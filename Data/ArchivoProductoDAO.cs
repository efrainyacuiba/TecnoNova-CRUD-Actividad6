using System.Text.Json;
using TecnoNovaCRUD.Models;

namespace TecnoNovaCRUD.Data;

// Modo portátil: no requiere instalar una base de datos. Guarda los cambios
// en el perfil del usuario, fuera del directorio del proyecto.
public sealed class ArchivoProductoDAO
{
    private static readonly object Candado = new();
    private readonly string _ruta;

    public sealed class DatosLocal
    {
        public int SiguienteId { get; set; } = 5;
        public List<Producto> Productos { get; set; } = new();
    }

    public ArchivoProductoDAO()
    {
        string carpeta = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "TecnoNovaBolivia", "Actividad6");
        Directory.CreateDirectory(carpeta);
        _ruta = Path.Combine(carpeta, "productos-demo.json");
    }

    public List<Categoria> ObtenerCategorias() => new()
    {
        new Categoria { Id = 1, Nombre = "Laptops" },
        new Categoria { Id = 2, Nombre = "Celulares" },
        new Categoria { Id = 3, Nombre = "Accesorios" },
        new Categoria { Id = 4, Nombre = "Componentes" }
    };

    public List<Producto> ObtenerTodos()
    {
        lock (Candado)
            return Leer().Productos.OrderBy(x => x.Id).Select(Copia).ToList();
    }

    public Producto? ObtenerPorId(int id)
    {
        lock (Candado)
        {
            var p = Leer().Productos.FirstOrDefault(x => x.Id == id);
            return p is null ? null : Copia(p);
        }
    }

    public void Insertar(Producto p)
    {
        lock (Candado)
        {
            var d = Leer();
            Revisar(d, p);
            var nuevo = Copia(p);
            nuevo.Id = d.SiguienteId++;
            d.Productos.Add(nuevo);
            Guardar(d);
        }
    }

    public bool Actualizar(Producto p)
    {
        lock (Candado)
        {
            var d = Leer();
            var anterior = d.Productos.FindIndex(x => x.Id == p.Id);
            if (anterior < 0) return false;
            Revisar(d, p, p.Id);
            d.Productos[anterior] = Copia(p);
            Guardar(d);
            return true;
        }
    }

    public bool Eliminar(int id)
    {
        lock (Candado)
        {
            var d = Leer();
            bool eliminado = d.Productos.RemoveAll(x => x.Id == id) > 0;
            if (eliminado) Guardar(d);
            return eliminado;
        }
    }

    private void Revisar(DatosLocal d, Producto p, int excepto = 0)
    {
        if (d.Productos.Any(x => x.Id != excepto &&
            string.Equals(x.Sku, p.Sku, StringComparison.OrdinalIgnoreCase)))
            throw new ArgumentException("Ese código SKU ya existe.", nameof(Producto.Sku));
        if (!ObtenerCategorias().Any(x => x.Id == p.CategoriaId))
            throw new ArgumentException("La categoría no existe.", nameof(Producto.CategoriaId));
        if (p.Precio <= 0 || p.Stock < 0)
            throw new ArgumentException("Revisa el precio y la cantidad.", nameof(Producto.Precio));
    }

    private DatosLocal Leer()
    {
        if (!File.Exists(_ruta))
        {
            var inicial = CrearInicial();
            Guardar(inicial);
            return inicial;
        }
        try
        {
            var json = File.ReadAllText(_ruta);
            return JsonSerializer.Deserialize<DatosLocal>(json) ?? CrearInicial();
        }
        catch (JsonException e)
        {
            throw new InvalidDataException(
                "No se puede leer el archivo local de productos. No se borraron sus datos.", e);
        }
    }

    private void Guardar(DatosLocal d)
    {
        // Guardado temporal para no dejar el archivo a medias.
        var temp = _ruta + ".tmp";
        File.WriteAllText(temp, JsonSerializer.Serialize(d,
            new JsonSerializerOptions { WriteIndented = true }));
        File.Move(temp, _ruta, overwrite: true);
    }

    private static Producto Copia(Producto p)
    {
        var c = new Producto
        {
            Id = p.Id, Sku = p.Sku, Nombre = p.Nombre,
            Precio = p.Precio, Stock = p.Stock,
            CategoriaId = p.CategoriaId
        };
        c.CategoriaNombre = c.CategoriaId switch
        {
            1 => "Laptops", 2 => "Celulares", 3 => "Accesorios",
            4 => "Componentes", _ => "Otra"
        };
        return c;
    }

    private static DatosLocal CrearInicial() => new()
    {
        SiguienteId = 5,
        Productos = new List<Producto>
        {
            new() { Id=1, Sku="TN-LAP-1001", Nombre="Lenovo Laptop A101", Precio=4255.92m, Stock=5, CategoriaId=1, CategoriaNombre="Laptops" },
            new() { Id=2, Sku="TN-CEL-1002", Nombre="ASUS Smartphone B102", Precio=3405.84m, Stock=26, CategoriaId=2, CategoriaNombre="Celulares" },
            new() { Id=3, Sku="TN-ACC-1012", Nombre="Logitech Hub USB L112", Precio=308.00m, Stock=18, CategoriaId=3, CategoriaNombre="Accesorios" },
            new() { Id=4, Sku="TN-COM-1005", Nombre="Logitech GPU E105", Precio=4332.24m, Stock=14, CategoriaId=4, CategoriaNombre="Componentes" }
        }
    };
}
