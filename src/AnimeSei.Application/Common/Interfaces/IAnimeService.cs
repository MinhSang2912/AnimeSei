using AnimeSei.Application.Common.Models;
using AnimeSei.Domain.Entities;

namespace AnimeSei.Application.Common.Interfaces;

public interface IAnimeService
{
    Task<PagedResult<AnimeCache>> GetAnimeListAsync(string? query = null, int page = 1, int perPage = 20, string? format = null, bool? is3D = null, string? country = null, string? genre = null, CancellationToken cancellationToken = default);
    Task<AnimeCache?> GetAnimeByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<int> SyncSeasonalAnimeAsync(int startYear = 1970, int endYear = 0, CancellationToken cancellationToken = default);
}
