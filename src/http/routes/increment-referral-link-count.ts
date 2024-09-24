import { incrementReferralLinkCount } from '@/app/functions/increment-referral-link-click-count'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function incrementReferralLinkCountRoute(app: FastifyInstance) {
  app.get(
    '/increment-referral-link-click-count',
    {
      schema: {
        description: 'Increment referral link click count',
        tags: ['Referral link'],
        querystring: {
          type: 'object',
          required: ['token', 'event_id'],
          properties: {
            token: {
              type: 'string',
              description: 'Referral link token',
            },
            event_id: {
              type: 'string',
              description: 'ID of the event associated with the referral link',
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { token, event_id } = z
        .object({
          token: z.string(),
          event_id: z.string(),
        })
        .parse(request.query)

      const result = await incrementReferralLinkCount({ token, event_id })

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
    }
  )
}
