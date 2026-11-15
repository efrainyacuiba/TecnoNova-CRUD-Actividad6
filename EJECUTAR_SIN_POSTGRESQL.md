# TecnoNova: dos maneras de abrir y presentar el proyecto

## A) Sin instalar nada: demostración visual

Haz **doble clic** en `DEMO_SIN_INSTALAR.html`. Se abrirá en Chrome o Edge.

- Contiene **el escenario 3D de Figma Make** (procesador, partículas y animaciones de cámara), siempre que el navegador admita WebGL.
- Incluye Inicio, Catálogo, Inventario y Nuevo Producto en una sola ventana con transiciones 3D.
- Puedes buscar, filtrar, agregar, editar y eliminar productos de prueba.
- Guarda los cambios mediante almacenamiento local **de ese navegador y esa computadora**.
- No requiere .NET ni PostgreSQL. No es el CRUD del servidor.

## B) Proyecto C# con CRUD verdadero, sin instalar PostgreSQL

En Visual Studio Code, con **.NET 10 SDK** instalado, abre una terminal en esta carpeta y ejecuta:

```powershell
dotnet restore
dotnet build
dotnet run --launch-profile http
```

Abre la URL que indique la terminal (por ejemplo `http://localhost:5071`).

Si no configuraste ninguna conexión `ConnectionStrings:TecnoNova`, el proyecto utiliza automáticamente un **archivo local JSON** con los cuatro productos de la actividad. Puedes agregar, consultar, editar y eliminar; los cambios persisten al cerrar la aplicación.

Se guarda en Windows en `%LOCALAPPDATA%\TecnoNovaBolivia\Actividad6\productos-demo.json`.

Para reiniciar la demostración puedes cerrar el programa y renombrar ese archivo. Se volverán a crear los cuatro productos cuando abras el proyecto.

## C) PostgreSQL original

Si configuras `ConnectionStrings:TecnoNova` mediante `dotnet user-secrets`, el mismo proyecto utilizará **solo PostgreSQL**. Un error de la base de datos no se oculta cambiando automáticamente al archivo de demostración.

```powershell
dotnet user-secrets set "ConnectionStrings:TecnoNova" "Host=localhost;Port=5432;Database=tecnonova_crud;Username=postgres;Password=TU_CONTRASEÑA"
```

Reinicia la aplicación. La cadena está guardada fuera del ZIP y no debes subir contraseñas a GitHub.

Para volver al modo portátil en tu PC:

```powershell
dotnet user-secrets remove "ConnectionStrings:TecnoNova"
```

**Nota para el docente:** la demo HTML y el modo JSON son formas de demostración. El proyecto real conserva las consultas PostgreSQL del trabajo original. Si la rúbrica exige explícitamente PostgreSQL en ejecución, debe demostrarse por separado.

## D) Publicar una demostración en GitHub Pages

Si quieres que el docente solo haga clic en una dirección web sin instalar nada, sube **todos los archivos del ZIP extraído** al repositorio y entra a GitHub → **Settings → Pages → Deploy from a branch → main → /docs**.

El sitio muestra `docs/index.html`, que contiene el mismo motor de escenas 3D. Las fotos, CSS y JavaScript se incluyen dentro de `/docs/assets`.

La web pública es **solo una demostración HTML**: las altas, modificaciones y eliminaciones se guardan localmente en el navegador de cada visitante. No accede al PostgreSQL del proyecto de C#.
