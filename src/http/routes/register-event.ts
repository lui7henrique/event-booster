import { registerEvent } from '@/app/functions/register-event'
import { isLeft } from '@/core/either'
import { addDays, subDays } from 'date-fns'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { verifyJwt } from '../hooks/verify-jwt'
import { createSelectSchema } from 'drizzle-zod'
import { schema } from '@/db/schema'

const bodySchema = z.object({
  title: z.string().min(1, 'Title is required').default('Unnamed Event'),
  startDate: z
    .string()
    .datetime({ message: 'Start date must be in ISO 8601 format' }),
  endDate: z
    .string()
    .datetime({ message: 'End date must be in ISO 8601 format' }),
})

const successResponseSchema = z.object({
  event: createSelectSchema(schema.events),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const responseSchema = {
  201: successResponseSchema.describe('Event successfully registered.'),
  409: errorResponseSchema.describe('Conflict with the provided event dates.'),
  400: errorResponseSchema.describe('Bad request.'),
}

export async function registerEventRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/event',
    onRequest: [verifyJwt],
    schema: {
      description: 'Register event with date-time format',
      tags: ['Event'],
      body: bodySchema,
      response: responseSchema,
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    handler: async (request, reply) => {
      const { hostId } = request.user
      const { title, endDate, startDate } = bodySchema.parse(request.body)

      const result = await registerEvent({
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        hostId: hostId,
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
