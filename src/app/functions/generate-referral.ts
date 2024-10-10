import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { ReferralLinkAlreadyExists } from '../errors/referral-link-already-exists'
import { randomBytes } from 'node:crypto'

type GenerateReferralInput = {
  email: string
  eventId: string
}

export async function generateReferral({
  email,
  eventId,
}: GenerateReferralInput) {
  try {
    const [existingReferralLink] = await db
      .select()
      .from(schema.referral)
      .where(
        and(
          eq(schema.referral.email, email),
          eq(schema.referral.eventId, eventId)
        )
      )

    if (existingReferralLink) {
      return makeLeft(new ReferralLinkAlreadyExists())
    }

    const token = randomBytes(16).toString('hex')
    const url = `${process.env.BASE_URL}/referral?token=${token}&eventId=${eventId}`

    const [subscription] = await db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.email, email),
          eq(schema.subscriptions.eventId, eventId)
        )
      )

    const [referral] = await db
      .insert(schema.referral)
      .values({
        email,
        eventId,
        link: url,
        token: token,
        parentId: subscription.referralId || null,
      })
      .returning()

    return makeRight({ referral })
  } catch (error) {
    throw error
  }
}
