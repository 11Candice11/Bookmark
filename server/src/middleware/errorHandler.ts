import type { ErrorRequestHandler, RequestHandler } from "express";
import type { ApiErrorBody } from "@bookmark/shared";
import { AppError, NotFoundError } from "../errors/AppError.js";

function send(res: Parameters<ErrorRequestHandler>[2], status: number, error: ApiErrorBody["error"]) {
  res.status(status).json({ error } satisfies ApiErrorBody);
}

/** Catch-all for unmatched routes. Register after every router. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.path}`));
};

/** Turns thrown errors into JSON responses. Register last. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    send(res, err.statusCode, { code: err.code, message: err.message, details: err.details });
    return;
  }

  // Errors raised by Express itself, e.g. a request body that is not valid JSON.
  const status = typeof err?.status === "number" ? err.status : undefined;
  if (status && status >= 400 && status < 500) {
    send(res, status, { code: "BAD_REQUEST", message: "The request could not be read." });
    return;
  }

  console.error(err);
  send(res, 500, { code: "INTERNAL_ERROR", message: "Something went wrong." });
};
