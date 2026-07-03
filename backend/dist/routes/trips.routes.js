"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trips_controller_js_1 = require("../controllers/trips.controller.js");
const auth_js_1 = require("../middlewares/auth.js");
const validation_js_1 = require("../middlewares/validation.js");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createTripSchema = zod_1.z.object({
    body: zod_1.z.object({
        client_phone: zod_1.z.string().min(8, 'Phone number must be at least 8 characters'),
        client_name: zod_1.z.string().optional(),
        origin: zod_1.z.string().min(1, 'Origin is required'),
        destination: zod_1.z.string().min(1, 'Destination is required'),
        departure_date: zod_1.z.string().datetime({ message: 'Must be a valid ISO Date' }).optional(),
        price: zod_1.z.number().positive('Price must be positive').optional(),
    }),
});
const updateTripSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('ID must be a valid UUID'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
        price: zod_1.z.number().positive().optional(),
    }),
});
// Proteger todas las rutas de viajes con auth
router.use(auth_js_1.authenticate);
router.get('/', trips_controller_js_1.TripsController.getTrips);
router.post('/', (0, validation_js_1.validate)(createTripSchema), trips_controller_js_1.TripsController.createTrip);
router.patch('/:id', (0, validation_js_1.validate)(updateTripSchema), trips_controller_js_1.TripsController.updateTrip);
exports.default = router;
