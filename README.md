# 📜 VaroPromptVault v1.0.0
### El Almacén Maestro de Prompts para IA (Pro Edition)

**VaroPromptVault** es una solución profesional, ligera y estéticamente superior para el almacenamiento y gestión de prompts de inteligencia artificial. Ofrece una experiencia de usuario fluida con estética **Glassmorphism** y funcionalidades de alta calidad de vida (QoL) para optimizar cualquier flujo de trabajo con LLMs.

---

## 🚀 Características Principales

*   **⚡ Interfaz Premium:** Diseño en modo oscuro con efectos de transparencia y desenfoque (Glassmorphism).
*   **🔍 Búsqueda Atómica:** Buscador instantáneo por título y contenido con soporte para categorías.
*   **📂 Organización Inteligente:** Filtros por categorías configurables y etiquetado dinámico.
*   **📋 QoL Extremo:** Copiado al portapapeles con un solo clic y vista detallada ampliada (Modal).
*   **🛠️ Tech Stack 2025:**
    *   **Frontend:** React 18 + Vite (Vanilla CSS).
    *   **Backend:** Fastify (Node.js 22 LTS).
    *   **Database:** SQLite3 para persistencia sólida y portable.
*   **🐳 Docker Orchestration:** Incluye configuración multi-stage optimizada para producción.

---

## 🛠️ Instalación y despliegue

### Requisitos previos
*   Docker & Docker Compose (Recomendado).
*   Node.js v22+ (Para desarrollo local).

### Despliegue con Docker
```bash
# Puerto asignado por defecto: 8090
docker compose up -d
```

### Desarrollo Local
```bash
# Servidor (Puerto 3000)
cd server && npm install && npm start

# Cliente (Puerto 5173)
cd client && npm install && npm run dev
```

---

## 📂 Estructura del Proyecto

*   `/client`: Frontend React con estilo Glassmorphism.
*   `/server`: API REST construída con Fastify.
*   `/data`: Volumen de persistencia para la base de datos SQLite.
*   `/scripts`: Herramientas auxiliares de gestión.

---

## 🛡️ Seguridad y Mantenimiento

*   **Usuario No-Root:** Imagen Docker configurada para ejecución segura.
*   **Capping de Recursos:** CPU limitada a 0.5 y RAM a 512MB para garantizar la estabilidad del sistema host.
*   **Atomic Shield:** Integración completa con sistemas de backup y rotación.

---

**Estado del Proyecto:** 🟢 NOMINAL | **Versión:** 1.0.0
**Administrador:** varo
