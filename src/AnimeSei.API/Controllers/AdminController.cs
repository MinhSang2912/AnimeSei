using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAnimeSeiDbContext _context;
    private readonly ISupabaseStorageService _storageService;

    public AdminController(IAnimeSeiDbContext context, ISupabaseStorageService storageService)
    {
        _context = context;
        _storageService = storageService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalCachedAnime = await _context.AnimeCaches.CountAsync();
        var totalWatchHistory = await _context.WatchHistories.CountAsync();
        var totalComments = await _context.Comments.CountAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            totalUsers,
            totalCachedAnime,
            totalWatchHistory,
            totalComments
        }, "Lấy thống kê hệ thống thành công"));
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.Role,
                u.Points,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(users, "Lấy danh sách người dùng thành công"));
    }

    [HttpGet("anime")]
    public async Task<IActionResult> GetAnimeList(
        [FromQuery] string? q = null,
        [FromQuery] string? format = null,
        [FromQuery] string? country = null,
        [FromQuery] string? genre = null,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 12)
    {
        page = Math.Max(1, page);
        perPage = Math.Clamp(perPage, 1, 100);

        var query = _context.AnimeCaches.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.Trim().ToLower();
            query = query.Where(a => 
                EF.Functions.Like(a.TitleRomaji.ToLower(), $"%{search}%") ||
                (a.TitleEnglish != null && EF.Functions.Like(a.TitleEnglish.ToLower(), $"%{search}%")) ||
                (a.TitleNative != null && EF.Functions.Like(a.TitleNative.ToLower(), $"%{search}%")));
        }

        if (!string.IsNullOrWhiteSpace(format) && !string.Equals(format, "ALL", StringComparison.OrdinalIgnoreCase))
        {
            var fmtUpper = format.ToUpper();
            query = query.Where(a => a.Format != null && a.Format.ToUpper() == fmtUpper);
        }

        if (!string.IsNullOrWhiteSpace(country) && !string.Equals(country, "ALL", StringComparison.OrdinalIgnoreCase))
        {
            var countryUpper = country.ToUpper();
            query = query.Where(a => a.CountryOfOrigin != null && a.CountryOfOrigin.ToUpper() == countryUpper);
        }

        if (!string.IsNullOrWhiteSpace(genre) && !string.Equals(genre, "ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(a => a.Genres.Contains(genre));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.Id)
            .Skip((page - 1) * perPage)
            .Take(perPage)
            .ToListAsync();

        var pagedResult = new PagedResult<AnimeCache>
        {
            Items = items,
            CurrentPage = page,
            Total = totalItems,
            LastPage = (int)Math.Ceiling((double)totalItems / perPage),
            HasNextPage = page * perPage < totalItems
        };

        return Ok(ApiResponse<PagedResult<AnimeCache>>.Ok(pagedResult, "Lấy danh sách Anime từ CSDL thành công"));
    }

    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
    {
        var rawGenres = await _context.AnimeCaches
            .AsNoTracking()
            .Select(a => a.Genres)
            .ToListAsync();

        var distinct = rawGenres
            .SelectMany(g => g)
            .Where(g => !string.IsNullOrWhiteSpace(g))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(g => g)
            .ToList();

        return Ok(ApiResponse<List<string>>.Ok(distinct, "Lấy danh sách thể loại thành công"));
    }

    [HttpPut("anime/{id:int}")]
    public async Task<IActionResult> UpdateAnime(int id, [FromBody] UpdateAnimeRequest request)
    {
        var anime = await _context.AnimeCaches.FirstOrDefaultAsync(a => a.Id == id);
        if (anime == null)
        {
            return NotFound(ApiResponse<string>.Fail("Không tìm thấy anime để cập nhật", 404));
        }

        if (!string.IsNullOrWhiteSpace(request.TitleRomaji))
        {
            anime.TitleRomaji = request.TitleRomaji.Trim();
        }
        anime.TitleEnglish = string.IsNullOrWhiteSpace(request.TitleEnglish) ? null : request.TitleEnglish.Trim();
        anime.TitleNative = string.IsNullOrWhiteSpace(request.TitleNative) ? null : request.TitleNative.Trim();
        if (request.Description != null)
        {
            anime.Description = request.Description;
        }
        anime.CoverImage = string.IsNullOrWhiteSpace(request.CoverImage) ? null : request.CoverImage.Trim();
        anime.BannerImage = string.IsNullOrWhiteSpace(request.BannerImage) ? null : request.BannerImage.Trim();
        anime.Episodes = request.Episodes;
        anime.CurrentEpisodes = request.CurrentEpisodes;
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            anime.Status = request.Status.Trim().ToUpper();
        }
        if (!string.IsNullOrWhiteSpace(request.Format))
        {
            anime.Format = request.Format.Trim().ToUpper();
        }
        if (!string.IsNullOrWhiteSpace(request.CountryOfOrigin))
        {
            anime.CountryOfOrigin = request.CountryOfOrigin.Trim().ToUpper();
        }
        anime.Is3D = request.Is3D;
        if (request.Genres != null)
        {
            anime.Genres = request.Genres;
        }
        anime.AverageScore = request.AverageScore;
        anime.SeasonYear = request.SeasonYear;
        anime.StartDate = string.IsNullOrWhiteSpace(request.StartDate) ? null : request.StartDate.Trim();
        anime.EndDate = string.IsNullOrWhiteSpace(request.EndDate) ? null : request.EndDate.Trim();
        anime.TrailerSite = string.IsNullOrWhiteSpace(request.TrailerSite) ? null : request.TrailerSite.Trim();
        anime.TrailerId = string.IsNullOrWhiteSpace(request.TrailerId) ? null : request.TrailerId.Trim();
        anime.LastSyncedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<AnimeCache>.Ok(anime, "Cập nhật thông tin anime thành công"));
    }

    // Upload Item Image to Supabase Storage
    [HttpPost("upload-item-image")]
    public async Task<IActionResult> UploadItemImage(IFormFile file, [FromQuery] string folder = "items")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<string>.Fail("File ảnh không hợp lệ", 400));
        }

        try
        {
            using var stream = file.OpenReadStream();
            var imageUrl = await _storageService.UploadItemImageAsync(stream, file.FileName, file.ContentType, folder);
            return Ok(ApiResponse<string>.Ok(imageUrl, "Tải ảnh vật phẩm lên Supabase Storage thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message, 400));
        }
    }
}

public class UpdateAnimeRequest
{
    public string TitleRomaji { get; set; } = string.Empty;
    public string? TitleEnglish { get; set; }
    public string? TitleNative { get; set; }
    public string? Description { get; set; }
    public string? CoverImage { get; set; }
    public string? BannerImage { get; set; }
    public int? Episodes { get; set; }
    public int? CurrentEpisodes { get; set; }
    public string? Status { get; set; }
    public string? Format { get; set; }
    public string? CountryOfOrigin { get; set; }
    public bool Is3D { get; set; }
    public List<string>? Genres { get; set; }
    public int? AverageScore { get; set; }
    public int? SeasonYear { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? TrailerSite { get; set; }
    public string? TrailerId { get; set; }
}



