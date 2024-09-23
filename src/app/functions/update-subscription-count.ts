import { db } from '@/db'
import { schema } from '@/db/schema'
import { count, eq } from 'drizzle-orm'

export async function updateSubscriptionCount(referralLinkId: string) {
  const [subscriptionCount] = await db
    .select({ count: count() })
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.referral_link_id, referralLinkId))
    .execute()

  await db
    .update(schema.referralLinks)
    .set({ subscription_count: subscriptionCount.count })
    .where(eq(schema.referralLinks.id, referralLinkId))
    .execute()
}
