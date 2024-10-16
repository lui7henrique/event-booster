import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { ReferralNotFound } from '../errors/referral-not-found'

type IncrementReferralClickCountInput = {
  token: string
}

export async function incrementReferralClickCount({
  token,
}: IncrementReferralClickCountInput) {
  const [referral] = await db
    .update(schema.referral)
    .set({ clickCount: sql`click_count + 1` })
    .where(eq(schema.referral.token, token))
    .returning()

  if (!referral) {
    return makeLeft(new ReferralNotFound())
  }

  return makeRight({ referral })
}
