using AnimeSei.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.Application.Common.Interfaces;

public interface IAnimeSeiDbContext
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<AnimeCache> AnimeCaches { get; }
    DbSet<WatchHistory> WatchHistories { get; }
    DbSet<Badge> Badges { get; }
    DbSet<Border> Borders { get; }
    DbSet<UserInventory> UserInventories { get; }
    DbSet<Comment> Comments { get; }
    DbSet<Rating> Ratings { get; }
    DbSet<Episode> Episodes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
