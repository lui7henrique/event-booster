import { handleReferralLink } from '@/app/functions/handle-referral-link.'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function handleReferralLinkClickRoute(app: FastifyInstance) {
  app.get('/referral', async (request, reply) => {
    const { token, event_id } = z
      .object({
        token: z.string(),
        event_id: z.string(),
      })
      .parse(request.query)

    const result = await handleReferralLink({ token, event_id })

    if (isLeft(result)) {
      const error = result.left

      switch (error.constructor.name) {
        case 'ReferralLinkNotFound':
          return reply.status(401).send({ message: error.message })
        default:
          return reply.status(400).send()
      }
    }

    return reply
      .status(200)
      .send({ referral_link: result.right.updatedReferralLink })
  })
}
