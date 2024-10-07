import { incrementReferralClickCount } from '@/app/functions/increment-referral-click-count'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const querySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  event_id: z.string().min(1, 'Event ID is required'),
})

export async function incrementReferralClickCountRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/increment-referral-link-click-count',
    schema: {
      description: 'Increment referral link click count',
      tags: ['Referral link'],
      querystring: querySchema,
      response: {
        200: z.object({
          referral_link: z.object({
            id: z.string(),
            click_count: z.number(),
          }),
        }),
        401: z.object({
          message: z.string(),
        }),
        400: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { token, event_id } = querySchema.parse(request.query)

      const result = await incrementReferralClickCount({ token, event_id })

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
    },
  })
}
