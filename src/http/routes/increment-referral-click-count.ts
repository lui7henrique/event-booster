import { incrementReferralClickCount } from '@/app/functions/increment-referral-click-count'
import { isLeft } from '@/core/either'
import { schema } from '@/db/schema'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const querySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  eventId: z.string().min(1, 'Event ID is required'),
})

const successResponseSchema = z
  .object({
    referral: createSelectSchema(schema.referral),
  })
  .describe('Successful response after incrementing the click count.')

const errorResponseSchema = z
  .object({
    message: z.string(),
  })
  .describe('Error message describing why the request failed.')

const responseSchema = {
  200: successResponseSchema,
  401: errorResponseSchema.describe(
    'Unauthorized access or referral not found.'
  ),
  400: errorResponseSchema.describe(
    'Bad request due to invalid input or server error.'
  ),
}

export async function incrementReferralClickCountRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/increment-referral-click-count',
    schema: {
      description: 'Increment referral click count',
      tags: ['Referral'],
      querystring: querySchema,
      response: responseSchema,
    },
    handler: async (request, reply) => {
      const { token, eventId } = querySchema.parse(request.query)
      const result = await incrementReferralClickCount({ token, eventId })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          case 'ReferralNotFound':
            return reply.status(401).send({ message: error.message })
          default:
            return reply.status(400).send()
        }
      }

      return reply.status(200).send({ referral: result.right.referral })
    },
  })
}
