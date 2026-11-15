namespace TecnoNovaCRUD.Models;

// Datos comunes para las cuatro páginas de la misma aplicación.
public class TecnoNovaPage
{
    public string Pagina { get; set; } = "Inicio";
    public List<Producto> Productos { get; set; } = new();
    public List<Categoria> Categorias { get; set; } = new();
    public NuevoProductoEntrada Entrada { get; set; } = new() { Stock = 1 };
    public bool SinConexion { get; set; }
    public bool ModoDemostracion { get; set; }
    public bool AbrirModal { get; set; }
    public int TotalUnidades => Productos.Sum(p => p.Stock);
}
