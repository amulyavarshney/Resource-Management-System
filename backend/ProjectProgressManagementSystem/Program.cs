using ProjectProgressManagementSystem.Extensions;

namespace ProjectProgressManagementSystem
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.AddApplicationDependencies();

            var app = builder.Build();

            app.AddApplicationMiddleware();

            app.Run();
        }
    }
}