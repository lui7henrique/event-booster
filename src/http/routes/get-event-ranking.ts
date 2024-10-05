import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'
import { getEventRanking } from '@/app/functions/get-event-ranking'
import { isLeft } from '@/core/either'
import { isPast, parseISO } from 'date-fns'
import { z } from 'zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

const FIFTEEN_MINUTES = 60 * 15
const TWO_MONTHS = 60 * 60 * 24 * 30 * 2 // Seconds;Minutes;Hours;Days;Months

const paramsSchema = z.object({
  id: z.string().min(1, 'Event ID is required'),
})

const querySchema = z.object({
  selected_date: z.string().optional().describe('Date to view ranking'),
})

const responseSchema = z.object({
  ranking: z.array(
    z.object({
      subscription_count: z.number(),
      id: z.string(),
      token: z.string(),
      click_count: z.number(),
      email: z.string(),
      created_at: z.date(),
    })
  ),
})

export async function getEventRankingRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/event/ranking/:id',
    schema: {
      description: 'Get referral links ranking of the event',
      tags: ['Event'],
      params: paramsSchema,
      querystring: querySchema,
      security: [
        {
          bearerAuth: [],
        },
      ],
      response: {
        200: responseSchema,
        400: z.object({
          message: z.string(),
        }),
      },
    },
    onRequest: [verifyJwt],
    handler: async (request, reply) => {
      const { id } = paramsSchema.parse(request.params)
      const { selected_date } = querySchema.parse(request.query)

      const { redis } = app
      const cacheKey = `eventRanking:${id}-${selected_date}`
      const cachedResult = await redis.get(cacheKey)

      if (cachedResult) {
        return reply.status(200).send({ ranking: JSON.parse(cachedResult) })
      }

      const result = await getEventRanking({ event_id: id, selected_date })

      if (isLeft(result)) {
        const error = result.left
        if (error.constructor.name === 'InvalidDateError') {
          return reply.status(400).send({ message: error.message })
        }
        return reply.status(400).send({ message: 'An error occurred' })
      }

      const isDatePast = selected_date ? isPast(parseISO(selected_date)) : false

      await redis.set(
        cacheKey,
        JSON.stringify(result.right.ranking),
        'EX',
        isDatePast ? TWO_MONTHS : FIFTEEN_MINUTES
      )

      return reply.status(200).send({ ranking: result.right.ranking })
    },
  })
}
