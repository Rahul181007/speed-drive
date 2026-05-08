import { z } from "zod";

export const uploadTripSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Trip name must be at least 3 characters"),
});