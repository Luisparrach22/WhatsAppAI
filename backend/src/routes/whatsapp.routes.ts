import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller.js';

const router = Router();

// Endpoints del Webhook de WhatsApp (sin autenticación Bearer ya que provienen de Meta)
router.get('/', WhatsAppController.verifyWebhook);
router.post('/', WhatsAppController.receiveMessage);

export default router;
