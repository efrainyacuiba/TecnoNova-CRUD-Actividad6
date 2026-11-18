using Microsoft.AspNetCore.Mvc;
using TecnoNovaCRUD.Data;
using TecnoNovaCRUD.Models;

namespace TecnoNovaCRUD.Controllers;

public class VentasController : Controller
{
    private readonly VentaDAO _ventaDAO;
    private readonly ProductoDAO _productoDAO;

    public VentasController(VentaDAO ventaDAO, ProductoDAO productoDAO)
    {
        _ventaDAO = ventaDAO;
        _productoDAO = productoDAO;
    }

    [HttpGet]
    public IActionResult Create()
    {
        ViewBag.Productos = _productoDAO.ObtenerTodos();
        return View(new Venta());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(Venta venta)
    {
        try
        {
            if (venta.Detalles == null || venta.Detalles.Count == 0)
            {
                ModelState.AddModelError("", "Agrega al menos un producto a la venta.");
            }

            if (!ModelState.IsValid)
            {
                ViewBag.Productos = _productoDAO.ObtenerTodos();
                return View(venta);
            }

            foreach (var detalle in venta.Detalles)
            {
                var producto = _productoDAO.ObtenerPorId(detalle.IdProducto);

                if (producto == null)
                {
                    ModelState.AddModelError("", "Uno de los productos seleccionados no existe.");
                    ViewBag.Productos = _productoDAO.ObtenerTodos();
                    return View(venta);
                }

                detalle.NombreProducto = producto.Nombre;
                detalle.PrecioUnitario = producto.Precio;
            }

            int idVenta = _ventaDAO.Insertar(venta);

            TempData["Mensaje"] = $"Venta registrada correctamente. Número de venta: {idVenta}";
            return RedirectToAction(nameof(Create));
        }
        catch (Exception ex)
        {
            ViewBag.Productos = _productoDAO.ObtenerTodos();
            ModelState.AddModelError("", "No se pudo registrar la venta: " + ex.Message);
            return View(venta);
        }
    }
}
