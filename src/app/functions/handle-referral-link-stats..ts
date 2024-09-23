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
      (referralLink.subscription_count / referralLink.click_count) * 100

    return makeRight({
      referralLink,
      directConversionRate,
    })
  } catch (e) {
    console.log({ e })
    return makeLeft(new ServerError())
  }
}
