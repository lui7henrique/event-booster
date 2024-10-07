import { registerHost } from '@/app/functions/register-host'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const hostSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export async function registerHostRoute(app: FastifyInstance) {
  app.after(() => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/register-host',
      schema: {
        description: 'Register event host',
        tags: ['Host'],
        body: hostSchema,
        response: {
          201: z.object({
            host: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
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
        const { name, email, password } = request.body
        const result = await registerHost({ name, email, password })

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
      },
    })
  })
}
