"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";

interface Document {
  id: string;
  clientName: string;
  fileName: string;
  fileType: string;
  ocrStatus: 'pending' | 'processing' | 'success' | 'failed';
  uploadedAt: string;
  extractedData: {
    document_type?: string;
    document_number?: string;
    first_name?: string;
    last_name?: string;
    nationality?: string;
    birth_date?: string;
  };
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "d1",
      clientName: "Juan Pérez",
      fileName: "dni_juan_perez.png",
      fileType: "image/png",
      ocrStatus: "success",
      uploadedAt: "2026-07-03T17:05:00Z",
      extractedData: {
        document_type: "DNI",
        document_number: "98765432W",
        first_name: "JUAN",
        last_name: "PEREZ SANCHEZ",
        nationality: "ESP",
        birth_date: "1985-04-12"
      }
    },
    {
      id: "d2",
      clientName: "María Rodríguez",
      fileName: "passport_maria_rod.jpg",
      fileType: "image/jpeg",
      ocrStatus: "success",
      uploadedAt: "2026-07-02T11:45:00Z",
      extractedData: {
        document_type: "PASSPORT",
        document_number: "PAA123456",
        first_name: "MARIA",
        last_name: "RODRIGUEZ LOPEZ",
        nationality: "ESP",
        birth_date: "1988-11-23"
      }
    },
    {
      id: "d3",
      clientName: "Desconocido",
      fileName: "dni_borroso.jpg",
      fileType: "image/jpeg",
      ocrStatus: "failed",
      uploadedAt: "2026-07-03T10:12:00Z",
      extractedData: {}
    }
  ]);

  const [selectedDocId, setSelectedDocId] = useState<string>("d1");
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-ES', {
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Documentos OCR</h1>
          <p className="text-muted-foreground mt-1">Expedientes de clientes procesados automáticamente por Gemini Vision.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document list table */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold">Documentos Cargados</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider bg-muted/20">
                      <th className="px-6 py-4">Cliente / Archivo</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Estado OCR</th>
                      <th className="px-6 py-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className={`hover:bg-muted/10 transition-colors cursor-pointer ${
                          doc.id === selectedDocId ? "bg-muted/30" : ""
                        }`}
                        onClick={() => setSelectedDocId(doc.id)}
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground">{doc.clientName}</p>
                          <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            doc.ocrStatus === "success" ? "bg-emerald-500/10 text-emerald-500" :
                            doc.ocrStatus === "processing" ? "bg-amber-500/10 text-amber-500" :
                            "bg-rose-500/10 text-rose-500"
                          }`}>
                            {doc.ocrStatus === "success" ? "Procesado" :
                             doc.ocrStatus === "processing" ? "Procesando" : "Fallido"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocId(doc.id);
                            }}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Details column (JSON representation and metadata) */}
          <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-4">Detalles del OCR</h2>
              {selectedDoc ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Nombre de Archivo</span>
                    <p className="text-sm font-semibold mt-0.5">{selectedDoc.fileName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Tipo de Archivo</span>
                    <p className="text-sm font-mono mt-0.5">{selectedDoc.fileType}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">ID del Cliente</span>
                    <p className="text-sm font-semibold mt-0.5">{selectedDoc.clientName}</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground block mb-2">Datos JSON Extraídos</span>
                    {selectedDoc.ocrStatus === "success" ? (
                      <pre className="text-xs bg-muted/65 p-3 rounded-lg overflow-x-auto border border-border font-mono max-h-60 text-zinc-300">
                        {JSON.stringify(selectedDoc.extractedData, null, 2)}
                      </pre>
                    ) : (
                      <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs leading-relaxed">
                        ⚠️ No se pudo extraer información estructurada debido a problemas de legibilidad o imagen borrosa.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Seleccione un documento para inspeccionar sus datos.</p>
              )}
            </div>

            {selectedDoc?.ocrStatus === "failed" && (
              <button
                onClick={() => {
                  setDocuments(prev => prev.map(d => d.id === selectedDocId ? {
                    ...d,
                    ocrStatus: "success",
                    extractedData: {
                      document_type: "DNI",
                      document_number: "76543210M",
                      first_name: "MOCK RE-RUN",
                      last_name: "MANUAL RUN",
                      nationality: "ESP"
                    }
                  } : d));
                }}
                className="mt-6 w-full py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Forzar Reprocesamiento OCR
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
