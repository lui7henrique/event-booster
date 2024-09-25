import { registerSubscription } from '@/app/functions/register-subscription'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function registerSubscriptionRoute(app: FastifyInstance) {
  app.post(
    '/subscription',
    {
      config: {
        rateLimit: {
          max: 50,
          timeWindow: '1 minute',
        },
      },
      schema: {
        description: 'Register a subscription for an event',
        tags: ['Subscription'],
        body: {
          type: 'object',
          required: ['name', 'email', 'event_id'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the user',
              default: 'John Doe',
            },
            email: {
              type: 'string',
              description: 'Email of the user',
              default: 'john-doe@gmail.com',
            },
            event_id: {
              type: 'string',
              description: 'Id of the event',
              default: '',
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { referral_link_token, event_id, name, email } = z
        .object({
          name: z.string(),
          email: z.string().email(),
          event_id: z.string(),
          referral_link_token: z.string().optional(),
        })
        .parse(request.body)

      const result = await registerSubscription({
        name,
        email,
        event_id,
        referral_link_token,
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

      return reply.status(201).send({ subscription: result.right.subscription })
    }
  )
}
