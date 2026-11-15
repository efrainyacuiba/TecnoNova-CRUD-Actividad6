# Estado de verificación — 14/11/2026

- [x] Se conservan modelos, controladores, SQL y consultas originales de PostgreSQL.
- [x] `ProductoDAO` selecciona archivo local JSON cuando no hay cadena de PostgreSQL, sin dependencias NuGet adicionales.
- [x] CRUD de datos locales implementado con creación, consulta, actualización y eliminación persistente en `%LOCALAPPDATA%`.
- [x] La demo HTML incluye el IIFE compilado de Three.js + GSAP y seis fotografías JPG locales.
- [x] La versión de GitHub Pages dentro de `/docs` incluye una copia autónoma de todos los recursos usados.
- [x] Sintaxis del JavaScript comprobada con `node --check`.
- [x] Enlaces a CSS, JavaScript e imágenes locales comprobados.
- [ ] Compilación y ejecución C# pendientes: el entorno de creación no dispone del SDK .NET.
- [ ] Comprobación visual automatizada en navegador pendiente: el navegador de este entorno bloquea URLs locales.
- [ ] No se ha probado la demo en la computadora del docente. Se debe abrir y comprobar antes de entregar.

**Importante:** la demo HTML usa el almacenamiento del navegador. Es distinta de la aplicación C#, cuyo modo de archivo local JSON se guarda en el perfil del usuario.
