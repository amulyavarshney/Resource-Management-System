using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ProjectProgressManagementSystem.Configuration;
using ProjectProgressManagementSystem.DataAccess;
using ProjectProgressManagementSystem.Filters;
using ProjectProgressManagementSystem.Services.Implementations;
using ProjectProgressManagementSystem.Services.Interfaces;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using System.Text.Json;
using System.Text;
using System.Text.Json.Serialization;

namespace ProjectProgressManagementSystem.Extensions
{
    public static class Startup
    {
        public static WebApplicationBuilder AddApplicationDependencies(this WebApplicationBuilder builder)
        {
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                var environment = builder.Environment.EnvironmentName;
                var connectionName = environment switch
                {
                    "Development" => "Development",
                    "Staging" => "Stage",
                    _ => "Production"
                };
                options.UseSqlServer(builder.Configuration.GetConnectionString(connectionName), providerOptions => { providerOptions.EnableRetryOnFailure(); });
            });

            var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("App_Cors_Policy", builder =>
                {
                    builder.WithOrigins(allowedOrigins)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
                });
            });

            builder.Services.AddControllers(options =>
            {
                options.Filters.Add(new GeneralExceptionHandler());
                var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
                options.Filters.Add(new AuthorizeFilter(policy));
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            }); ;

            builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    var jwtSecret = builder.Configuration.GetSection("AppSettings:JwtSecret").Value;
                    var issuer = builder.Configuration.GetValue<string>("AppSettings:JwtIssuer");
                    var audience = builder.Configuration.GetValue<string>("AppSettings:JwtAudience");

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                        ValidateIssuer = !string.IsNullOrWhiteSpace(issuer),
                        ValidIssuer = issuer,
                        ValidateAudience = !string.IsNullOrWhiteSpace(audience),
                        ValidAudience = audience,
                        ClockSkew = TimeSpan.FromMinutes(2)
                    };
                    options.RequireHttpsMetadata = true;
                });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireClaim("Role", "Admin"));
            });

            builder.Services.AddDistributedMemoryCache();

            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IProjectService, ProjectService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IWeekDataService, WeekDataService>();
            builder.Services.AddScoped<IHolidayService, HolidayService>();
            builder.Services.AddScoped<ILeaveService, LeaveService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();

            builder.Services.AddSwaggerGen(config =>
            {
                config.SwaggerDoc("v1.0.0", new OpenApiInfo
                {
                    Title = "Project Progress Management System API Documentation",
                    Version = "v1.0.0",
                });
                config.SchemaFilter<EnumSchemaFilter>();
                // Add JWT Bearer token security definition
                config.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT"
                });

                config.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "bearer",
                            Name = "Authorization",
                            In = ParameterLocation.Header
                        },
                        new List<string>()
                    }
                });
            });

            // Response compression
            builder.Services.AddResponseCompression();

            // Health checks
            var envName = builder.Environment.EnvironmentName;
            var connName = envName switch { "Development" => "Development", "Staging" => "Stage", _ => "Production" };
            var connString = builder.Configuration.GetConnectionString(connName);
            builder.Services.AddHealthChecks()
                .AddSqlServer(connString, name: "sql", tags: new[] { "ready" });

            // Basic correlation id propagation via TraceIdentifier
            builder.Services.AddHttpContextAccessor();

            return builder;
        }

        public static WebApplication AddApplicationMiddleware(this WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(config =>
                {
                    config.SwaggerEndpoint("/swagger/v1.0.0/swagger.json", "Project Progress Management System");
                });
            }

            // middleware configuration
            if (!app.Environment.IsDevelopment())
            {
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseResponseCompression();
            app.UseCors("App_Cors_Policy");

            // Correlation ID: add TraceIdentifier header for responses
            app.Use(async (context, next) =>
            {
                context.Response.Headers["X-Correlation-ID"] = context.TraceIdentifier;
                await next();
            });

            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            // Health checks endpoints
            app.MapHealthChecks("/health/live");
            app.MapHealthChecks("/health/ready", new HealthCheckOptions
            {
                Predicate = r => r.Tags.Contains("ready"),
                ResponseWriter = async (context, report) =>
                {
                    context.Response.ContentType = "application/json";
                    var payload = new
                    {
                        status = report.Status.ToString(),
                        checks = report.Entries.Select(e => new { name = e.Key, status = e.Value.Status.ToString(), duration = e.Value.Duration.TotalMilliseconds }),
                        totalDuration = report.TotalDuration.TotalMilliseconds
                    };
                    await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
                }
            });
            return app;
        }
    }
}
