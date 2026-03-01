# Integración: Chat con modelo local (Ollama / GGUF)

Esbozo para usar un modelo **GGUF** en el chat (p. ej. *GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-GGUF*) mediante **Ollama**. El proyecto sigue teniendo **un solo backend** (Node/Express en `server/`): ese backend es quien llama a Ollama (servicio local en tu máquina) para el chat; Ollama no es un segundo backend de la app.

**Modelo recomendado (Hugging Face):** [DavidAU/GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-GGUF](https://huggingface.co/DavidAU/GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-GGUF) — GLM-4.7-Flash 30B MOE, uncensored, varios quants (Q4_K_M ~18.5 GB, Q5_K_M, Q8_0, etc.). En el proyecto: **`ollama/README.md`** (pasos completos) y **`ollama/download-gguf.js`** (descarga del .gguf desde HF).

---

## 1. Servicios de modelo local (el backend los llama)

| Servicio    | Uso típico              | API                    | Ventaja                          |
|-------------|-------------------------|------------------------|----------------------------------|
| **Ollama**  | Modelos GGUF en local   | `http://localhost:11434`| Muy fácil; el proyecto lo usa ya |
| **llama.cpp** (server) | Servidor HTTP propio | Puerto que configures | Control total, sin daemon        |
| **KoboldCpp** | Interfaz web + API    | Puerto que configures  | Útil si ya lo usas para otras cosas |

El **único backend** de la app (Node/Express) llama a uno de estos servicios para el chat. En este proyecto la integración está hecha con **Ollama**. Si usas solo llama.cpp en modo servidor, puedes apuntar `OLLAMA_BASE_URL` a ese servidor si expone un endpoint compatible (ver más abajo).

---

## 2. Usar Ollama con tu modelo GGUF

### 2.1 Instalar Ollama

- **Windows:** [ollama.com](https://ollama.com) → descargar e instalar.
- En terminal: `ollama --version` para comprobar.

### 2.2 Añadir el modelo GGUF a Ollama

Ollama suele usar sus propios nombres de modelo (`ollama run <name>`). Para un GGUF propio:

1. **Crear un Modelfile** (en una carpeta cualquiera):

```dockerfile
FROM /ruta/completa/a/tu/GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-Q4_K_M.gguf
PARAMETER temperature 0.8
PARAMETER num_ctx 4096
```

2. **Crear el modelo en Ollama:**

```bash
ollama create glm-uncensored -f Modelfile
```

El nombre `glm-uncensored` es el que usarás en `OLLAMA_MODEL` en el proyecto. Si el GGUF está en otra ruta, cambia `FROM` en el Modelfile.

3. **Comprobar:**

```bash
ollama list
ollama run glm-uncensored "Hola, responde en una palabra."
```

Si no quieres usar Modelfile, en algunas versiones puedes hacer:

```bash
ollama run C:\path\to\model.gguf
```

(depende de la versión de Ollama; la vía recomendada es el Modelfile.)

---

## 3. Cómo está integrado en este proyecto

### 3.1 Configuración (.env)

| Variable          | Descripción                          | Ejemplo                          |
|-------------------|--------------------------------------|----------------------------------|
| `OLLAMA_BASE_URL` | URL del servidor Ollama              | `http://localhost:11434`         |
| `OLLAMA_MODEL`    | Nombre del modelo en Ollama          | `glm-uncensored` o el nombre que diste al `ollama create` |

Si **ambos** están definidos y no vacíos, el chat **prioriza Ollama** (local) y, si falla o no responde, usa Hugging Face Router.

### 3.2 Flujo del chat

1. El usuario envía un mensaje → `POST /api/ai/chat`.
2. Backend:
   - Si Ollama está configurado: llama a `OLLAMA_BASE_URL/api/chat` con `OLLAMA_MODEL` y los mensajes.
   - Si Ollama no está configurado o falla (timeout, error): usa el Router de Hugging Face (HF_TOKEN + modelo remoto).

Así puedes tener el GGUF en local para uso normal y la nube como respaldo.

### 3.3 Código relevante

- **Cliente Ollama:** `server/src/api/ollama.js`  
  - `chatCompletion(messages, options)`  
  - `POST ${baseUrl}/api/chat` con `{ model, messages, stream: false, options: { num_predict, temperature } }`  
  - Respuesta: `response.message.content`

- **Config:** `server/src/config/apiKeys.js`  
  - `apiKeys.ollama.baseUrl`, `apiKeys.ollama.modelId`  
  - `isOllamaConfigured()`

- **Ruta de chat:** `server/src/routes/ai.js`  
  - Primero intenta Ollama; si no está configurado o falla, usa `hfRouter.js`.

---

## 4. Alternativa: solo llama.cpp (sin Ollama)

Si en lugar de Ollama usas el **servidor HTTP de llama.cpp**:

- Ese servidor puede exponer un endpoint tipo **OpenAI** (p. ej. `/v1/chat/completions`) o uno propio.
- Si es compatible con el formato de Ollama (`/api/chat`, body con `model`, `messages`, `stream: false`), puedes poner en `.env`:
  - `OLLAMA_BASE_URL=http://localhost:8080` (o el puerto que use tu servidor).
  - `OLLAMA_MODEL=nombre` (el que acepte tu servidor).

Si tu servidor solo tiene formato OpenAI (`/v1/chat/completions`), entonces habría que añadir un cliente pequeño en `server/src/api/` que hable con ese endpoint (mismo formato que `hfRouter.js` pero contra tu URL local) y usarlo en la ruta de chat en lugar de, o además de, Ollama.

---

## 5. Resumen rápido

1. Instala Ollama y crea un modelo a partir de tu GGUF (Modelfile + `ollama create`).
2. En `.env`: `OLLAMA_BASE_URL=http://localhost:11434` y `OLLAMA_MODEL=glm-uncensored` (o el nombre que hayas usado).
3. Reinicia el backend del proyecto; el chat usará primero Ollama (tu GGUF) y, si no está disponible o falla, el Router de Hugging Face.

Si quieres, el siguiente paso puede ser revisar contigo el Modelfile concreto para tu archivo GGUF o el nombre exacto del modelo en `ollama list`.
