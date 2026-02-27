# TODO — XXXAI / videoOnix

Lista de tareas pendientes y sugeridas para el proyecto.

---

## Prioridad alta

- [ ] **Producción**: Configurar variables de entorno (`.env.production`) para API, MongoDB y Stripe.
- [ ] **Stripe**: Conectar checkout real con Stripe (actualmente simulado).
- [ ] **API de generación**: Conectar la generación de video con el backend/IA real (si aplica).
- [ ] **Tests**: Añadir tests (unitarios o E2E) para flujos críticos (login, chat, checkout).

---

## Prioridad media

- [ ] **Chat**: Conectar mensajes del chat con un backend/IA real (ahora son placeholders).
- [ ] **Feed**: Persistir o sincronizar posts entre sesiones si se desea (ahora en localStorage).
- [ ] **Match**: Opcionalmente sincronizar matches con el backend para multi‑dispositivo.
- [ ] **PWA**: Añadir manifest y service worker para instalación en móvil.
- [ ] **Accesibilidad**: Revisar aria-labels, contraste y navegación por teclado.
- [ ] **Errores**: Página o componente de error global (Error Boundary) con mensaje amigable.

---

## Prioridad baja / mejoras

- [ ] **Internacionalización**: Revisar que no queden textos hardcodeados sin `t()`.
- [ ] **Performance**: Lazy load de rutas pesadas (ya usas `lazy()` en App).
- [ ] **SEO**: Meta tags y títulos por ruta si la app tiene contenido público.
- [ ] **Documentación**: README con pasos de instalación, `.env` de ejemplo y cómo correr front + API.
- [ ] **Limpieza**: Quitar `console.log` y código comentado antes de producción.
- [ ] **npm**: Revisar `npm audit` y actualizar dependencias con vulnerabilidades.

---

## Hecho (referencia)

- Chat con grupos, matches, secciones Chat/Match, eliminar y mover entre secciones.
- Mensajes del chat traducidos al cambiar idioma (claves en lugar de texto fijo).
- Límite de 2 mensajes de la IA tras la última interacción del usuario.
- Estado vacío "Empieza a chatear" cuando no hay chats o no hay selección.
- No autoabrir un chat al entrar en la página Chat.
- Feed: posts de IAs, tiempos de próximo post persistidos al salir del Feed.
- Match: swipe, probabilidad de match, matches únicos, Link a Chat.
- Traducciones revisadas (es/en).
- Vite con `host: true` para probar desde el móvil en la misma WiFi.

---

*Actualizado según el estado actual del proyecto. Marca con `[x]` lo que vayas completando.*
