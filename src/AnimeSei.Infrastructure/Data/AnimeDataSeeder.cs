using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AnimeSei.Infrastructure.Data;

public static class AnimeDataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider, CancellationToken cancellationToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AnimeSeiDbContext>>();
        var dbContext = scope.ServiceProvider.GetRequiredService<IAnimeSeiDbContext>();
        var passwordHasher = scope.ServiceProvider.GetService<IPasswordHasher>();

        try
        {
            // Execute fast raw SQL update to convert DD/MM/YYYY dates to YYYY-MM-DD format for instant indexing & sorting
            try
            {
                var concreteDb = scope.ServiceProvider.GetService<AnimeSeiDbContext>();
                if (concreteDb != null && concreteDb.Database.IsRelational())
                {
                    await concreteDb.Database.ExecuteSqlRawAsync(
                        @"ALTER TABLE ""AnimeCaches"" ADD COLUMN IF NOT EXISTS ""Relations"" text DEFAULT '[]';
                          ALTER TABLE ""Badges"" ADD COLUMN IF NOT EXISTS ""ImageUrl"" text;
                          ALTER TABLE ""Borders"" ADD COLUMN IF NOT EXISTS ""ImageUrl"" text;
                          UPDATE ""AnimeCaches"" SET ""Relations"" = '[]' WHERE ""Relations"" IS NULL;
                          UPDATE ""AnimeCaches"" 
                          SET ""StartDate"" = SUBSTRING(""StartDate"", 7, 4) || '-' || SUBSTRING(""StartDate"", 4, 2) || '-' || SUBSTRING(""StartDate"", 1, 2) 
                          WHERE ""StartDate"" LIKE '__/__/____';",
                        cancellationToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning("StartDate SQL format update skipped or failed: {Message}", ex.Message);
            }

            // Check if AnimeCaches table already has data
            bool hasData = await dbContext.AnimeCaches.AnyAsync(cancellationToken);
            if (!hasData)
            {
                logger.LogInformation("🚀 Database is empty! Starting AnimeDataSeeder to fetch and populate Anime into Database...");
                
                var animeService = scope.ServiceProvider.GetRequiredService<IAnimeService>();
                
                // Seed anime from years 2010 to 2026 across all seasons (Winter, Spring, Summer, Fall)
                int syncedCount = await animeService.SyncSeasonalAnimeAsync(startYear: 2010, endYear: 2026, cancellationToken);
                
                logger.LogInformation("✅ AnimeDataSeeder completed successfully! Total anime seeded into Database: {Count}", syncedCount);
            }
            else
            {
                int currentCount = await dbContext.AnimeCaches.CountAsync(cancellationToken);
                logger.LogInformation("ℹ️ Database already contains {Count} anime. DataSeeder skipped.", currentCount);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "⚠️ Error occurred during AnimeDataSeeder execution.");
        }
    }
}
