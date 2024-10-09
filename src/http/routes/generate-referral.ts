import { generateReferral } from '@/app/functions/generate-referral'
import { isLeft } from '@/core/either'
import { schema } from '@/db/schema'
import { createInsertSchema } from 'drizzle-zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const generateReferralSchema = z.object({
  email: z.string().email('Invalid email format').default('john-doe@gmail.com'),

  eventId: z.string().min(1, 'Event ID is required').default(''),
})

export async function generateReferralRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/generate-referral',
    schema: {
      description: 'Generate event referral link',
      tags: ['Referral link'],
      body: generateReferralSchema,
      response: {
        201: z.object({
          referral: createInsertSchema(schema.referral),
        }),
        400: z.object({
          message: z.string().describe('Error occurred'),
        }),
        409: z.object({
          message: z.string().describe('Referral link already exists'),
        }),
      },
    },
    handler: async (request, reply) => {
      const { email, eventId } = generateReferralSchema.parse(request.body)

      const result = await generateReferral({ email, eventId })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          case 'ReferralLinkAlreadyExists':
            return reply.status(409).send({ message: error.message })

          default:
            return reply.status(400).send({ message: 'An error occurred' })
        }
      }

      return reply.status(201).send({ referral: result.right.referral })
    },
  })
}
