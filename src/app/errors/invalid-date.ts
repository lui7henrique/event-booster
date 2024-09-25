export class InvalidDateError extends Error {
  constructor(message?: string) {
    super(message ?? 'The date provided is invalid. Use MM/DD/YYYY')
  }
}
