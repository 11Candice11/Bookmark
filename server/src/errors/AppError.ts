import type { ApiErrorBody } from "@bookmark/shared";

/** An error that is safe to show to API clients. Anything else becomes a generic 500. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: ApiErrorBody["error"]["details"],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(details: NonNullable<ApiErrorBody["error"]["details"]>, message = "The request is invalid.") {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

/** The requested time is not a bookable slot for that branch (wrong time, in the past, too far ahead). */
export class InvalidSlotError extends AppError {
  constructor(message = "That time is not available for booking. Please choose another.") {
    super(400, "INVALID_SLOT", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class SlotTakenError extends AppError {
  constructor(message = "That time slot has just been taken. Please choose another.") {
    super(409, "SLOT_TAKEN", message);
  }
}
