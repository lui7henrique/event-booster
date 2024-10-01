import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { ServerError } from '../errors/server-error'
import { endOfDay, format, isFuture, isValid, startOfDay } from 'date-fns'
import { InvalidDateError } from '../errors/invalid-date'
import { InvalidFutureDateError } from '../errors/invalid-future-date'

type GetEventRankingInput = {
  event_id: string
  selected_date?: string
}

const buildDateFilter = (rawDate?: string) => {
  if (!rawDate) return undefined

  const date = new Date(rawDate)
  const endDate = format(endOfDay(date), 'yyyy-MM-dd')

  return sql`CAST(${schema.subscriptions.created_at} AS DATE) <= ${endDate}`
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

    const teste = await db
      .select()
      .from(schema.referral)
      .leftJoin(
        schema.subscriptions,
        eq(schema.subscriptions.referral_link_id, schema.referral.id)
      )
      .where(eq(schema.referral.event_id, event_id))

    console.log({ teste })

    const referralLinks = await db
      .select({
        id: schema.referral.id,
        token: schema.referral.token,
        click_count: schema.referral.click_count,
        email: schema.referral.email,
        subscription_count: sql`COUNT(${schema.subscriptions.id})`.as(
          'subscription_count'
        ),
      })
      .from(schema.referral)
      .leftJoin(
        schema.subscriptions,
        eq(schema.referral.id, schema.subscriptions.referral_link_id)
      )
      .where(
        and(
          eq(schema.referral.event_id, event_id),
          buildDateFilter(selected_date)
        )
      )
      .groupBy(schema.referral.id)
      .execute()

    console.log({ referralLinks })

    return makeRight({
      referralLinks: referralLinks.map(link => ({
        ...link,
        subscription_count: Number(link.subscription_count),
      })),
    })
  } catch (e) {
    return makeLeft(new ServerError())
  }
}
