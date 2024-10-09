import { db } from '@/db'
import { schema } from '@/db/schema'
import { referral } from '@/db/schema/referral'
import { count, eq, sql } from 'drizzle-orm'

export async function updateSubscriptionCount(referralId: string) {
  await db
    .update(schema.referral)
    .set({ subscriptionCount: sql`${referral.subscriptionCount} + 1` })
    .where(eq(schema.referral.id, referralId))
}
