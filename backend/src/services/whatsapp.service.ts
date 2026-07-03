import { env } from '../config/env.js';

export class WhatsAppService {
  /**
   * Envía un mensaje de texto simple al cliente.
   */
  public static async sendTextMessage(toPhone: string, textBody: string): Promise<boolean> {
    console.log(`[WhatsApp] Sending message to ${toPhone}: "${textBody}"`);

    if (env.NODE_ENV === 'development' || env.WHATSAPP_ACCESS_TOKEN === 'mock-access-token') {
      console.log(`[WhatsApp] Mock mode: Message simulated successfully.`);
      return true;
    }

    try {
      const url = `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: textBody,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[WhatsApp] Graph API Error response:', JSON.stringify(errorData));
        return false;
      }

      console.log(`[WhatsApp] Message successfully sent to ${toPhone}.`);
      return true;
    } catch (error) {
      console.error('[WhatsApp] Failed to send WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Descarga un archivo multimedia desde la CDN de Meta usando su mediaId.
   */
  public static async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    console.log(`[WhatsApp] Downloading media with ID: ${mediaId}`);

    if (env.NODE_ENV === 'development' || env.WHATSAPP_ACCESS_TOKEN === 'mock-access-token') {
      // Mock de descarga de archivo (retornamos un buffer vacío y tipo imagen)
      return {
        buffer: Buffer.from('mock-file-content'),
        mimeType: 'image/png',
      };
    }

    try {
      // 1. Obtener URL de descarga del mediaId
      const metaUrl = `https://graph.facebook.com/v20.0/${mediaId}`;
      const metadataResponse = await fetch(metaUrl, {
        headers: {
          'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        },
      });

      if (!metadataResponse.ok) {
        throw new Error(`Failed to retrieve media metadata: ${metadataResponse.statusText}`);
      }

      const metadata = (await metadataResponse.json()) as { url: string; mime_type: string };
      
      // 2. Descargar el binario del archivo
      const mediaResponse = await fetch(metadata.url, {
        headers: {
          'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        },
      });

      if (!mediaResponse.ok) {
        throw new Error(`Failed to download binary from Meta CDN: ${mediaResponse.statusText}`);
      }

      const arrayBuffer = await mediaResponse.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        mimeType: metadata.mime_type,
      };
    } catch (error) {
      console.error('[WhatsApp] Error downloading media:', error);
      throw error;
    }
  }
}
