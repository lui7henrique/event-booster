import { db } from '@/db'
import { schema } from '@/db/schema'
import { count, eq } from 'drizzle-orm'

export async function updateSubscriptionCount(referralId: string) {
  const [subscriptionCount] = await db
    .select({ count: count() })
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.referralId, referralId))

  await db
    .update(schema.referral)
    .set({ subscriptionCount: subscriptionCount.count })
    .where(eq(schema.referral.id, referralId))
}
