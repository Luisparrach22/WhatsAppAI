# Especificación de la API REST

Esta es la especificación técnica de la API REST provista por el backend de Express. Toda comunicación se realiza bajo formato JSON y requiere autenticación JWT a través de Supabase Auth (a excepción del webhook de WhatsApp y el endpoint de estado).

---

## 1. Resumen de Endpoints

| Ruta | Método | Autenticación | Descripción |
| :--- | :---: | :---: | :--- |
| `/api/health` | GET | No | Verifica el estado del servidor y conexiones. |
| `/api/auth/login` | POST | No | Inicio de sesión de operadores y obtención de token JWT. |
| `/api/trips` | GET | Sí | Listado paginado de viajes con filtros. |
| `/api/trips` | POST | Sí | Creación manual de un viaje. |
| `/api/trips/:id` | PATCH | Sí | Actualización de estado del viaje. |
| `/api/documents/:id/ocr` | POST | Sí | Forzar reprocesamiento OCR manual de un archivo. |
| `/api/webhooks/whatsapp` | GET | No | Verificación del webhook por Meta (Challenge). |
| `/api/webhooks/whatsapp` | POST | No | Recepción de eventos y mensajes de WhatsApp. |

---

## 2. Detalle de Endpoints

### 2.1 GET `/api/health`
Verifica si el backend está activo y si la conexión con Supabase es correcta.

* **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-07-03T19:10:00Z",
    "database": "connected"
  }
  ```

---

### 2.2 POST `/api/auth/login`
Autentica a un operador utilizando el flujo de Supabase Auth. Devuelve la sesión del usuario.

* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "operador@empresa.com",
    "password": "PasswordSegura123!"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "email": "operador@empresa.com",
      "role": "operator"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "g1h2i3j4...",
      "expires_in": 3600
    }
  }
  ```
* **Response (401 Unauthorized):**
  ```json
  {
    "error": "Credenciales inválidas"
  }
  ```

---

### 2.3 GET `/api/trips`
Retorna una lista de viajes registrados, con opciones de filtrado por cliente, estado y paginación.

* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `status`: `pending`, `confirmed`, `completed`, `cancelled` (opcional).
  - `limit`: Número de registros a retornar, default `10` (opcional).
  - `page`: Número de página, default `1` (opcional).
* **Response (200 OK):**
  ```json
  {
    "data": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "origin": "Madrid",
        "destination": "Valencia",
        "departure_date": "2026-07-04T18:00:00Z",
        "status": "pending",
        "price": 120.00,
        "created_at": "2026-07-03T17:00:00Z",
        "client": {
          "id": "e8c7b6a5-d4c3-b2a1-0f9e-8d7c6b5a4f3e",
          "name": "Juan Perez",
          "whatsapp_phone": "+34600112233"
        }
      }
    ],
    "pagination": {
      "total_items": 125,
      "page": 1,
      "limit": 10,
      "total_pages": 13
    }
  }
  ```

---

### 2.4 POST `/api/trips`
Crea manualmente un viaje asociado a un cliente existente o nuevo.

* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "client_phone": "+34600112233",
    "client_name": "Juan Perez",
    "origin": "Sevilla",
    "destination": "Málaga",
    "departure_date": "2026-07-05T09:00:00Z",
    "price": 150.00
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "message": "Viaje creado exitosamente",
    "data": {
      "id": "8f8e8d8c-8b8a-8f8e-8d8c-8b8a8f8e8d8c",
      "origin": "Sevilla",
      "destination": "Málaga",
      "departure_date": "2026-07-05T09:00:00Z",
      "status": "pending",
      "price": 150.00,
      "client_id": "e8c7b6a5-d4c3-b2a1-0f9e-8d7c6b5a4f3e"
    }
  }
  ```

---

### 2.5 PATCH `/api/trips/:id`
Actualiza campos parciales de un viaje (usualmente su estado de confirmación).

* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "status": "confirmed",
    "price": 140.00
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Viaje actualizado correctamente",
    "data": {
      "id": "8f8e8d8c-8b8a-8f8e-8d8c-8b8a8f8e8d8c",
      "status": "confirmed",
      "price": 140.00
    }
  }
  ```

---

### 2.6 POST `/api/webhooks/whatsapp`
Webhook de entrada para recibir mensajes de WhatsApp Cloud API.

* **GET `/api/webhooks/whatsapp` (Verificación de Webhook):**
  * Query params: `hub.mode`, `hub.verify_token`, `hub.challenge`.
  * Response: Retorna el contenido de `hub.challenge` con status 200 si la clave de verificación coincide.

* **POST `/api/webhooks/whatsapp` (Recepción de Mensajes):**
  * Request Body (Formato Oficial de Meta):
    ```json
    {
      "object": "whatsapp_business_account",
      "entry": [
        {
          "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "15550000000",
                  "phone_number_id": "100000000000000"
                },
                "contacts": [
                  {
                    "profile": {
                      "name": "Juan Perez"
                    },
                    "wa_id": "34600112233"
                  }
                ],
                "messages": [
                  {
                    "from": "34600112233",
                    "id": "wamid.HBgL...==",
                    "timestamp": "1783100000",
                    "text": {
                      "body": "Hola, quiero cotizar un viaje de Madrid a Toledo"
                    },
                    "type": "text"
                  }
                ]
              },
              "field": "messages"
            }
          ]
        }
      ]
    }
    ```
  * **Response (200 OK):**
    ```json
    {
      "received": true
    }
    ```
    *(Nota: El webhook siempre debe responder inmediatamente con status 200 a Meta para evitar retries de reenvío, delegando el procesamiento asíncronamente).*
