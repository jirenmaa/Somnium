import { z } from "zod";

import { passwordSchema } from "@/lib/auth/password";
import { restrictedUsernames } from "@/lib/auth/usernames";

export const signInSchema = z.object({
  username: z.string().min(4, { message: "Username is required" }),
  password: z
    .string()
    .min(6, { message: "Password lenght at least 6 characters" }),
});

export const signUpSchema = z
  .object({
    email: z
      .email({ message: "Invalid email address" })
      .min(1, { message: "Email is required" }),
    name: z.string().min(4, { message: "Must be at least 4 characters" }),
    username: z
      .string()
      .min(4, { message: "Must be at least 4 characters" })
      .regex(/^[a-zA-Z0-9]+$/, "Only letters and numbers allowed")
      .refine(
        (username) => {
          for (const pattern of restrictedUsernames) {
            if (username.toLowerCase().includes(pattern)) {
              return false;
            }
          }
          return true;
        },
        { message: "Username contains disallowed words" },
      ),
    password: passwordSchema,
    confirmPassword: z.string().min(8, {
      message: "Must be at least 8 characters",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const videoFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5_000, "Description is too long")
    .refine(
      (val) => val.length > 0,
      "Description cannot be empty",
    ),
  visibility: z.enum(["public", "private", "unlisted"]),
});

export const updateVideoSchema = z.object({
  videoId: z.string(),
  visibility: z.enum(["public", "private", "unlisted"]),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type VideoFormValues = z.infer<typeof videoFormSchema>;
