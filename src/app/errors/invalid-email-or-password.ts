export class InvalidEmailOrPassword extends Error {
  constructor(message?: string) {
    super(message ?? 'Invalid email or password')
  }
}
