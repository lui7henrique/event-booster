import { loginCompany } from '@/app/functions/login'
import { isLeft, unwrapEither } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function loginRoute(app: FastifyInstance) {
  app.post(
    '/login',
    {
      schema: {
        description: 'Company login with email and password',
        tags: ['Auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the company',
            },
            password: {
              type: 'string',
              description: 'Password of the company',
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
      const body = z
        .object({
          email: z.string().email(),
          password: z.string(),
        })
        .parse(request.body)

      const result = await loginCompany({ ...body })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          case 'InvalidEmailOrPassword':
            return reply.status(401).send({ message: error.message })

          default:
            return reply.status(400).send()
        }
      }

      const token = app.jwt.sign({ companyId: result.right.company.id })

      return reply.status(200).send({ token })
    }
  )
}
