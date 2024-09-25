import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { ServerError } from '../errors/server-error'
import { endOfDay, format, isValid, startOfDay } from 'date-fns'
import { InvalidDateError } from '../errors/invalid-date'
import { union } from 'drizzle-orm/pg-core'

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
    if (selected_date && !isValid(new Date(selected_date))) {
      return makeLeft(new InvalidDateError())
    }

    const referralLinks = await db
      .select({
        id: schema.referralLinks.id,
        token: schema.referralLinks.token,
        click_count: schema.referralLinks.click_count,
        email: schema.referralLinks.email,
        subscription_count: sql`COUNT(${schema.subscriptions.id})`.as(
          'subscription_count'
        ),
      })
      .from(schema.referralLinks)
      .innerJoin(
        schema.subscriptions,
        eq(schema.referralLinks.id, schema.subscriptions.referral_link_id)
      )
      .where(
        and(
          eq(schema.referralLinks.event_id, event_id),
          buildDateFilter(selected_date)
        )
      )
      .groupBy(schema.referralLinks.id)
      .execute()

    return makeRight({
      referralLinks: referralLinks.map(link => ({
        ...link,
        subscription_count: Number(link.subscription_count),
      })),
    })
  } catch (e) {
    console.log({ e })
    return makeLeft(new ServerError())
  }
}
