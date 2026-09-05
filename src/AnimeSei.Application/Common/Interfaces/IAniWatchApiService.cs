namespace AnimeSei.Application.Common.Interfaces;

public interface IAniWatchApiService
{
    Task<string?> GetHlsStreamUrlAsync(string animeTitle, int episodeNumber, CancellationToken cancellationToken = default);
}
