import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq, count, sql } from 'drizzle-orm'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'
import { ServerError } from '../errors/server-error'

type HandleReferralLinkInput = {
  token: string
  event_id: string
}

type TotalSubscriptions = {
  click_count: string
  subscription_count: string
}

export async function handleReferralLinkStats({
  event_id,
  token,
}: HandleReferralLinkInput) {
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

    const directConversionRate =
      referralLink.click_count === 0
        ? 0
        : (referralLink.subscription_count / referralLink.click_count) * 100

    const [totalSubscriptions] = await db.execute<TotalSubscriptions>(
      sql`
        WITH RECURSIVE referral_chain AS (
          SELECT id, parent_id, click_count, subscription_count
          FROM referral_links
          WHERE id = ${referralLink.id}
    
          UNION ALL
    
          SELECT rl.id, rl.parent_id, rl.click_count, rl.subscription_count
          FROM referral_links rl
          INNER JOIN referral_chain rc ON rl.parent_id = rc.id
        )
        SELECT SUM(click_count) AS click_count, SUM(subscription_count) AS subscription_count
        FROM referral_chain;
      `
    )

    const indirectConversionRate =
      Number(totalSubscriptions.click_count) === 0
        ? 0
        : (Number(totalSubscriptions.subscription_count) /
            Number(totalSubscriptions.click_count)) *
          100

    return makeRight({
      referralLink,
      directConversionRate,
      indirectConversionRate,
    })
  } catch (e) {
    console.log({ e })
    return makeLeft(new ServerError())
  }
}
