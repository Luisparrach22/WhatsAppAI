# Estándares de Programación y Git

Este documento establece las reglas, convenciones y mejores prácticas obligatorias para el desarrollo en el proyecto de Automatización de WhatsApp Business. Todos los desarrolladores (y asistentes de IA) deben adherirse estrictamente a estas directrices.

---

## 1. Convenciones de TypeScript

* **Tipado Estricto:** Siempre activar `"strict": true` en el `tsconfig.json`. Evitar desactivar reglas de tipado con comentarios `eslint-disable`.
* **Prohibición del tipo `any`:** El uso de `any` está estrictamente prohibido a menos que se justifique con un comentario de desactivación de ESLint explícito y una explicación detallada. En su lugar, utilizar tipos específicos, genéricos o `unknown`.
* **Interfaces vs Types:**
  - Usar `interface` para definir la estructura de objetos que puedan ser extendidos o implementados (capas de persistencia, DTOs, etc.).
  - Usar `type` para uniones de tipos, intersecciones, tuplas y tipos primitivos alias.
* **Retornos Explicitas:** Todas las funciones expuestas en servicios, controladores o helpers deben declarar explícitamente su tipo de retorno (incluyendo `Promise<void>` o `Promise<T>`).

---

## 2. Convenciones de Nombres

* **Archivos y Directorios:**
  - Componentes de React: PascalCase (`TripCard.tsx`, `ChatHistory.tsx`).
  - Hooks de React: camelCase con prefijo `use` (`useAuth.ts`, `useSocket.ts`).
  - Archivos TypeScript de lógica/servicios: kebab-case (`whatsapp-service.ts`, `auth-middleware.ts`).
  - Directorios: kebab-case (`database-migration/`, `ui/`).
* **Variables y Funciones:**
  - Variables y funciones: camelCase (`activeTripId`, `getTripById()`).
  - Constantes de configuración: SCREAMING_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `SUPABASE_URL`).
  - Clases: PascalCase (`ExpressServer`, `WhatsAppClient`).
* **Base de Datos (PostgreSQL):**
  - Nombres de tablas: plural, snake_case (`trips`, `audit_logs`).
  - Columnas: singular, snake_case (`client_id`, `created_at`).
  - Claves primarias: `id` (UUIDv4).

---

## 3. Guía de React & Next.js

* **Next.js App Router (React Server Components - RSC):**
  - Por defecto, todos los componentes en `/app` son Server Components. Esto mejora el rendimiento de carga y el SEO.
  - Usar `"use client"` únicamente en componentes de hojas (leaf components) que manejen interactividad del lado del cliente (formularios, clicks, hooks como `useState` o `useEffect`).
* **Componentización:**
  - Mantener los componentes pequeños y enfocados en una única responsabilidad. Si supera las 150 líneas de código, considerar dividirlo.
* **Tailwind CSS:**
  - Usar Tailwind de manera semántica. Evitar estilos en línea o hacks CSS innecesarios.
  - Agrupar colores temáticos y espaciados mediante variables y clases de utilidad nativas.

---

## 4. Guía de Express y Node.js

* **Manejo de Errores Asíncronos:**
  - Nunca dejar promesas sin capturar. Usar bloques `try/catch` o un middleware que maneje promesas (como `express-async-errors`) para capturar excepciones en controladores asíncronos de forma centralizada.
* **Validación de Entradas:**
  - Validar toda petición externa (body, query params, path params) utilizando esquemas de **Zod** en la capa de controladores/middlewares. No permitir datos no validados en los casos de uso.
* **Separación de Lógica:**
  - Los controladores HTTP *solo* deben encargarse de extraer los datos de la petición (`req`), pasarlos al caso de uso, capturar excepciones y formatear la respuesta JSON (`res`). Ninguna lógica de negocio ni consultas a la base de datos deben ocurrir en el controlador.

---

## 5. Estándares de Git y Ramas

### Estructura de Ramas
* **`main`:** Código de producción estable y verificado.
* **`develop`:** Rama de integración para desarrollo en progreso.
* **Ramas de funcionalidad (`feat/*`):** Para nuevas características (`feat/whatsapp-webhook`).
* **Ramas de corrección (`fix/*`):** Para errores encontrados (`fix/ocr-extraction-null`).
* **Ramas de refactorización (`refactor/*`):** Modificaciones de código sin cambio de comportamiento (`refactor/supabase-client`).

### Mensajes de Commit (Conventional Commits)
Los commits deben seguir el formato estandarizado:
```
<tipo>(<ámbito>): <descripción corta en imperativo>
```
* **Tipos válidos:**
  - `feat`: Nueva funcionalidad.
  - `fix`: Corrección de un error.
  - `docs`: Cambios en la documentación.
  - `style`: Formateo, punto y coma perdidos, etc. (no cambia lógica).
  - `refactor`: Cambios de código que no corrigen bugs ni añaden features.
  - `test`: Añadir o modificar pruebas unitarias.
  - `chore`: Tareas de compilación, herramientas de configuración, etc.

* **Ejemplos:**
  - `feat(whatsapp): agregar soporte para descarga de adjuntos multimedia`
  - `fix(ocr): controlar excepción de imagen corrupta en gemini vision`
  - `docs(readme): actualizar guía de despliegue local`
