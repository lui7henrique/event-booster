import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { ReferralLinkAlreadyExists } from '../errors/referral-link-already-exists'
import { randomBytes } from 'node:crypto'
import { ServerError } from '../errors/server-error'

type GenerateReferralLinkInput = {
  email: string
  event_id: string
}

export async function generateReferralLink({
  email,
  event_id,
}: GenerateReferralLinkInput) {
  try {
    const [existingReferralLink] = await db
      .select()
      .from(schema.referral)
      .where(
        and(
          eq(schema.referral.email, email),
          eq(schema.referral.event_id, event_id)
        )
      )
      .execute()

    if (existingReferralLink) {
      return makeLeft(new ReferralLinkAlreadyExists())
    }

    const token = randomBytes(16).toString('hex')
    const baseUrl = process.env.BASE_URL
    const url = `${baseUrl}/referral?token=${token}&event_id=${event_id}`

    const [subscription] = await db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.email, email),
          eq(schema.subscriptions.event_id, event_id)
        )
      )

    const [referralLink] = await db
      .insert(schema.referral)
      .values({
        email,
        event_id,
        referral_link: url,
        token: token,
        parent_id: subscription.referral_link_id || null,
      })
      .returning()
      .execute()

    return makeRight({ referralLink })
  } catch (err) {
    return makeLeft(new ServerError())
  }
}
