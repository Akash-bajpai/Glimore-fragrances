import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function unauthorized(message = "You must be signed in to do that.") {
  return fail(message, 401);
}

export function forbidden(message = "You don't have permission to do that.") {
  return fail(message, 403);
}

export function notFound(message = "Not found.") {
  return fail(message, 404);
}

export function tooManyRequests(message = "Too many requests. Please slow down.") {
  return fail(message, 429);
}

export function fromZodError(error: ZodError) {
  const details = error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
  return fail(details[0]?.message ?? "Please check the highlighted fields.", 422, details);
}

export function serverError(err: unknown) {
  console.error(err);
  return fail("Something went wrong on our end. Please try again.", 500);
}
