# GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX (Ollama)

Modelo GGUF en [Hugging Face](https://huggingface.co/DavidAU/GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-GGUF): GLM-4.7-Flash 30B-A3B MOE, uncensored/heretic, con quants optimizados (Imatrix NEO/Code, output tensor 16-bit).

---

## Quants disponibles (elige uno)

| Quant | Tamaño | RAM aprox. | Uso típico |
|-------|--------|------------|------------|
| **IQ2_M** | 10.3 GB | ~12 GiB | **Poca RAM** (p. ej. &lt;14 GiB disponible) |
| **IQ3_M** | 13.6 GB | ~15 GiB | Calidad/VRAM media |
| **Q4_K_M** | 18.5 GB | ~14+ GiB | Buen equilibrio calidad/VRAM |
| **Q4_K_S** | 17.4 GB | Menos que Q4_K_M | Menos VRAM |
| **IQ4_NL** | 17.3 GB | Especializado | |
| **Q5_K_M** | 21.6 GB | Más calidad | |
| **Q8_0** | 32.1 GB | Máxima calidad (más lento) | |

Si Ollama devuelve *"model requires more system memory than is available"*, usa el quant **IQ2_M** (opción A):

1. Descargar: `node download-gguf.js IQ2_M`
2. Cuando termine, crear el modelo: `ollama create glm-uncensored-small -f Modelfile-IQ2_M`
3. En `.env`: `OLLAMA_MODEL=glm-uncensored-small`

O ejecuta `.\create-iq2-after-download.ps1` en la carpeta `ollama`: espera a que termine la descarga y crea el modelo.

Lista completa en la pestaña "Files and versions" del repo.

---

## 1. Descargar el .gguf

### Opción A: Script (recomendado)

Si tienes Node.js (el proyecto ya lo usa):

```powershell
cd c:\Users\julia\videoOnix\ollama
node download-gguf.js Q4_K_M
```

Eso descarga el archivo `GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-Q4_K_M.gguf` en esta carpeta. Puedes usar otro quant: `Q4_K_S`, `IQ4_NL`, `Q5_K_M`, `Q5_1`, `Q8_0`, etc. Si el script falla (404), comprueba el nombre exacto del archivo en la pestaña **Files and versions** del [repo](https://huggingface.co/DavidAU/GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-GGUF/tree/main) y pásalo como argumento (solo la parte del quant si el nombre sigue el patrón `...-{quant}.gguf`).

### Opción B: Manual

1. Entra en [DavidAU/GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-GGUF](https://huggingface.co/DavidAU/GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-GGUF).
2. Abre **Files and versions**, elige un `.gguf` (p. ej. `GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-Q4_K_M.gguf`).
3. Descarga el archivo y guárdalo (por ejemplo en `c:\Users\julia\videoOnix\ollama\`).
4. Anota la **ruta completa** del archivo.

---

## 2. Modelfile

Abre `ollama/Modelfile` y en la línea `FROM` pon la **ruta completa** al `.gguf` descargado, por ejemplo:

```text
FROM C:\Users\julia\videoOnix\ollama\GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-Q4_K_M.gguf
```

Si usaste el script, la ruta será algo como:

```text
FROM C:\Users\julia\videoOnix\ollama\GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-Q4_K_M.gguf
```

---

## 3. Crear el modelo en Ollama

Desde PowerShell, en la carpeta `ollama`:

```powershell
cd c:\Users\julia\videoOnix\ollama
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" create glm-uncensored -f Modelfile
```

---

## 4. Probar

```powershell
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" list
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" run glm-uncensored "Hola"
```

---

## 5. Usar en el chat del proyecto

En la raíz del proyecto, en tu `.env`:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=glm-uncensored
```

Reinicia el backend. El chat usará primero Ollama (este modelo) y, si falla, el Router de Hugging Face.

---

## Parámetros recomendados (model card)

- **Por defecto (model card):** temperature 1.0, top_p 0.95, max new tokens 131072.
- **Estilo GLM 4.6 (recomendado para chat):** temperature 0.8, top_p 0.6, top_k 2, max context 8k–16k.
- **Repetition penalty:** 1.1 (o 1.0 si no hay repeticiones).

El `Modelfile` incluido usa estos valores (num_ctx 16384, temperature 0.8, repeat_penalty 1.1). Puedes ajustarlos en el `Modelfile` y volver a ejecutar `ollama create glm-uncensored -f Modelfile`.
