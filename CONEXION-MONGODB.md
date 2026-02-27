# Conectar XXXAI a MongoDB Atlas

Si la app no conecta a la base de datos, sigue estos pasos.

## 0. Comprobar la URI en Atlas

1. Entra en [cloud.mongodb.com](https://cloud.mongodb.com) → tu proyecto.
2. **Database** → en tu cluster pulsa **Connect**.
3. Elige **Drivers** (o “Connect your application”).
4. Copia la **connection string** que te dan.
5. Debe ser parecida a: `mongodb+srv://usuario:password@NOMBRECLUSTER.xxxxx.mongodb.net/`
6. En tu proyecto, abre el archivo **`.env`** y pega esa URI en `MONGODB_URI=`, cambiando `<password>` por tu contraseña y añadiendo al final el nombre de la base: `/xxxai?retryWrites=true&w=majority&authSource=admin`

(El nombre del cluster puede ser `cluster0`, `iaxxx` u otro; tiene que coincidir con lo que ves en Atlas.)

## 1. Probar la conexión

En **CMD** (no PowerShell si te da error de scripts):

```cmd
cd C:\Users\julia\videoOnix
npm run db:test
```

- Si ves **✅ Conectado a MongoDB** → la conexión está bien.
- Si ves **ECONNREFUSED** o **querySrv** → suele ser el **Network Access** (paso 2).

## 2. Permitir tu IP en MongoDB Atlas

1. Entra en [cloud.mongodb.com](https://cloud.mongodb.com) e inicia sesión.
2. En tu proyecto, en el menú izquierdo: **Network Access**.
3. Pulsa **"+ ADD IP ADDRESS"**.
4. Para poder conectarte desde cualquier sitio (casa, trabajo, etc.):
   - Pulsa **"ALLOW ACCESS FROM ANYWHERE"**.
   - Se añadirá la IP `0.0.0.0/0`.
5. Pulsa **Confirm**.
6. Espera 1–2 minutos a que Atlas active el cambio.

## 3. Comprobar usuario de base de datos

1. En el menú izquierdo: **Database Access**.
2. Comprueba que exista el usuario que usas en la URI (ej. `juliacmarrero_db_user`).
3. Sus permisos deben ser al menos **"Read and write to any database"** (o Atlas Admin).

## 4. Volver a probar

```cmd
npm run db:test
```

Si sigue fallando, ejecuta otra vez y copia el mensaje de error completo para revisarlo.
