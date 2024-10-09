import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { isWithinInterval } from 'date-fns'
import { and, eq } from 'drizzle-orm'
import { EmailAlreadySubscribedError } from '../errors/email-already-subscribed-error'
import { EventDateError } from '../errors/event-date-error'
import { EventNotFoundError } from '../errors/event-not-found-error'
import { ServerError } from '../errors/server-error'
import { updateSubscriptionCount } from './update-subscription-count'

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

    if (isValidDate) {
      if (referralToken) {
        const [referral] = await db
          .select()
          .from(schema.referral)
          .where(eq(schema.referral.token, referralToken))

        const [subscription] = await db
          .insert(schema.subscriptions)
          .values({
            email,
            name,
            eventId,
            referralId: referral.id,
          })
          .returning()

        await updateSubscriptionCount(referral.id)

        return makeRight({ subscription })
      }

      const [subscription] = await db
        .insert(schema.subscriptions)
        .values({
          email,
          name,
          eventId,
        })
        .returning()

      return makeRight({ subscription })
    }

    return makeLeft(new EventDateError())
  } catch (error) {
    if (error instanceof TypeError) {
      if (error.message === 'Right side of assignment cannot be destructured') {
        return makeLeft(new EventNotFoundError())
      }
    }

    return makeLeft(new ServerError())
  }
}
