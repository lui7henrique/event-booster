import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../hooks/verify-jwt'
import { getEventRanking } from '@/app/functions/get-event-ranking'
import { isLeft } from '@/core/either'
import { z } from 'zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

const params = z.object({
  id: z.string().min(1, 'Event ID is required'),
})

const query = z.object({
  selected_date: z.string().optional().describe('Date to view ranking'),
})

const response = z.object({
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
      params: params,
      querystring: query,
      security: [
        {
          bearerAuth: [],
        },
      ],
      response: {
        200: response,
        400: z.object({
          message: z.string(),
        }),
      },
    },
    onRequest: [verifyJwt],
    handler: async (request, reply) => {
      const { id } = params.parse(request.params)
      const { selected_date } = query.parse(request.query)

      const { redis } = app

      const result = await getEventRanking({
        event_id: id,
        selected_date,
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
