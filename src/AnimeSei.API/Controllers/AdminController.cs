using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAnimeSeiDbContext _context;
    private readonly IAniListService _aniListService;

    public AdminController(IAnimeSeiDbContext context, IAniListService aniListService)
    {
        _context = context;
        _aniListService = aniListService;
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

    [HttpPost("sync-anime")]
    public IActionResult SyncAnime([FromQuery] int startYear = 2000, [FromQuery] int endYear = 2026)
    {
        _ = Task.Run(async () =>
        {
            await _aniListService.SyncSeasonalAnimeAsync(startYear, endYear);
        });

        return Ok(ApiResponse<string>.Ok($"Đã khởi chạy tiến trình đồng bộ dữ liệu Anime theo Mùa & Năm từ {startYear} đến {endYear} trong nền.", "Khởi chạy đồng bộ thành công"));
    }
}
