namespace TecnoNovaCRUD.Models;

// Datos de entrada del modal; el precio se recibe como texto para aceptar coma o punto.
public class NuevoProductoEntrada
{
    public string? Sku { get; set; }
    public string? Nombre { get; set; }
    public string? PrecioTexto { get; set; }
    public int? Stock { get; set; } = 1;
    public int? CategoriaId { get; set; }
}
