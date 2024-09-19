import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { EmailAlreadySubscribedError } from '../errors/email-already-subscribed-error'
import { eq, and } from 'drizzle-orm'
import { EventNotFoundError } from '../errors/event-not-found-error'
import { isWithinInterval } from 'date-fns'
import { EventDateError } from '../errors/event-date-error'

type RegisterSubscriptionInput = {
  name: string
  email: string
  eventId: string
}

export async function registerSubscription({
  name,
  email,
  eventId,
}: RegisterSubscriptionInput) {
  try {
    const [existingSubscription] = await db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.email, email),
          eq(schema.subscriptions.event_id, eventId)
        )
      )
      .execute()

    console.log({ existingSubscription })

    if (existingSubscription) {
      return makeLeft(new EmailAlreadySubscribedError())
    }

    const event = await db.query.events.findFirst({
      where: eq(schema.events.id, eventId),
    })

    if (!event) {
      return makeLeft(new EventNotFoundError())
    }

    const isValidDate = isWithinInterval(new Date(), {
      start: new Date(event.start_date),
      end: new Date(event.end_date),
    })

    if (isValidDate) {
      const [subscription] = await db
        .insert(schema.subscriptions)
        .values({
          email,
          name,
          event_id: eventId,
        })
        .returning()

      return makeRight({ subscription })
    }

    return makeLeft(new EventDateError())
  } catch (err) {
    return makeLeft(new EmailAlreadySubscribedError())
  }
}
