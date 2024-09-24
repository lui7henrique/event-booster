import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'
import { getEvents } from '@/app/functions/get-events'
import { isLeft } from '@/core/either'

export async function getEventsRoutes(app: FastifyInstance) {
  app.get(
    '/events',
    {
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
    },
    async (request, reply) => {
      const { company_id } = request.user as { company_id: string }

      const result = await getEvents({ company_id })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          default:
            return reply.status(400).send()
        }
      }

      return reply.status(200).send({ ...result.right })
    }
  )
}
