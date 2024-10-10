import { registerSubscription } from '@/app/functions/register-subscription'
import { isLeft } from '@/core/either'
import { schema } from '@/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  eventId: z.string().min(1, 'Event ID is required'),
  referralToken: z.string().optional(),
})

const successResponseSchema = z.object({
  subscription: createInsertSchema(schema.subscriptions),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const responseSchema = {
  201: successResponseSchema.describe('Subscription successfully registered.'),
  409: errorResponseSchema.describe(
    'Conflict: The email is already subscribed to this event.'
  ),
  404: errorResponseSchema.describe(
    'Not found: The specified event does not exist.'
  ),
  400: errorResponseSchema.describe(
    'Bad request: Input validation errors or logical constraints not met.'
  ),
}

export async function registerSubscriptionRoute(app: FastifyInstance) {
  app.after(() => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/subscription',
      schema: {
        description: 'Register a subscription for an event',
        tags: ['Subscription'],
        body: bodySchema,
        response: responseSchema,
      },
      handler: async (request, reply) => {
        const { referralToken, eventId, name, email } = request.body

        const result = await registerSubscription({
          name,
          email,
          eventId,
          referralToken,
        })

        if (isLeft(result)) {
          const error = result.left
          switch (error.constructor.name) {
            case 'EmailAlreadySubscribedError':
              return reply.status(409).send({ message: error.message })
            case 'EventNotFoundError':
              return reply.status(404).send({ message: error.message })
            case 'EventDateError':
              return reply.status(400).send({ message: error.message })
            default:
              return reply.status(400).send()
          }
        }

        return reply
          .status(201)
          .send({ subscription: result.right.subscription })
      },
    })
  })
}
