using AnimeSei.Domain.Entities;

namespace AnimeSei.Application.Common.Interfaces;

public interface IEpisodeService
{
    Task<List<Episode>> GetEpisodesByAnimeIdAsync(int animeId, CancellationToken cancellationToken = default);
    Task<Episode?> GetEpisodeStreamAsync(int animeId, int episodeNumber, CancellationToken cancellationToken = default);
    Task<Episode> CreateOrUpdateEpisodeAsync(Episode episode, CancellationToken cancellationToken = default);
}
