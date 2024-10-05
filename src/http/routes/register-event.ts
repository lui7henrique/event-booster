import { registerEvent } from '@/app/functions/register-event'
import { isLeft } from '@/core/either'
import { addDays, subDays } from 'date-fns'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { verifyJwt } from '../hooks/verify-jwt'

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').default('Unnamed Event'),
  start_date: z
    .string()
    .datetime({ message: 'Start date must be in ISO 8601 format' })
    .default(subDays(new Date(), 1).toISOString()),
  end_date: z
    .string()
    .datetime({ message: 'End date must be in ISO 8601 format' })
    .default(addDays(new Date(), 3).toISOString()),
})

export async function registerEventRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/event',
    onRequest: [verifyJwt],
    schema: {
      description: 'Register event with date-time format',
      tags: ['Event'],
      body: eventSchema,
      security: [
        {
          bearerAuth: [],
        },
      ],
      response: {
        201: z.object({
          event: z.object({
            id: z.string(),
            title: z.string(),
            start_date: z.date(),
            end_date: z.date(),
          }),
        }),
        400: z.object({
          message: z.string(),
        }),
        409: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { host_id } = request.user

      const { title, end_date, start_date } = eventSchema.parse(request.body)

      const result = await registerEvent({
        title,
        start_date,
        end_date,
        host_id,
      })

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
    },
  })
}
