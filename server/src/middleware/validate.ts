import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../errors/AppError.js";

/**
 * Validates `req.body` or `req.query` against a Zod schema.
 * - body: replaced with the parsed value (trimmed strings, etc.).
 * - query: only checked. Express 5 makes `req.query` read-only, and the query schemas
 *   here need no transformation.
 */
export function validate(schema: ZodType, source: "body" | "query"): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(
        new ValidationError(
          result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        ),
      );
      return;
    }
    if (source === "body") req.body = result.data;
    next();
  };
}
