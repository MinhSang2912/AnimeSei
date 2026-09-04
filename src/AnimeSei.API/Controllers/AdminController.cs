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

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.LastSyncedAt)
            .ThenByDescending(a => a.Id)
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



