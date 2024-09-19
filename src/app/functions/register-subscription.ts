import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { EmailAlreadySubscribedError } from '../errors/email-already-subscribed-error'
import { eq, and } from 'drizzle-orm'

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
    const existingSubscription = await db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.email, email),
          eq(schema.subscriptions.event_id, eventId)
        )
      )
      .execute()

    if (existingSubscription.length > 0) {
      return makeLeft(new EmailAlreadySubscribedError())
    }

    const subscriptions = await db
      .insert(schema.subscriptions)
      .values({
        email,
        name,
        event_id: eventId,
      })
      .execute()

    return makeRight({ subscription: subscriptions[0] })
  } catch (err) {
    console.log({ err })
    return makeLeft(new EmailAlreadySubscribedError())
  }
}
