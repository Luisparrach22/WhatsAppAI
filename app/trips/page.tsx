"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";

interface Trip {
  id: string;
  clientName: string;
  clientPhone: string;
  origin: string;
  destination: string;
  departureDate: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      clientName: "Juan Pérez",
      clientPhone: "+34 600 11 22 33",
      origin: "Madrid",
      destination: "Valencia",
      departureDate: "2026-07-04T18:00:00Z",
      price: 120.00,
      status: "pending"
    },
    {
      id: "8f8e8d8c-8b8a-8f8e-8d8c-8b8a8f8e8d8c",
      clientName: "María Rodríguez",
      clientPhone: "+34 622 44 55 66",
      origin: "Barcelona",
      destination: "Andorra",
      departureDate: "2026-07-05T09:30:00Z",
      price: 240.00,
      status: "confirmed"
    },
    {
      id: "cf15923b-0129-45bc-926f-cb28211b4392",
      clientName: "Esteban D. Díaz",
      clientPhone: "+34 655 88 99 00",
      origin: "Sevilla",
      destination: "Córdoba",
      departureDate: "2026-07-02T10:00:00Z",
      price: 85.00,
      status: "completed"
    }
  ]);

  const handleUpdateStatus = (id: string, newStatus: Trip['status']) => {
    setTrips(prevTrips =>
      prevTrips.map(trip =>
        trip.id === id ? { ...trip, status: newStatus } : trip
      )
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Viajes</h1>
            <p className="text-muted-foreground mt-1">Supervisión, cotización y cambio de estados para traslados.</p>
          </div>
        </header>

        {/* Trips Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Listado de Reservas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <th className="px-6 py-4">ID / Cliente</th>
                  <th className="px-6 py-4">Ruta</th>
                  <th className="px-6 py-4">Salida</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{trip.clientName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{trip.clientPhone}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <span className="text-zinc-400">{trip.origin}</span>
                      <span className="mx-2 text-primary">➔</span>
                      <span>{trip.destination}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(trip.departureDate)}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {trip.price ? `€${trip.price.toFixed(2)}` : "No cotizado"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        trip.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500" :
                        trip.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                        trip.status === "completed" ? "bg-blue-500/10 text-blue-500" :
                        "bg-rose-500/10 text-rose-500"
                      }`}>
                        {trip.status === "confirmed" ? "Confirmado" :
                         trip.status === "pending" ? "Pendiente" :
                         trip.status === "completed" ? "Completado" : "Cancelado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {trip.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(trip.id, 'confirmed')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-emerald-950 transition-colors"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(trip.id, 'cancelled')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 transition-colors"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {trip.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(trip.id, 'completed')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-500 transition-colors"
                        >
                          Marcar Completado
                        </button>
                      )}
                      {trip.status === 'completed' && (
                        <span className="text-xs text-muted-foreground">Ninguna acción</span>
                      )}
                      {trip.status === 'cancelled' && (
                        <span className="text-xs text-rose-400">Cancelado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
