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
    const [referral] = await db
      .select()
      .from(schema.referral)
      .where(
        and(
          eq(schema.referral.token, token),
          eq(schema.referral.event_id, event_id)
        )
      )
      .execute()

    if (!referral) {
      return makeLeft(new ReferralLinkNotFound())
    }

    const [updatedReferralLink] = await db
      .update(schema.referral)
      .set({ click_count: (referral.click_count || 0) + 1 })
      .where(eq(schema.referral.id, referral.id))
      .returning()

    return makeRight({ updatedReferralLink })
  } catch (e) {
    throw new Error()
  }
}
