import { registerHost } from '@/app/functions/register-host'
import { isLeft } from '@/core/either'
import { schema } from '@/db/schema'
import { createInsertSchema } from 'drizzle-zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

const successResponseSchema = z.object({
  host: createInsertSchema(schema.hosts),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const responseSchema = {
  201: successResponseSchema.describe('Host successfully registered.'),
  409: errorResponseSchema.describe(
    'Conflict: The email is already registered.'
  ),
  400: errorResponseSchema.describe('Bad request: Input validation errors.'),
}

export async function registerHostRoute(app: FastifyInstance) {
  app.after(() => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/register-host',
      schema: {
        description: 'Register event host',
        tags: ['Host'],
        body: bodySchema,
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
