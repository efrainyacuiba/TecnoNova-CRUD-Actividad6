# Integración del frontend cinematográfico en TecnoNova Bolivia (ASP.NET Core MVC, .NET 10)

## 0. Qué se verificó y qué NO

| Verificado (en Figma Make, Chromium headless con WebGL por software) | NO verificado |
|---|---|
| El JS compila a un solo archivo `wwwroot/js/tecnonova-motion.js` (IIFE, sin CDN) | **Las vistas Razor no se compilaron**: no hay SDK de .NET en este entorno |
| Las 4 escenas 3D se renderizan, el canvas persiste entre rutas | **El backend C# y PostgreSQL no se tocaron ni se probaron** |
| Navegación parcial, `pushState`, botón Atrás, limpieza de eventos | `POST /Interfaz/Crear`, token antifalsificación y validación de precio en C# |
| Fallback a navegación normal si WebGL/fetch falla | Rendimiento en dispositivos reales (solo se probó en emulación móvil) |

Las vistas `.cshtml` asumen nombres que **debes adaptar** a tu proyecto (marcados con `@* ADAPTAR *@`):
- `@using TecnoNova.Models` y el tipo `Producto` con `Id, Sku, Nombre, Precio (decimal), Stock (int), Categoria.Nombre`.
- Las categorías del formulario se leen de `ViewBag.Categorias` como `IEnumerable<SelectListItem>`. Si tu controlador las entrega distinto, cambia solo esa línea en `Nuevo.cshtml`.
- Eliminar se envía como `POST /Productos/Eliminar/{id}` (con token). Si tu acción es GET o se llama distinto, ajusta el `<form>` en `Inventario.cshtml`.
- `Index` debe devolver la vista `Inicio` (`return View("Inicio");`) si tu acción no lo hace ya.

## 1. Contenido de esta carpeta

```
TECNONOVA_ASPNET_INTEGRACION/
├─ Views/Shared/_Layout.cshtml          ← REEMPLAZA el existente (canvas WebGL persistente)
├─ Views/Shared/_ProductoFoto.cshtml    ← NUEVO (elige fotografía real por nombre/categoría)
├─ Views/Interfaz/Inicio.cshtml         ← REEMPLAZA
├─ Views/Interfaz/Catalogo.cshtml       ← REEMPLAZA
├─ Views/Interfaz/Inventario.cshtml     ← REEMPLAZA
├─ Views/Interfaz/Nuevo.cshtml          ← REEMPLAZA
├─ wwwroot/css/tecnonova-motion.css     ← REEMPLAZA/CREA
├─ wwwroot/js/tecnonova-motion.js       ← YA COMPILADO (Three.js + GSAP incluidos, ~650 KB, ~176 KB gzip)
├─ wwwroot/img/productos/*.jpg          ← NUEVO (6 fotografías de Unsplash)
└─ frontend/                            ← CÓDIGO FUENTE del JS (no se despliega)
   ├─ package.json, vite.config.js
   └─ src/ main.js, nav.js, pages.js, engine/{stage,models,gfx}.js, scenes/{home,catalog,inventory,nuevo}.js
```

Los modelos 3D (procesador, laptop, celular, RAM, ventilador, SSD, disipadores) son **geometría procedural en `engine/models.js`**; no hay `.glb` que descargar. Los shaders (trazas de circuito, rejilla holográfica, partículas) están en `engine/gfx.js`.

## 2. Pasos

1. **Respaldo**: `git commit -am "antes del nuevo frontend"` en tu proyecto.
2. Copia a la raíz de tu proyecto MVC (junto a `Program.cs`), conservando rutas:
   - `Views/Shared/_Layout.cshtml`, `Views/Shared/_ProductoFoto.cshtml`
   - `Views/Interfaz/Inicio.cshtml`, `Catalogo.cshtml`, `Inventario.cshtml`, `Nuevo.cshtml`
   - `wwwroot/css/tecnonova-motion.css`, `wwwroot/js/tecnonova-motion.js`, `wwwroot/img/productos/`
3. Adapta las líneas `ADAPTAR` (sección 0).
4. Si tu `_Layout` anterior tenía `@RenderSection("Scripts")` o `_ValidationScriptsPartial`, el nuevo ya renderiza las secciones `Styles` y `Scripts` (opcionales).
5. (Opcional) copia `frontend/` a tu repo (fuera de `wwwroot`) para poder recompilar:
   ```
   cd frontend
   npm install          # instala three y gsap (dependencias) + vite (compilador)
   npm run build        # escribe ../wwwroot/js/tecnonova-motion.js
   ```
   Requiere Node.js 20+. Si no recompilas, usa el `.js` ya compilado.
6. Ejecuta: `dotnet run` (o F5 en VS Code) y abre `https://localhost:xxxx/Interfaz/Index`.

### Dependencias (todas documentadas, ninguna por CDN)
| Paquete | Uso | Licencia |
|---|---|---|
| three ^0.187 | escenas 3D / WebGL | MIT |
| gsap ^3.15 | cámara, transiciones, UI | licencia estándar GSAP (gratuita; revisa los términos para tu uso comercial) |
| vite ^8 (dev) | compilar a un solo archivo | MIT |
| Fotografías Unsplash | `wwwroot/img/productos` | licencia Unsplash |

