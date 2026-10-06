# Evently

Plataforma web para descubrir, consultar y gestionar eventos. Está inspirada conceptualmente en plataformas modernas de eventos, pero con identidad visual y desarrollo propios.

## Descripción

Evently es una plataforma donde cualquier usuario registrado puede descubrir eventos, guardarlos en "Me gusta", registrarse y consultar sus entradas, **y además crear, editar y eliminar sus propios eventos**. No hay separación entre asistentes y organizadores: la misma cuenta puede crear eventos y asistir a los de otras personas.

> **Evently no separa a los usuarios en asistentes y organizadores. Un mismo usuario puede crear eventos y registrarse en eventos creados por otras personas.** Solo existen dos roles: `USER` y `ADMIN`.

## Objetivo

Centralizar en un solo lugar el descubrimiento y la organización de eventos, resolviendo la dispersión de la información y la falta de una herramienta simple para gestionarlos, con una experiencia clara para cualquier usuario (crear y asistir) y una administración central para el rol `ADMIN`.

## MVP

- Registro e inicio de sesión con JWT.
- Descubrir, buscar y filtrar eventos por categoría.
- Búsqueda real por título, descripción, categoría y ubicación.
- Autocompletado de ubicaciones con Google Places.
- Ver el detalle de un evento.
- Guardar y quitar eventos de "Me gusta".
- Registrarse a un evento con formulario, ticket con QR y envío por correo.
- Consultar "Mis entradas" con el código de entrada y su QR.
- Cancelar una inscripción.
- Ver el perfil en "Mi cuenta".
- Crear eventos (cualquier usuario autenticado), editarlos y eliminarlos.
- Consultar "Mis eventos" y los asistentes de un evento propio.
- Administración (rol `ADMIN`): gestionar usuarios y eventos de la plataforma.
- Funcionalidad de IA: recomendación de qué llevar/vestir.

## Funcionalidades

### Descubrir eventos
Home con hero, buscador, filtro por categoría y orden. El buscador consulta PostgreSQL a través de `GET /api/events?search=` y encuentra coincidencias (sin distinguir mayúsculas) en **título, descripción, categoría y ubicación**. El campo **Ubicación** usa **Google Places Autocomplete** para sugerir lugares reales y filtrar con `?location=`. Los eventos provienen de PostgreSQL mediante la API (sin datos mock).

### Búsqueda en vivo en el navbar
Mientras escribes en el buscador del navbar (mínimo 2 caracteres, con *debounce* de 250 ms) aparece un panel con los eventos que coinciden; al hacer clic en uno vas a su detalle. Al presionar **Buscar** (o Enter) navega a la Home con los filtros aplicados.

### Ubicación (Google Places)
El componente reutilizable `LocationAutocomplete.tsx` se usa en el buscador del navbar y en los formularios de crear/editar evento. Al escribir (mínimo 2 caracteres, con *debounce*) sugiere ubicaciones de **todo el mundo**, sin depender de que existan eventos:
- **Con `VITE_GOOGLE_MAPS_API_KEY`**: sugerencias reales de Google Places (`AutocompleteSuggestion`); al seleccionar guarda el texto formateado, el `placeId` y lat/long.
- **Sin Google (respaldo)**: `GET /api/places?input=` consulta OpenStreetMap/Nominatim en el backend y devuelve lugares a nivel mundial.

Al elegir una ubicación se muestran los eventos de ese lugar; si no hay ninguno aparece el mensaje "No existe ningún evento en …". El filtro usa el nombre del lugar (`?location=`), insensible a acentos.

### Me gusta
Los usuarios autenticados pueden guardar/quitar eventos con el corazón (tarjetas y detalle) y verlos en `/favorites`.

### Registro a eventos (formulario + QR + correo)
Al pulsar **Registrarme** en el detalle se abre `RegistrationModal.tsx` (no registra de forma automática). El formulario pide nombres, apellidos, correo, teléfono y organización (opcional), con validación tanto en frontend como en backend. Si el usuario está autenticado, se precargan nombre y correo. Al confirmar, el backend valida el evento, la capacidad (solo registros `CONFIRMED`) y evita duplicados `(userId, eventId)`, crea el registro con un `ticketCode` único, genera el QR y envía el correo. El registro se mantiene aunque falle el correo.

