# TecnoNova Bolivia — Actividad 6 (UI/UX)

## Qué contiene
Este ZIP amplía el **proyecto real de la Actividad 5**. Conserva `ProductosController`, `ProductoDAO`, los modelos, las vistas del CRUD y el script SQL original. La nueva ruta inicial `/Interfaz` muestra una portada futurista de laptops y celulares con partículas, animaciones, búsqueda y filtros. El modal `Nuevo producto` tiene campos por defecto, Esc/Enter/Ctrl+S, mensajes claros y confirmación de salida.

## Probar la aplicación real (requiere .NET 10 + PostgreSQL)
1. Abre esta carpeta en Visual Studio o en la terminal.
2. Ejecuta el archivo `sql/01_tablas_y_datos.sql` en la base de datos `tecnonova_crud`.
3. Configura el secreto local: `dotnet user-secrets set "ConnectionStrings:TecnoNova" "Host=localhost;Port=5432;Database=tecnonova_crud;Username=postgres;Password=TU_CLAVE"`.
4. Ejecuta `dotnet restore`, `dotnet build` y `dotnet run --launch-profile http`.
5. Abre `http://localhost:5071/Interfaz` o el puerto que indique la consola. Para ver el CRUD anterior: `/Productos`.
6. Abre **Nuevo producto**, comprueba que cantidad es 1. Prueba precio `-10`, guardar, `Esc`, `Ctrl+S`, y confirma cambios descartados. Toma capturas reales del servidor C# para Moodle.

## Ver diseño sin base de datos
La carpeta `docs/vista-previa-web` es una **maqueta navegable estática** del mismo diseño. No escribe en PostgreSQL. Se suministra para revisar las animaciones visuales y tomar referencias, no como prueba del CRUD C#. Los cuatro artículos que ves ahí son los ejemplos del SQL de la Actividad 5.

## Figma
https://www.figma.com/design/g7JNxG1x76qcAkCfHRvsCS
Busca la página `ACTIVIDAD 6 • TECNONOVA REAL (CRUD)`; no uses las pantallas anteriores de esfera.

## Nota sobre límites y pruebas
Aquí no había SDK .NET disponible ni PostgreSQL conectado para verificar el guardado real. La vista web se probó con Chromium a tamaños de PC y celular; no sustituyas esas capturas por las dos pruebas C# pedidas por el docente. Figma recibió 8 diseños, pero algunas interacciones quedaron sin configurar por el límite del plan conectado.
