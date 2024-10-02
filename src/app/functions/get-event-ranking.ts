import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { isFuture, isSameDay, isValid } from 'date-fns'
import { and, eq, sql } from 'drizzle-orm'
import { InvalidDateError } from '../errors/invalid-date'
import { InvalidFutureDateError } from '../errors/invalid-future-date'
import { ServerError } from '../errors/server-error'

type GetEventRankingInput = {
  event_id: string
  selected_date?: string
}

export async function getEventRanking({
  event_id,
  selected_date,
}: GetEventRankingInput) {
  try {
    if (!selected_date) {
      return makeLeft(new InvalidDateError())
    }

    if (!isValid(new Date(selected_date))) {
      return makeLeft(new InvalidDateError())
    }

    if (isFuture(new Date(selected_date))) {
      return makeLeft(new InvalidFutureDateError())
    }

    const referralLinks = await db
      .select({
        id: schema.referral.id,
        token: schema.referral.token,
        click_count: schema.referral.click_count,
        email: schema.referral.email,
        created_at: schema.referral.created_at,
        subscription_count: sql`COUNT(${schema.subscriptions.id})`.as(
          'subscription_count'
        ),
      })
      .from(schema.referral)
      .leftJoin(
        schema.subscriptions,
        eq(schema.referral.id, schema.subscriptions.referral_link_id)
      )
      .where(and(eq(schema.referral.event_id, event_id)))
      .groupBy(schema.referral.id)
      .execute()

    const formatted = referralLinks
      .map(link => ({
        ...link,
        subscription_count: Number(link.subscription_count),
      }))
      .filter(referral =>
        isSameDay(referral.created_at, new Date(selected_date))
      )

    return makeRight({
      ranking: formatted,
    })
  } catch {
    return makeLeft(new ServerError())
  }
}
