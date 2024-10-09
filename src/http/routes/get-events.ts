import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'
import { getEvents } from '@/app/functions/get-events'
import { isLeft } from '@/core/either'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

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
