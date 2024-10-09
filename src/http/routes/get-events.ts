import { getEvents } from '@/app/functions/get-events'
import { isLeft } from '@/core/either'
import { schema } from '@/db/schema'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { verifyJwt } from '../hooks/verify-jwt'

const responseSchema = {
  200: z
    .object({
      events: z.array(createSelectSchema(schema.events)),
    })
    .describe('Successful response with an array of event details.'),
  400: z
    .object({
      message: z.string(),
    })
    .describe('Bad request response due to an error in fetching events.'),
  401: z
    .object({
      message: z.string().default('Unauthorized'),
    })
    .describe('Unauthorized response if the JWT token is missing or invalid.'),
}

export async function getEventsRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/events',
    schema: {
      description: 'Get events',
      tags: ['Event'],
      security: [
        {
          bearerAuth: [],
        },
      ],
      response: responseSchema,
    },
    onRequest: [verifyJwt],
    handler: async (request, reply) => {
      const { hostId } = request.user
      const result = await getEvents({ hostId })

      if (isLeft(result)) {
        const error = result.left

        return reply
          .status(400)
          .send({ message: error.message || 'Server error' })
      }

      return reply.status(200).send({ events: result.right.events })
    },
  })
}
