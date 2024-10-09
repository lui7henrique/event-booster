import { getReferralStats } from '@/app/functions/get-referral-stats'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const querySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  eventId: z.string().min(1, 'Event ID is required'),
})

export async function getReferralStatsRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/referral/stats',
    schema: {
      description: 'Retrieve referral link statistics',
      tags: ['Referral link'],
      querystring: querySchema,
    },
    handler: async (request, reply) => {
      const { token, eventId } = querySchema.parse(request.query)
      const result = await getReferralStats({ token, eventId })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          case 'ReferralLinkNotFound':
            return reply.status(401).send({ message: error.message })
          default:
            return reply.status(400).send()
        }
      }

      const { referral, directConversionRate, indirectConversionRate } =
        result.right

      return reply.status(200).send({
        referral,
        directConversionRate,
        indirectConversionRate,
      })
    },
  })
}
