export class InvalidFutureDateError extends Error {
  constructor(message?: string) {
    super(message ?? 'The selected date cannot be in the future.')
  }
}
