# Casos de Uso e Historias de Usuario

Este documento define la perspectiva funcional del sistema de Automatización de WhatsApp Business con IA, delineando los flujos principales (casos de uso) y las especificaciones detalladas de las funcionalidades de usuario (historias de usuario con criterios de aceptación).

---

## 1. Casos de Uso Principales

```mermaid
usecaseDiagram
    actor Cliente as "Cliente (WhatsApp)"
    actor Operator as "Operador Humano (Dashboard)"
    actor System as "Sistema de Automatización (IA / Backend)"

    Cliente --> (Enviar solicitud de viaje)
    Cliente --> (Enviar documentos/DNI)
    
    System --> (Recibir webhook e interpretar mensaje)
    System --> (Extraer datos OCR de documentos)
    System --> (Generar respuesta automática)
    
    Operator --> (Aprobar/Modificar viaje)
    Operator --> (Intervenir en Chat manualmente)
    Operator --> (Visualizar logs de auditoría)
```

### 1.1 Caso de Uso 1: Recepción e Interpretación de Mensaje de Viaje
* **Actor Principal:** Cliente (vía WhatsApp).
* **Precondiciones:** El webhook de WhatsApp está operativo.
* **Flujo Principal:**
  1. El cliente envía un mensaje solicitando un viaje (p. ej., *"Hola, necesito ir de Madrid a Valencia mañana por la tarde"*).
  2. El proveedor de WhatsApp envía la notificación al webhook del backend.
  3. El sistema registra el mensaje en la tabla `messages`.
  4. El sistema invoca al servicio de IA (Gemini) pasándole el mensaje.
  5. La IA clasifica el mensaje como `BOOKING_REQUEST` y extrae: origen, destino y fecha.
  6. El sistema crea un viaje en estado `pending` en la tabla `trips` con los datos extraídos.
  7. El sistema genera una respuesta y la envía por WhatsApp: *"¡Entendido! He registrado una solicitud de viaje de Madrid a Valencia para el 04 de julio. Para confirmar, por favor envía una foto de tu identificación (DNI/Pasaporte)"*.

### 1.2 Caso de Uso 2: Procesamiento de Documento OCR
* **Actor Principal:** Cliente / Sistema.
* **Precondiciones:** El viaje está en estado `pending` esperando documentación.
* **Flujo Principal:**
  1. El cliente envía una imagen o PDF de su documento de identidad.
  2. El backend recibe el webhook, descarga el archivo multimedia y lo almacena en Supabase Storage.
  3. El sistema crea un registro en la tabla `documents` con `ocr_status = 'processing'`.
  4. El sistema invoca a Gemini Vision (u OCR) enviando el archivo.
  5. La IA extrae los datos del documento: Nombre, Apellidos, DNI, Fecha de Expiración.
  6. El sistema actualiza el registro en la tabla `documents` con `ocr_status = 'success'` y los datos JSON en `extracted_data`.
  7. El sistema vincula el documento al viaje `pending` activo.
  8. El sistema actualiza el nombre del cliente en `clients` y le avisa: *"Gracias, hemos validado tu documento [DNI]. Un operador confirmará tu viaje a la brevedad"*.

---

## 2. Historias de Usuario (Gherkin Syntax)

### Historia de Usuario 1: Detección y Extracción Automática de Solicitud de Viaje
Como **operador del sistema**, quiero que la **IA detecte automáticamente las solicitudes de viaje en los chats de WhatsApp** para reducir el tiempo de carga manual de reservas.

* **Criterio de Aceptación 1:** Extracción de parámetros básicos.
  * **Given (Dado)** que un cliente envía el mensaje *"Necesito un auto de Sevilla a Málaga para el lunes a las 9 am"*.
  * **When (Cuando)** el backend procesa el webhook a través de la IA.
  * **Then (Entonces)** se debe crear un registro en `trips` con `origin = 'Sevilla'`, `destination = 'Málaga'`, y la fecha calculada para el próximo lunes a las 09:00:00.
  * **And (Y)** el estado del viaje debe ser `pending`.

* **Criterio de Aceptación 2:** Mensaje no relacionado.
  * **Given (Dado)** que un cliente envía un mensaje genérico como *"Buenos días, ¿cómo están?"*.
  * **When (Cuando)** el backend procesa el mensaje a través de la IA.
  * **Then (Entonces)** la IA debe clasificar el mensaje como consulta general.
  * **And (Y)** no debe crear ningún registro en la tabla `trips`.

### Historia de Usuario 2: Procesamiento OCR de Identificaciones
Como **administrador del sistema**, quiero que **las imágenes de identificación enviadas por los clientes se procesen automáticamente por OCR** para validar su identidad de forma ágil.

* **Criterio de Aceptación 1:** Procesamiento exitoso de imagen legible.
  * **Given (Dado)** que un cliente envía una imagen legible de su DNI.
  * **When (Cuando)** el servicio de OCR y Gemini Vision procesan la imagen.
  * **Then (Entonces)** el campo `ocr_status` en la tabla `documents` debe actualizarse a `success`.
  * **And (Y)** el objeto `extracted_data` debe contener:
    ```json
    {
      "document_number": "12345678Z",
      "first_name": "JUAN",
      "last_name": "PEREZ",
      "document_type": "DNI"
    }
    ```
  * **And (Y)** el nombre del cliente en la tabla `clients` debe actualizarse automáticamente a `"JUAN PEREZ"`.

* **Criterio de Aceptación 2:** Imagen ilegible o error.
  * **Given (Dado)** que un cliente envía una imagen borrosa que no contiene un documento de identidad legible.
  * **When (Cuando)** el servicio de OCR intenta analizar el archivo.
  * **Then (Entonces)** el campo `ocr_status` debe establecerse en `failed`.
  * **And (Y)** el sistema debe responder automáticamente por WhatsApp: *"Lo sentimos, no pudimos leer tu identificación. ¿Podrías enviarnos una foto más clara y enfocada?"*.

### Historia de Usuario 3: Dashboard de Administración de Mensajes y Viajes
Como **operador humano**, quiero **visualizar en una interfaz web todos los viajes activos y chats en tiempo real** para poder intervenir manualmente cuando sea necesario.

* **Criterio de Aceptación 1:** Monitoreo del estado de viajes.
  * **Given (Dado)** que estoy autenticado en el Dashboard de Next.js.
  * **When (Cuando)** navego a la sección de "/trips".
  * **Then (Entonces)** debo ver una tabla responsiva con todos los viajes pendientes, confirmados y completados.
  * **And (Y)** cada fila debe mostrar el número de teléfono del cliente, origen, destino, estado del viaje y estado de sus documentos.

* **Criterio de Aceptación 2:** Intervención manual de chat.
  * **Given (Dado)** que estoy en la vista de "/chats" viendo una conversación.
  * **When (Cuando)** escribo una respuesta manual en el campo de texto y hago click en "Enviar".
  * **Then (Entonces)** el mensaje debe enviarse inmediatamente al número de WhatsApp del cliente.
  * **And (Y)** se debe registrar en la base de datos con `message_direction = 'outbound'`.
