using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using TecnoNovaCRUD.Data;
using TecnoNovaCRUD.Models;

namespace TecnoNovaCRUD.Controllers;

// Pantallas nuevas. El CRUD que hicimos en la Actividad 5 sigue en ProductosController.
public class InterfazController : Controller
{
    private readonly ProductoDAO _dao;
    public InterfazController(ProductoDAO dao) => _dao = dao;

    [HttpGet] public IActionResult Index() => Pagina("Inicio");
    [HttpGet] public IActionResult Catalogo() => Pagina("Catalogo");
    [HttpGet] public IActionResult Inventario() => Pagina("Inventario");
    [HttpGet] public IActionResult Nuevo() => Pagina("Nuevo", new NuevoProductoEntrada { Stock = 1 }, true);

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Crear(NuevoProductoEntrada entrada)
    {
        entrada.Sku = (entrada.Sku ?? "").Trim();
        entrada.Nombre = (entrada.Nombre ?? "").Trim();
        var texto = (entrada.PrecioTexto ?? "").Trim().Replace(',', '.');
        bool precioCorrecto = decimal.TryParse(texto,
            NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign,
            CultureInfo.InvariantCulture, out var precio);

        if (string.IsNullOrWhiteSpace(entrada.Sku))
            ModelState.AddModelError(nameof(entrada.Sku), "Escribe el código del producto.");
        else if (entrada.Sku.Length > 30)
            ModelState.AddModelError(nameof(entrada.Sku), "El código debe tener máximo 30 caracteres.");
        if (string.IsNullOrWhiteSpace(entrada.Nombre))
            ModelState.AddModelError(nameof(entrada.Nombre), "Escribe el nombre del equipo.");
        else if (entrada.Nombre.Length > 100)
            ModelState.AddModelError(nameof(entrada.Nombre), "El nombre debe tener máximo 100 caracteres.");
        if (!precioCorrecto || precio <= 0 || precio > 99999999)
            ModelState.AddModelError(nameof(entrada.PrecioTexto), "El precio debe ser mayor a Bs 0. Usa coma o punto.");
        if (entrada.Stock is null || entrada.Stock < 0 || entrada.Stock > 999999)
            ModelState.AddModelError(nameof(entrada.Stock), "Pon una cantidad entera desde 0.");
        if (entrada.CategoriaId is null || entrada.CategoriaId <= 0)
            ModelState.AddModelError(nameof(entrada.CategoriaId), "Elige una categoría para continuar.");

        if (!ModelState.IsValid) return Pagina("Nuevo", entrada, true);
        try
        {
            if (!_dao.ObtenerCategorias().Any(c => c.Id == entrada.CategoriaId))
            {
                ModelState.AddModelError(nameof(entrada.CategoriaId), "Esa categoría ya no está disponible. Elige otra.");
                return Pagina("Nuevo", entrada, true);
            }
            _dao.Insertar(new Producto
            {
                Sku = entrada.Sku, Nombre = entrada.Nombre, Precio = precio,
                Stock = entrada.Stock!.Value, CategoriaId = entrada.CategoriaId!.Value
            });
            TempData["Mensaje"] = _dao.EsDemostracion
                ? "¡Listo! Producto guardado en el archivo local (modo demostración)."
                : "¡Listo! Tu producto ya está guardado en PostgreSQL.";
            return RedirectToAction(nameof(Catalogo));
        }
        catch (ArgumentException ex) when (ex.ParamName == nameof(Producto.Sku))
        { ModelState.AddModelError(nameof(entrada.Sku), "Ese código ya existe. Prueba con otro."); }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        { ModelState.AddModelError(nameof(entrada.Sku), "Ese código ya existe. Prueba con otro."); }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        { ModelState.AddModelError(nameof(entrada.CategoriaId), "La categoría cambió. Vuelve a elegirla."); }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.CheckViolation)
        { ModelState.AddModelError(string.Empty, "Revisa el precio y la cantidad."); }
        catch (Exception ex) when (ex is NpgsqlException or InvalidOperationException or TimeoutException)
        { ModelState.AddModelError(string.Empty, "No pudimos conectar con PostgreSQL. Revisa la conexión e inténtalo otra vez."); }
        return Pagina("Nuevo", entrada, true);
    }

    private IActionResult Pagina(string nombre, NuevoProductoEntrada? entrada = null, bool abrirModal = false)
    {
        var vm = new TecnoNovaPage
        {
            Pagina = nombre,
            Entrada = entrada ?? new NuevoProductoEntrada { Stock = 1 },
            AbrirModal = abrirModal,
            ModoDemostracion = _dao.EsDemostracion
        };
        try
        {
            vm.Categorias = _dao.ObtenerCategorias();
            vm.Productos = _dao.ObtenerTodos();
        }
        catch (Exception ex) when (ex is NpgsqlException or InvalidOperationException or TimeoutException)
        { vm.SinConexion = true; }
        if (!abrirModal && vm.Categorias.Count > 0 && vm.Entrada.CategoriaId is null)
            vm.Entrada.CategoriaId = vm.Categorias.FirstOrDefault(c => c.Nombre.Equals("Laptops", StringComparison.OrdinalIgnoreCase))?.Id ?? vm.Categorias[0].Id;
        if (nombre == "Nuevo" && vm.Categorias.Count > 0 && vm.Entrada.CategoriaId is null)
            vm.Entrada.CategoriaId = vm.Categorias.FirstOrDefault(c => c.Nombre.Equals("Laptops", StringComparison.OrdinalIgnoreCase))?.Id ?? vm.Categorias[0].Id;
        return View(nombre, vm);
    }
}
