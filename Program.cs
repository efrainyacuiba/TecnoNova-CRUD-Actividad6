using TecnoNovaCRUD.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Services.AddScoped<ProductoDAO>();
builder.Services.AddScoped<VentaDAO>();
var app = builder.Build();
if (!app.Environment.IsDevelopment()) app.UseExceptionHandler("/Interfaz/Index");
app.UseStaticFiles();
app.UseRouting();
app.MapControllerRoute(name: "default", pattern: "{controller=Interfaz}/{action=Index}/{id?}");
app.Run();

