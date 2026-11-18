using Npgsql;
using TecnoNovaCRUD.Models;

namespace TecnoNovaCRUD.Data;

public class VentaDAO
{
    private readonly string _conexion;

    public VentaDAO(IConfiguration config)
    {
        _conexion = config.GetConnectionString("TecnoNova")
            ?? throw new InvalidOperationException(
                "No se encontró la conexión TecnoNova.");
    }

    public int Insertar(Venta venta)
    {
        if (venta.Detalles == null || venta.Detalles.Count == 0)
            throw new InvalidOperationException(
                "La venta debe tener al menos un producto.");

        if (venta.Detalles.Any(d =>
            d.IdProducto <= 0 ||
            d.Cantidad <= 0 ||
            d.PrecioUnitario <= 0))
            throw new InvalidOperationException(
                "Hay productos con datos inválidos.");

        using var conexion = new NpgsqlConnection(_conexion);
        conexion.Open();

        using var transaccion = conexion.BeginTransaction();

        try
        {
            int idVenta;

            using (var comandoVenta = new NpgsqlCommand(@"
                INSERT INTO ventas (cliente, total)
                VALUES (@cliente, @total)
                RETURNING id;", conexion, transaccion))
            {
                comandoVenta.Parameters.AddWithValue(
                    "cliente", venta.Cliente.Trim());

                comandoVenta.Parameters.AddWithValue(
                    "total", venta.Total);

                idVenta = (int)comandoVenta.ExecuteScalar()!;
            }

            foreach (var detalle in venta.Detalles)
            {
                using var comandoDetalle = new NpgsqlCommand(@"
                    INSERT INTO detalle_ventas
                    (id_venta, id_producto, nombre_producto,
                     cantidad, precio_unitario, subtotal)
                    VALUES
                    (@idVenta, @idProducto, @nombre,
                     @cantidad, @precio, @subtotal);",
                    conexion, transaccion);

                comandoDetalle.Parameters.AddWithValue(
                    "idVenta", idVenta);

                comandoDetalle.Parameters.AddWithValue(
                    "idProducto", detalle.IdProducto);

                comandoDetalle.Parameters.AddWithValue(
                    "nombre", detalle.NombreProducto.Trim());

                comandoDetalle.Parameters.AddWithValue(
                    "cantidad", detalle.Cantidad);

                comandoDetalle.Parameters.AddWithValue(
                    "precio", detalle.PrecioUnitario);

                comandoDetalle.Parameters.AddWithValue(
                    "subtotal", detalle.Subtotal);

                comandoDetalle.ExecuteNonQuery();
            }

            transaccion.Commit();

            return idVenta;
        }
        catch
        {
            transaccion.Rollback();
            throw;
        }
    }
}
