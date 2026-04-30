"use client";

const BUBBLES = [
  { id: 0, size: 64, left: "8%", dur: 22, del: 0, op: 0.55 },
  { id: 1, size: 42, left: "22%", dur: 28, del: -6, op: 0.45 },
  { id: 2, size: 86, left: "43%", dur: 19, del: -13, op: 0.35 },
  { id: 3, size: 52, left: "61%", dur: 24, del: -3, op: 0.5 },
  { id: 4, size: 72, left: "78%", dur: 30, del: -17, op: 0.4 },
  { id: 5, size: 36, left: "54%", dur: 17, del: -9, op: 0.65 },
  { id: 6, size: 94, left: "33%", dur: 26, del: -22, op: 0.3 },
  { id: 7, size: 48, left: "89%", dur: 21, del: -14, op: 0.5 },
  { id: 8, size: 58, left: "16%", dur: 23, del: -4, op: 0.45 },
  { id: 9, size: 76, left: "70%", dur: 31, del: -11, op: 0.35 },
];

export const BubbleBackground = () => {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {BUBBLES.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            width: b.size,
            height: b.size,
            left: b.left,
            bottom: `-${b.size}px`,
            borderRadius: "50%",
            border: `1px solid rgba(167, 139, 250, ${b.op * 1.8})`,
            background: `radial-gradient(circle at 30% 30%, rgba(167, 139, 250, ${b.op}), transparent 70%)`,
            filter: `blur(${Math.round(b.size * 0.06)}px)`,
            animation: `bubble-rise ${b.dur}s ${b.del}s infinite linear`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
};
