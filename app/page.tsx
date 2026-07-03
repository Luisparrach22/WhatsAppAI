"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("operator@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simular llamada a la API POST /api/auth/login
    setTimeout(() => {
      if (email === "operator@example.com" && password === "password") {
        router.push("/dashboard");
      } else {
        setError("Credenciales incorrectas. Pruebe con operator@example.com y password");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-tr from-zinc-950 via-zinc-900 to-emerald-950/30 px-6 py-12 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-700/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-8 rounded-2xl shadow-xl z-10">
        {/* App Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-black font-extrabold text-2xl mb-3 shadow-lg shadow-emerald-500/20">
            W
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            WhatsApp <span className="text-emerald-400 font-extrabold">AI</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1 text-center">
            Gestión Inteligente de WhatsApp Business con IA y OCR
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center leading-normal">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/50 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/50 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
            ) : (
              "Ingresar al Dashboard"
            )}
          </button>
        </form>

        {/* Demo User Info Hint */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-zinc-500 leading-normal">
            * Credenciales de demostración pre-cargadas para la evaluación inicial.
          </p>
        </div>
      </div>
    </div>
  );
}
