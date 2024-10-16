import { getReferralStats } from '@/app/functions/get-referral-stats'
import { isLeft } from '@/core/either'
import { schema } from '@/db/schema'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const querySchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

const successResponseSchema = z.object({
  referral: createSelectSchema(schema.referral),
  directConversionRate: z.number(),
  indirectConversionRate: z.number(),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const responseSchema = {
  200: successResponseSchema.describe(
    'Successful response with referral statistics.'
  ),
  401: errorResponseSchema.describe(
    'Unauthorized access or referral not found.'
  ),
  400: errorResponseSchema.describe(
    'Bad request due to invalid input or server error.'
  ),
}

export async function getReferralStatsRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/referral/stats',
    schema: {
      description: 'Retrieve referral statistics',
      tags: ['Referral'],
      querystring: querySchema,
      response: responseSchema,
    },
    handler: async (request, reply) => {
      const { token } = querySchema.parse(request.query)
      const result = await getReferralStats({ token })

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
