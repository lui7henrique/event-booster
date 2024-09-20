import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { ReferralLinkAlreadyExists } from '../errors/referral-link-already-exists'
import { randomBytes } from 'node:crypto'

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
      .from(schema.referralLinks)
      .where(
        and(
          eq(schema.referralLinks.email, email),
          eq(schema.referralLinks.event_id, event_id)
        )
      )
      .execute()

    if (existingReferralLink) {
      return makeLeft(new ReferralLinkAlreadyExists())
    }

    const uniqueToken = randomBytes(16).toString('hex')
    const baseUrl = process.env.BASE_URL || 'https://domain.com'
    const url = `${baseUrl}/register-subscription?ref=${uniqueToken}&event_id=${event_id}`

    const [referralLink] = await db
      .insert(schema.referralLinks)
      .values({
        email,
        event_id,
        referral_link: url,
      })
      .returning()

    return makeRight({ referralLink })
  } catch (err) {
    return makeLeft(new ReferralLinkAlreadyExists())
  }
}
