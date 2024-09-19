export class EventDateError extends Error {
  constructor(message?: string) {
    super(message ?? 'The event is not active on the current dates.')
  }
}
