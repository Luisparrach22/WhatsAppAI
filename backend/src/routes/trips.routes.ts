import { Router } from 'express';
import { TripsController } from '../controllers/trips.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { z } from 'zod';

const router = Router();

const createTripSchema = z.object({
  body: z.object({
    client_phone: z.string().min(8, 'Phone number must be at least 8 characters'),
    client_name: z.string().optional(),
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    departure_date: z.string().datetime({ message: 'Must be a valid ISO Date' }).optional(),
    price: z.number().positive('Price must be positive').optional(),
  }),
});

const updateTripSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID must be a valid UUID'),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
    price: z.number().positive().optional(),
  }),
});

// Proteger todas las rutas de viajes con auth
router.use(authenticate);

router.get('/', TripsController.getTrips);
router.post('/', validate(createTripSchema), TripsController.createTrip);
router.patch('/:id', validate(updateTripSchema), TripsController.updateTrip);

export default router;
