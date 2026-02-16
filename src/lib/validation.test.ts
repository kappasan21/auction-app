import { describe, expect, it } from "vitest";
import { auctionSchema, loginSchema } from "./validation";

describe("validation schemas", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "Password123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid auction data", () => {
    const result = auctionSchema.safeParse({
      title: "Hi",
      description: "Too short",
      startingPrice: -5,
      startsAt: "",
      endAt: "",
    });
    expect(result.success).toBe(false);
  });
});
