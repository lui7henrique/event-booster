import { registerCompany } from '@/app/functions/register-company'
import { isLeft } from '@/core/either'
import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function registerCompanyRoute(app: FastifyInstance) {
  app.post(
    '/company',
    {
      schema: {
        description: 'Register company',
        tags: ['Company'],
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the company',
              default: 'Unnamed Company',
            },
            email: {
              type: 'string',
              description: 'Email of the company',
              default: faker.internet.email(),
            },
            password: {
              type: 'string',
              description: 'Password of the company',
              default: faker.internet.password(),
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

      const result = await registerCompany({ ...body })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          case 'CompanyAlreadyRegisteredError':
            return reply.status(409).send({ message: error.message })

          default:
            return reply.status(400).send()
        }
      }

      return reply.status(201).send({ company: result.right.company })
    }
  )
}
