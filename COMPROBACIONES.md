# Comprobaciones de integración — 14/11/2026

**Confirmado por inspección de archivos:**

- Los archivos del backend listados abajo conservan exactamente los bytes de la versión anterior (SHA-256 igual).
- Se adaptaron las cuatro vistas a `TecnoNovaPage` y `CategoriaNombre`.
- Se cambiaron las rutas de Figma incorrectas `Editar`/`Eliminar` por `Edit`/`Delete`, que sí existen en `ProductosController`.
- Se conservaron los campos del POST `Sku`, `Nombre`, `PrecioTexto`, `Stock`, `CategoriaId`.
- Se conservó el token antifalsificación generado por el Form Tag Helper de ASP.NET Core.
- El JS integrado pasa `node --check`.
- Las seis fotos JPG pasan verificación de formato.
- Se añadió confirmación de salida, modal rápido, mensajes de validación, búsqueda en inventario y CSV.

**Pendiente de verificar en tu equipo:**

- `dotnet restore`, `dotnet build` y `dotnet run` (el entorno no dispone de dotnet).
- PostgreSQL: alta, modificación, eliminación real y mensajes de error de servidor.
- Movimiento en Chromium/VS Code con el servidor MVC; el navegador de prueba en este entorno bloqueó todas las navegaciones por una restricción administrativa.
- Rendimiento real de WebGL en teléfonos y GPUs antiguas.

| Archivo original | Se mantiene idéntico |
|---|---|
| `Program.cs` | Sí |
| `Controllers/ProductosController.cs` | Sí |
| `Models/Producto.cs` | Sí |
| `Models/Categoria.cs` | Sí |
| `Data/ProductoDAO.cs` | Sí |
| `sql/01_tablas_y_datos.sql` | Sí |
| `TecnoNovaCRUD.csproj` | Sí |

`Controllers/InterfazController.cs` solo cambió su categoría predeterminada, para elegir Laptops si existe.
