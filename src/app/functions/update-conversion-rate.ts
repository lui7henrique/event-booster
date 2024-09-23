import { db } from '@/db'
import { schema } from '@/db/schema'
import { count, eq } from 'drizzle-orm'

export async function updateConversionRate(referralLinkId: string) {
  const [subscriptionCount] = await db
    .select({ count: count() })
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.referral_link_id, referralLinkId))
    .execute()

  const [referralLink] = await db
    .select()
    .from(schema.referralLinks)
    .where(eq(schema.referralLinks.id, referralLinkId))
    .execute()

  if (referralLink && referralLink.click_count > 0) {
    const conversionRate =
      (subscriptionCount.count / referralLink.click_count) * 100

    await db
      .update(schema.referralLinks)
      .set({ conversion_rate: conversionRate })
      .where(eq(schema.referralLinks.id, referralLinkId))
      .execute()
  }
}
