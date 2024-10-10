import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { FastifyRedis } from '@fastify/redis'
import { isFuture, isPast, isSameDay, isValid, parseISO } from 'date-fns'
import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import { InvalidDateError } from '../errors/invalid-date'
import { InvalidFutureDateError } from '../errors/invalid-future-date'

const FIFTEEN_MINUTES = 60 * 15
const TWO_MONTHS = 60 * 60 * 24 * 30 * 2 // Seconds;Minutes;Hours;Days;Months

type GetEventRankingInput = {
  eventId: string
  selectedDate: Date
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
    if (!isValid(selectedDate)) {
      return makeLeft(new InvalidDateError())
    }

    if (isFuture(selectedDate)) {
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
            sql`DATE(${schema.subscriptions.createdAt})`,
            sql`DATE(${selectedDate.toISOString()})`
          )
        )
      )
      .groupBy(schema.referral.id)
      .orderBy(ranking => desc(ranking.subscription_count))

    const isDatePast = selectedDate ? isPast(selectedDate) : false

    await redis?.set(
      cacheKey,
      JSON.stringify(ranking),
      'EX',
      isDatePast ? TWO_MONTHS : FIFTEEN_MINUTES
    )

    return makeRight({
      ranking,
    })
  } catch (error) {
    throw error
  }
}
