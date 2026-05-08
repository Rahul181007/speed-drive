import { z } from "zod";

export const signupSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters"),

    email: z
        .string()
        .trim()
        .email("Enter a valid email address"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});

export type SignupFormData = z.infer<typeof signupSchema>;


export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Enter a valid email address"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});
export type LoginFormData = z.infer<typeof loginSchema>;