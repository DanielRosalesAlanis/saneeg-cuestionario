<div align="center">

# SanEEG

**Evaluación de bienestar emocional para estudiantes**

Cuestionario DASS-21 sin registro previo, resultados con líneas de apoyo y folio para vincular posteriormente una cita.

![React](https://img.shields.io/badge/React-19-002060?style=for-the-badge&logo=react&logoColor=00B4D8)
![Vite](https://img.shields.io/badge/Vite-8-002060?style=for-the-badge&logo=vite&logoColor=00B4D8)

</div>

---

## Sobre el proyecto

SanEEG es el frontend de un proyecto de investigación (CENIDET) enfocado en neurología, psicología y salud mental estudiantil. Guía al participante por consentimiento informado, cuestionario DASS-21, resultados y generación de folio sin pedir una cuenta, nombre, teléfono, correo ni matrícula. La cuenta se creará posteriormente en la plataforma de citas cuando la persona decida vincular su evaluación.

## Flujo de la aplicación

| Paso | Pantalla | Descripción |
|---|---|---|
| 1 | Bienvenida | Presentación breve antes de iniciar |
| 2 | Aviso de privacidad | Consentimiento informado y creación de una sesión anónima |
| 3 | Cuestionario | 3 bloques sin identificadores directos: contexto general, DASS-21 y contexto demográfico |
| 4 | Resultados | Puntajes por severidad, líneas de apoyo, folio y código privado |
| 5 | Citas | Vinculación futura del folio con una cuenta y consumo de la API de citas |

## Tecnologías

- **React 19** + **Vite** — SPA sin enrutador, controlada por estado (`App.jsx`)
- Estilos en JS por componente, sin librerías de UI externas
- Iconografía SVG propia (`src/components/Icons.jsx`), sin emojis
- Paleta clínica: azul navy (`#002060`) + turquesa (`#00B4D8`)

## Correr en local

Requiere Node.js `^20.19.0` o `>=22.12.0` y npm.

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Las llamadas a `/api/*` se redirigen (ver
`vite.config.js`) al backend Spring Boot en `http://localhost:8080` — necesitas
tenerlo corriendo en paralelo (repo [saneeg-backend](https://github.com/DanielRosalesAlanis/saneeg-backend))
para guardar el cuestionario, calcular resultados y generar el folio.

## Scripts disponibles

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | Corre ESLint sobre el proyecto |
| `npm test` | Ejecuta las pruebas unitarias con Vitest |
| `npm run test:e2e` | Ejecuta Playwright con el backend simulado del cuestionario |

## Estructura del proyecto

```
src/
├── App.jsx              # Máquina de estados del flujo (paso actual)
├── components/           # Header, ActionButton, OptionCard, Icons…
├── screens/               # Una pantalla por paso del flujo
├── constants/            # Preguntas del cuestionario, colores, datos de ejemplo
└── hooks/                 # Hooks compartidos (ej. useEnterKey)
```

## Despliegue

El sitio se sirve desde un VPS de IONOS: `npm run build` genera `dist/`, que nginx
sirve como estático en el mismo dominio que expone la API del backend Spring Boot
(`saneeg-backend`) bajo `/api/*` — así el frontend y la API comparten origen y no
hace falta configurar CORS en producción.
