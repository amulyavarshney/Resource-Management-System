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
        /*public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

            // dependency injection configuration
            builder.Services.AddDbContext<ApplicationDBContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("Development"), providerOptions => { providerOptions.EnableRetryOnFailure(); })
                .LogTo(Console.WriteLine, new[] { DbLoggerCategory.Infrastructure.Name });
                // options.UseMySql(builder.Configuration.GetConnectionString("Development"));
            });

            builder.Services.AddControllers(options =>
            {
                options.Filters.Add(new GeneralExceptionHandler());
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("App_Cors_Policy", builder =>
                {
                    builder.WithOrigins(allowedOrigins)
                    .AllowAnyMethod()
                    .AllowAnyHeader();
                });
            });

            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IProjectService, ProjectService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();

            builder.Services.AddSwaggerGen(config =>
            {
                config.SwaggerDoc("v1.0.0", new OpenApiInfo
                {
                    Title = "Project Progress Management System API Documentation",
                    Version = "v1.0.0",
                });
                // ======================================================================================================================
                // Add JWT Bearer Token Authorization Functionality In Swagger
                config.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\"",
                });
                config.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer",
                            }
                        },
                        new string[] { }
                    }
                });
                // =======================================================================================================================
            });

            builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetSection("AppSettings:JwtSecret").Value)),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                    };
                });

            builder.Services.AddAuthorization(options =>
            {
                // options.AddPolicy("Admin", policy => policy.RequireClaim("Role", "Admin", "None"));
                // options.AddPolicy("User", policy => policy.RequireClaim("Role", "None"));
                options.AddPolicy("Admin", policy => policy.RequireAssertion(context => context.User.HasClaim(c => c.Type == "Role" && c.Value == "Admin")));
            });


            var app = builder.Build();
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(config =>
                {
                    config.SwaggerEndpoint("/swagger/v1.0.0/swagger.json", "Project Progress Management System");
                });
            }

            // middleware configuration
            app.UseCors("App_Cors_Policy");
            app.UseAuthentication();
            app.MapControllers();
            app.UseAuthorization();

            app.Run();
        }*/
    }
}