### Mis entradas
En `/tickets` el usuario ve sus entradas reales (desde `GET /api/users/me/tickets`), con fecha, hora, ubicación, **código de entrada** y un botón **Ver entrada** que abre un modal con el asistente y el **código QR** de esa inscripción. El QR se genera de forma determinista a partir del `ticketCode`, por lo que siempre es el mismo. También permite cancelar la inscripción.

### Crear eventos
Cualquier usuario autenticado (`USER` o `ADMIN`) puede crear eventos. Formulario (`/create-event`) con nombre, descripción, categoría, fecha, hora, ubicación (con autocompletado de Google Places), capacidad máxima, precio (opcional) e imagen (URL o archivo). El backend toma el usuario autenticado del JWT como `creatorId`; el frontend no decide el creador. Tras publicar se redirige a la lista de eventos.

### Gestión de eventos
En `/my-events` el usuario ve los eventos que creó, puede editarlos, eliminarlos y consultar sus asistentes. Un `USER` solo puede editar/eliminar sus propios eventos (si intenta otro recibe `403`); un `ADMIN` puede con cualquiera.

### Autenticación
`POST /api/auth/register`, `POST /api/auth/login` y `GET /api/auth/me`. JWT + bcrypt. La sesión se mantiene en el frontend. El registro público siempre crea usuarios con rol `USER` (nunca se puede elegir `ADMIN`).

### Roles
Solo `USER` y `ADMIN`. No existen `ATTENDEE` ni `ORGANIZER`. La autorización por rol se reserva para `ADMIN`; la propiedad de los recursos (creador del evento) se valida en el servicio.

### IA
Botón "¿Qué debería llevar?" en el detalle, que llama a `POST /api/ai/recommendation`.

## Arquitectura

Arquitectura cliente-servidor con separación por capas. La lógica de negocio no vive en las rutas.

```
Frontend (React + TypeScript + Tailwind)
        ↓  HTTP / REST (JSON + JWT)
Backend (Node.js + Express + TypeScript)
   Routes → Controllers → Services
        ↓
   Prisma ORM
        ↓
   PostgreSQL
```

Capas del backend: **routes** (endpoints), **controllers** (HTTP), **services** (lógica de negocio y acceso a datos), **middlewares** (auth, roles, errores, 404), **validators** (validación de entrada), **config** (env + Prisma), **utils** (JWT, bcrypt, errores), **types**.

## Tecnologías

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7.
- **Backend**: Node.js, Express 5, TypeScript.
- **Base de datos**: PostgreSQL, Prisma ORM.
- **Autenticación**: JWT (jsonwebtoken), bcrypt (bcryptjs).
- **Ubicación**: Google Maps Platform (Maps JavaScript API + Places API (New)) y, como respaldo sin key, OpenStreetMap/Nominatim.
- **Tickets**: `qrcode` (generación de QR) y `nodemailer` (envío por SMTP).
- **API**: REST.

## Estructura del proyecto

```
Evently/
├── frontend/
│   ├── src/
│   │   ├── components/    Navbar, ProtectedRoute, EventCard, EventForm, EventImage,
│   │   │                  FavoriteButton, CategoryChips, LocationAutocomplete,
│   │   │                  Modal, RegistrationModal, TicketModal, estados UI, iconos
│   │   ├── context/       AuthContext, FavoritesContext
│   │   ├── hooks/         useAuth, useFavorites
│   │   ├── layouts/       MainLayout
│   │   ├── pages/         Home, Login, Register, EventDetail, Tickets, Favorites,
│   │   │                  Account, MyEvents, CreateEvent, EditEvent, Admin, NotFound
│   │   ├── services/      api, authService, eventService, registrationService,
│   │   │                  favoriteService, categoryService, aiService,
│   │   │                  userService, placeService
│   │   ├── types/         Tipos de TypeScript
│   │   ├── utils/         Formato de fechas/precio, googleMaps (Places), image
│   │   │                  (compresión de imagen), utilidades
│   │   ├── App.tsx        Definición de rutas
│   │   ├── main.tsx       Punto de entrada (AuthProvider + FavoritesProvider)
│   │   └── index.css      Estilos globales (Tailwind + tema)
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma  Esquema de base de datos
│   │   ├── migrations/    Migraciones
│   │   └── seed.ts        Datos de prueba
│   ├── src/
│   │   ├── config/        env.ts, prisma.ts
│   │   ├── routes/        Definición de endpoints
│   │   ├── controllers/   Manejo de peticiones y respuestas
│   │   ├── services/      Lógica de negocio (incluye qr.service y email.service)
│   │   ├── middlewares/   auth, role, errorHandler, notFound
│   │   ├── validators/    Validación de datos (event, auth, registration, ai)
│   │   ├── utils/         AppError, jwt, password, ticket (genera el ticketCode)
│   │   ├── types/         Tipos compartidos
│   │   ├── app.ts         Configuración de Express
│   │   └── server.ts      Arranque del servidor
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── .gitignore
```

