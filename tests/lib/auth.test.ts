import { describe, it, expect } from "vitest";
import { AuthError, NotFoundError, handleApiError } from "@/lib/auth";

describe("AuthError", () => {
  it("has name AuthError", () => {
    const err = new AuthError();
    expect(err.name).toBe("AuthError");
  });

  it("uses default message", () => {
    const err = new AuthError();
    expect(err.message).toBe("Unauthorized");
  });

  it("uses custom message", () => {
    const err = new AuthError("Custom message");
    expect(err.message).toBe("Custom message");
  });

  it("is instanceof AuthError", () => {
    const err = new AuthError();
    expect(err instanceof AuthError).toBe(true);
  });

  it("is instanceof Error", () => {
    const err = new AuthError();
    expect(err instanceof Error).toBe(true);
  });
});

describe("NotFoundError", () => {
  it("has name NotFoundError", () => {
    const err = new NotFoundError();
    expect(err.name).toBe("NotFoundError");
  });

  it("uses default message", () => {
    const err = new NotFoundError();
    expect(err.message).toBe("Not found");
  });

  it("uses custom message", () => {
    const err = new NotFoundError("Patient not found.");
    expect(err.message).toBe("Patient not found.");
  });

  it("is instanceof NotFoundError", () => {
    const err = new NotFoundError();
    expect(err instanceof NotFoundError).toBe(true);
  });
});

describe("handleApiError", () => {
  it("returns 401 for AuthError", () => {
    const res = handleApiError(new AuthError());
    expect(res.status).toBe(401);
  });

  it("returns 404 for NotFoundError", () => {
    const res = handleApiError(new NotFoundError());
    expect(res.status).toBe(404);
  });

  it("returns 400 for SyntaxError", () => {
    const res = handleApiError(new SyntaxError("bad json"));
    expect(res.status).toBe(400);
  });

  it("returns 500 for generic Error", () => {
    const res = handleApiError(new Error("db failure"));
    expect(res.status).toBe(500);
  });

  it("returns 500 for non-Error thrown value", () => {
    const res = handleApiError("just a string");
    expect(res.status).toBe(500);
  });

  it("uses fallback message for non-Error", () => {
    const res = handleApiError(42, "Custom fallback");
    expect(res.status).toBe(500);
  });

  it("includes error message in body for AuthError", async () => {
    const res = handleApiError(new AuthError("Access denied"));
    const body = await res.json();
    expect(body.error).toBe("Access denied");
  });

  it("includes fixed message for SyntaxError regardless of message", async () => {
    const res = handleApiError(new SyntaxError("whatever"));
    const body = await res.json();
    expect(body.error).toBe("Invalid request body.");
  });
});
