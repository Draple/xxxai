# XXXAI — Proyecto Vite + React

Proyecto **Vite + React** con API Express en el mismo repo. Una sola instalación, un solo comando para desarrollo.

## Estructura (proyecto Vite + React)

```
xxxai/
├── index.html              # Entrada HTML (Vite)
├── vite.config.js          # Config Vite + proxy /api
├── jsconfig.json           # Rutas @/ para src
├── package.json            # Un solo package (front + API)
├── src/                    # App React (Vite)
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── context/
│   ├── components/
│   └── pages/
├── public/
│   └── favicon.svg
├── server/                 # API Express (mismo repo)
│   ├── src/
│   │   ├── index.js
│   │   ├── db/
│   │   ├── routes/
│   │   └── middleware/
│   └── src/models/         # Mongoose (MongoDB)
├── .env.example
└── INICIAR-XXXAI.bat  # Arrancar todo (Windows)
```

## Requisitos

- **Node.js 18+**

## Uso

### Instalación (una vez)

```bash
cd C:\Users\julia\videoOnix
npm install
```

Copia `.env.example` a `.env` y **añade tu URI de MongoDB** en `MONGODB_URI`. Si no la tienes aún, puedes arrancar igual; cuando la tengas, ponla en `.env` y reinicia la API.

(Opcional) Probar conexión a MongoDB:

```bash
npm run db:init
```

### Desarrollo (Vite + React + API)

**Opción 1 — Un solo comando (recomendado)**

```bash
npm start
```

Levanta Vite (front) y la API a la vez. Abre **http://localhost:5173**.

**Opción 2 — Por separado**

```bash
# Terminal 1: API
npm run api

# Terminal 2: Vite + React
npm run dev
```

**Opción 3 — Windows (doble clic)**

Ejecuta **`INICIAR-VIDEOONIX.bat`**: instala, inicia API y app y abre el navegador.

### Scripts

| Comando | Descripción |
|--------|-------------|
| `npm run dev` | Solo Vite (React) en :5173 |
| `npm run api` | Solo API Express en :4000 |
| `npm run build` | Build de producción (Vite) |
| `npm run preview` | Previsualizar build |
| `npm run db:init` | Crear/inicializar SQLite |
| `npm start` | Vite + API a la vez |

### Build para producción

```bash
npm run build
```

La app queda en `dist/`. La API se ejecuta con `npm run api` (o en tu servidor con Node).

## Configuración

- **Frontend:** Vite 5, React 18, React Router, Tailwind CSS.
- **API:** Express, SQLite (better-sqlite3), JWT, bcrypt.
- **Proxy:** En dev, las peticiones a `/api` se envían a `http://localhost:4000`.

Variables en `.env` (ver `.env.example`): `PORT`, `JWT_SECRET`, `FRONTEND_URL`, Stripe y wallets cripto si los usas.
