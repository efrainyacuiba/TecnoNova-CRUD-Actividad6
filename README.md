# TecnoNova Actividad 6 — VERSIÓN PORTÁTIL

**Para presentar sin configurar PostgreSQL:** abre `DEMO_SIN_INSTALAR.html` (o `ABRIR_DEMO_WINDOWS.bat`). Tiene las escenas WebGL de Figma, las cuatro pantallas y operaciones CRUD de demostración en el navegador.

**Para ejecutar C# sin PostgreSQL:** con .NET 10 instalado ejecuta `dotnet run --launch-profile http`. Se inicia el modo de archivo local JSON con los cuatro productos originales y operaciones reales Crear/Consultar/Editar/Eliminar.

**Para usar PostgreSQL:** configura `ConnectionStrings:TecnoNova` (no publiques la contraseña). El backend PostgreSQL original continúa disponible.

**Lee primero:** `EJECUTAR_SIN_POSTGRESQL.md`.

---

# TecnoNova Bolivia — Actividad 6 + Figma Make 3D

**Proyecto C# MVC real con interfaz cinematográfica de Figma Make integrada.**

Lee primero [LEER_PRIMERO_FIGMA_INTEGRADO.md](LEER_PRIMERO_FIGMA_INTEGRADO.md).

- Vistas: `Views/Interfaz/` (Inicio, Catálogo, Inventario, Nuevo)
- Cámara 3D, partículas, procesador: `wwwroot/js/tecnonova-motion.js`
- Interacciones y validación auxiliar: `wwwroot/js/tecnonova-ux.js`
- Fuente del motor Three.js/GSAP: `frontend/src`
- Fotografía JPG local: `wwwroot/img/productos`
- Backend conservado: `Controllers`, `Models`, `Data`, PostgreSQL

La carpeta `docs` es una demo antigua, no corresponde al nuevo diseño de Figma.
