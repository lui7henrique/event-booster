import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'
import { getEvents } from '@/app/functions/get-events'
import { isLeft } from '@/core/either'
import { z } from 'zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

const eventsResponseSchema = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      start_date: z.date(),
      end_date: z.date(),
      host_id: z.string(),
    })
  ),
})

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
      response: {
        200: eventsResponseSchema,
        400: z.object({
          message: z.string(),
        }),
      },
    },
    onRequest: [verifyJwt],
    handler: async (request, reply) => {
      const { host_id } = request.user

      const result = await getEvents({ host_id })

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
