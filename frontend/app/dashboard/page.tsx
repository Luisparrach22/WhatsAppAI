"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";

export default function Dashboard() {
  const [stats] = useState({
    activeTrips: 12,
    pendingValidation: 3,
    messagesToday: 148,
    ocrSuccessRate: "94.2%",
  });

  const [recentTrips] = useState([
    { id: "1", client: "Juan Pérez", phone: "+34 600 11 22 33", route: "Madrid ➔ Valencia", status: "pending", date: "Hoy, 18:00" },
    { id: "2", client: "María Rodríguez", phone: "+34 622 44 55 66", route: "Barcelona ➔ Andorra", status: "confirmed", date: "Mañana, 09:30" },
    { id: "3", client: "Carlos Gómez", phone: "+34 633 77 88 99", route: "Sevilla ➔ Málaga", status: "completed", date: "Ayer, 14:00" },
  ]);

  const [auditLogs] = useState([
    { time: "Hace 5 min", action: "OCR_SUCCESS", desc: "DNI extraído para Juan Pérez (98765432W)", user: "Sistema (AI)" },
    { time: "Hace 12 min", action: "TRIP_CREATE", desc: "Viaje Madrid ➔ Valencia creado automáticamente", user: "Sistema (AI)" },
    { time: "Hace 30 min", action: "TRIP_CONFIRM", desc: "Viaje de María Rodríguez confirmado", user: "Carlos Gómez" },
  ]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
            <p className="text-muted-foreground mt-1">Automatización de WhatsApp Business e Inteligencia Artificial.</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Servidor Activo
            </span>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Viajes Activos</p>
            <div className="flex justify-between items-end mt-2">
              <span className="text-3xl font-bold">{stats.activeTrips}</span>
              <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">+15% vs ayer</span>
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Pendientes de OCR / Firma</p>
            <div className="flex justify-between items-end mt-2">
              <span className="text-3xl font-bold">{stats.pendingValidation}</span>
              <span className="text-xs font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">Acción requerida</span>
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Mensajes Procesados</p>
            <div className="flex justify-between items-end mt-2">
              <span className="text-3xl font-bold">{stats.messagesToday}</span>
              <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">100% auto</span>
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Tasa Acierto OCR</p>
            <div className="flex justify-between items-end mt-2">
              <span className="text-3xl font-bold">{stats.ocrSuccessRate}</span>
              <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Gemini Vision</span>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Trips Table */}
          <div className="lg:col-span-2 p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Solicitudes de Viaje Recientes</h2>
                <button className="text-xs font-medium text-primary hover:underline">Ver todos</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3">Cliente</th>
                      <th className="pb-3">Ruta</th>
                      <th className="pb-3">Fecha/Hora</th>
                      <th className="pb-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {recentTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-muted/30">
                        <td className="py-3.5">
                          <p className="font-semibold">{trip.client}</p>
                          <p className="text-xs text-muted-foreground">{trip.phone}</p>
                        </td>
                        <td className="py-3.5 font-medium">{trip.route}</td>
                        <td className="py-3.5 text-muted-foreground">{trip.date}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trip.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500" :
                            trip.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                            "bg-zinc-500/10 text-zinc-500"
                          }`}>
                            {trip.status === "confirmed" ? "Confirmado" :
                             trip.status === "pending" ? "Pendiente" : "Finalizado"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold mb-6">Bitácora de Auditoría (IA)</h2>
            <div className="space-y-4 flex-1">
              {auditLogs.map((log, index) => (
                <div key={index} className="flex gap-3 text-sm pb-4 border-b border-border last:border-0">
                  <div className="flex flex-col items-center">
                    <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                      log.action === "OCR_SUCCESS" ? "bg-emerald-500" :
                      log.action === "TRIP_CREATE" ? "bg-blue-500" :
                      "bg-purple-500"
                    }`}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{log.desc}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                      <span>Acción: <strong className="text-foreground/80">{log.action}</strong></span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
