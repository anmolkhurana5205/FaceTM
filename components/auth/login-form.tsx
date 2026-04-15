"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { LoginSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { CardWrapper } from "./card-wrapper";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { login } from "@/actions/login";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaceLogin } from "@/components/auth/face-login";

export const LoginForm = () => {
  const SearchParams = useSearchParams();
  const urlError =
    SearchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "";

  const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const [isPending, startTransition] = useTransition();
  const [emailValue, setEmailValue] = useState("");

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  });

  const router = useRouter();
  const { update } = useSession();

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      login(values)
        .then(async (data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
            if (showTwoFactor) {
              setShowTwoFactor(false);
              setTimeLeft(null);
            }
          }
          if (data?.success) {
            setSuccess(data.success);
            await update();
            router.push(DEFAULT_LOGIN_REDIRECT);
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
            setTimeLeft(5 * 60);
          }
        })
        .catch(() => {
          setError("Something went wrong");
        });
    });
  };

  useEffect(() => {
    if (!showTwoFactor) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showTwoFactor]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        disabled={
                          isPending || (showTwoFactor && timeLeft === 0)
                        }
                        {...field}
                        placeholder="123456"
                      />
                    </FormControl>
                    {timeLeft !== null && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Code expires in {formatTime(timeLeft)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          No. of attempts: 1
                        </p>
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          {...field}
                          placeholder="anmol@example.com"
                          type="email"
                          onChange={(e) => {
                            field.onChange(e);
                            setEmailValue(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          {...field}
                          placeholder="******"
                          type="password"
                        />
                      </FormControl>
                      <Button
                        size="sm"
                        variant="link"
                        asChild
                        className="font-normal -mt-2 pl-0"
                      >
                        <Link href="/auth/reset" className="justify-self-start">
                          Forgot password?
                        </Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {emailValue && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          or
                        </span>
                      </div>
                    </div>
                    <FaceLogin email={emailValue} />
                  </>
                )}
              </>
            )}
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending || (showTwoFactor && timeLeft === 0)}
            type="submit"
            className="w-full cursor-pointer"
          >
            {showTwoFactor ? "Confirm" : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
