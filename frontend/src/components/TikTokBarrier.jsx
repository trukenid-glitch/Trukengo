import React, { useState, useEffect } from "react";
import {
  Monitor,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function TikTokBarrier() {
  const [isTikTok, setIsTikTok] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Deteksi apakah user-agent mengandung kata TikTok
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (ua.includes("TikTok") || ua.includes("FBAN") || ua.includes("FBAV")) {
      setIsTikTok(true);
    }
  }, []);

  const handleOpenBrowser = () => {
    const currentUrl = window.location.href.replace(/^https?:\/\//, "");
    // Intent khusus Android untuk paksa buka Chrome
    const intentUrl = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;

    window.location.href = intentUrl;

    // Fallback kalau intent tidak jalan (misal di iPhone)
    setTimeout(() => {
      handleCopyLink();
    }, 500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isTikTok) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center p-6 backdrop-blur-lg">
      <div className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header Alert */}
        <div className="bg-amber-500 p-8 flex flex-col items-center text-white text-center">
          <div className="bg-white/20 p-3 rounded-full mb-4 animate-bounce">
            <AlertTriangle size={32} strokeWidth={3} />
          </div>
          <h2 className="text-xl font-black leading-tight uppercase tracking-tight">
            Pindah ke Chrome <br /> Biar Lancar, Ndes!
          </h2>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-gray-600 text-center text-sm font-medium leading-relaxed">
            Browser TikTok membatasi fitur{" "}
            <span className="font-bold text-slate-800">GPS & WhatsApp</span>.
            Yuk pindah ke browser asli biar bisa pesan Jastip!
          </p>

          <div className="space-y-3">
            {/* Tombol Utama: Buka Otomatis */}
            <button
              onClick={handleOpenBrowser}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              <Monitor size={20} />
              Buka Otomatis (Android)
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
              <div className="bg-gray-100 p-1 rounded-md text-gray-500">
                INFO
              </div>
              <p>
                Setelah salin link, buka Google Chrome lalu tempel di kolom
                alamat ya!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
