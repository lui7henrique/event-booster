import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { FastifyRedis } from '@fastify/redis'
import { isFuture, isPast, isSameDay, isValid, parseISO } from 'date-fns'
import { and, eq, sql } from 'drizzle-orm'
import { InvalidDateError } from '../errors/invalid-date'
import { InvalidFutureDateError } from '../errors/invalid-future-date'
import { ServerError } from '../errors/server-error'

const FIFTEEN_MINUTES = 60 * 15
const TWO_MONTHS = 60 * 60 * 24 * 30 * 2 // Seconds;Minutes;Hours;Days;Months

type GetEventRankingInput = {
  event_id: string
  selected_date?: string
  redis: FastifyRedis
}

export async function getEventRanking({
  event_id,
  selected_date,
  redis,
}: GetEventRankingInput) {
  const cacheKey = `eventRanking:${event_id}-${selected_date}`
  const cachedResult = await redis.get(cacheKey)

  if (cachedResult) {
    return makeRight({ ranking: JSON.parse(cachedResult) })
  }

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

    const isDatePast = selected_date ? isPast(parseISO(selected_date)) : false

    await redis.set(
      cacheKey,
      JSON.stringify(formatted),
      'EX',
      isDatePast ? TWO_MONTHS : FIFTEEN_MINUTES
    )

    return makeRight({
      ranking: formatted,
    })
  } catch {
    return makeLeft(new ServerError())
  }
}
