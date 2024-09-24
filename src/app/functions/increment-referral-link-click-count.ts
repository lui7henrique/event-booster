import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'

type IncrementReferralLinkCountInput = {
  token: string
  event_id: string
}

export async function incrementReferralLinkCount({
  event_id,
  token,
}: IncrementReferralLinkCountInput) {
  try {
    const [referralLink] = await db
      .select()
      .from(schema.referralLinks)
      .where(
        and(
          eq(schema.referralLinks.token, token),
          eq(schema.referralLinks.event_id, event_id)
        )
      )
      .execute()

    if (!referralLink) {
      return makeLeft(new ReferralLinkNotFound())
    }

    const [updatedReferralLink] = await db
      .update(schema.referralLinks)
      .set({ click_count: (referralLink.click_count || 0) + 1 })
      .where(eq(schema.referralLinks.id, referralLink.id))
      .returning()

    return makeRight({ updatedReferralLink })
  } catch (e) {
    throw new Error()
  }
}
