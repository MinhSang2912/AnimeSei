using System.Net.Http.Json;
using System.Text.Json;
using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AnimeSei.Infrastructure.Services;

public class EpisodeService : IEpisodeService
{
    private readonly IAnimeSeiDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly ILogger<EpisodeService> _logger;

    public EpisodeService(IAnimeSeiDbContext context, HttpClient httpClient, ILogger<EpisodeService> logger)
    {
        _context = context;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<List<Episode>> GetEpisodesByAnimeIdAsync(int animeId, CancellationToken cancellationToken = default)
    {
        var existingEpisodes = await _context.Episodes
            .Where(e => e.AnimeId == animeId)
            .OrderBy(e => e.EpisodeNumber)
            .ToListAsync(cancellationToken);

        if (existingEpisodes.Any())
        {
            return existingEpisodes;
        }

        // If no episodes in DB yet, try generating default stream references
        var anime = await _context.AnimeCaches.FirstOrDefaultAsync(a => a.Id == animeId, cancellationToken);
        if (anime == null) return new List<Episode>();

        int totalEpisodes = anime.Episodes ?? 12;
        var generated = new List<Episode>();

        for (int i = 1; i <= totalEpisodes; i++)
        {
            var ep = new Episode
            {
                AnimeId = animeId,
                EpisodeNumber = i,
                Title = $"Tập {i}",
                ServerName = "VidSrc VIP (vsembed.ru)",
                CreatedAt = DateTime.UtcNow
            };
            generated.Add(ep);
        }

        _context.Episodes.AddRange(generated);
        await _context.SaveChangesAsync(cancellationToken);

        return generated;
    }

    public async Task<Episode?> GetEpisodeStreamAsync(int animeId, int episodeNumber, CancellationToken cancellationToken = default)
    {
        var episode = await _context.Episodes
            .FirstOrDefaultAsync(e => e.AnimeId == animeId && e.EpisodeNumber == episodeNumber, cancellationToken);

        var anime = await _context.AnimeCaches.FirstOrDefaultAsync(a => a.Id == animeId, cancellationToken);
        bool isMovie = anime?.Format?.ToUpper() == "MOVIE";

        string defaultEmbedUrl = isMovie
            ? $"https://vsembed.ru/embed/movie/{animeId}?ds_lang=vi,en&autonext=1"
            : $"https://vsembed.ru/embed/tv/{animeId}/1/{episodeNumber}?ds_lang=vi,en&autonext=1";

        if (episode == null)
        {
            episode = new Episode
            {
                AnimeId = animeId,
                EpisodeNumber = episodeNumber,
                Title = $"Tập {episodeNumber}",
                EmbedUrl = defaultEmbedUrl,
                ServerName = "VidSrc VIP (vsembed.ru)",
                CreatedAt = DateTime.UtcNow
            };
            _context.Episodes.Add(episode);
            await _context.SaveChangesAsync(cancellationToken);
        }
        else if (string.IsNullOrEmpty(episode.EmbedUrl) && string.IsNullOrEmpty(episode.HlsUrl))
        {
            episode.EmbedUrl = defaultEmbedUrl;
            episode.ServerName = "VidSrc VIP (vsembed.ru)";
            await _context.SaveChangesAsync(cancellationToken);
        }

        return episode;
    }

    public async Task<Episode> CreateOrUpdateEpisodeAsync(Episode episode, CancellationToken cancellationToken = default)
    {
        var existing = await _context.Episodes
            .FirstOrDefaultAsync(e => e.AnimeId == episode.AnimeId && e.EpisodeNumber == episode.EpisodeNumber, cancellationToken);

        if (existing == null)
        {
            episode.CreatedAt = DateTime.UtcNow;
            _context.Episodes.Add(episode);
            await _context.SaveChangesAsync(cancellationToken);
            return episode;
        }

        existing.Title = episode.Title;
        existing.EmbedUrl = episode.EmbedUrl;
        existing.HlsUrl = episode.HlsUrl;
        existing.ServerName = episode.ServerName;
        existing.SubtitlesJson = episode.SubtitlesJson;

        await _context.SaveChangesAsync(cancellationToken);
        return existing;
    }
}
