import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ServerError } from '../errors/server-error'

type GetEventRankingInput = {
  event_id: string
}

export async function getEventRanking({ event_id }: GetEventRankingInput) {
  try {
    const [eventReferralLinks] = await db
      .select()
      .from(schema.referralLinks)
      .where(eq(schema.referralLinks.event_id, event_id))

    console.log({ eventReferralLinks })

    return makeRight({ eventReferralLinks })
  } catch {
    return makeLeft(new ServerError())
  }
}
