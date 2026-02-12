"use client";

import { redirect } from "next/navigation";
import { useTransition } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { signIn } from "@/lib/auth/client";
import { signInSchema, SignInFormValues } from "@/lib/validator";

import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InputPasswordContainer from "../InputPassword";

export default function SignInForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: SignInFormValues) {
    startTransition(async () => {
      const response = await signIn.username(values);

      if (response.error) {
        toast.error(response.error.message);
      } else {
        redirect("/");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <Input
                disabled={isPending}
                {...field}
                placeholder="Username"
                className="!py-6 !border-black/10"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <InputPasswordContainer>
                <Input
                  disabled={isPending}
                  {...field}
                  type="password"
                  placeholder="Password"
                  className="!py-6 !border-black/10"
                />
              </InputPasswordContainer>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full cursor-pointer rounded-full bg-[#7322FF] !py-6 text-base text-white transition-colors hover:bg-[#4E17AD]"
          disabled={isPending}
        >
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
