import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
  }
}

function captureServerException(error: unknown) {
  const capturedError =
    error instanceof Error ? error : new Error("Unexpected server error");

  Sentry.withScope((scope) => {
    scope.setTag("service", "web");

    if (error instanceof ApiError) {
      scope.setContext("apiError", {
        code: error.code,
        status: error.status
      });
    }

    Sentry.captureException(capturedError);
  });
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: error.flatten()
      }
    };
  }

  if (error instanceof ApiError) {
    if (error.status >= 500) {
      captureServerException(error);
    }

    return {
      status: error.status,
      body: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }

  captureServerException(error);

  return {
    status: 500,
    body: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error"
    }
  };
}
