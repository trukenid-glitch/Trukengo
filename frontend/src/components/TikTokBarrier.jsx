import React, { useState, useEffect } from "react";
import {
  Monitor,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function TikTokBarrier() {
  const [isInApp, setIsInApp] = useState(false);
  const [detectedApp, setDetectedApp] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Deteksi apakah user-agent mengandung kata TikTok / Instagram / Facebook (in-app browsers)
    const ua = (navigator.userAgent || navigator.vendor || window.opera || "").toLowerCase();
    if (ua.includes("tiktok")) {
      setIsInApp(true);
      setDetectedApp("TikTok");
    } else if (ua.includes("instagram")) {
      setIsInApp(true);
      setDetectedApp("Instagram");
    } else if (ua.includes("fban") || ua.includes("fbav") || ua.includes("facebook")) {
      setIsInApp(true);
      setDetectedApp("Facebook");
    }
  }, []);

  const handleOpenBrowser = () => {
    const href = window.location.href;
    const ua = (navigator.userAgent || "").toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIOS = /iphone|ipad|ipod/.test(ua);

    try {
      if (isAndroid) {
        // Intent untuk buka Chrome di Android
        const withoutProtocol = href.replace(/^https?:\/\//, "");
        const intentUrl = `intent://${withoutProtocol}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
        // Jika intent gagal, fallback ke copy setelah short delay
        setTimeout(() => handleCopyLink(), 800);
        return;
      }

      if (isIOS) {
        // Coba buka di Chrome iOS via custom scheme
        const chromeScheme = href.replace(/^https?:\/\//, "googlechromes://");
        window.location.href = chromeScheme;
        // fallback: coba open new tab (may be blocked) then copy
        setTimeout(() => {
          try {
            window.open(href, "_blank");
          } catch (e) {}
          handleCopyLink();
        }, 800);
        return;
      }

      // Default: coba buka di tab baru (desktop or allowed browsers)
      const opened = window.open(href, "_blank");
      if (!opened) {
        // popup blocked or in-app prevented: fallback to copy
        handleCopyLink();
      }
    } catch (err) {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isInApp) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6 backdrop-blur-lg">
      <div className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header Alert */}
        <div className="bg-amber-500 p-8 flex flex-col items-center text-white text-center">
          <div className="bg-white/20 p-3 rounded-full mb-4">
            <AlertTriangle size={32} strokeWidth={3} />
          </div>
          <h2 className="text-xl font-black leading-tight uppercase tracking-tight">
            Pindah ke Browser <br /> Agar Pesanan Lancar!
          </h2>
          <p className="text-[11px] opacity-90 mt-1">Terdeteksi: {detectedApp}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">


          <div className="space-y-3">
            {/* Tombol Utama: Buka Otomatis */}
            <button
              onClick={handleOpenBrowser}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              <Monitor size={20} />
              Buka di Browser (Otomatis)
            </button>

            {/* Tombol Cadangan: Salin Link */}
            <button
              onClick={handleCopyLink}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 border-2
                ${
                  copied
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
                }`}
            >
              {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
              {copied ? "Link Tersalin!" : "Salin Link Manual"}
            </button>
          </div>

          <div className="pt-4 border-t border-dashed border-gray-200">
            <div className="flex items-start gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              <div className="bg-gray-100 p-1 rounded-md text-gray-500">INFO</div>
              <div>
                <p>Jika tombol otomatis tidak bekerja:</p>
                <ul className="list-disc ml-4 text-[12px] text-gray-500">
                  <li>Tekan "Salin Link Manual" lalu buka Chrome/Safari.</li>
                  <li>Atau tekan menu (⋮ / …) di pojok kanan atas dan pilih "Buka di browser".</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
