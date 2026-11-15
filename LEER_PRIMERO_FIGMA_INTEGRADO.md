# TecnoNova Bolivia — Actividad 6, Figma Make integrado en C#

Este ZIP **sí usa las pantallas y el motor 3D que exportaste de Figma Make**. No contiene solo capturas ni una maqueta. El procesador, la cámara, las partículas y las transiciones están en `wwwroot/js/tecnonova-motion.js` y el código editable en `frontend/src`.

## Qué se conservó

Se preservaron `Program.cs`, `Controllers/ProductosController.cs`, `Models`, `Data/ProductoDAO.cs`, el SQL y la conexión con PostgreSQL. En `Controllers/InterfazController.cs` únicamente se ajustó la **categoría inicial** para elegir «Laptops» cuando exista; el resto del guardado, validaciones, controles y SQL no se modificó. Se cambiaron la interfaz, su CSS/JS y se agregaron fotografías JPG de Figma Make.

## Cómo abrirlo en VS Code

1. Extrae el ZIP y abre **la carpeta que contiene `TecnoNovaCRUD.csproj`**, no `frontend` ni `docs`.
2. Abre terminal dentro de la carpeta. Comprueba `dotnet --version`. El proyecto requiere **.NET 10 SDK**.
3. Configura PostgreSQL y la base `tecnonova_crud`. Si aún no tiene las tablas, ejecuta `sql/01_tablas_y_datos.sql` dentro de esa base.
4. Configura la contraseña local fuera del repositorio, desde la raíz:

   ```powershell
   dotnet user-secrets init
   dotnet user-secrets set "ConnectionStrings:TecnoNova" "Host=localhost;Port=5432;Database=tecnonova_crud;Username=postgres;Password=TU_CONTRASEÑA"
   ```

5. Ejecuta:

   ```bash
   dotnet restore
   dotnet build
   dotnet run --launch-profile http
   ```

6. Abre la dirección http que indique la terminal (en este proyecto suele ser `http://localhost:5071/Interfaz/Index`).

## Navegación y funciones

- Inicio, Catálogo, Inventario y Nuevo producto tienen rutas separadas.
- Three.js + GSAP manejan el procesador 3D, el cambio de cámara y las 4 escenas. El escenario está en `_Layout.cshtml`, así que la navegación parcial puede mantenerlo entre páginas.
- Catálogo muestra **productos reales** de PostgreSQL. Filtros por categoría y búsqueda por nombre/SKU.
- Inventario permite buscar, exportar un CSV de las filas mostradas y entrar al CRUD clásico para editar y eliminar.
- El botón **Nuevo producto** de Inicio, Catálogo o Inventario abre un modal rápido que guarda por `POST /Interfaz/Crear`; la ruta Nuevo ofrece un formulario completo.
- Esc cancela (con confirmación si ya escribiste), Ctrl+S guarda, cantidad inicia en 1, mensajes de error amables.
- Editar y Eliminar llevan a `Productos/Edit` y `Productos/Delete` del CRUD original, respetando la confirmación de borrado.
- Todas las fotos están físicamente en `wwwroot/img/productos/`. Son **referencias**, no fotos certificadas de cada SKU.

## Advertencia muy importante sobre Figma Make

Figma generó Razor con errores de compatibilidad (modelo `TecnoNova.Models`, propiedad inexistente `Categoria.Nombre` y rutas `Editar`/`Eliminar`). **No copies directamente los originales de `TECNONOVA_ASPNET_INTEGRACION` sobre este proyecto**: ya los adapté al modelo real `TecnoNovaCRUD.Models.TecnoNovaPage`, la propiedad `CategoriaNombre` y acciones `Edit` y `Delete`.

## Estado de comprobación

He inspeccionado archivos, validado sintaxis del JavaScript integrado con Node y verificado que las fotografías descargadas son JPG. Este entorno **no tiene SDK .NET ni PostgreSQL en ejecución**: todavía necesitas ejecutar `dotnet build` y verificar altas, cambios y bajas en tu computadora antes de entregar como evidencia funcional. La exportación de Figma Make indica pruebas de las escenas en Chromium; son pruebas de la demo, no del servidor ASP.NET.

## Para GitHub

Sube el contenido **extraído** de esta carpeta. No publiques contraseñas ni archivos `bin`, `obj` o `node_modules`. GitHub Pages no ejecuta C# ni PostgreSQL: necesitas un hosting compatible con ASP.NET Core para que funcione el CRUD real.

## Y el viejo Live Server

La carpeta `docs` sigue existiendo como material de la entrega anterior, pero **no es la nueva animación**. Esta versión se ve ejecutando C# desde VS Code (`dotnet run`).

## Nota sobre las fotos

Las seis fotos JPG proceden de tu ZIP exportado de Figma Make; el archivo de instrucciones de Figma las describe como Unsplash, pero no proporciona enlaces individuales de origen. Antes de publicarlas en un sitio comercial, confirma su procedencia/licencia y reemplaza las que no tengas derecho a redistribuir. Son imágenes **de referencia**, no fotografías exactas de los cuatro SKU.
