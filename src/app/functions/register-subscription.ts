import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { isWithinInterval } from 'date-fns'
import { and, eq, sql } from 'drizzle-orm'
import { EmailAlreadySubscribedError } from '../errors/email-already-subscribed-error'
import { EventDateError } from '../errors/event-date-error'
import { EventNotFoundError } from '../errors/event-not-found-error'

type RegisterSubscriptionInput = {
  name: string
  email: string
  eventId: string
  referralToken?: string | null
}

export async function registerSubscription({
  name,
  email,
  eventId,
  referralToken,
}: RegisterSubscriptionInput) {
  try {
    const result = await db
      .select({
        event: {
          startDate: schema.events.startDate,
          endDate: schema.events.endDate,
          id: schema.events.id,
        },
        existingSubscription: schema.subscriptions.id,
      })
      .from(schema.events)
      .leftJoin(
        schema.subscriptions,
        and(
          eq(schema.subscriptions.eventId, schema.events.id),
          eq(schema.subscriptions.email, email),
          eq(schema.subscriptions.eventId, eventId)
        )
      )
      .where(eq(schema.events.id, eventId))

    const { event, existingSubscription } = result[0]

    if (existingSubscription) {
      return makeLeft(new EmailAlreadySubscribedError())
    }

    const isValidDate = isWithinInterval(new Date(), {
      start: new Date(event.startDate),
      end: new Date(event.endDate),
    })

    if (!isValidDate) {
      return makeLeft(new EventDateError())
    }

    let referralId = null
    if (referralToken) {
      const [referral] = await db
        .select()
        .from(schema.referral)
        .where(eq(schema.referral.token, referralToken))

      referralId = referral?.id || null

      if (referralId) {
        await db
          .update(schema.referral)
          .set({ subscriptionCount: sql`${referral.subscriptionCount} + 1` })
          .where(eq(schema.referral.id, referralId))
      }
    }

    const [subscription] = await db
      .insert(schema.subscriptions)
      .values({
        email,
        name,
        eventId,
        referralId,
      })
      .returning()

    return makeRight({ subscription })
  } catch (error) {
    if (error instanceof TypeError) {
      if (error.message === 'Right side of assignment cannot be destructured') {
        return makeLeft(new EventNotFoundError())
      }

      if (
        error.message ===
        "Cannot destructure property 'event' of 'result[0]' as it is undefined."
      ) {
        return makeLeft(new EventNotFoundError())
      }
    }

    throw error
  }
}
