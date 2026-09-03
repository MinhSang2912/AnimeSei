using AnimeSei.Application.Common.Models;
using AnimeSei.Domain.Entities;

namespace AnimeSei.Application.Common.Interfaces;

public interface IAniListService
{
    Task<PagedResult<AnimeCache>> GetRecentAnimeAsync(int page = 1, int perPage = 20, string? format = null, bool? is3D = null, string? country = null, CancellationToken cancellationToken = default);
    Task<PagedResult<AnimeCache>> SearchAnimeAsync(string query, int page = 1, int perPage = 20, string? format = null, bool? is3D = null, string? country = null, CancellationToken cancellationToken = default);
    Task<AnimeCache?> GetAnimeByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<int> SyncSeasonalAnimeAsync(int startYear = 2000, int endYear = 2026, CancellationToken cancellationToken = default);
    Task<int> SyncIncrementalAnimeAsync(CancellationToken cancellationToken = default);
}
