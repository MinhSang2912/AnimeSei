using System.Net.Http.Json;
using System.Text.Json;
using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AnimeSei.Infrastructure.Services;

public class AniListService : IAniListService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AniListService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public AniListService(HttpClient httpClient, ILogger<AniListService> logger, IServiceProvider serviceProvider)
    {
        _httpClient = httpClient;
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task<PagedResult<AnimeCache>> GetRecentAnimeAsync(
        int page = 1,
        int perPage = 20,
        string? format = null,
        bool? is3D = null,
        string? country = null,
        string? genre = null,
        CancellationToken cancellationToken = default)
    {
        bool hasFormat = !string.IsNullOrWhiteSpace(format) && !string.Equals(format, "ALL", StringComparison.OrdinalIgnoreCase);
        bool hasCountry = !string.IsNullOrWhiteSpace(country) && !string.Equals(country, "ALL", StringComparison.OrdinalIgnoreCase);
        bool hasGenre = !string.IsNullOrWhiteSpace(genre) && !string.Equals(genre, "ALL", StringComparison.OrdinalIgnoreCase);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<IAnimeSeiDbContext>();
            var todayStr = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var queryable = dbContext.AnimeCaches
                .Where(a => a.Status != "NOT_YET_RELEASED" && a.Status != "CANCELLED" && (a.StartDate == null || string.Compare(a.StartDate, todayStr) <= 0))
                .Where(a => !a.Genres.Contains("Hentai") && (a.Format == null || a.Format.ToUpper() != "MUSIC"));

            if (hasFormat)
            {
                var fmtUpper = format!.ToUpper();
                queryable = queryable.Where(a => a.Format != null && a.Format.ToUpper() == fmtUpper);
            }
            if (hasCountry)
            {
                var countryUpper = country!.ToUpper();
                queryable = queryable.Where(a => a.CountryOfOrigin != null && a.CountryOfOrigin.ToUpper() == countryUpper);
            }
            if (hasGenre)
            {
                queryable = queryable.Where(a => a.Genres.Contains(genre!));
            }
            if (is3D.HasValue)
            {
                queryable = queryable.Where(a => a.Is3D == is3D.Value);
            }

            // Backfill / fix missing or future LastAiredAt in DB before running SQL queries
            var nowUtc = DateTime.UtcNow;
            var needsFixInDb = await dbContext.AnimeCaches
                .Where(a => a.LastAiredAt == null || a.LastAiredAt > nowUtc)
                .ToListAsync(cancellationToken);

            if (needsFixInDb.Count > 0)
            {
                foreach (var a in needsFixInDb)
                {
                    EnsureLastAiredAt(a);
                }
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            int totalCount = await queryable.CountAsync(cancellationToken);
            if (totalCount == 0)
            {
                return new PagedResult<AnimeCache>
                {
                    Items = new List<AnimeCache>(),
                    CurrentPage = 1,
                    LastPage = 1,
                    Total = 0,
                    HasNextPage = false
                };
            }

            int exactLastPage = (int)Math.Ceiling((double)totalCount / perPage);
            int safePage = Math.Max(1, Math.Min(page, exactLastPage));

            var items = await queryable
                .OrderByDescending(a => a.LastAiredAt)
                .ThenByDescending(a => a.EndDate)
                .ThenByDescending(a => a.StartDate)
                .ThenByDescending(a => a.Id)
                .Skip((safePage - 1) * perPage)
                .Take(perPage)
                .ToListAsync(cancellationToken);

            items.ForEach(EnsureLastAiredAt);

            return new PagedResult<AnimeCache>
            {
                Items = items,
                CurrentPage = safePage,
                LastPage = exactLastPage,
                Total = totalCount,
                HasNextPage = safePage < exactLastPage
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error querying database for recent anime");
            return new PagedResult<AnimeCache> { Items = new List<AnimeCache>(), CurrentPage = 1, LastPage = 1, Total = 0, HasNextPage = false };
        }
    }

    public async Task<PagedResult<AnimeCache>> SearchAnimeAsync(
        string search,
        int page = 1,
        int perPage = 20,
        string? format = null,
        bool? is3D = null,
        string? country = null,
        string? genre = null,
        CancellationToken cancellationToken = default)
    {
        bool hasFormat = !string.IsNullOrWhiteSpace(format) && !string.Equals(format, "ALL", StringComparison.OrdinalIgnoreCase);
        bool hasCountry = !string.IsNullOrWhiteSpace(country) && !string.Equals(country, "ALL", StringComparison.OrdinalIgnoreCase);
        bool hasGenre = !string.IsNullOrWhiteSpace(genre) && !string.Equals(genre, "ALL", StringComparison.OrdinalIgnoreCase);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<IAnimeSeiDbContext>();
            var todayStr = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var queryable = dbContext.AnimeCaches
                .Where(a => a.Status != "NOT_YET_RELEASED" && a.Status != "CANCELLED" && (a.StartDate == null || string.Compare(a.StartDate, todayStr) <= 0))
                .Where(a => !a.Genres.Contains("Hentai") && (a.Format == null || a.Format.ToUpper() != "MUSIC"));

            if (!string.IsNullOrWhiteSpace(search))
            {
                var sPattern = $"%{search.Trim()}%";
                queryable = queryable.Where(a =>
                    EF.Functions.ILike(a.TitleRomaji, sPattern) ||
                    (a.TitleEnglish != null && EF.Functions.ILike(a.TitleEnglish, sPattern)) ||
                    (a.TitleNative != null && EF.Functions.ILike(a.TitleNative, sPattern)));
            }

            if (hasFormat)
            {
                var fmtUpper = format!.ToUpper();
                queryable = queryable.Where(a => a.Format != null && a.Format.ToUpper() == fmtUpper);
            }
            if (hasCountry)
            {
                var countryUpper = country!.ToUpper();
                queryable = queryable.Where(a => a.CountryOfOrigin != null && a.CountryOfOrigin.ToUpper() == countryUpper);
            }
            if (hasGenre)
            {
                queryable = queryable.Where(a => a.Genres.Contains(genre!));
            }
            if (is3D.HasValue)
            {
                queryable = queryable.Where(a => a.Is3D == is3D.Value);
            }

            // Backfill / fix missing or future LastAiredAt in DB before running SQL queries
            var nowUtc = DateTime.UtcNow;
            var needsFixInDb = await dbContext.AnimeCaches
                .Where(a => a.LastAiredAt == null || a.LastAiredAt > nowUtc)
                .ToListAsync(cancellationToken);

            if (needsFixInDb.Count > 0)
            {
                foreach (var a in needsFixInDb)
                {
                    EnsureLastAiredAt(a);
                }
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            int totalCount = await queryable.CountAsync(cancellationToken);
            if (totalCount == 0)
            {
                return new PagedResult<AnimeCache>
                {
                    Items = new List<AnimeCache>(),
                    CurrentPage = 1,
                    LastPage = 1,
                    Total = 0,
                    HasNextPage = false
                };
            }

            int exactLastPage = (int)Math.Ceiling((double)totalCount / perPage);
            int safePage = Math.Max(1, Math.Min(page, exactLastPage));

            var items = await queryable
                .OrderByDescending(a => a.LastAiredAt)
                .ThenByDescending(a => a.EndDate)
                .ThenByDescending(a => a.StartDate)
                .ThenByDescending(a => a.Id)
                .Skip((safePage - 1) * perPage)
                .Take(perPage)
                .ToListAsync(cancellationToken);

            items.ForEach(EnsureLastAiredAt);

            return new PagedResult<AnimeCache>
            {
                Items = items,
                CurrentPage = safePage,
                LastPage = exactLastPage,
                Total = totalCount,
                HasNextPage = safePage < exactLastPage
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching database for anime");
            return new PagedResult<AnimeCache> { Items = new List<AnimeCache>(), CurrentPage = 1, LastPage = 1, Total = 0, HasNextPage = false };
        }
    }

    public async Task<AnimeCache?> GetAnimeByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<IAnimeSeiDbContext>();
            var existing = await dbContext.AnimeCaches.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
            
            if (existing != null)
            {
                EnsureLastAiredAt(existing);
                return existing;
            }

            // Only fetch from AniList API if not found in database at all
            var fetched = await FetchAnimeFromAniListByIdAsync(id, cancellationToken);
            if (fetched != null)
            {
                EnsureLastAiredAt(fetched);
                dbContext.AnimeCaches.Add(fetched);
                await dbContext.SaveChangesAsync(cancellationToken);
                return fetched;
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Anime by ID {Id} from Database", id);
            return null;
        }
    }

    private async Task<AnimeCache?> FetchAnimeFromAniListByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = @"
            query ($id: Int) {
              Media(id: $id, type: ANIME) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  extraLarge
                }
                bannerImage
                episodes
                nextAiringEpisode {
                  episode
                  airingAt
                }
                status
                format
                countryOfOrigin
                seasonYear
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                genres
                tags {
                  name
                }
                isAdult
                averageScore
                trailer {
                  id
                  site
                }
                relations {
                  edges {
                    relationType
                    node {
                      id
                      type
                      format
                      title {
                        romaji
                        english
                      }
                      coverImage {
                        extraLarge
                      }
                      seasonYear
                    }
                  }
                }
              }
            }";

            var variables = new { id };
            var requestBody = new { query, variables };

            var response = await _httpClient.PostAsJsonAsync("https://graphql.anilist.co", requestBody, cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("data", out var data) &&
                data.TryGetProperty("Media", out var media))
            {
                return MapMediaToAnimeCache(media);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching anime by ID {Id} from AniList API", id);
        }

        return null;
    }

    private static void EnsureLastAiredAt(AnimeCache anime)
    {
        if (!anime.LastAiredAt.HasValue)
        {
            if (!string.IsNullOrEmpty(anime.EndDate) && DateTime.TryParse(anime.EndDate, out var ed))
            {
                anime.LastAiredAt = DateTime.SpecifyKind(ed, DateTimeKind.Utc);
            }
            else if (!string.IsNullOrEmpty(anime.StartDate) && DateTime.TryParse(anime.StartDate, out var sd))
            {
                anime.LastAiredAt = DateTime.SpecifyKind(sd, DateTimeKind.Utc);
            }
            else if (anime.SeasonYear.HasValue)
            {
                anime.LastAiredAt = new DateTime(anime.SeasonYear.Value, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            }
        }

        while (anime.LastAiredAt.HasValue && anime.LastAiredAt.Value > DateTime.UtcNow)
        {
            anime.LastAiredAt = anime.LastAiredAt.Value.AddDays(-7);
        }
    }

    private static bool IsSensitiveOrAdult(JsonElement media)
    {
        return false;
    }

    private static AnimeCache MapMediaToAnimeCache(JsonElement media)
    {
        var title = media.GetProperty("title");
        var cover = media.TryGetProperty("coverImage", out var c) && c.TryGetProperty("extraLarge", out var el) ? el.GetString() : null;
        var banner = media.TryGetProperty("bannerImage", out var b) ? b.GetString() : null;
        var format = media.TryGetProperty("format", out var fmt) && fmt.ValueKind != JsonValueKind.Null ? fmt.GetString() : null;
        var countryOfOrigin = media.TryGetProperty("countryOfOrigin", out var coo) && coo.ValueKind != JsonValueKind.Null ? coo.GetString() : null;

        string? trailerSite = null;
        string? trailerId = null;
        if (media.TryGetProperty("trailer", out var tr) && tr.ValueKind == JsonValueKind.Object)
        {
            if (tr.TryGetProperty("site", out var trs)) trailerSite = trs.GetString();
            if (tr.TryGetProperty("id", out var tri)) trailerId = tri.GetString();
        }

        int? seasonYear = media.TryGetProperty("seasonYear", out var sy) && sy.ValueKind != JsonValueKind.Null ? sy.GetInt32() : null;
        
        string? startDateStr = null;
        if (media.TryGetProperty("startDate", out var sd) && sd.ValueKind == JsonValueKind.Object)
        {
            int? year = sd.TryGetProperty("year", out var y) && y.ValueKind != JsonValueKind.Null ? y.GetInt32() : null;
            int? month = sd.TryGetProperty("month", out var m) && m.ValueKind != JsonValueKind.Null ? m.GetInt32() : null;
            int? day = sd.TryGetProperty("day", out var sdd) && sdd.ValueKind != JsonValueKind.Null ? sdd.GetInt32() : null;

            if (year.HasValue) seasonYear ??= year.Value;

            if (day.HasValue && month.HasValue && year.HasValue)
            {
                startDateStr = $"{year.Value:D4}-{month.Value:D2}-{day.Value:D2}";
            }
            else if (month.HasValue && year.HasValue)
            {
                startDateStr = $"{year.Value:D4}-{month.Value:D2}-01";
            }
            else if (year.HasValue)
            {
                startDateStr = $"{year.Value:D4}-01-01";
            }
        }

        bool is3D = false;
        if (media.TryGetProperty("tags", out var tagsArray) && tagsArray.ValueKind == JsonValueKind.Array)
        {
            foreach (var tag in tagsArray.EnumerateArray())
            {
                if (tag.TryGetProperty("name", out var tagname))
                {
                    var nameStr = tagname.GetString();
                    if (!string.IsNullOrEmpty(nameStr) &&
                        (nameStr.Equals("CGI", StringComparison.OrdinalIgnoreCase) ||
                         nameStr.Equals("3D CGI", StringComparison.OrdinalIgnoreCase) ||
                         nameStr.Equals("Full CGI", StringComparison.OrdinalIgnoreCase)))
                    {
                        is3D = true;
                        break;
                    }
                }
            }
        }

        var genres = new List<string>();
        if (media.TryGetProperty("genres", out var gArray))
        {
            foreach (var g in gArray.EnumerateArray())
            {
                if (g.GetString() is string genreStr) genres.Add(genreStr);
            }
        }

        var relations = new List<AnimeRelationDto>();
        if (media.TryGetProperty("relations", out var relObj) && relObj.TryGetProperty("edges", out var edgesArray))
        {
            foreach (var edge in edgesArray.EnumerateArray())
            {
                var relType = edge.TryGetProperty("relationType", out var rt) ? rt.GetString() ?? "" : "";
                if (edge.TryGetProperty("node", out var node) && node.ValueKind == JsonValueKind.Object)
                {
                    var relMediaType = node.TryGetProperty("type", out var t) && t.ValueKind != JsonValueKind.Null ? t.GetString() : null;
                    var relFmt = node.TryGetProperty("format", out var f) && f.ValueKind != JsonValueKind.Null ? f.GetString() : null;

                    // Filter out MANGA, NOVEL, ONE_SHOT
                    if (string.Equals(relMediaType, "MANGA", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(relFmt, "MANGA", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(relFmt, "NOVEL", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(relFmt, "ONE_SHOT", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    int relId = node.GetProperty("id").GetInt32();
                    var relTitleObj = node.GetProperty("title");
                    string relTitle = relTitleObj.TryGetProperty("romaji", out var rom) ? rom.GetString() ?? "" : "";
                    if (string.IsNullOrEmpty(relTitle) && relTitleObj.TryGetProperty("english", out var eng))
                    {
                        relTitle = eng.GetString() ?? "";
                    }

                    string? relCover = node.TryGetProperty("coverImage", out var cImg) && cImg.TryGetProperty("extraLarge", out var elImg) ? elImg.GetString() : null;
                    int? relYear = node.TryGetProperty("seasonYear", out var sy2) && sy2.ValueKind != JsonValueKind.Null ? sy2.GetInt32() : null;

                    relations.Add(new AnimeRelationDto
                    {
                        Id = relId,
                        RelationType = relType,
                        Title = relTitle,
                        CoverImage = relCover,
                        Format = relFmt,
                        SeasonYear = relYear
                    });
                }
            }
        }

        int? totalEpisodes = media.TryGetProperty("episodes", out var ep) && ep.ValueKind != JsonValueKind.Null ? ep.GetInt32() : null;
        int? currentEpisodes = totalEpisodes;

        if (media.TryGetProperty("nextAiringEpisode", out var nae) && nae.ValueKind == JsonValueKind.Object)
        {
            if (nae.TryGetProperty("episode", out var naeEp) && naeEp.ValueKind != JsonValueKind.Null)
            {
                // Current released episode is (Next Episode Number - 1)
                currentEpisodes = Math.Max(0, naeEp.GetInt32() - 1);
            }
        }
        else if (media.TryGetProperty("status", out var stCheck) && stCheck.ValueKind == JsonValueKind.String)
        {
            var statusStr = stCheck.GetString();
            if (string.Equals(statusStr, "NOT_YET_RELEASED", StringComparison.OrdinalIgnoreCase))
            {
                currentEpisodes = 0;
            }
        }

        string? endDateStr = null;
        DateTime? lastAiredAt = null;
        if (media.TryGetProperty("endDate", out var ed) && ed.ValueKind == JsonValueKind.Object)
        {
            int? year = ed.TryGetProperty("year", out var y) && y.ValueKind != JsonValueKind.Null ? y.GetInt32() : null;
            int? month = ed.TryGetProperty("month", out var m) && m.ValueKind != JsonValueKind.Null ? m.GetInt32() : null;
            int? day = ed.TryGetProperty("day", out var edd) && edd.ValueKind != JsonValueKind.Null ? edd.GetInt32() : null;

            if (day.HasValue && month.HasValue && year.HasValue)
            {
                endDateStr = $"{year.Value:D4}-{month.Value:D2}-{day.Value:D2}";
            }
            else if (month.HasValue && year.HasValue)
            {
                endDateStr = $"{year.Value:D4}-{month.Value:D2}-01";
            }
            else if (year.HasValue)
            {
                endDateStr = $"{year.Value:D4}-01-01";
            }
        }

        // Priority 1: Next episode / new episode air time
        if (media.TryGetProperty("nextAiringEpisode", out var naeObj) && naeObj.ValueKind == JsonValueKind.Object)
        {
            if (naeObj.TryGetProperty("airingAt", out var aAt) && aAt.ValueKind != JsonValueKind.Null)
            {
                long unixSeconds = aAt.GetInt64();
                lastAiredAt = DateTimeOffset.FromUnixTimeSeconds(unixSeconds).UtcDateTime;
            }
        }

        // Priority 2: Finished date (EndDate)
        if (!lastAiredAt.HasValue && !string.IsNullOrEmpty(endDateStr) && DateTime.TryParse(endDateStr, out var parsedEndDate))
        {
            lastAiredAt = DateTime.SpecifyKind(parsedEndDate, DateTimeKind.Utc);
        }

        // Priority 3: Start date (StartDate)
        if (!lastAiredAt.HasValue && !string.IsNullOrEmpty(startDateStr) && DateTime.TryParse(startDateStr, out var parsedStartDate))
        {
            lastAiredAt = DateTime.SpecifyKind(parsedStartDate, DateTimeKind.Utc);
        }

        // Priority 4: SeasonYear
        if (!lastAiredAt.HasValue && seasonYear.HasValue)
        {
            lastAiredAt = new DateTime(seasonYear.Value, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        }

        while (lastAiredAt.HasValue && lastAiredAt.Value > DateTime.UtcNow)
        {
            lastAiredAt = lastAiredAt.Value.AddDays(-7);
        }

        return new AnimeCache
        {
            Id = media.GetProperty("id").GetInt32(),
            TitleRomaji = title.TryGetProperty("romaji", out var r) ? r.GetString() ?? "" : "",
            TitleEnglish = title.TryGetProperty("english", out var e) ? e.GetString() : null,
            TitleNative = title.TryGetProperty("native", out var n) ? n.GetString() : null,
            Description = media.TryGetProperty("description", out var desc) ? desc.GetString() ?? "" : "",
            CoverImage = cover,
            BannerImage = banner,
            Episodes = totalEpisodes,
            CurrentEpisodes = currentEpisodes,
            Status = media.TryGetProperty("status", out var st) ? st.GetString() ?? "" : "",
            Format = format,
            CountryOfOrigin = countryOfOrigin,
            Is3D = is3D,
            Genres = genres,
            AverageScore = media.TryGetProperty("averageScore", out var sc) && sc.ValueKind != JsonValueKind.Null ? sc.GetInt32() : null,
            SeasonYear = seasonYear,
            StartDate = startDateStr,
            EndDate = endDateStr,
            LastAiredAt = lastAiredAt,
            TrailerSite = trailerSite,
            TrailerId = trailerId,
            Relations = relations,
            LastSyncedAt = DateTime.UtcNow
        };
    }

    public async Task<int> SyncSeasonalAnimeAsync(int startYear = 2000, int endYear = 2026, CancellationToken cancellationToken = default)
    {
        int totalSynced = 0;

        var query = @"
        query ($page: Int, $year: Int) {
          Page(page: $page, perPage: 50) {
            pageInfo {
              currentPage
              hasNextPage
            }
            media(seasonYear: $year, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                extraLarge
              }
              bannerImage
              episodes
              nextAiringEpisode {
                episode
                airingAt
              }
              status
              format
              countryOfOrigin
              seasonYear
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              genres
              tags {
                name
              }
              isAdult
              averageScore
              trailer {
                id
                site
              }
            }
          }
        }";

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IAnimeSeiDbContext>();

        _logger.LogInformation("Starting reverse yearly anime sync from year {EndYear} down to {StartYear}", endYear, startYear);

        for (int year = endYear; year >= startYear; year--)
        {
            int page = 1;
            bool hasNextPage = true;

            while (hasNextPage && !cancellationToken.IsCancellationRequested)
            {
                var variables = new { page, year };
                var requestBody = new { query, variables };

                try
                {
                    var response = await _httpClient.PostAsJsonAsync("https://graphql.anilist.co", requestBody, cancellationToken);
                    if (!response.IsSuccessStatusCode) break;

                    var json = await response.Content.ReadAsStringAsync(cancellationToken);
                    using var doc = JsonDocument.Parse(json);

                    if (doc.RootElement.TryGetProperty("data", out var data) &&
                        data.TryGetProperty("Page", out var pageObj))
                    {
                        if (pageObj.TryGetProperty("pageInfo", out var pageInfo) &&
                            pageInfo.TryGetProperty("hasNextPage", out var hnp))
                        {
                            hasNextPage = hnp.GetBoolean();
                        }
                        else
                        {
                            hasNextPage = false;
                        }

                        if (pageObj.TryGetProperty("media", out var mediaArray))
                        {
                            int pageSyncedCount = 0;
                            var sampleTitles = new List<string>();

                            foreach (var media in mediaArray.EnumerateArray())
                            {
                                if (!IsSensitiveOrAdult(media))
                                {
                                    var item = MapMediaToAnimeCache(media);
                                    if (!string.IsNullOrEmpty(item.TitleRomaji) && sampleTitles.Count < 3)
                                    {
                                        sampleTitles.Add(item.TitleRomaji);
                                    }

                                    var existing = await dbContext.AnimeCaches.FirstOrDefaultAsync(a => a.Id == item.Id, cancellationToken);
                                    if (existing == null)
                                    {
                                        dbContext.AnimeCaches.Add(item);
                                    }
                                    else
                                    {
                                        existing.TitleRomaji = item.TitleRomaji;
                                        existing.TitleEnglish = item.TitleEnglish;
                                        existing.TitleNative = item.TitleNative;
                                        existing.CoverImage = item.CoverImage;
                                        existing.BannerImage = item.BannerImage;
                                        existing.Episodes = item.Episodes;
                                        existing.CurrentEpisodes = item.CurrentEpisodes;
                                        existing.Status = item.Status;
                                        existing.Format = item.Format;
                                        existing.CountryOfOrigin = item.CountryOfOrigin;
                                        existing.Is3D = item.Is3D;
                                        existing.Genres = item.Genres;
                                        existing.AverageScore = item.AverageScore;
                                        existing.SeasonYear = item.SeasonYear;
                                        existing.StartDate = item.StartDate;
                                        existing.EndDate = item.EndDate;
                                        existing.LastAiredAt = item.LastAiredAt;
                                        existing.TrailerSite = item.TrailerSite;
                                        existing.TrailerId = item.TrailerId;
                                        existing.LastSyncedAt = DateTime.UtcNow;
                                    }
                                    pageSyncedCount++;
                                    totalSynced++;
                                }
                            }
                            await dbContext.SaveChangesAsync(cancellationToken);

                            if (pageSyncedCount > 0)
                            {
                                _logger.LogInformation("🔄 [AniList Scraper] Synced Year {Year} (Page {Page}): {Count} items. Total so far: {TotalSynced}. Anime sample: [{Sample}]",
                                    year, page, pageSyncedCount, totalSynced, string.Join(" | ", sampleTitles));
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error syncing anime for year {Year}, page {Page}", year, page);
                    break;
                }

                page++;
                // Respect AniList API rate limits (90 req/min)
                await Task.Delay(400, cancellationToken);
            }
        }

        _logger.LogInformation("Completed yearly anime sync. Total items synced: {TotalSynced}", totalSynced);
        return totalSynced;
    }

    public async Task<int> SyncIncrementalAnimeAsync(CancellationToken cancellationToken = default)
    {
        // Background sync fetches all anime from year 2000 to current year without filtering/max date comparison
        int currentYear = DateTime.UtcNow.Year;
        return await SyncSeasonalAnimeAsync(2000, DateTime.UtcNow.Year+1, cancellationToken);
    }
}
