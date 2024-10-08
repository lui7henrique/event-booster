import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { FastifyRedis } from '@fastify/redis'
import { isFuture, isPast, isSameDay, isValid, parseISO } from 'date-fns'
import { and, count, eq } from 'drizzle-orm'
import { InvalidDateError } from '../errors/invalid-date'
import { InvalidFutureDateError } from '../errors/invalid-future-date'
import { ServerError } from '../errors/server-error'

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

    const referralLinks = await db
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
      .where(and(eq(schema.referral.eventId, eventId)))
      .groupBy(schema.referral.id)
      .execute()

    const formatted = referralLinks
      .map(link => ({
        ...link,
        subscription_count: Number(link.subscription_count),
      }))
      .filter(referral =>
        isSameDay(referral.created_at, new Date(selectedDate))
      )

    const isDatePast = selectedDate ? isPast(parseISO(selectedDate)) : false

    await redis?.set(
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
