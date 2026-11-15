using Npgsql;
using TecnoNovaCRUD.Models;

namespace TecnoNovaCRUD.Data;

// DAO: aquí están las consultas SQL, fuera del controlador.
public class ProductoDAO
{
    private readonly string _conexion;
    private readonly ArchivoProductoDAO _archivo = new();
    // Sin cadena de conexión, usa un JSON local con CRUD completo.
    // Con cadena configurada usa exclusivamente PostgreSQL, sin ocultar errores.
    public bool EsDemostracion => string.IsNullOrWhiteSpace(_conexion);

    public ProductoDAO(IConfiguration config)
    {
        _conexion = config.GetConnectionString("TecnoNova") ?? string.Empty;
    }

    // La aplicación puede mostrar su interfaz aun cuando todavía no se configure PostgreSQL.
    // Para leer o guardar datos sí exigimos una conexión válida.
    private NpgsqlConnection AbrirConexion()
    {
        if (string.IsNullOrWhiteSpace(_conexion))
            throw new InvalidOperationException("Configura ConnectionStrings:TecnoNova con dotnet user-secrets.");
        var conexion = new NpgsqlConnection(_conexion);
        conexion.Open();
        return conexion;
    }

    public List<Categoria> ObtenerCategorias()
    {
        if (EsDemostracion) return _archivo.ObtenerCategorias();
        var categorias = new List<Categoria>();
        using var conexion = AbrirConexion();
        using var comando = new NpgsqlCommand(
            "SELECT id, nombre FROM categorias ORDER BY nombre", conexion);
        using var lector = comando.ExecuteReader();
        while (lector.Read())
        {
            categorias.Add(new Categoria
            {
                Id = lector.GetInt32(0),
                Nombre = lector.GetString(1)
            });
        }
        return categorias;
    }

    public List<Producto> ObtenerTodos()
    {
        if (EsDemostracion) return _archivo.ObtenerTodos();
        var productos = new List<Producto>();
        using var conexion = AbrirConexion();
        using var comando = new NpgsqlCommand(@"
            SELECT p.id, p.sku, p.nombre, p.precio, p.stock,
                   p.categoria_id, c.nombre
            FROM productos p
            INNER JOIN categorias c ON c.id = p.categoria_id
            ORDER BY p.id", conexion);
        using var lector = comando.ExecuteReader();
        while (lector.Read())
            productos.Add(LeerProducto(lector));
        return productos;
    }

    public Producto? ObtenerPorId(int id)
    {
        if (EsDemostracion) return _archivo.ObtenerPorId(id);
        using var conexion = AbrirConexion();
        using var comando = new NpgsqlCommand(@"
            SELECT p.id, p.sku, p.nombre, p.precio, p.stock,
                   p.categoria_id, c.nombre
            FROM productos p
            INNER JOIN categorias c ON c.id = p.categoria_id
            WHERE p.id = @id", conexion);
        comando.Parameters.AddWithValue("id", id);
        using var lector = comando.ExecuteReader();
        return lector.Read() ? LeerProducto(lector) : null;
    }

    public void Insertar(Producto producto)
    {
        if (EsDemostracion) { _archivo.Insertar(producto); return; }
        using var conexion = AbrirConexion();
        using var comando = new NpgsqlCommand(@"
            INSERT INTO productos (sku, nombre, precio, stock, categoria_id)
            VALUES (@sku, @nombre, @precio, @stock, @categoria)", conexion);
        PonerParametros(comando, producto);
        comando.ExecuteNonQuery();
    }

    public bool Actualizar(Producto producto)
    {
        if (EsDemostracion) return _archivo.Actualizar(producto);
        using var conexion = AbrirConexion();
        using var comando = new NpgsqlCommand(@"
            UPDATE productos
            SET sku = @sku, nombre = @nombre, precio = @precio,
                stock = @stock, categoria_id = @categoria
            WHERE id = @id", conexion);
        comando.Parameters.AddWithValue("id", producto.Id);
        PonerParametros(comando, producto);
        return comando.ExecuteNonQuery() > 0;
    }

    public bool Eliminar(int id)
    {
        if (EsDemostracion) return _archivo.Eliminar(id);
        using var conexion = AbrirConexion();
        using var comando = new NpgsqlCommand(
            "DELETE FROM productos WHERE id = @id", conexion);
        comando.Parameters.AddWithValue("id", id);
        return comando.ExecuteNonQuery() > 0;
    }

    private static void PonerParametros(NpgsqlCommand comando, Producto producto)
    {
        comando.Parameters.AddWithValue("sku", producto.Sku.Trim());
        comando.Parameters.AddWithValue("nombre", producto.Nombre.Trim());
        comando.Parameters.AddWithValue("precio", producto.Precio);
        comando.Parameters.AddWithValue("stock", producto.Stock);
        comando.Parameters.AddWithValue("categoria", producto.CategoriaId);
    }

    private static Producto LeerProducto(NpgsqlDataReader lector)
    {
        return new Producto
        {
            Id = lector.GetInt32(0),
            Sku = lector.GetString(1),
            Nombre = lector.GetString(2),
            Precio = lector.GetDecimal(3),
            Stock = lector.GetInt32(4),
            CategoriaId = lector.GetInt32(5),
            CategoriaNombre = lector.GetString(6)
        };
    }
}
