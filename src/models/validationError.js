// Distinguishes safe input feedback from internal database or runtime failures.
export default class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
