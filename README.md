# TotalSleep · Fase 1 (Frontend)

Gestión de pacientes y cuestionarios de salud del sueño. **Sin backend**: login, registro,
respuestas y puntajes se simulan en el cliente con estado local, `localStorage` y datos mock.

Stack: **React 19 + Vite 7 + Tailwind CSS 4 + React Router 7**

## Desarrollo local

Requiere **Node.js 20.19+** o **22+**.

```bash
npm install
npm run dev      # http://localhost:5173
```

## Demo en GitHub Pages (gratis)

Tras mergear a `main` y activar Pages en el repo:

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions  
2. El workflow `.github/workflows/deploy-pages.yml` publica el build estático  
3. URL esperada: `https://pablodybel.github.io/totalsleep/`

Los datos de la demo quedan en el navegador de cada visitante (no hay servidor compartido).

## Cuentas de prueba

| Rol        | Usuario  | Contraseña    |
| ---------- | -------- | ------------- |
| Paciente   | `lucia`  | `paciente123` |
| Paciente   | `martin` | `paciente123` |
| Admin      | `admin`  | `admin123`    |

En el login hay botones que autocompletan estas credenciales.

## Roles

- **Paciente** — completa la evaluación y la repite pasado un tiempo. Ve su propio historial.
- **Administración** — no completa cuestionarios. Lee qué respondió cada paciente y cómo evolucionó entre tomas.

## Sistema de diseño

Definido como variables de tema en `src/index.css` (`@theme` de Tailwind 4).

| Rol                    | Token           | Hex       |
| ---------------------- | --------------- | --------- |
| Azul corporativo       | `navy-900/700`  | `#0B2545` / `#1A365D` |
| Turquesa (CTA, foco)   | `aqua-500`      | `#00A8CC` |
| Azul eléctrico         | `electric`      | `#0080FF` |
| Verde salud / éxito    | `vital-600/500` | `#28A745` / `#20C997` |
| Gris niebla (fondos)   | `mist-50/100`   | `#F8F9FA` / `#F0F2F5` |

Tipografía: **Schibsted Grotesk**, vía Google Fonts. Respeta `prefers-reduced-motion`.
