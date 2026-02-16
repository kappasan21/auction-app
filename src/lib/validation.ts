import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = registerSchema;

export const auctionSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters."),
    category: z.string().optional(),
    startingPrice: z
      .number()
      .int()
      .positive("Starting price must be a positive number."),
    startsAt: z.string().min(1, "Start date/time is required."),
    endAt: z.string().min(1, "End date/time is required."),
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.startsAt);
    const end = Date.parse(data.endAt);
    if (Number.isNaN(start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startsAt"],
        message: "Start date/time must be a valid date.",
      });
    }
    if (Number.isNaN(end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endAt"],
        message: "End date/time must be a valid date.",
      });
    }
    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endAt"],
        message: "End date/time must be after the start date/time.",
      });
    }
  });

export const bidSchema = z.object({
  amount: z.number().int().positive(),
});
