import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { ServerError } from '../errors/server-error'

type GetEventRankingInput = {
  event_id: string
}

export async function getEventRanking({ event_id }: GetEventRankingInput) {
  try {
    const referralLinks = await db
      .select({
        id: schema.referralLinks.id,
        token: schema.referralLinks.token,
        click_count: schema.referralLinks.click_count,
        subscription_count: schema.referralLinks.subscription_count,
        email: schema.referralLinks.email,

        // CHATGPT SQL ¯\_(ツ)_/¯
        conversion_rate: sql<number>`COALESCE(
          CASE 
            WHEN ${schema.referralLinks.click_count} = 0 THEN 0
            ELSE ${schema.referralLinks.subscription_count}::float / ${schema.referralLinks.click_count}::float 
          END, 0)`.as('conversion_rate'),
      })
      .from(schema.referralLinks)
      .where(eq(schema.referralLinks.event_id, event_id))
      .orderBy(sql`conversion_rate DESC`)
      .execute()

    return makeRight({ referralLinks })
  } catch (e) {
    return makeLeft(new ServerError())
  }
}
