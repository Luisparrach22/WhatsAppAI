"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsController = void 0;
const supabase_js_1 = require("../config/supabase.js");
const n8n_service_js_1 = require("../services/n8n.service.js");
const error_handler_js_1 = require("../middlewares/error-handler.js");
// Base de datos local mockeada para fallback o testing
let mockTrips = [
    {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        origin: 'Madrid',
        destination: 'Valencia',
        departure_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        price: 120.00,
        created_at: new Date().toISOString(),
        client: {
            id: 'e8c7b6a5-d4c3-b2a1-0f9e-8d7c6b5a4f3e',
            name: 'Juan Perez',
            whatsapp_phone: '+34600112233'
        }
    }
];
class TripsController {
    static async getTrips(req, res, next) {
        try {
            const { status } = req.query;
            // Si no tenemos credenciales correctas de Supabase configuradas, usamos el mock database
            if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'mock-service-role-key') {
                let filtered = mockTrips;
                if (status) {
                    filtered = mockTrips.filter(t => t.status === status);
                }
                res.status(200).json({ data: filtered, pagination: { total_items: filtered.length, page: 1, limit: 10, total_pages: 1 } });
                return;
            }
            let query = supabase_js_1.supabase
                .from('trips')
                .select('*, client:clients(*)');
            if (status) {
                query = query.eq('status', status);
            }
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) {
                throw new error_handler_js_1.AppError(`Supabase Error: ${error.message}`, 500);
            }
            res.status(200).json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    static async createTrip(req, res, next) {
        try {
            const { client_phone, client_name, origin, destination, departure_date, price } = req.body;
            if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'mock-service-role-key') {
                const newTrip = {
                    id: crypto.randomUUID(),
                    origin,
                    destination,
                    departure_date: departure_date || new Date().toISOString(),
                    status: 'pending',
                    price: price || null,
                    created_at: new Date().toISOString(),
                    client: {
                        id: crypto.randomUUID(),
                        name: client_name || 'Client Name',
                        whatsapp_phone: client_phone
                    }
                };
                mockTrips.push(newTrip);
                // Trigger n8n trigger asincronamente
                await n8n_service_js_1.N8NService.triggerTripCreated(newTrip);
                res.status(201).json({ message: 'Viaje creado exitosamente (Mock)', data: newTrip });
                return;
            }
            // 1. Verificar o crear cliente
            let { data: client, error: clientError } = await supabase_js_1.supabase
                .from('clients')
                .select('*')
                .eq('whatsapp_phone', client_phone)
                .single();
            if (!client) {
                const { data: newClient, error: createClientError } = await supabase_js_1.supabase
                    .from('clients')
                    .insert({ whatsapp_phone: client_phone, name: client_name || null })
                    .select()
                    .single();
                if (createClientError)
                    throw new error_handler_js_1.AppError(`Failed to create client: ${createClientError.message}`, 500);
                client = newClient;
            }
            // 2. Crear viaje
            const { data: trip, error: tripError } = await supabase_js_1.supabase
                .from('trips')
                .insert({
                client_id: client.id,
                origin,
                destination,
                departure_date: departure_date || null,
                price: price || null,
                status: 'pending'
            })
                .select('*, client:clients(*)')
                .single();
            if (tripError)
                throw new error_handler_js_1.AppError(`Failed to create trip: ${tripError.message}`, 500);
            // Trigger n8n webhook
            await n8n_service_js_1.N8NService.triggerTripCreated(trip);
            res.status(201).json({ message: 'Viaje creado exitosamente', data: trip });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTrip(req, res, next) {
        try {
            const { id } = req.params;
            const { status, price } = req.body;
            if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'mock-service-role-key') {
                const tripIndex = mockTrips.findIndex(t => t.id === id);
                if (tripIndex === -1)
                    throw new error_handler_js_1.AppError('Trip not found', 404);
                const updatedTrip = {
                    ...mockTrips[tripIndex],
                    ...(status && { status }),
                    ...(price !== undefined && { price }),
                };
                mockTrips[tripIndex] = updatedTrip;
                if (status === 'confirmed') {
                    await n8n_service_js_1.N8NService.triggerTripConfirmed(updatedTrip);
                }
                res.status(200).json({ message: 'Viaje actualizado correctamente (Mock)', data: updatedTrip });
                return;
            }
            const { data: trip, error: getError } = await supabase_js_1.supabase
                .from('trips')
                .select('*, client:clients(*)')
                .eq('id', id)
                .single();
            if (getError || !trip)
                throw new error_handler_js_1.AppError('Trip not found', 404);
            const { data: updatedTrip, error: updateError } = await supabase_js_1.supabase
                .from('trips')
                .update({
                ...(status && { status }),
                ...(price !== undefined && { price }),
            })
                .eq('id', id)
                .select('*, client:clients(*)')
                .single();
            if (updateError)
                throw new error_handler_js_1.AppError(`Failed to update trip: ${updateError.message}`, 500);
            if (status === 'confirmed') {
                await n8n_service_js_1.N8NService.triggerTripConfirmed(updatedTrip);
            }
            res.status(200).json({ message: 'Viaje actualizado correctamente', data: updatedTrip });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TripsController = TripsController;
