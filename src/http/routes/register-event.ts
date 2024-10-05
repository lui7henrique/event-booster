import { registerEvent } from '@/app/functions/register-event'
import { isLeft } from '@/core/either'
import { addDays, subDays } from 'date-fns'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verifyJwt } from '../hooks/verify-jwt'

export async function registerEventRoute(app: FastifyInstance) {
  app.post(
    '/event',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Register event with date-time format',
        tags: ['Event'],
        body: {
          type: 'object',
          required: ['title', 'start_date', 'end_date'],
          properties: {
            title: {
              type: 'string',
              description: 'Title of the event',
              default: 'Unnamed Event',
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Start date and time of the event (ISO 8601 format)',
              default: subDays(new Date(), 1).toISOString(),
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'End date and time of the event (ISO 8601 format)',
              default: addDays(new Date(), 3).toISOString(),
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    async (request, reply) => {
      const { host_id } = request.user

      const body = z
        .object({
          title: z.string(),
          start_date: z.string(),
          end_date: z.string(),
        })
        .parse(request.body)

      const result = await registerEvent({ ...body, host_id })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          case 'EventInvalidDateError':
            return reply.status(409).send({ message: error.message })
          case 'EventPastDateError':
            return reply.status(409).send({ message: error.message })
          default:
            return reply.status(400).send()
        }
      }

      return reply.status(201).send({ event: result.right.event })
    }
  )
}
