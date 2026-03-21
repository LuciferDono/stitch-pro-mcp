export class StitchProError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
  ) {
    super(message);
    this.name = 'StitchProError';
  }
}

export class ProcessorFatalError extends StitchProError {
  constructor(processor: string, message: string) {
    super(`[${processor}] ${message}`, 'PROCESSOR_FATAL', false);
    this.name = 'ProcessorFatalError';
  }
}

export class StitchApiError extends StitchProError {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message, 'STITCH_API_ERROR', statusCode === 429 || statusCode === 503);
    this.name = 'StitchApiError';
  }
}

export class ValidationError extends StitchProError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', false);
    this.name = 'ValidationError';
  }
}
