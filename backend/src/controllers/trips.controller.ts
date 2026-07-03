import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { supabase } from '../config/supabase.js';
import { N8NService } from '../services/n8n.service.js';
import { AppError } from '../middlewares/error-handler.js';

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

export class TripsController {
  public static async getTrips(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

      let query = supabase
        .from('trips')
        .select('*, client:clients(*)');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new AppError(`Supabase Error: ${error.message}`, 500);
      }

      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  }

  public static async createTrip(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        await N8NService.triggerTripCreated(newTrip);

        res.status(201).json({ message: 'Viaje creado exitosamente (Mock)', data: newTrip });
        return;
      }

      // 1. Verificar o crear cliente
      let { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('whatsapp_phone', client_phone)
        .single();

      if (!client) {
        const { data: newClient, error: createClientError } = await supabase
          .from('clients')
          .insert({ whatsapp_phone: client_phone, name: client_name || null })
          .select()
          .single();

        if (createClientError) throw new AppError(`Failed to create client: ${createClientError.message}`, 500);
        client = newClient;
      }

      // 2. Crear viaje
      const { data: trip, error: tripError } = await supabase
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

      if (tripError) throw new AppError(`Failed to create trip: ${tripError.message}`, 500);

      // Trigger n8n webhook
      await N8NService.triggerTripCreated(trip);

      res.status(201).json({ message: 'Viaje creado exitosamente', data: trip });
    } catch (error) {
      next(error);
    }
  }

  public static async updateTrip(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, price } = req.body;

      if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'mock-service-role-key') {
        const tripIndex = mockTrips.findIndex(t => t.id === id);
        if (tripIndex === -1) throw new AppError('Trip not found', 404);

        const updatedTrip = {
          ...mockTrips[tripIndex],
          ...(status && { status }),
          ...(price !== undefined && { price }),
        };
        mockTrips[tripIndex] = updatedTrip;

        if (status === 'confirmed') {
          await N8NService.triggerTripConfirmed(updatedTrip);
        }

        res.status(200).json({ message: 'Viaje actualizado correctamente (Mock)', data: updatedTrip });
        return;
      }

      const { data: trip, error: getError } = await supabase
        .from('trips')
        .select('*, client:clients(*)')
        .eq('id', id)
        .single();

      if (getError || !trip) throw new AppError('Trip not found', 404);

      const { data: updatedTrip, error: updateError } = await supabase
        .from('trips')
        .update({
          ...(status && { status }),
          ...(price !== undefined && { price }),
        })
        .eq('id', id)
        .select('*, client:clients(*)')
        .single();

      if (updateError) throw new AppError(`Failed to update trip: ${updateError.message}`, 500);

      if (status === 'confirmed') {
        await N8NService.triggerTripConfirmed(updatedTrip);
      }

      res.status(200).json({ message: 'Viaje actualizado correctamente', data: updatedTrip });
    } catch (error) {
      next(error);
    }
  }
}
