using System.Net.Http.Json;
using System.Text.Json;
using AnimeSei.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AnimeSei.Infrastructure.Services;

public class AniWatchApiService : IAniWatchApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AniWatchApiService> _logger;
    private readonly string _baseUrl;

    public AniWatchApiService(HttpClient httpClient, ILogger<AniWatchApiService> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        var configUrl = configuration["AniWatch:ApiUrl"];
        _baseUrl = string.IsNullOrWhiteSpace(configUrl) ? "http://localhost:4000" : configUrl.TrimEnd('/');
    }

    public async Task<string?> GetHlsStreamUrlAsync(string animeTitle, int episodeNumber, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(animeTitle)) return null;

        try
        {
            // 1. Search anime by title
            var searchUrl = $"{_baseUrl}/api/v2/hianime/search?q={Uri.EscapeDataString(animeTitle)}";
            var searchResponse = await FetchWithFallbackAsync(searchUrl, animeTitle, cancellationToken);
            if (searchResponse == null || !searchResponse.IsSuccessStatusCode) return null;

            var searchJson = await searchResponse.Content.ReadAsStringAsync(cancellationToken);
            using var searchDoc = JsonDocument.Parse(searchJson);

            string? animeId = null;
            if (searchDoc.RootElement.TryGetProperty("data", out var searchData) &&
                searchData.TryGetProperty("animes", out var animesArray) &&
                animesArray.ValueKind == JsonValueKind.Array &&
                animesArray.GetArrayLength() > 0)
            {
                var firstAnime = animesArray[0];
                if (firstAnime.TryGetProperty("id", out var idProp))
                {
                    animeId = idProp.GetString();
                }
            }

            if (string.IsNullOrEmpty(animeId)) return null;

            // 2. Fetch episodes for this anime
            var activeBaseUrl = searchResponse.RequestMessage?.RequestUri?.GetLeftPart(UriPartial.Authority) ?? _baseUrl;
            var episodesUrl = $"{activeBaseUrl}/api/v2/hianime/anime/{animeId}/episodes";
            var epResponse = await _httpClient.GetAsync(episodesUrl, cancellationToken);
            if (!epResponse.IsSuccessStatusCode) return null;

            var epJson = await epResponse.Content.ReadAsStringAsync(cancellationToken);
            using var epDoc = JsonDocument.Parse(epJson);

            string? episodeId = null;
            if (epDoc.RootElement.TryGetProperty("data", out var epData) &&
                epData.TryGetProperty("episodes", out var episodesArray) &&
                episodesArray.ValueKind == JsonValueKind.Array)
            {
                foreach (var ep in episodesArray.EnumerateArray())
                {
                    int epNo = ep.TryGetProperty("number", out var n) && n.ValueKind != JsonValueKind.Null ? n.GetInt32() : 0;
                    if (epNo == episodeNumber)
                    {
                        if (ep.TryGetProperty("episodeId", out var epIdProp))
                        {
                            episodeId = epIdProp.GetString();
                            break;
                        }
                    }
                }

                if (string.IsNullOrEmpty(episodeId) && episodesArray.GetArrayLength() > 0)
                {
                    var firstEp = episodesArray[0];
                    if (firstEp.TryGetProperty("episodeId", out var epIdProp))
                    {
                        episodeId = epIdProp.GetString();
                    }
                }
            }

            if (string.IsNullOrEmpty(episodeId)) return null;

            // 3. Fetch episode streaming sources
            var sourcesUrl = $"{activeBaseUrl}/api/v2/hianime/episode/sources?episodeId={Uri.EscapeDataString(episodeId)}&server=hd-1&category=sub";
            var sourcesResponse = await _httpClient.GetAsync(sourcesUrl, cancellationToken);
            if (!sourcesResponse.IsSuccessStatusCode) return null;

            var sourcesJson = await sourcesResponse.Content.ReadAsStringAsync(cancellationToken);
            using var sourcesDoc = JsonDocument.Parse(sourcesJson);

            if (sourcesDoc.RootElement.TryGetProperty("data", out var streamData) &&
                streamData.TryGetProperty("sources", out var sourcesArray) &&
                sourcesArray.ValueKind == JsonValueKind.Array &&
                sourcesArray.GetArrayLength() > 0)
            {
                foreach (var src in sourcesArray.EnumerateArray())
                {
                    if (src.TryGetProperty("url", out var urlProp))
                    {
                        var url = urlProp.GetString();
                        if (!string.IsNullOrEmpty(url))
                        {
                            _logger.LogInformation("Successfully fetched HLS stream URL from AniWatch API for {Title} Ep {Ep}", animeTitle, episodeNumber);
                            return url;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("AniWatch API stream fetch skipped: {Message}", ex.Message);
        }

        return null;
    }

    private async Task<HttpResponseMessage?> FetchWithFallbackAsync(string primaryUrl, string animeTitle, CancellationToken cancellationToken)
    {
        try
        {
            var res = await _httpClient.GetAsync(primaryUrl, cancellationToken);
            if (res.IsSuccessStatusCode) return res;
        }
        catch { }

        // Try public demo endpoint if configured URL failed or not running locally
        if (!primaryUrl.StartsWith("https://api-aniwatch.onrender.com"))
        {
            try
            {
                var fallbackUrl = $"https://api-aniwatch.onrender.com/api/v2/hianime/search?q={Uri.EscapeDataString(animeTitle)}";
                var res = await _httpClient.GetAsync(fallbackUrl, cancellationToken);
                if (res.IsSuccessStatusCode) return res;
            }
            catch { }
        }

        return null;
    }
}
