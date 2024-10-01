import { TypeID, typeid } from 'typeid-js'

export const PREFIXES = {
  user: 'usr',
  event: 'evt',
  'referral-link': 'rfr',
  host: 'hst',
} as const

export function generateUniqueId(prefixKey: keyof typeof PREFIXES) {
  const prefix = PREFIXES[prefixKey]

  return typeid(prefix).toString()
}

export function parseUniqueId(id: string): {
  prefix: string
  id: string
} {
  const typeId = TypeID.fromString(id)

  return {
    prefix: typeId.getType(),
    id: typeId.getSuffix(),
  }
}
