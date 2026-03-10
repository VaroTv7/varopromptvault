# 💎 VaroPromptVault

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)
![Fastify](https://img.shields.io/badge/Fastify-5.x-000000.svg?logo=fastify)
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57.svg?logo=sqlite)

**VaroPromptVault** es un repositorio personal y profesional para gestionar, almacenar y versionar tus prompts de Inteligencia Artificial. Diseñado con una interfaz "Glassmorphism" moderna y oscura, optimizado para la velocidad y la eficiencia del flujo de trabajo diario.

---

## ✨ Características Principales

-   **🎨 Diseño Premium (Glassmorphism):** Interfaz oscura, elegante, con paneles semitransparentes y desenfoque de fondo.
-   **⚡ Rendimiento Instantáneo:** Sistema de caché híbrido para cargas inmediatas.
-   **📝 Editor Markdown Nativo:** Formateo rico integrado en la UI oscura.
-   **📂 Gestión de Categorías:** Configuración total desde el *Settings Hub*.
-   **✨ Variables Dinámicas:** Usa `{{ variable }}` para crear plantillas interactivas y reutilizables.
-   **🔄 Historial y Notas:** Control de versiones con capacidad de añadir notas personalizadas y eliminar registros antiguos.
-   **❓ Guía Interactiva:** Haz clic en el botón de **Ayuda (icono de interrogación)** en la cabecera para acceder al manual de usuario amigable y detallado.
-   **⌨️ Accesos Directos:** `Ctrl+N` (Nuevo), `Ctrl+K` (Buscar), `Esc` (Cerrar).

---

## 🏗️ Arquitectura Técnica

### Frontend (Cliente)
Construido con React (Vite) para máxima velocidad de desarrollo. Recientemente refactorizado bajo un modelo modular *"Enterprise"*:
- **Componentes Aislados:** `Sidebar`, `PromptCard`, modales dedicados (`CreatePrompt`, `PromptDetail`, `Settings`, `Guide`).
- **Iconografía:** `lucide-react` para iconos minimalistas y nítidos.
- **Estilos:** CSS puro con variables `:root` globales, priorizando el rendimiento sin abusar de dependencias externas.

### Backend (Servidor)
API RESTful ultra-rápida.
- **Framework:** Fastify.
- **Base de Datos:** SQLite (`sqlite3` nativo, base de datos en `./server/data/promptvault.db`).
- **Archivos Estáticos:** El backend es capaz de servir la compilación de Vite (carpeta `dist`) de forma independiente si es necesario a través de `@fastify/static`.

---

## 🚀 Instalación y Uso Local

### Prerrequisitos
- Node.js (v18 o superior).

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/VaroTv7/varopromptvault.git
cd varopromptvault
```

### Paso 2: Ejecutar el Backend (API & DB)
```bash
cd server
npm install
npm start   # O 'node index.js'
```
*El servidor correrá en `http://localhost:6100` y creará la base de datos automáticamente si no existe.*

### Paso 3: Ejecutar el Frontend (UI)
Abre una nueva pestaña en tu terminal:
```bash
cd client
npm install
npm run dev
```
*La interfaz estará disponible en `http://localhost:6101` (u otro puerto si está ocupado).*

---

## 🐳 Despliegue con Docker (Recomendado para Servidores)

La forma más fácil de instalar en un servidor. Solo necesitas Docker y Docker Compose.

```bash
git clone https://github.com/VaroTv7/varopromptvault.git
cd varopromptvault
docker compose up -d --build
```

La app estará disponible en `http://tu-servidor:8090`. Los datos se guardan en `./data/` y persisten entre reinicios.

Para actualizar a una nueva versión:
```bash
git pull
docker compose up -d --build
```

---

## 🤝 Mejoras y Contribuciones
Si se desean hacer cambios masivos, se recomienda añadir modificaciones en componentes pequeños dentro de `client/src/components` para mantener la base de código libre de deuda técnica.

*VaroPromptVault v1.5 — Diseñado como una bóveda centralizada para potenciar flujos de trabajo con IAs Generativas.*
