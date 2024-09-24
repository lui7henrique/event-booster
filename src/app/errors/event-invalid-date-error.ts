export class EventInvalidDateError extends Error {
  constructor(message?: string) {
    super(
      message ??
        'The start date of the event cannot be later than the end date. Please ensure that the event duration is valid.'
    )
  }
}
