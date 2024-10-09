import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { FastifyRedis } from '@fastify/redis'
import { isFuture, isPast, isSameDay, isValid, parseISO } from 'date-fns'
import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import { InvalidDateError } from '../errors/invalid-date'
import { InvalidFutureDateError } from '../errors/invalid-future-date'
import { ServerError } from '../errors/server-error'
import { date } from 'drizzle-orm/pg-core'

const FIFTEEN_MINUTES = 60 * 15
const TWO_MONTHS = 60 * 60 * 24 * 30 * 2 // Seconds;Minutes;Hours;Days;Months

type GetEventRankingInput = {
  eventId: string
  selectedDate?: string
  redis?: FastifyRedis
}

export async function getEventRanking({
  eventId,
  selectedDate,
  redis,
}: GetEventRankingInput) {
  const cacheKey = `eventRanking:${eventId}-${selectedDate}`
  const cachedResult = await redis?.get(cacheKey)

  if (cachedResult) {
    return makeRight({ ranking: JSON.parse(cachedResult) })
  }

  try {
    if (!selectedDate) {
      return makeLeft(new InvalidDateError())
    }

    if (!isValid(new Date(selectedDate))) {
      return makeLeft(new InvalidDateError())
    }

    if (isFuture(new Date(selectedDate))) {
      return makeLeft(new InvalidFutureDateError())
    }

    const ranking = await db
      .select({
        id: schema.referral.id,
        token: schema.referral.token,
        click_count: schema.referral.clickCount,
        email: schema.referral.email,
        created_at: schema.referral.createdAt,
        subscription_count: count(schema.subscriptions.id),
      })
      .from(schema.referral)
      .leftJoin(
        schema.subscriptions,
        eq(schema.referral.id, schema.subscriptions.referralId)
      )
      .where(
        and(
          eq(schema.referral.eventId, eventId),
          eq(
            sql`DATE(${schema.subscriptions.created_at})`,
            sql`DATE(${selectedDate})`
          )
        )
      )
      .groupBy(schema.referral.id)
      .orderBy(ranking => desc(ranking.subscription_count))

    const isDatePast = selectedDate ? isPast(parseISO(selectedDate)) : false

    await redis?.set(
      cacheKey,
      JSON.stringify(ranking),
      'EX',
      isDatePast ? TWO_MONTHS : FIFTEEN_MINUTES
    )

    return makeRight({
      ranking,
    })
  } catch {
    return makeLeft(new ServerError())
  }
}
