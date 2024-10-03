import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'
import { ServerError } from '../errors/server-error'

type IncrementReferralLinkCountInput = {
  token: string
  event_id: string
}

export async function incrementReferralLinkCount({
  event_id,
  token,
}: IncrementReferralLinkCountInput) {
  try {
    const [updatedReferralLink] = await db
      .update(schema.referral)
      .set({ click_count: sql`COALESCE(click_count, 0) + 1` })
      .where(
        and(
          eq(schema.referral.token, token),
          eq(schema.referral.event_id, event_id)
        )
      )
      .returning()

    if (!updatedReferralLink) {
      return makeLeft(new ReferralLinkNotFound())
    }

    return makeRight({ updatedReferralLink })
  } catch {
    return makeLeft(new ServerError())
  }
}
