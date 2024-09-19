import { registerSubscription } from '@/app/functions/register-subscription'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function registerSubscriptionRoute(app: FastifyInstance) {
  app.post('/subscription', async (request, reply) => {
    const body = z.object({
      name: z.string(),
      email: z.string().email(),
      event_id: z.string(),
    })

    const { name, email, event_id } = body.parse(request.body)

    const result = await registerSubscription({
      name,
      email,
      eventId: event_id,
    })

    if (isLeft(result)) {
      const error = result.left

      switch (error.constructor.name) {
        case 'EmailAlreadySubscribedError':
          return reply.status(409).send({ message: error.message })
        default:
          return reply.status(400).send()
      }
    }

    return reply.status(201).send({ subscription: result.right.subscription })
  })
}
