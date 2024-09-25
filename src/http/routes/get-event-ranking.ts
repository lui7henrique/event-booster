import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'
import { getEventRanking } from '@/app/functions/get-event-ranking'
import { isLeft } from '@/core/either'

export async function getEventRankingRoute(app: FastifyInstance) {
  app.get(
    '/event/ranking/:id',
    {
      schema: {
        description: 'Get referral links ranking of the event',
        tags: ['Event'],
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID of the event',
            },
          },
          required: ['id'],
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      onRequest: [verifyJwt],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const { redis } = app
      const cacheKey = `eventRanking:${id}`
      const cachedResult = await redis.get(cacheKey)

      if (cachedResult) {
        return reply
          .status(200)
          .send({ referralLinks: JSON.parse(cachedResult) })
      }

      const result = await getEventRanking({ event_id: id })

      if (isLeft(result)) {
        const error = result.left

        return reply.status(400).send({ message: error.message })
      }

      await redis.set(
        cacheKey,
        JSON.stringify(result.right.referralLinks),
        'EX',
        30 // TODO: verify if was good time
      )

      return reply
        .status(200)
        .send({ referralLinks: result.right.referralLinks })
    }
  )
}
