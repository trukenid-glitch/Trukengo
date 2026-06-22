import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { loginUser } from '../api/authService';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); 

    try {
      const result = await loginUser(formData.username, formData.password);
      
      if (result.status === "success") {
        // Cukup simpan data profil user biasa ke localStorage (untuk kebutuhan UI)
        const userData = {
          username: result.data.username,
          role: result.data.role 
        };
        localStorage.setItem('user', JSON.stringify(userData));

        // Arahkan berdasarkan role
        if (result.data.role === 'admin') {
          navigate('/super-admin/dashboard');
        } else if (result.data.role === 'driver') {
          navigate('/driver/orders');
        } else {
          navigate('/katalog');
        }
      }
    } catch (err) {
      setError(err); 
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Aksesoris Background (Biar gak polos di Laptop) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[400px] relative z-10">
        {/* LOGO & TITLE */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 mb-4 border border-white/10">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-none">
            ADMIN <span className="text-blue-500 text-sm italic">SUPER</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            TrukenGo System Management
          </p>
        </div>

        {/* FORM LOGIN */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Input Username */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                  placeholder="Masukkan username..."
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-500 text-[11px] font-bold text-center animate-shake">
                  {error}
                </div>
              )}
            </div>

            {/* Tombol Login */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* Info Footer */}
        <p className="text-center text-slate-600 text-[10px] mt-8 font-medium">
          &copy; 2026 TrukenGo Tech. Authorized Personnel Only.
        </p>
      </div>
    </div>
  );
}