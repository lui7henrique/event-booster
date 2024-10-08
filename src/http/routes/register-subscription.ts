import { registerSubscription } from '@/app/functions/register-subscription'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  eventId: z.string().min(1, 'Event ID is required'),
  referralToken: z.string().optional(),
})

export async function registerSubscriptionRoute(app: FastifyInstance) {
  app.after(() => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/subscription',
      schema: {
        description: 'Register a subscription for an event',
        tags: ['Subscription'],
        body: schema,
        // response: {
        //   201: z.object({
        //     subscription: z.object({
        //       id: z.string(),
        //       name: z.string(),
        //       email: z.string(),
        //       event_id: z.string().nullable(),
        //     }),
        //   }),
        //   400: z.object({
        //     message: z.string(),
        //   }),
        //   409: z.object({
        //     message: z.string(),
        //   }),
        //   404: z.object({
        //     message: z.string(),
        //   }),
        // },
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

        return reply.status(201).send({ ...result.right })
      },
    })
  })
}
