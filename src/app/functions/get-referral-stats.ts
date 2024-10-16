import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { ReferralNotFound } from '../errors/referral-not-found'

type GetReferralInput = {
  token: string
}

type TotalSubscriptions = {
  click_count: string
  subscription_count: string
}

export async function getReferralStats({ token }: GetReferralInput) {
  const [referral] = await db
    .select()
    .from(schema.referral)
    .where(eq(schema.referral.token, token))

  if (!referral) {
    return makeLeft(new ReferralNotFound())
  }

  const directConversionRate =
    referral.clickCount === 0
      ? 0
      : (referral.subscriptionCount / referral.clickCount) * 100

  const [totalSubscriptions] = await db.execute<TotalSubscriptions>(
    sql`
        WITH RECURSIVE referral_chain AS (
          SELECT 
            id, 
            parent_id, 
            click_count, 
            subscription_count
          FROM 
            ${schema.referral} r
          WHERE 
            r.id = ${referral.id}
    
          UNION ALL
    
          SELECT 
            rl.id, 
            rl.parent_id, 
            rl.click_count, 
            rl.subscription_count
          FROM 
            ${schema.referral} rl
          INNER JOIN 
            referral_chain rc ON rl.parent_id = rc.id
        )

        SELECT 
          SUM(click_count) AS click_count, 
          SUM(subscription_count) AS subscription_count
        FROM 
          referral_chain;
      `
  )

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
}
