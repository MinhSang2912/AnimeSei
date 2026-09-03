using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.Infrastructure.Data;

public class AnimeSeiDbContext : DbContext, IAnimeSeiDbContext
{
    public AnimeSeiDbContext(DbContextOptions<AnimeSeiDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AnimeCache> AnimeCaches => Set<AnimeCache>();
    public DbSet<WatchHistory> WatchHistories => Set<WatchHistory>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<Border> Borders => Set<Border>();
    public DbSet<UserInventory> UserInventories => Set<UserInventory>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Rating> Ratings => Set<Rating>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        // RefreshToken Configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(rt => rt.Id);
            entity.HasOne(rt => rt.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(rt => rt.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // WatchHistory Configuration
        modelBuilder.Entity<WatchHistory>(entity =>
        {
            entity.HasKey(wh => wh.Id);
            entity.HasOne(wh => wh.User)
                  .WithMany(u => u.WatchHistories)
                  .HasForeignKey(wh => wh.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // UserInventory Configuration
        modelBuilder.Entity<UserInventory>(entity =>
        {
            entity.HasKey(ui => ui.Id);
            entity.HasOne(ui => ui.User)
                  .WithMany(u => u.Inventories)
                  .HasForeignKey(ui => ui.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Comment Configuration
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasOne(c => c.User)
                  .WithMany(u => u.Comments)
                  .HasForeignKey(c => c.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Rating Configuration
        modelBuilder.Entity<Rating>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.HasOne(r => r.User)
                  .WithMany(u => u.Ratings)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // AnimeCache Configuration
        modelBuilder.Entity<AnimeCache>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Relations)
                  .HasConversion(
                      v => System.Text.Json.JsonSerializer.Serialize(v ?? new List<AnimeRelationDto>(), (System.Text.Json.JsonSerializerOptions?)null),
                      v => string.IsNullOrEmpty(v) ? new List<AnimeRelationDto>() : System.Text.Json.JsonSerializer.Deserialize<List<AnimeRelationDto>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<AnimeRelationDto>()
                  );
        });
    }
}
