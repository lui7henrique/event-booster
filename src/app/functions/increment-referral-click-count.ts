import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { ReferralNotFound } from '../errors/referral-not-found'
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
    const [referral] = await db
      .update(schema.referral)
      .set({ clickCount: sql`click_count + 1` })
      .where(eq(schema.referral.token, token))
      .returning()

    if (!referral) {
      return makeLeft(new ReferralNotFound())
    }

    return makeRight({ referral })
  } catch {
    return makeLeft(new ServerError())
  }
}
