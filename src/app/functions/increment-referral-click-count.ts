import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'
import { ServerError } from '../errors/server-error'

type IncrementReferralClickCountInput = {
  eventId: string
  token: string
}

export async function incrementReferralClickCount({
  eventId,
  token,
}: IncrementReferralClickCountInput) {
  try {
    const [updatedReferralLink] = await db
      .update(schema.referral)
      .set({ clickCount: sql`click_count + 1` })
      .where(
        and(
          eq(schema.referral.token, token),
          eq(schema.referral.eventId, eventId)
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
