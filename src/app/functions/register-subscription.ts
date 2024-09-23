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
  event_id: string
  referral_link_token: string | null
}

export async function registerSubscription({
  name,
  email,
  event_id,
  referral_link_token,
}: RegisterSubscriptionInput) {
  try {
    const [existingSubscription] = await db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.email, email),
          eq(schema.subscriptions.event_id, event_id)
        )
      )
      .execute()

    if (existingSubscription) {
      return makeLeft(new EmailAlreadySubscribedError())
    }

    const event = await db.query.events.findFirst({
      where: eq(schema.events.id, event_id),
    })

    if (!event) {
      return makeLeft(new EventNotFoundError())
    }

    const isValidDate = isWithinInterval(new Date(), {
      start: new Date(event.start_date),
      end: new Date(event.end_date),
    })

    if (isValidDate) {
      if (referral_link_token) {
        console.log({ referral_link_token })
      }

      const [subscription] = await db
        .insert(schema.subscriptions)
        .values({
          email,
          name,
          event_id,
        })
        .returning()

      return makeRight({ subscription })
    }

    return makeLeft(new EventDateError())
  } catch (err) {
    console.log({ err })
    throw new Error()
  }
}
