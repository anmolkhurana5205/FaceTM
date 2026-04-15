"use client";

const loadFresh = async () => {
  const api = await import("face-api.js");
  const MODEL_URL = "/models";

  await Promise.all([
    api.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    api.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  return api;
};

export const waitForVideoReady = (video: HTMLVideoElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (video.readyState >= 2) {
      resolve();
      return;
    }
    const cleanup = () => {
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Video stream error"));
    };
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onError);
    setTimeout(() => {
      cleanup();
      reject(new Error("Video took too long to be ready. Try again."));
    }, 8000);
  });
};

export const detectFaceDescriptor = async (
  video: HTMLVideoElement,
): Promise<Float32Array | null> => {
  const api = await loadFresh();
  await waitForVideoReady(video);

  const detection = await api
    .detectSingleFace(video, new api.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor ?? null;
};

export const descriptorToJson = (d: Float32Array): string =>
  JSON.stringify(Array.from(d));

export const jsonToDescriptor = (json: string): Float32Array =>
  new Float32Array(JSON.parse(json));

export const FACE_MATCH_THRESHOLD = 0.55;
