"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "../ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useState } from "react";

export const Social = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onClick = (provider: "google" | "github") => {
    if (isLoading) return;
    setIsLoading(true);
    signIn(provider, {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <div className="flex items-center gap-x-2 w-full">
      <Button
        disabled={isLoading}
        size={"lg"}
        className="flex-1 cursor-pointer"
        variant={"outline"}
        onClick={() => {
          onClick("google");
        }}
      >
        <FcGoogle className="h-5 w-5" />
      </Button>
      <Button
        disabled={isLoading}
        size={"lg"}
        className="flex-1 cursor-pointer"
        variant={"outline"}
        onClick={() => {
          onClick("github");
        }}
      >
        <FaGithub className="h-5 w-5" />
      </Button>
    </div>
  );
};
