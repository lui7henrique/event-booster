import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'
import { getEventRanking } from '@/app/functions/get-event-ranking'
import { isLeft } from '@/core/either'
import { z } from 'zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { parseISO } from 'date-fns'

const params = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
})

const query = z.object({
  selectedDate: z.string().optional().describe('Date to view ranking'),
})

const ranking = z.array(
  z.object({
    id: z.string(),
    token: z.string(),
    email: z.string(),
    click_count: z.number(),
    subscription_count: z.number(),
    created_at: z.date(),
  })
)

export async function getEventRankingRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/event/ranking/:eventId',
    schema: {
      description: 'Get referral links ranking of the event',
      tags: ['Event'],
      params: params,
      querystring: query,
      security: [
        {
          bearerAuth: [],
        },
      ],
      response: {
        200: z
          .object({
            ranking: ranking,
          })
          .describe('Successful response with an array of referral rankings.'),
        400: z
          .object({
            message: z.string(),
          })
          .describe(
            'Bad request response indicating that the input parameters were invalid or missing, or an error occurred in processing the request.'
          ),
      },
    },
    onRequest: [verifyJwt],
    handler: async (request, reply) => {
      const { eventId } = params.parse(request.params)
      const { selectedDate } = query.parse(request.query)

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
