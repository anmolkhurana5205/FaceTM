"use client";
import { useCallback, useEffect, useState } from "react";
// import { BeatLoader } from "react-spinners";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import { newVerification } from "@/actions/new-verification";
import { CardWrapper } from "./card-wrapper";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

const LazyGridLoader = dynamic(
  () => import("react-spinners").then((mod) => mod.GridLoader),
  { ssr: false } // Server Side Render nahi karna hai qki usme kuch problem aa rhi hai
);

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;
    if (!token) {
      setError("Missing token");
      return;
    }
    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong");
      });
  }, [token, success, error]);

  useEffect(() => {
    Promise.resolve().then(onSubmit);
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="w-full flex justify-center items-center">
        {!success && !error && <LazyGridLoader color="#2a72de" />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};
