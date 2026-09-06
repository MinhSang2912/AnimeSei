using System.Text;
using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Mappings;
using AnimeSei.Application.Features.Auth.Commands;
using AnimeSei.Infrastructure.Authentication;
using AnimeSei.Infrastructure.BackgroundServices;
using AnimeSei.Infrastructure.Data;
using AnimeSei.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (Supabase PostgreSQL or Fallback InMemory for quick dev)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

if (!string.IsNullOrEmpty(connectionString) && builder.Configuration["UsePostgres"] == "true")
{
    builder.Services.AddDbContext<AnimeSeiDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    builder.Services.AddDbContext<AnimeSeiDbContext>(options =>
        options.UseInMemoryDatabase("AnimeSeiDevDb"));
}

builder.Services.AddScoped<IAnimeSeiDbContext>(provider => provider.GetRequiredService<AnimeSeiDbContext>());

// 2. MediatR Configuration
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterCommand).Assembly));

// 3. Infrastructure & Services Dependency Injection
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<ISupabaseStorageService, SupabaseStorageService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddHttpClient<IAnimeService, AnimeService>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "AnimeSei/1.0");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});
builder.Services.AddHttpClient<IEpisodeService, EpisodeService>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "AnimeSei/1.0");
});
builder.Services.AddAutoMapper(config =>
{
    config.AddProfile<AnimeCacheProfile>();
    config.AddProfile<AdminMappingProfile>();
    config.AddProfile<BadgeProfile>();
    config.AddProfile<BorderProfile>();
    config.AddProfile<ProfileMappingProfile>();
});
builder.Services.AddHostedService<AniListAutoSyncWorker>();

// 4. CORS Policy Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. JWT Authentication Configuration
var secretKey = builder.Configuration["Jwt:SecretKey"] ?? "AnimeSeiSuperSecretKeyForJWTAuth2026!#$";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "AnimeSei",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "AnimeSeiClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 6. Swagger API Documentation Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "AnimeSei API", Version = "v1", Description = "API Backend cho Hệ thống Xem phim AnimeSei" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập JWT Bearer token theo định dạng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Auto Ensure Created for InMemory / Initial DB Migration
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AnimeSeiDbContext>();
        if (db.Database.IsRelational())
        {
            db.Database.Migrate();
            db.Database.ExecuteSqlRaw(@"
                ALTER TABLE ""AnimeCaches"" ADD COLUMN IF NOT EXISTS ""Relations"" text DEFAULT '[]';
                UPDATE ""AnimeCaches"" SET ""Relations"" = '[]' WHERE ""Relations"" IS NULL;
            ");
        }
        else
        {
            db.Database.EnsureCreated();
        }

        // 7.1 Automatic DataSeeder execution if Database is empty
        _ = Task.Run(async () => await AnimeDataSeeder.SeedAsync(app.Services));
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning("Database connection/seeding attempt failed: {Message}. Application will run.", ex.Message);
    }
}

// 8. Pipeline Middlewares Configuration
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "AnimeSei API v1"));

app.UseCors("AllowClient");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
