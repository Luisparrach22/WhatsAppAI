"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8NService = void 0;
const env_js_1 = require("../config/env.js");
class N8NService {
    /**
     * Envía un evento a n8n cuando se crea un nuevo viaje.
     */
    static async triggerTripCreated(tripData) {
        if (!env_js_1.env.N8N_TRIP_CREATED_WEBHOOK) {
            console.log('[n8n] Trip Created webhook not configured. Skipping trigger.');
            return;
        }
        try {
            console.log(`[n8n] Triggering trip.created webhook: ${env_js_1.env.N8N_TRIP_CREATED_WEBHOOK}`);
            const response = await fetch(env_js_1.env.N8N_TRIP_CREATED_WEBHOOK, {
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
        }
        catch (error) {
            console.error('[n8n] Error triggering trip.created webhook:', error);
        }
    }
    /**
     * Envía un evento a n8n cuando se confirma un viaje.
     */
    static async triggerTripConfirmed(tripData) {
        if (!env_js_1.env.N8N_TRIP_CONFIRMED_WEBHOOK) {
            console.log('[n8n] Trip Confirmed webhook not configured. Skipping trigger.');
            return;
        }
        try {
            console.log(`[n8n] Triggering trip.confirmed webhook: ${env_js_1.env.N8N_TRIP_CONFIRMED_WEBHOOK}`);
            const response = await fetch(env_js_1.env.N8N_TRIP_CONFIRMED_WEBHOOK, {
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
        }
        catch (error) {
            console.error('[n8n] Error triggering trip.confirmed webhook:', error);
        }
    }
}
exports.N8NService = N8NService;
