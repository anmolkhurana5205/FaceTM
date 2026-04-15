"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { verifyFaceDescriptor } from "@/actions/face-auth";
import { detectFaceDescriptor, descriptorToJson } from "@/lib/face-detection";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

interface FaceLoginProps {
  email: string;
}

export const FaceLogin = ({ email }: FaceLoginProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .catch(() => setError("Could not start video playback."));
    }
  }, [isStreaming]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = async () => {
    setError(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      setIsStreaming(true);
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const authenticate = async () => {
    if (!videoRef.current || !email) {
      setError("Please enter your email first.");
      return;
    }

    setIsScanning(true);
    setError(undefined);

    try {
      let descriptor: Float32Array | null;
      try {
        descriptor = await detectFaceDescriptor(videoRef.current);
      } catch (modelErr) {
        setError(
          modelErr instanceof Error
            ? modelErr.message
            : "Could not load face detection models.",
        );
        return;
      }

      if (!descriptor) {
        setError(
          "No face detected. Keep your face inside the oval and ensure good lighting.",
        );
        return;
      }

      let verifyResult: Awaited<ReturnType<typeof verifyFaceDescriptor>>;
      try {
        verifyResult = await verifyFaceDescriptor(
          email,
          descriptorToJson(descriptor),
        );
      } catch {
        setError("Could not reach the server. Please try again.");
        return;
      }

      if (verifyResult.error) {
        setError(verifyResult.error);
        return;
      }

      if (verifyResult.match) {
        stopCamera();

        const signInResult = await signIn("credentials", {
          email,
          faceVerified: "true",
          redirect: false,
        });

        if (signInResult?.error) {
          setError(
            "Sign-in failed after face verification. Please use your password.",
          );
          return;
        }

        window.location.href = DEFAULT_LOGIN_REDIRECT;
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-3">
      {!isStreaming ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={startCamera}
          type="button"
        >
          🔍 Sign in with Face
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="rounded-xl border-2 border-primary w-full"
              style={{ transform: "scaleX(-1)" }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: "scaleX(-1)" }}
            >
              <div
                className="border-4 border-primary border-dashed rounded-full opacity-60"
                style={{ width: "130px", height: "160px" }}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Keep your face inside the oval, then click Verify Face
          </p>

          <div className="flex gap-2 w-full">
            <Button
              className="flex-1"
              onClick={authenticate}
              disabled={isScanning}
              type="button"
            >
              {isScanning ? "Scanning..." : "Verify Face"}
            </Button>
            <Button variant="outline" onClick={stopCamera} type="button">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <FormError message={error} />
    </div>
  );
};
