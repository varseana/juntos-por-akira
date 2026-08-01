# Juntos por Akira

Aplicacion web real para una rifa solidaria. 300 numeros a mil colones cada uno,
pago por Sinpe Movil, ticker de agradecimientos, seccion editable sobre Akira y un
panel de administracion protegido con autenticacion.

Stack: React + Vite + TypeScript + Supabase (Postgres con Row Level Security, Auth
y Storage). Estilo hand-drawn con rough.js y react-rough-fiber.

---

## 1. Crear y configurar el backend en Supabase

1. Entra a https://supabase.com y crea una cuenta.
2. Crea un proyecto nuevo (New project). Elige la region mas cercana a Costa Rica,
   por ejemplo East US. Guarda la contrasena de la base de datos.
3. Cuando el proyecto termine de aprovisionarse, ve a **SQL Editor** en el menu
   lateral, abre **New query**, pega TODO el contenido del archivo
   `supabase/schema.sql` de este repositorio y pulsa **Run**.
   Esto crea las tablas, siembra los 300 numeros, activa Row Level Security, crea
   el bucket de fotos y habilita Realtime. Es seguro volver a ejecutarlo.
4. Crea el usuario administrador:
   - Ve a **Authentication > Users > Add user > Create new user**.
   - Escribe el correo y la contrasena que usaras para administrar. Marca la
     casilla **Auto Confirm User** para que quede confirmado de inmediato.
   - Copia el **User UID** que aparece en la lista de usuarios.
5. Autoriza a ese usuario como admin. Vuelve al **SQL Editor**, abre otra query y
   ejecuta (reemplaza el UID por el que copiaste):
   ```sql
   insert into public.admins (user_id) values ('PEGA_AQUI_EL_USER_UID');
   ```
6. Copia las llaves publicas del frontend. Ve a **Project Settings > API** y copia:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public** key (la clave publica, NO la `service_role`)

   Nunca uses ni publiques la `service_role` key en el frontend.

---

## 2. Variables de entorno

En la raiz del proyecto, copia `.env.example` como `.env.local` y completa:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY_PUBLICA
```

Estas dos variables son publicas por diseno. La seguridad real vive en las
politicas RLS de la base de datos, no en ocultar estas claves.

---

## 3. Correr en local

```
npm install
npm run dev
```

Abre la URL que muestra la terminal. En AgentSpaces el servidor queda en el puerto
3000 y se accede por el boton **Connect** o por la URL del proxy de DevSpaces.

Para probar el build de produccion:

```
npm run build
npm run preview
```

---

## 4. Desplegar en Vercel

Vercel es la opcion recomendada para una app Vite estatica.

1. Sube el proyecto a un repositorio de GitHub (o GitLab / Bitbucket).
2. Entra a https://vercel.com, pulsa **Add New > Project** e importa el
   repositorio.
3. Vercel detecta Vite automaticamente. Confirma:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. En **Environment Variables** agrega las dos variables, con los mismos valores de
   tu `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Pulsa **Deploy**. Al terminar tendras una URL publica lista para compartir.

En cada push a la rama principal Vercel vuelve a desplegar solo.

---

## 5. Entrar al panel de administracion (acceso secreto)

El panel de admin NO tiene ningun boton visible en la pagina. Solo aparece si
visitas la web con una ruta secreta en el hash de la URL:

```
https://TU-SITIO.com/#/panel-akira-8f3k29
```

1. Cambia la ruta secreta por una tuya. Abre `src/lib/supabase.ts` y edita el
   valor de `ADMIN_SECRET_PATH`. Elige algo dificil de adivinar, por ejemplo
   `panel-akira-mi-clave-larga-2026`. No compartas esa ruta con nadie.
2. Entra a `https://TU-SITIO.com/#/TU_RUTA_SECRETA`. Aparece el formulario de
   login.
3. Ingresa el correo y la contrasena del usuario que creaste en el paso 1.4.
4. Al entrar aparece la barra superior **Modo administracion activo**. Desde ahi:
   - Toca cualquier numero de la cuadricula para marcarlo como vendido o volverlo
     a disponible.
   - Pulsa **Gestionar ticker** para agregar o eliminar mensajes de
     agradecimiento.
   - Pulsa **Editar seccion** en el bloque de Akira para cambiar el titulo, el
     texto y subir o quitar fotos.
5. Los cambios se guardan en Supabase y se ven al instante para todas las
   personas que tengan la pagina abierta (via Realtime).

Doble candado: aunque alguien descubra la ruta secreta, no puede modificar nada
sin tu correo y contrasena. Y aunque tuviera una sesion, la base de datos solo
acepta escrituras del usuario listado en la tabla `admins`. La ruta secreta solo
oculta el formulario; la seguridad real vive en las politicas RLS.

## 6. Como subir las fotos de Akira

1. Entra al panel de admin (paso 5).
2. En el bloque **Quien es Akira**, pulsa **Editar seccion**.
3. Usa el selector de archivos para elegir una o varias fotos. Se suben al
   Storage de Supabase y aparecen como miniaturas; puedes quitar cualquiera con
   la X.
4. Pulsa **Guardar cambios**.

Recomendaciones de las fotos:

- Formato: JPG o PNG. Peso ideal por foto: menos de 2 MB.
- Resolucion recomendada: alrededor de 1000 x 1000 px (cuadradas). Se muestran en
  una cuadricula recortadas a cuadrado, asi que una foto cuadrada se ve mejor.
- Fotos horizontales o verticales tambien sirven: se recortan al centro de forma
  automatica para encajar en el cuadrado, sin deformarse.
- Puedes subir varias; se muestran en una cuadricula de dos columnas.

## 7. El premio y el sorteo

- El premio es de 50.000 colones y se muestra en un banner al inicio de la
  pagina, con una barra de progreso de numeros vendidos.
- La rifa se realiza una vez que los 300 numeros esten vendidos. El banner avisa
  automaticamente cuando se completa la venta.
- Para cambiar el monto del premio, edita `PRIZE_AMOUNT` en `src/lib/supabase.ts`.

---

## Notas de seguridad

- Row Level Security esta activo en todas las tablas. El publico solo puede leer;
  toda escritura exige sesion autenticada y ademas que el usuario este en
  `public.admins` (verificado por la funcion `is_admin()` en la base de datos).
- La tabla `admins` no es legible ni editable desde el cliente. Solo se administra
  por SQL con las credenciales del proyecto.
- El bucket de fotos permite lectura publica, pero subir, reemplazar o borrar
  archivos requiere ser admin.
- El frontend nunca contiene la `service_role` key.
