export class HashPasswordError extends Error {
  constructor() {
    super('Failed to hash password.')
  }
}
