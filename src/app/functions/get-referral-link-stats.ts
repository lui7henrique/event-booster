import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'
import { ServerError } from '../errors/server-error'

type GetReferralLinkInput = {
  token: string
  eventId: string
}

type TotalSubscriptions = {
  click_count: string
  subscription_count: string
}

export async function getReferralLinkStats({
  eventId,
  token,
}: GetReferralLinkInput) {
  try {
    const [referral] = await db
      .select()
      .from(schema.referral)
      .where(
        and(
          eq(schema.referral.token, token),
          eq(schema.referral.eventId, eventId)
        )
      )
      .execute()

    if (!referral) {
      return makeLeft(new ReferralLinkNotFound())
    }

    const directConversionRate =
      referral.clickCount === 0
        ? 0
        : (referral.subscriptionCount / referral.clickCount) * 100

    const [totalSubscriptions] = await db.execute<TotalSubscriptions>(
      sql`
        WITH RECURSIVE referral_chain AS (
          SELECT id, parent_id, click_count, subscription_count
          FROM referral_links
          WHERE id = ${referral.id}
    
          UNION ALL
    
          SELECT rl.id, rl.parent_id, rl.click_count, rl.subscription_count
          FROM referral_links rl
          INNER JOIN referral_chain rc ON rl.parent_id = rc.id
        )
        SELECT SUM(click_count) AS click_count, SUM(subscription_count) AS subscription_count
        FROM referral_chain;
      `
    )

    console.log({ totalSubscriptions })

    const indirectConversionRate =
      Number(totalSubscriptions.click_count) === 0
        ? 0
        : (Number(totalSubscriptions.subscription_count) /
            Number(totalSubscriptions.click_count)) *
          100

    return makeRight({
      referral,
      directConversionRate,
      indirectConversionRate,
    })
  } catch {
    return makeLeft(new ServerError())
  }
}
