import { login } from '@/app/functions/login'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format').default('vercel@vercel.com'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .default('vercel-password'),
})

export async function loginRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      description: 'Host login with email and password',
      tags: ['Auth'],
      body: loginSchema,
      response: {
        200: z
          .object({
            token: z.string(),
          })
          .describe('JWT token for authenticated session.'),

        401: z
          .object({
            message: z.string(),
          })
          .describe('Authentication failed due to invalid email or password.'),

        400: z
          .object({
            message: z.string(),
          })
          .describe('Bad request. '),
      },
    },
    handler: async (request, reply) => {
      const { email, password } = loginSchema.parse(request.body)
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

      const token = app.jwt.sign({ hostId: result.right.host.id })
      return reply.status(200).send({ token })
    },
  })
}
