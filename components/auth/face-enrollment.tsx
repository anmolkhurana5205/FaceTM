"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { enrollFace } from "@/actions/face-auth";
import { detectFaceDescriptor, descriptorToJson } from "@/lib/face-detection";

interface FaceEnrollmentProps {
  isEnrolled: boolean;
  onDisable: () => void;
  onEnroll: () => void;
}

export const FaceEnrollment = ({
  isEnrolled,
  onDisable,
  onEnroll,
}: FaceEnrollmentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {
        setError("Could not start video playback.");
      });
    }
  }, [isStreaming]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = async () => {
    setError(undefined);
    setSuccess(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
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

  const captureAndEnroll = async () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    setError(undefined);

    try {
      const descriptor = await detectFaceDescriptor(videoRef.current);

      if (!descriptor) {
        setError(
          "No face detected. Make sure your face is visible inside the oval and well-lit, then try again.",
        );
        setIsCapturing(false);
        return;
      }

      const descriptorJson = descriptorToJson(descriptor);
      stopCamera();

      startTransition(async () => {
        const result = await enrollFace(descriptorJson);
        if (result.error) {
          setError(result.error);
        }
        if (result.success) {
          setSuccess(result.success);
          onEnroll();
        }
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong during face capture.";
      setError(message);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Face Authentication</p>
          <p className="text-xs text-muted-foreground">
            {isEnrolled ? "Face is enrolled" : "No face enrolled yet"}
          </p>
        </div>

        <div className="flex gap-2">
          {isEnrolled && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDisable}
              disabled={isPending}
            >
              Disable
            </Button>
          )}
          <Button
            size="sm"
            onClick={isStreaming ? captureAndEnroll : startCamera}
            disabled={isPending || isCapturing}
          >
            {isStreaming
              ? isCapturing
                ? "Scanning..."
                : "Capture Face"
              : isEnrolled
                ? "Re-enroll"
                : "Setup Face Auth"}
          </Button>
        </div>
      </div>

      <div
        className={isStreaming ? "flex flex-col items-center gap-3" : "hidden"}
      >
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded-xl w-full max-w-sm border-2 border-primary"
            style={{ transform: "scaleX(-1)" }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ transform: "scaleX(-1)" }}
          >
            <div
              className="border-4 border-primary border-dashed rounded-full opacity-60"
              style={{ width: "160px", height: "200px" }}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Keep your face inside the oval, then click{" "}
          <strong>Capture Face</strong>.
          <br />
          Hold still until scanning completes.
        </p>
        <Button variant="outline" size="sm" onClick={stopCamera}>
          Cancel
        </Button>
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />
    </div>
  );
};
