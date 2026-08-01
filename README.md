# TotalSleep · Fase 1 (Frontend)

Gestión de pacientes y cuestionarios de salud del sueño. **Sin backend**: login, registro,
respuestas y puntajes se simulan en el cliente con estado local, `localStorage` y datos simulados "mock".

Stack: **React 19 + Vite 7 + Tailwind CSS 4 + React Router 7**

```bash
npm install
npm run dev      # http://localhost:5173 en la mia


## Cuentas de prueba

| Rol        | Usuario  | Contraseña    |
| ---------- | -------- | ------------- |
| Paciente   | `lucia`  | `paciente123` |
| Paciente   | `martin` | `paciente123` |
| Admin      | `admin`  | `admin123`    |

En el login hay botones que autocompletan estas credenciales.

## Rutas

## Los dos roles


- **Paciente** — completa la evaluación y la repite pasado un tiempo. Ve su propio historial.
- **Administración** — **nunca completa cuestionarios**. Entra a leer qué respondió cada paciente y
  cómo evolucionó entre tomas.


## Sistema de diseño

Definido como variables de tema en `src/index.css` (`@theme` de Tailwind 4).

| Rol                    | Token           | Hex       |
| ---------------------- | --------------- | --------- |
| Azul corporativo       | `navy-900/700`  | `#0B2545` / `#1A365D` |
| Turquesa (CTA, foco)   | `aqua-500`      | `#00A8CC` |
| Azul eléctrico         | `electric`      | `#0080FF` |
| Verde salud / éxito    | `vital-600/500` | `#28A745` / `#20C997` |
| Gris niebla (fondos)   | `mist-50/100`   | `#F8F9FA` / `#F0F2F5` |

Tipografías: **Bricolage Grotesque** (títulos) + **Manrope** (texto), vía Google Fonts.
Respeta `prefers-reduced-motion`.
