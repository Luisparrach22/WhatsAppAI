import { env } from '../config/env.js';

export class N8NService {
  /**
   * Envía un evento a n8n cuando se crea un nuevo viaje.
   */
  public static async triggerTripCreated(tripData: any): Promise<void> {
    if (!env.N8N_TRIP_CREATED_WEBHOOK) {
      console.log('[n8n] Trip Created webhook not configured. Skipping trigger.');
      return;
    }

    try {
      console.log(`[n8n] Triggering trip.created webhook: ${env.N8N_TRIP_CREATED_WEBHOOK}`);
      const response = await fetch(env.N8N_TRIP_CREATED_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'trip.created',
          timestamp: new Date().toISOString(),
          data: tripData,
        }),
      });

      if (!response.ok) {
        console.error(`[n8n] Failed to trigger trip.created: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[n8n] Error triggering trip.created webhook:', error);
    }
  }

  /**
   * Envía un evento a n8n cuando se confirma un viaje.
   */
  public static async triggerTripConfirmed(tripData: any): Promise<void> {
    if (!env.N8N_TRIP_CONFIRMED_WEBHOOK) {
      console.log('[n8n] Trip Confirmed webhook not configured. Skipping trigger.');
      return;
    }

    try {
      console.log(`[n8n] Triggering trip.confirmed webhook: ${env.N8N_TRIP_CONFIRMED_WEBHOOK}`);
      const response = await fetch(env.N8N_TRIP_CONFIRMED_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'trip.confirmed',
          timestamp: new Date().toISOString(),
          data: tripData,
        }),
      });

      if (!response.ok) {
        console.error(`[n8n] Failed to trigger trip.confirmed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[n8n] Error triggering trip.confirmed webhook:', error);
    }
  }
}