## Modelo de datos

**User**: `id`, `name`, `email` (único), `password` (hash bcrypt), `role` (`USER` | `ADMIN`, por defecto `USER`), `createdAt`, `updatedAt`.

**Event**: `id`, `title`, `description`, `date`, `time`, `location`, `placeId` (opcional), `latitude` (opcional), `longitude` (opcional), `image` (URL o data URL, opcional), `capacity`, `price` (opcional; `null` = gratis), `creatorId`, `categoryId`, `createdAt`, `updatedAt`.

**Category**: `id`, `name` (único), `createdAt`.

**Registration**: `id`, `userId`, `eventId`, `firstName`, `lastName`, `email`, `phone`, `organization` (opcional), `ticketCode` (único), `registeredAt`, `status` (`CONFIRMED` | `CANCELLED`). Restricción única `(userId, eventId)`.

**Favorite**: `id`, `userId`, `eventId`, `createdAt`. Restricción única `(userId, eventId)`.

## Relaciones

- **User 1:N Event** — un usuario (`creatorId`) puede crear múltiples eventos.
- **User 1:N Registration** — un usuario puede registrarse a múltiples eventos.
- **User 1:N Favorite** — un usuario puede guardar múltiples eventos.
- **Event 1:N Registration** — un evento puede tener múltiples asistentes.
- **Event 1:N Favorite** — un evento puede ser guardado por múltiples usuarios.
- **Category 1:N Event** — una categoría puede tener múltiples eventos.

## Instalación

Cada parte se instala y ejecuta por separado. Requiere Node.js y PostgreSQL en marcha.

```bash
cd backend
npm install
cp .env.example .env      # en Windows: copy .env.example .env
# edita .env con tu DATABASE_URL y JWT_SECRET

cd ../frontend
npm install
cp .env.example .env      # opcional
```

## Variables de entorno

**Backend (`backend/.env`)**

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT. |
| `JWT_EXPIRES_IN` | Vigencia del token (por defecto `7d`). |
| `PORT` | Puerto del servidor Express (por defecto `3000`). |
| `AI_API_KEY` | Clave de la API de IA (opcional). |
| `AI_BASE_URL` | URL base compatible con OpenAI (por defecto `https://api.openai.com/v1`). |
| `AI_MODEL` | Modelo a utilizar (por defecto `gpt-4o-mini`). |
| `GOOGLE_MAPS_API_KEY` | Clave de Google Maps (opcional en backend; el autocompletado vive en el frontend). |
| `EMAIL_HOST` | Servidor SMTP. Si está vacío, no se envían correos (`emailSent: false`). |
| `EMAIL_PORT` | Puerto SMTP (por defecto `587`; usa `465` para SSL). |
| `EMAIL_USER` | Usuario/correo SMTP. |
| `EMAIL_PASSWORD` | Contraseña o *app password* del correo. |
| `EMAIL_FROM` | Remitente mostrado (por defecto `Evently <no-reply@evently.com>`). |

**Frontend (`frontend/.env`)**

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | Base de la API REST (por defecto `http://localhost:3000/api`). |
| `VITE_GOOGLE_MAPS_API_KEY` | Clave pública de Google Maps para el autocompletado. Déjala vacía para desactivar el autocompletado. |

> Los `.env` no se suben al repositorio. Usa `.env.example` como plantilla. Las claves reales nunca deben subirse.

## Google Maps Platform (autocompletado de ubicación)

