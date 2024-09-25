import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'
import { getEventRanking } from '@/app/functions/get-event-ranking'
import { isLeft } from '@/core/either'
import { isPast, parseISO } from 'date-fns'

const FIFTEEN_MINUTES = 60 * 15
const TWO_MONTHS = 60 * 60 * 24 * 30 * 2 // Seconds;Minutes;Hours;Days;Months

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
        querystring: {
          type: 'object',
          properties: {
            selected_date: {
              type: 'string',
              description: 'Date to view ranking',
            },
          },
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
      const { selected_date } = request.query as { selected_date?: string }

      const { redis } = app
      const cacheKey = `eventRanking:${id}-${selected_date}`
      const cachedResult = await redis.get(cacheKey)

      if (cachedResult) {
        return reply
          .status(200)
          .send({ referralLinks: JSON.parse(cachedResult) })
      }

      const result = await getEventRanking({ event_id: id, selected_date })

      if (isLeft(result)) {
        const error = result.left

        return reply.status(400).send({ message: error.message })
      }

      const isDatePast = selected_date ? isPast(parseISO(selected_date)) : false

      const expiresIn = await redis.set(
        cacheKey,
        JSON.stringify(result.right.referralLinks),
        'EX',
        isDatePast ? TWO_MONTHS : FIFTEEN_MINUTES
      )

      return reply
        .status(200)
        .send({ referralLinks: result.right.referralLinks })
    }
  )
}
