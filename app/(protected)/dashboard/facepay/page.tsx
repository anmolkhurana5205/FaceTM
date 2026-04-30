import { ScanFace } from "lucide-react";

const FacePayPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
        <ScanFace className="w-6 h-6 text-indigo-400" />
      </div>
      <h2 className="text-white/80 text-xl font-semibold">FacePay</h2>
      <p className="text-white/30 text-sm mt-1.5 max-w-xs">
        Live camera + face verification payment flow coming (stuck in jam).
      </p>
    </div>
  );
};

export default FacePayPage;
