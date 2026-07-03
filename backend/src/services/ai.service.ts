import { env } from '../config/env.js';

export interface ChatAnalysisResult {
  category: 'BOOKING_REQUEST' | 'DOCUMENT_SUBMISSION' | 'GENERAL_INQUIRY' | 'CANCEL_REQUEST';
  confidence: number;
  parameters: {
    origin: string | null;
    destination: string | null;
    departure_date: string | null;
  };
  suggested_reply: string | null;
}

export interface DocumentOcrResult {
  document_type: 'DNI' | 'PASSPORT' | 'DRIVER_LICENSE' | 'UNKNOWN';
  document_number: string | null;
  first_name: string | null;
  last_name: string | null;
  nationality: string | null;
  birth_date: string | null;
  expiration_date: string | null;
}

export class AIService {
  /**
   * Analiza un mensaje entrante para clasificarlo y extraer parámetros de viaje.
   */
  public static async analyzeMessage(messageText: string): Promise<ChatAnalysisResult> {
    console.log(`[AI] Analyzing message: "${messageText}"`);

    // En producción se realizaría el fetch a Gemini API
    // Aquí implementamos lógica mock inteligente basada en palabras clave para que el flujo sea funcional.
    const textLower = messageText.toLowerCase();

    if (textLower.includes('viaje') || textLower.includes('ir de') || textLower.includes('llevar') || textLower.includes('auto') || textLower.includes('bus')) {
      // Extraer posibles destinos usando Regex simple para el mock
      const match = messageText.match(/de\s+([A-Za-zñáéíóú]+)\s+a\s+([A-Za-zñáéíóú]+)/i);
      const origin = match ? match[1] : 'Madrid';
      const destination = match ? match[2] : 'Valencia';

      return {
        category: 'BOOKING_REQUEST',
        confidence: 0.95,
        parameters: {
          origin,
          destination,
          departure_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // mañana
        },
        suggested_reply: `¡Perfecto! Hemos registrado tu solicitud de viaje de ${origin} a ${destination}. Por favor, envíanos tu identificación para confirmar la reserva.`,
      };
    }

    if (textLower.includes('dni') || textLower.includes('documento') || textLower.includes('foto') || textLower.includes('identidad')) {
      return {
        category: 'DOCUMENT_SUBMISSION',
        confidence: 0.90,
        parameters: { origin: null, destination: null, departure_date: null },
        suggested_reply: 'Gracias por enviar tu documento. Lo estamos procesando en este momento.',
      };
    }

    if (textLower.includes('cancelar') || textLower.includes('baja') || textLower.includes('eliminar')) {
      return {
        category: 'CANCEL_REQUEST',
        confidence: 0.85,
        parameters: { origin: null, destination: null, departure_date: null },
        suggested_reply: 'Entendido. ¿Me podrías indicar el código de viaje o el motivo para proceder con la cancelación?',
      };
    }

    return {
      category: 'GENERAL_INQUIRY',
      confidence: 0.80,
      parameters: { origin: null, destination: null, departure_date: null },
      suggested_reply: 'Hola. ¿En qué te puedo ayudar hoy? Si deseas cotizar un viaje, indícame el origen y el destino.',
    };
  }

  /**
   * Procesa un archivo de imagen/PDF usando Gemini Vision para extraer datos de DNI/Pasaporte.
   */
  public static async processDocumentOcr(fileBuffer: Buffer, mimeType: string): Promise<DocumentOcrResult> {
    console.log(`[AI] Processing document OCR (${mimeType}) - Size: ${fileBuffer.length} bytes`);

    // Mock funcional de extracción OCR exitoso
    return {
      document_type: 'DNI',
      document_number: '98765432W',
      first_name: 'MARIA',
      last_name: 'RODRIGUEZ LOPEZ',
      nationality: 'ESP',
      birth_date: '1988-11-23',
      expiration_date: '2032-02-15',
    };
  }
}