1. **Obtén una API key**: entra a [Google Cloud Console](https://console.cloud.google.com/), crea/selecciona un proyecto y ve a **APIs y servicios → Credenciales → Crear credenciales → Clave de API**.
2. **Habilita estas APIs** en **APIs y servicios → Biblioteca**:
   - **Maps JavaScript API** (carga el SDK en el navegador).
   - **Places API (New)** (usada por `AutocompleteSuggestion`, la API de autocompletado vigente).
3. **Dónde va la variable**: en `frontend/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY="tu-api-key"
   ```
   Reinicia el servidor de Vite tras cambiarla. Si la dejas vacía, el autocompletado usa el respaldo mundial de OpenStreetMap/Nominatim.
4. **Restringe la key**: en Credenciales → tu clave → **Restricciones de aplicación → Sitios web** agrega `http://localhost:5173/*` (y tu dominio en producción). Puedes activar una *cuota/límite* de gasto en el proyecto para evitar consumos inesperados.
5. (Opcional) El backend acepta `GOOGLE_MAPS_API_KEY`, pero el autocompletado se resuelve en el frontend; normalmente no necesitas configurarla en el backend.

> **Sin API key**: el autocompletado sigue funcionando con el respaldo `GET /api/places` (OpenStreetMap/Nominatim), que devuelve lugares de todo el mundo. Google solo se usa si `VITE_GOOGLE_MAPS_API_KEY` está configurada.

## Correo (SMTP con Nodemailer)

El envío de la entrada se hace en `backend/src/services/email.service.ts`. Si `EMAIL_HOST`, `EMAIL_USER` y `EMAIL_PASSWORD` están vacíos, no se envían correos y el registro se completa igual con `emailSent: false` (la inscripción **no** se elimina).

Ejemplo en `backend/.env` (usa una *app password*, no tu contraseña real):

```
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tucorreo@gmail.com"
EMAIL_PASSWORD="tu-app-password"
EMAIL_FROM="Evently <tucorreo@gmail.com>"
```

El correo se envía al **correo indicado en el formulario**, con asunto `Tu entrada para [Evento] - Evently`, el detalle del evento, el código de entrada y el QR adjunto como `ticket-qr.png` (también embebido en el HTML). El contenido del QR es únicamente el `ticketCode` (sin datos personales, sin JWT).

## Prisma

```bash
cd backend
npx prisma generate                 # genera el cliente
npx prisma migrate dev --name init  # crea/aplica migraciones
npx prisma db seed                  # carga datos de prueba
npx prisma studio                   # explorador visual (opcional)
```

## Seed

```bash
cd backend
npx prisma db seed
```

Genera: 6 categorías, 3 usuarios (1 `ADMIN` y 2 `USER`), 8 eventos, varios registros de asistencia y favoritos. Es idempotente: vuelve a dejar usuarios y categorías, y regenera eventos, registros y favoritos en cada ejecución.

## Ejecución

En dos terminales:

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Frontend: `http://localhost:5173` · Backend: según `PORT` (ver notas).

## API Endpoints

Formato de respuesta: `{ "success": boolean, "data"?: ..., "message"?: string }`.

**Health**

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/health` | Público |

**Auth**

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/auth/register` | Público |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Autenticado |

**Categorías**

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/categories` | Público |

**Eventos**

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/events` | Público (`?search=`, `?location=`, `?categoryId=`, `?sort=`, `?limit=`) |
| GET | `/api/events/:id` | Público |
| POST | `/api/events` | Autenticado (cualquier `USER` o `ADMIN`) |
| PUT | `/api/events/:id` | Creador del evento o ADMIN |
| DELETE | `/api/events/:id` | Creador del evento o ADMIN |
| GET | `/api/events/:id/attendees` | Creador del evento o ADMIN |

**Lugares (autocompletado de ubicación)**

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/places` | Público (`?input=`, respaldo mundial vía OpenStreetMap/Nominatim) |

**Registros ("Mis entradas")**

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/events/:id/register` | Autenticado |
| DELETE | `/api/events/:id/register` | Autenticado |

`POST /api/events/:id/register` recibe `{ firstName, lastName, email, phone, organization? }`, valida capacidad/duplicado, crea el registro con `ticketCode`, genera el QR y envía el correo. Responde:

```json
{
  "success": true,
  "message": "Registro confirmado",
  "data": { "registrationId": "...", "ticketCode": "EVT-XXXXXXXX", "emailSent": true }
}
```

Si el correo falla, `emailSent` es `false` y la inscripción se mantiene. `GET /api/users/me/tickets` devuelve cada entrada con `ticketCode`, `attendee` y `qrCode` (data URL PNG).

**Favoritos ("Me gusta")**

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/events/:id/favorite` | Autenticado |
| DELETE | `/api/events/:id/favorite` | Autenticado |

**Usuario**

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/users/me/tickets` | Autenticado |
| GET | `/api/users/me/favorites` | Autenticado |
| GET | `/api/users/me/events` | Autenticado (eventos creados por el usuario) |
| GET | `/api/users` | ADMIN (lista de usuarios con conteos) |
| PATCH | `/api/users/:id/role` | ADMIN (cambiar rol: `USER` ↔ `ADMIN`; no permite el propio) |

**Administración**

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/admin/stats` | ADMIN (usuarios, eventos e inscripciones) |

**IA**

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/ai/recommendation` | Público |

## Roles

Evently solo tiene dos roles. Un mismo usuario puede crear eventos y registrarse en eventos de otros.

| Rol | Qué puede hacer |
| --- | --- |
| `USER` | Explorar, buscar, filtrar, ver detalle, favoritos, registrarse a eventos y ver "Mis entradas"; **crear eventos**, y editar/eliminar **sus propios** eventos y ver sus asistentes. |
| `ADMIN` | Todo lo de `USER`, y además administrar la plataforma desde `/admin`: **dashboard** con métricas (usuarios/eventos/inscripciones), listado de **usuarios** (con cambio de rol `USER` ↔ `ADMIN`) y de **eventos** (creador, inscritos/capacidad, buscar, ver, editar y eliminar **cualquier** evento). |

Reglas de autorización:
- `POST /api/events` requiere estar autenticado; el `creatorId` se toma del JWT (nunca del body).
- Editar/eliminar un evento: solo el creador o un `ADMIN` (si no, `403`).
- El registro público siempre crea usuarios con rol `USER`.

## Credenciales de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Admin | `admin@evently.com` | `admin123` |
| Usuario | `user@evently.com` | `user123` |
| Usuario 2 | `user2@evently.com` | `user123` |

## Estado del proyecto

**MVP funcional.**

Incluye autenticación con JWT y bcrypt, roles `USER`/`ADMIN`, descubrimiento con búsqueda/filtros, detalle, favoritos ("Me gusta"), **creación/gestión de eventos por cualquier usuario**, "Mis eventos", cuenta de usuario, panel de administración y recomendación de IA. Además: **autocompletado de ubicación con Google Places**, **búsqueda real** (título, descripción, categoría y ubicación) y **registro a eventos con formulario, ticket con QR y envío por correo**. Frontend responsive con estados de carga, error y vacío.

## Notas de implementación

- **bcryptjs en lugar de bcrypt**: misma familia bcrypt, sin compilación nativa en Windows. Hashing y comparación equivalentes.
- **Puerto**: el backend usa `PORT=3000` por defecto. En este equipo el `3000` estaba ocupado por otro proyecto, por lo que los `.env` locales quedaron en `3100` (`backend/.env` `PORT=3100` y `frontend/.env` `VITE_API_URL="http://localhost:3100/api"`). Para volver a `3000`, cambia ambos archivos.
- **Sin datos mock**: eventos, usuarios, entradas, favoritos y asistentes provienen de PostgreSQL vía API. El único origen de datos de prueba es el seed de Prisma.
- **Imágenes (MVP sin nube)**: cada evento acepta una **URL** o una **imagen subida** desde el navegador. Al subir un archivo se comprime en el cliente (canvas → JPEG, máx. ~1280px) y se guarda como **data URL** en el campo `image` de la base de datos. Como las imágenes viajan en el body JSON, el backend usa `express.json({ limit: '10mb' })`; si el body excede el límite responde `413` con un mensaje claro. Es una solución válida para el MVP; para producción conviene un almacenamiento de objetos (S3, Cloudinary, etc.).
- **IA**: sin `AI_API_KEY` el endpoint responde con una recomendación de respaldo basada en la categoría (fuente `fallback`).
- **Correo opcional**: sin variables SMTP, el registro se confirma igual y la respuesta indica `emailSent: false`; la inscripción nunca se elimina por un fallo de correo.
- **QR determinista**: el QR se genera a partir del `ticketCode` (contenido = solo el código), por lo que siempre es el mismo para una misma entrada y no expone datos personales.
- **Google Places opcional**: sin `VITE_GOOGLE_MAPS_API_KEY`, `LocationAutocomplete` funciona como un input de texto normal.
- **Migración con backfill**: la migración `registration_details_and_event_location` rellena los registros existentes (nombre/apellidos/correo desde el usuario, `ticketCode` generado) antes de aplicar los `NOT NULL`.
- **Migración de roles**: la migración `roles_user_admin_and_event_creator` convierte el enum `Role` a `USER`/`ADMIN` (`ADMIN` se mantiene; `ATTENDEE` y `ORGANIZER` pasan a `USER`) y renombra `Event.organizerId` → `creatorId` preservando los datos.
