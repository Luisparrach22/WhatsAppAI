"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppController = void 0;
const env_js_1 = require("../config/env.js");
const supabase_js_1 = require("../config/supabase.js");
const ai_service_js_1 = require("../services/ai.service.js");
const whatsapp_service_js_1 = require("../services/whatsapp.service.js");
class WhatsAppController {
    /**
     * Verificación del webhook por Meta (Challenge handshake)
     */
    static verifyWebhook(req, res, next) {
        try {
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            if (mode && token) {
                if (mode === 'subscribe' && token === env_js_1.env.WHATSAPP_VERIFY_TOKEN) {
                    console.log('[WhatsApp Webhook] Verification successful.');
                    res.status(200).send(challenge);
                    return;
                }
                res.status(403).send('Forbidden: Token mismatch');
                return;
            }
            res.status(400).send('Bad Request: Missing hub params');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Recepción de eventos de mensajes de WhatsApp
     */
    static async receiveMessage(req, res, next) {
        try {
            const body = req.body;
            console.log('[WhatsApp Webhook] Event received:', JSON.stringify(body, null, 2));
            // Responder inmediatamente a Meta para evitar reintentos duplicados
            res.status(200).json({ received: true });
            // Procesar el mensaje de fondo asíncronamente
            const entry = body.entry?.[0];
            const change = entry?.changes?.[0];
            const value = change?.value;
            const message = value?.messages?.[0];
            if (!message) {
                return;
            }
            const clientPhone = message.from;
            const clientName = value?.contacts?.[0]?.profile?.name || 'Cliente de WhatsApp';
            const messageId = message.id;
            // Ignorar mensajes que no sean del tipo esperado
            if (message.type !== 'text' && message.type !== 'image' && message.type !== 'document') {
                return;
            }
            console.log(`[WhatsApp Webhook] Processing message from ${clientPhone} (${clientName})`);
            // 1. Identificar o crear cliente en base de datos
            let clientId = 'mock-client-uuid';
            let clientProfile = { name: clientName, id: clientId };
            if (process.env.SUPABASE_SERVICE_ROLE_KEY !== 'mock-service-role-key') {
                let { data: existingClient } = await supabase_js_1.supabase
                    .from('clients')
                    .select('*')
                    .eq('whatsapp_phone', clientPhone)
                    .single();
                if (!existingClient) {
                    const { data: newClient } = await supabase_js_1.supabase
                        .from('clients')
                        .insert({ whatsapp_phone: clientPhone, name: clientName })
                        .select()
                        .single();
                    if (newClient) {
                        existingClient = newClient;
                    }
                }
                if (existingClient) {
                    clientId = existingClient.id;
                    clientProfile = existingClient;
                }
            }
            // 2. Procesar según el tipo de mensaje
            if (message.type === 'text') {
                const textBody = message.text.body;
                // Registrar mensaje entrante en la base de datos
                if (process.env.SUPABASE_SERVICE_ROLE_KEY !== 'mock-service-role-key') {
                    await supabase_js_1.supabase.from('messages').insert({
                        client_id: clientId,
                        message_direction: 'inbound',
                        message_text: textBody,
                    });
                }
                // Analizar con IA
                const analysis = await ai_service_js_1.AIService.analyzeMessage(textBody);
                // Si es una solicitud de viaje, crear el viaje
                if (analysis.category === 'BOOKING_REQUEST' && analysis.parameters.origin && analysis.parameters.destination) {
                    if (process.env.SUPABASE_SERVICE_ROLE_KEY !== 'mock-service-role-key') {
                        await supabase_js_1.supabase.from('trips').insert({
                            client_id: clientId,
                            origin: analysis.parameters.origin,
                            destination: analysis.parameters.destination,
                            departure_date: analysis.parameters.departure_date,
                            status: 'pending',
                        });
                    }
                    else {
                        console.log('[WhatsApp Webhook] Mock booking created:', analysis.parameters);
                    }
                }
                // Responder con la sugerencia de la IA
                const replyText = analysis.suggested_reply || 'Gracias por tu mensaje. Un asesor te atenderá pronto.';
                await whatsapp_service_js_1.WhatsAppService.sendTextMessage(clientPhone, replyText);
                // Registrar mensaje saliente en base de datos
                if (process.env.SUPABASE_SERVICE_ROLE_KEY !== 'mock-service-role-key') {
                    await supabase_js_1.supabase.from('messages').insert({
                        client_id: clientId,
                        message_direction: 'outbound',
                        message_text: replyText,
                    });
                }
            }
            else if (message.type === 'image' || message.type === 'document') {
                const mediaId = message.type === 'image' ? message.image.id : message.document.id;
                const fileName = message.type === 'image' ? `image_${mediaId}.png` : message.document.filename;
                const mimeType = message.type === 'image' ? message.image.mime_type : message.document.mime_type;
                console.log(`[WhatsApp Webhook] Received document/image webhook from ${clientPhone}. MediaID: ${mediaId}`);
                // Registrar el mensaje multimedia en la base de datos
                if (process.env.SUPABASE_SERVICE_ROLE_KEY !== 'mock-service-role-key') {
                    await supabase_js_1.supabase.from('messages').insert({
                        client_id: clientId,
                        message_direction: 'inbound',
                        message_text: `[Archivo Adjunto: ${fileName}]`,
                        media_url: mediaId,
                    });
                }
                // Descargar multimedia de Meta
                const { buffer } = await whatsapp_service_js_1.WhatsAppService.downloadMedia(mediaId);
                // Subir a Supabase Storage (en producción)
                let storagePath = `documents/${clientId}/${mediaId}_${fileName}`;
                if (process.env.SUPABASE_SERVICE_ROLE_KEY !== 'mock-service-role-key') {
                    await supabase_js_1.supabase.storage
                        .from('documents')
                        .upload(storagePath, buffer, { contentType: mimeType, upsert: true });
                }
                // Procesar OCR y extraer datos de identidad
                const ocrData = await ai_service_js_1.AIService.processDocumentOcr(buffer, mimeType);
                // Guardar documento
                if (process.env.SUPABASE_SERVICE_ROLE_KEY !== 'mock-service-role-key') {
                    // Obtener el último viaje del cliente para asociarlo
                    const { data: latestTrip } = await supabase_js_1.supabase
                        .from('trips')
                        .select('id')
                        .eq('client_id', clientId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();
                    await supabase_js_1.supabase.from('documents').insert({
                        client_id: clientId,
                        trip_id: latestTrip?.id || null,
                        file_name: fileName,
                        storage_path: storagePath,
                        file_type: mimeType,
                        ocr_status: 'success',
                        extracted_data: ocrData,
                    });
                    // Actualizar nombre del cliente con el nombre del DNI si está disponible
                    if (ocrData.first_name && ocrData.last_name) {
                        const fullName = `${ocrData.first_name} ${ocrData.last_name}`;
                        await supabase_js_1.supabase
                            .from('clients')
                            .update({ name: fullName })
                            .eq('id', clientId);
                    }
                }
                // Responder confirmando la validación
                const responseText = `Hemos procesado tu documento (${ocrData.document_type}). Datos extraídos: Nombre: ${ocrData.first_name} ${ocrData.last_name}, N°: ${ocrData.document_number}. En breve te confirmaremos tu viaje.`;
                await whatsapp_service_js_1.WhatsAppService.sendTextMessage(clientPhone, responseText);
                if (process.env.SUPABASE_SERVICE_ROLE_KEY !== 'mock-service-role-key') {
                    await supabase_js_1.supabase.from('messages').insert({
                        client_id: clientId,
                        message_direction: 'outbound',
                        message_text: responseText,
                    });
                }
            }
        }
        catch (error) {
            console.error('[WhatsApp Webhook] Fatal processing error:', error);
        }
    }
}
exports.WhatsAppController = WhatsAppController;
