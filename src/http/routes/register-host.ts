import { registerHost } from '@/app/functions/register-host'
import { isLeft } from '@/core/either'
import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function registerHostRoute(app: FastifyInstance) {
  app.post(
    '/register-host',
    {
      schema: {
        description: 'Register event host',
        tags: ['Host'],
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the event host',
            },
            email: {
              type: 'string',
              description: 'Email of the event host',
            },
            password: {
              type: 'string',
              description: 'Password of the event host',
            },
          },
        },
      },
    },
    async (request, reply) => {
      const body = z
        .object({
          name: z.string(),
          email: z.string().email(),
          password: z.string(),
        })
        .parse(request.body)

      const result = await registerHost({ ...body })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          case 'HostEmailAlreadyRegisteredError':
            return reply.status(409).send({ message: error.message })

          default:
            return reply.status(400).send()
        }
      }

      return reply.status(201).send({ host: result.right.host })
    }
  )
}
