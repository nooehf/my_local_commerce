# My Local Commerce - SaaS MVP

Plataforma SaaS multi-tenant diseñada para digitalizar y automatizar pequeños negocios locales (peluquerías, barberías, clínicas, etc.).

## 🚀 Tecnologías Principales (Tech Stack)

### Frontend
* **Framework:** Next.js (App Router)
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS (Moderno, minimalista, modo premium)
* **Iconos:** Lucide React

### Backend & Autenticación
* **Servicios en la Nube:** Supabase (PostgreSQL, Auth, Storage)
* **Autenticación:** Server-Side Rendering (SSR) a través de `@supabase/ssr` en Next.js.
* **Pagos (Planeado):** Stripe

---

## 🏗 Arquitectura y Base de Datos (Supabase)

El sistema está diseñado bajo una arquitectura verdaderamente **Multi-Tenant**. Un solo backend sirve a múltiples negocios locales de forma completamente aislada e independiente.

### Diagrama de Tablas Principales
* `businesses`: Corazón del sistema. Cada registro define una empresa suscrita.
* `profiles`: Extiende `auth.users` ligando cada usuario a un `business_id` y definiendo su `role` (Dueño/Empleado/Cliente).
* `customers`: Directorio e historial de clientes asociados a un `business_id`.
* `employees`: Plantilla de empleados.
* `services` & `products`: Servicios ofrecidos y catálogo físico de productos.
* `reservations`: Citas y agenda, entrelazando Clientes, Servicios y Empleados.
* `inventory` & `inventory_movements`: Stock actualizado en tiempo real.
* `tasks` & `staff_shifts`: Gestión logística interna.

### Seguridad Row Level Security (RLS)
El aislamiento de los datos ("Tenant Isolation") está garantizado forzadamente a nivel de base de datos a través de PostgreSQL RLS. 

Para lograrlo, la base de datos inyecta dinámicamente el `business_id` del token JWT actual a través de la siguiente función SQL interna:
```sql
CREATE OR REPLACE FUNCTION get_user_business_id() RETURNS uuid STABLE AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql;
```
Cualquier solicitud que llega a la API o mediante cliente Next.js que intente visualizar clientes o servicios, automáticamente se le aplica el filtro `USING (business_id = get_user_business_id())`.

### Triggers y Automatizaciones (Backend)
* **Creación Automática:** Cuando un usuario nuevo se registra en `/register` (Autenticación), un `Trigger` en Supabase detecta la inserción en `auth.users` y automáticamente levanta una instancia de `businesses` y designa a ese usuario como dueño y administrador en `profiles`.

---

## 💻 Módulos y Funcionalidades Desarrolladas

1. **Autenticación (SSR):** `/login` y `/register`. El inicio de sesión y registro utilizan Server Actions y Middleware para refrescar cookies y proteger automáticamente las rutas privadas bajo `/dashboard`.
2. **Dashboard Overview:** Widgets con KPIs esenciales: Reservas hoy, citas para mañana, ingresos, y productos con stock bajo.
3. **Reservas (Core):** Calendario y lista con filtros de estado (Confirmada, Pendiente, No-Show). Funcionalidad de asignación entre cliente, servicio y recurso humano.
4. **Clientes (CRM Básico):** Fichas con datos de contacto, contador de visitas (fidelización) y fecha de la última reserva.
5. **Servicios:** Panel para establecer el tarifario, duración, y habilitar/deshabilitar disponibilidad.
6. **Equipo y Turnos:** Control del personal activo y calendarios de turnos laborales.
7. **Inventario:** Visualización rápida del catálogo de productos con alertas visuales de estado (Normal, Bajo, Agotado).
8. **Configuración y Facturación:** Módulo preparatorio para la integración con suscripciones Stripe.

---

## 🛠 Cómo iniciar el proyecto

Sigue estos pasos para arrancar el entorno en local:

1. **Instalar dependencias:**
   ```bash
   npm install
   # o bien
   yarn
   ```

2. **Copiar variables de entorno:**
   Asegúrate de que exista tu archivo `.env.local` en la raíz del proyecto. Este ha sido generado y vinculado automáticamente a la nube y debe contener:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

3. **Ejecutar el servidor local de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Visualizar:**
   Abre [http://localhost:3000](http://localhost:3000) con tu navegador para ver la Landing Page y navegar hacia el Dashboard.