## 3. Qué NO tocar ni reemplazar
`Program.cs`, `Controllers/*` (InterfazController, ProductosController), `Models/*`, la cadena de conexión y Npgsql (`appsettings*.json`), scripts SQL, `Views/Productos/*` (Editar, etc.) y cualquier `_ViewImports.cshtml` / `_ViewStart.cshtml` (si tu `_ViewImports` no incluye `@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers`, agrégalo; es el valor por defecto de la plantilla MVC).

## 4. Cómo funciona la navegación parcial
- `_Layout` contiene `<canvas id="tn-stage">` fuera de `<main id="tn-main">`. El canvas nunca se reemplaza.
- `nav.js` intercepta solo clics GET a `/Interfaz`, `/Interfaz/Index`, `/Interfaz/Inicio`, `/Interfaz/Catalogo`, `/Interfaz/Inventario`, `/Interfaz/Nuevo`. Los demás enlaces (Editar, etc.) y los `POST` funcionan normalmente.
- Se lanza la animación de salida de cámara y a la vez `fetch(url)`; cuando ambas terminan se toma `#tn-main` del HTML recibido, se limpian los eventos de la pantalla anterior (`AbortController` + `gsap.context`), se inserta el nuevo contenido y se ejecuta la animación de entrada. **No hace falta modificar ningún controlador**: el servidor devuelve la página completa y el cliente extrae `#tn-main`.
- `history.pushState` + `popstate` mantienen Atrás/Adelante. Si algo falla (red, HTML inesperado, timeout 9 s) se hace `location.href = url` (navegación MVC normal). Sin JavaScript los enlaces funcionan igual.
- Los `<script>` dentro de las vistas no se re-ejecutan en navegación parcial: ponlos en `@section Scripts` del layout o en el bundle.

Transiciones: Inicio→Catálogo: el procesador llena la pantalla y se entra al laboratorio por un portal. Catálogo→Inventario: zoom a la pantalla de la laptop, que se disuelve sobre la placa base y la cámara recorre las pistas. Resto: salidas/entradas propias por escena (ver `scenes/*.js`, métodos `exit` y `enter`).

## 5. CRUD y PostgreSQL
- `Nuevo.cshtml` envía `POST /Interfaz/Crear` con `Sku`, `Nombre`, `PrecioTexto`, `Stock` (inicia en 1) y `CategoriaId`, con el token generado por `<form asp-controller asp-action>`. Los datos no se alteran en JS (solo se descartan caracteres no numéricos del precio; coma o punto los valida C#).
- Catálogo e Inventario muestran exclusivamente `Model` enviado por el controlador (PostgreSQL). El JS no contiene datos de productos. (Los datos de demostración están solo en `src/demo` del proyecto de Figma Make y no se exportan.)
- Editar/Eliminar usan `asp-controller="Productos"`.

### Comprobar PostgreSQL
1. Inicia PostgreSQL y `dotnet run`.
2. `/Interfaz/Catalogo`: deben aparecer tus productos reales. Compara con `SELECT count(*) FROM productos;` (nombre real de tu tabla).
3. `/Interfaz/Nuevo`: crea un producto con precio `12,5` y otro con `12.5`; verifica ambos en el Inventario y en `psql`. Prueba un precio inválido (`abc`) para confirmar el mensaje de C#.
4. Edita y elimina un producto; confirma en la base de datos.
5. Quita el token (DevTools) y reenvía: el servidor debe rechazarlo (400) si usas `[ValidateAntiForgeryToken]`.

## 6. Verificar las transiciones
1. Abre `/Interfaz/Index`: procesador gigante. Haz clic en Catálogo: acercamiento, destello, entrada al laboratorio. La URL cambia y la página NO recarga (en DevTools→Network solo aparece un `fetch`; `window.TecnoNova` conserva el mismo objeto).
2. Catálogo→Inventario, Inventario→Nuevo y vuelta a Inicio.
3. Botones Atrás/Adelante: deben animar y restaurar cada pantalla.
4. Recarga F5 en cada ruta: carga directa con entrada de cámara.
5. Fallback: en consola `window.fetch = () => Promise.reject()` y haz clic en un enlace: debe cargar la página de forma normal.
6. Móvil: DevTools→modo dispositivo (390 px): menú hamburguesa, tarjetas en una columna.
7. Accesibilidad: con `prefers-reduced-motion` la salida de cámara se acelera.

## 7. Lista de pruebas
Hechas: compilación de ambos bundles; render de las 4 escenas; transiciones entre las 4 rutas en escritorio y móvil emulado; Atrás; ausencia de errores en consola; fallback sin WebGL (detectado y probado en un primer arranque donde falló una escena).
Pendientes: compilar y ejecutar las vistas Razor; `Crear/Editar/Eliminar` contra PostgreSQL; token antifalsificación; pruebas en navegadores/dispositivos reales; Lighthouse y consumo de GPU en móviles gama baja.
