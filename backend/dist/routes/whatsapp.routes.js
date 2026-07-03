"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whatsapp_controller_js_1 = require("../controllers/whatsapp.controller.js");
const router = (0, express_1.Router)();
// Endpoints del Webhook de WhatsApp (sin autenticación Bearer ya que provienen de Meta)
router.get('/', whatsapp_controller_js_1.WhatsAppController.verifyWebhook);
router.post('/', whatsapp_controller_js_1.WhatsAppController.receiveMessage);
exports.default = router;
