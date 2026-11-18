namespace TecnoNovaCRUD.Models;

public class Venta
{
    public int Id { get; set; }

    public DateTime Fecha { get; set; } = DateTime.Now;

    public string Cliente { get; set; } = "Consumidor Final";

    public List<DetalleVenta> Detalles { get; set; } = new();

    public decimal Total => Detalles.Sum(d => d.Subtotal);
}
