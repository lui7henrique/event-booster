export class EventPastDateError extends Error {
  constructor(message?: string) {
    super(
      message ??
        'The event cannot be scheduled in the past. Please choose a future date for the event.'
    )
  }
}
