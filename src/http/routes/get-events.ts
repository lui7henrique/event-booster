import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'

export async function getEventsRoutes(app: FastifyInstance) {
  app.get(
    '/events',
    {
      onRequest: [verifyJwt],
    },
    async (request, reply) => {}
  )
}
