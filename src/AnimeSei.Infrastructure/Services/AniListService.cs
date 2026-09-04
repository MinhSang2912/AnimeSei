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
        CancellationToken cancellationToken = default)
    {
        bool hasFormat = !string.IsNullOrWhiteSpace(format) && !string.Equals(format, "ALL", StringComparison.OrdinalIgnoreCase);
        bool hasCountry = !string.IsNullOrWhiteSpace(country) && !string.Equals(country, "ALL", StringComparison.OrdinalIgnoreCase);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<IAnimeSeiDbContext>();
            var todayStr = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var queryable = dbContext.AnimeCaches
                .Where(a => a.Status != "NOT_YET_RELEASED" && (a.StartDate == null || string.Compare(a.StartDate, todayStr) <= 0));

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
            if (is3D.HasValue)
            {
                queryable = queryable.Where(a => a.Is3D == is3D.Value);
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
                .OrderByDescending(a => a.StartDate)
                .ThenByDescending(a => a.Id)
                .Skip((safePage - 1) * perPage)
                .Take(perPage)
                .ToListAsync(cancellationToken);

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
        CancellationToken cancellationToken = default)
    {
        bool hasFormat = !string.IsNullOrWhiteSpace(format) && !string.Equals(format, "ALL", StringComparison.OrdinalIgnoreCase);
        bool hasCountry = !string.IsNullOrWhiteSpace(country) && !string.Equals(country, "ALL", StringComparison.OrdinalIgnoreCase);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<IAnimeSeiDbContext>();
            var todayStr = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var queryable = dbContext.AnimeCaches
                .Where(a => a.Status != "NOT_YET_RELEASED" && (a.StartDate == null || string.Compare(a.StartDate, todayStr) <= 0));

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
            if (is3D.HasValue)
            {
                queryable = queryable.Where(a => a.Is3D == is3D.Value);
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
                .OrderByDescending(a => a.StartDate)
                .ThenByDescending(a => a.Id)
                .Skip((safePage - 1) * perPage)
                .Take(perPage)
                .ToListAsync(cancellationToken);

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
            
            if (existing != null && existing.Relations != null && existing.Relations.Count > 0)
            {
                return existing;
            }

            // If existing is missing relations or not in DB, fetch from AniList API directly
            var fetched = await FetchAnimeFromAniListByIdAsync(id, cancellationToken);
            if (fetched != null)
            {
                if (existing == null)
                {
                    dbContext.AnimeCaches.Add(fetched);
                }
                else
                {
                    existing.Relations = fetched.Relations;
                    if (string.IsNullOrEmpty(existing.CoverImage)) existing.CoverImage = fetched.CoverImage;
                    existing.LastSyncedAt = DateTime.UtcNow;
                }
                await dbContext.SaveChangesAsync(cancellationToken);
                return fetched ?? existing;
            }

            return existing;
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
                status
                format
                countryOfOrigin
                seasonYear
                startDate {
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

    private static bool IsSensitiveOrAdult(JsonElement media)
    {
        if (media.TryGetProperty("isAdult", out var adultProp) && adultProp.ValueKind == JsonValueKind.True)
        {
            return true;
        }

        if (media.TryGetProperty("format", out var fmtProp) && fmtProp.ValueKind == JsonValueKind.String)
        {
            var fmtStr = fmtProp.GetString();
            if (string.Equals(fmtStr, "MUSIC", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        if (media.TryGetProperty("genres", out var gArray) && gArray.ValueKind == JsonValueKind.Array)
        {
            foreach (var g in gArray.EnumerateArray())
            {
                var genreStr = g.GetString()?.Trim();
                if (string.Equals(genreStr, "Hentai", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
        }

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

        return new AnimeCache
        {
            Id = media.GetProperty("id").GetInt32(),
            TitleRomaji = title.TryGetProperty("romaji", out var r) ? r.GetString() ?? "" : "",
            TitleEnglish = title.TryGetProperty("english", out var e) ? e.GetString() : null,
            TitleNative = title.TryGetProperty("native", out var n) ? n.GetString() : null,
            Description = media.TryGetProperty("description", out var desc) ? desc.GetString() ?? "" : "",
            CoverImage = cover,
            BannerImage = banner,
            Episodes = media.TryGetProperty("episodes", out var ep) && ep.ValueKind != JsonValueKind.Null ? ep.GetInt32() : null,
            Status = media.TryGetProperty("status", out var st) ? st.GetString() ?? "" : "",
            Format = format,
            CountryOfOrigin = countryOfOrigin,
            Is3D = is3D,
            Genres = genres,
            AverageScore = media.TryGetProperty("averageScore", out var sc) && sc.ValueKind != JsonValueKind.Null ? sc.GetInt32() : null,
            SeasonYear = seasonYear,
            StartDate = startDateStr,
            TrailerSite = trailerSite,
            TrailerId = trailerId,
            Relations = relations,
            LastSyncedAt = DateTime.UtcNow
        };
    }

    public async Task<int> SyncSeasonalAnimeAsync(int startYear = 2000, int endYear = 2026, CancellationToken cancellationToken = default)
    {
        string[] seasons = new[] { "WINTER", "SPRING", "SUMMER", "FALL" };
        int totalSynced = 0;

        var query = @"
        query ($page: Int, $year: Int, $season: MediaSeason) {
          Page(page: $page, perPage: 50) {
            pageInfo {
              currentPage
              hasNextPage
            }
            media(seasonYear: $year, season: $season, type: ANIME, isAdult: false, genre_not_in: [""Hentai""]) {
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
              status
              format
              countryOfOrigin
              seasonYear
              startDate {
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

        _logger.LogInformation("Starting seasonal anime sync from year {StartYear} to {EndYear}", startYear, endYear);

        for (int year = startYear; year <= endYear; year++)
        {
            foreach (var season in seasons)
            {
                int page = 1;
                bool hasNextPage = true;

                while (hasNextPage && !cancellationToken.IsCancellationRequested)
                {
                    var variables = new { page, year, season };
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
                                foreach (var media in mediaArray.EnumerateArray())
                                {
                                    if (!IsSensitiveOrAdult(media))
                                    {
                                        var item = MapMediaToAnimeCache(media);
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
                                            existing.Status = item.Status;
                                            existing.Format = item.Format;
                                            existing.CountryOfOrigin = item.CountryOfOrigin;
                                            existing.Is3D = item.Is3D;
                                            existing.Genres = item.Genres;
                                            existing.AverageScore = item.AverageScore;
                                            existing.SeasonYear = item.SeasonYear;
                                            existing.StartDate = item.StartDate;
                                            existing.TrailerSite = item.TrailerSite;
                                            existing.TrailerId = item.TrailerId;
                                            existing.LastSyncedAt = DateTime.UtcNow;
                                        }
                                        totalSynced++;
                                    }
                                }
                                await dbContext.SaveChangesAsync(cancellationToken);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error syncing anime for year {Year}, season {Season}, page {Page}", year, season, page);
                        break;
                    }

                    page++;
                    // Respect AniList API rate limits (90 req/min)
                    await Task.Delay(400, cancellationToken);
                }
            }
        }

        _logger.LogInformation("Completed seasonal anime sync. Total items synced: {TotalSynced}", totalSynced);
        return totalSynced;
    }

    public async Task<int> SyncIncrementalAnimeAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<IAnimeSeiDbContext>();

            // Find the latest StartDate currently in DB
            var latestAnime = await dbContext.AnimeCaches
                .Where(a => a.StartDate != null && a.StartDate.Length == 10)
                .OrderByDescending(a => a.StartDate)
                .FirstOrDefaultAsync(cancellationToken);

            int startDateGreater = 20000101; // default if DB empty

            if (latestAnime != null && !string.IsNullOrEmpty(latestAnime.StartDate))
            {
                var s = latestAnime.StartDate.Trim();
                if (s.Contains("/"))
                {
                    var parts = s.Split('/');
                    if (parts.Length == 3 && int.TryParse(parts[0], out int d) && int.TryParse(parts[1], out int m) && int.TryParse(parts[2], out int y))
                    {
                        startDateGreater = y * 10000 + m * 100 + d;
                    }
                }
                else if (s.Contains("-"))
                {
                    var parts = s.Split('-');
                    if (parts.Length == 3 && int.TryParse(parts[0], out int y) && int.TryParse(parts[1], out int m) && int.TryParse(parts[2], out int d))
                    {
                        startDateGreater = y * 10000 + m * 100 + d;
                    }
                }
            }

            var query = $@"
            query {{
              Page(page: 1, perPage: 10) {{
                media(type: ANIME, startDate_greater: {startDateGreater}, sort: [START_DATE]) {{
                  id
                  title {{
                    romaji
                    english
                    native
                  }}
                  description
                  coverImage {{
                    extraLarge
                  }}
                  bannerImage
                  episodes
                  status
                  format
                  countryOfOrigin
                  seasonYear
                  startDate {{
                    year
                    month
                    day
                  }}
                  genres
                  tags {{
                    name
                  }}
                  isAdult
                  averageScore
                  trailer {{
                    id
                    site
                  }}
                }}
              }}
            }}";

            var requestBody = new { query };

            var response = await _httpClient.PostAsJsonAsync("https://graphql.anilist.co", requestBody, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("AniList API returned status {StatusCode} during incremental sync: {ErrorContent}", response.StatusCode, errContent);
                return 0;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);

            int addedCount = 0;
            var loadedTitles = new List<string>();

            if (doc.RootElement.TryGetProperty("data", out var dataObj) &&
                dataObj.TryGetProperty("Page", out var pageObj) &&
                pageObj.TryGetProperty("media", out var mediaArray))
            {
                foreach (var mediaElem in mediaArray.EnumerateArray())
                {
                    if (!IsSensitiveOrAdult(mediaElem))
                    {
                        var item = MapMediaToAnimeCache(mediaElem);
                        if (!string.IsNullOrEmpty(item.TitleRomaji))
                        {
                            loadedTitles.Add(item.TitleRomaji);
                        }

                        var existing = await dbContext.AnimeCaches.FirstOrDefaultAsync(a => a.Id == item.Id, cancellationToken);
                        if (existing == null)
                        {
                            dbContext.AnimeCaches.Add(item);
                            addedCount++;
                        }
                        else
                        {
                            existing.TitleRomaji = item.TitleRomaji;
                            existing.TitleEnglish = item.TitleEnglish;
                            existing.TitleNative = item.TitleNative;
                            existing.CoverImage = item.CoverImage;
                            existing.BannerImage = item.BannerImage;
                            existing.Episodes = item.Episodes;
                            existing.Status = item.Status;
                            existing.Format = item.Format;
                            existing.CountryOfOrigin = item.CountryOfOrigin;
                            existing.Is3D = item.Is3D;
                            existing.Genres = item.Genres;
                            existing.AverageScore = item.AverageScore;
                            existing.SeasonYear = item.SeasonYear;
                            existing.StartDate = item.StartDate;
                            existing.TrailerSite = item.TrailerSite;
                            existing.TrailerId = item.TrailerId;
                            existing.Relations = item.Relations;
                            existing.LastSyncedAt = DateTime.UtcNow;
                        }
                    }
                }
                if (addedCount > 0)
                {
                    await dbContext.SaveChangesAsync(cancellationToken);
                }
            }

            var titlesSummary = loadedTitles.Count > 0 ? string.Join(" | ", loadedTitles) : "None";
            _logger.LogInformation("🔄 Incremental sync completed. Fetched {Count} anime from AniList (after date {StartDateGreater}): [{TitlesSummary}]. {AddedCount} new anime saved into Database.", loadedTitles.Count, startDateGreater, titlesSummary, addedCount);
            return addedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing incremental anime sync from AniList");
            return 0;
        }
    }
}
