import { getReferralLinkStats } from '@/app/functions/get-referral-link-stats'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function GetReferralLinkStats(app: FastifyInstance) {
  app.get('/referral/stats', async (request, reply) => {
    const { token, event_id } = z
      .object({
        token: z.string(),
        event_id: z.string(),
      })
      .parse(request.query)

    const result = await getReferralLinkStats({ token, event_id })

    if (isLeft(result)) {
      const error = result.left

      switch (error.constructor.name) {
        case 'ReferralLinkNotFound':
          return reply.status(401).send({ message: error.message })
        default:
          return reply.status(400).send()
      }
    }

    return reply.status(200).send({ ...result.right })
  })
}
