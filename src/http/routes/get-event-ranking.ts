import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'
import { getEventRanking } from '@/app/functions/get-event-ranking'
import { isLeft } from '@/core/either'
import { z } from 'zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { parseISO } from 'date-fns'

const paramsSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
})

const querySchema = z.object({
  selectedDate: z.string().optional().describe('Date to view ranking'),
})

const rankingSchema = z.array(
  z.object({
    id: z.string(),
    token: z.string(),
    email: z.string(),
    click_count: z.number(),
    subscription_count: z.number(),
    created_at: z.date(),
  })
)

const responseSchema = {
  200: z
    .object({
      ranking: rankingSchema,
    })
    .describe('Successful response with an array of referral rankings.'),
  400: z
    .object({
      message: z.string(),
    })
    .describe(
      'Bad request response indicating that the input parameters were invalid or missing, or an error occurred in processing the request.'
    ),
}

export async function getEventRankingRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/event/ranking/:eventId',
    schema: {
      description: 'Get referral ranking of the event',
      tags: ['Event'],
      params: paramsSchema,
      querystring: querySchema,
      security: [
        {
          bearerAuth: [],
        },
      ],
      response: responseSchema,
    },
    onRequest: [verifyJwt],
    handler: async (request, reply) => {
      const { eventId } = paramsSchema.parse(request.params)
      const { selectedDate } = querySchema.parse(request.query)

      const { redis } = app

      const result = await getEventRanking({
        eventId,
        selectedDate: selectedDate ? parseISO(selectedDate) : new Date(),
        redis,
      })

      if (isLeft(result)) {
        const error = result.left

        if (error.constructor.name === 'InvalidDateError') {
          return reply.status(400).send({ message: error.message })
        }

        return reply.status(400).send({ message: 'An error occurred' })
      }

      return reply.status(200).send({ ranking: result.right.ranking })
    },
  })
}
