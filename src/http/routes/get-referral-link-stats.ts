import { getReferralLinkStats } from '@/app/functions/get-referral-link-stats'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const querySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  event_id: z.string().min(1, 'Event ID is required'),
})

export async function getReferralLinkStatsRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/referral/stats',
    schema: {
      description: 'Retrieve referral link statistics',
      tags: ['Referral link'],
      querystring: querySchema,
      response: {
        200: z.object({
          referralLink: z.object({
            token: z.string(),
            event_id: z.string().nullable(),
            id: z.string(),
            email: z.string(),
            created_at: z.date(),
            referral_link: z.string(),
            click_count: z.number(),
            subscription_count: z.number(),
            parent_id: z.string().nullable(),
          }),
          directConversionRate: z.number(),
          indirectConversionRate: z.number(),
        }),
        401: z.object({
          message: z.string().describe('Invalid or non-existent referral link'),
        }),
        400: z.object({
          message: z.string().describe('Invalid request data'),
        }),
      },
    },
    handler: async (request, reply) => {
      const { token, event_id } = querySchema.parse(request.query)

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

      const { referralLink, directConversionRate, indirectConversionRate } =
        result.right

      return reply.status(200).send({
        referralLink,
        directConversionRate,
        indirectConversionRate,
      })
    },
  })
}
