import { login } from '@/app/functions/login'
import { isLeft, unwrapEither } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function loginRoute(app: FastifyInstance) {
  app.post(
    '/login',
    {
      schema: {
        description: 'Host login with email and password',
        tags: ['Auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the host',
              default: 'vercel@vercel.com',
            },
            password: {
              type: 'string',
              description: 'Password of the host',
              default: 'vercel-password',
            },
          },
        },
        response: {
          200: {
            description: 'Login successful',
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT Token' },
            },
          },
          401: {
            description: 'Invalid email or password',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = z
        .object({
          email: z.string().email(),
          password: z.string(),
        })
        .parse(request.body)

      const result = await login({ email, password })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          case 'InvalidEmailOrPassword':
            return reply.status(401).send({ message: error.message })

          default:
            return reply.status(400).send()
        }
      }

      const token = app.jwt.sign({ host_id: result.right.host.id })

      return reply.status(200).send({ token })
    }
  )
}
