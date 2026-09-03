using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.WatchHistory;
using AnimeSei.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WatchHistoryController : ControllerBase
{
    private readonly IAnimeSeiDbContext _context;

    public WatchHistoryController(IAnimeSeiDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserWatchHistory()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var history = await _context.WatchHistories
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.LastWatchedAt)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(history, "Lấy lịch sử xem phim thành công"));
    }

    [HttpPost("progress")]
    public async Task<IActionResult> SaveProgress([FromBody] SaveProgressRequestDto request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var history = await _context.WatchHistories.FirstOrDefaultAsync(
            w => w.UserId == userId && w.AnimeId == request.AnimeId && w.EpisodeNumber == request.EpisodeNumber);

        if (history == null)
        {
            history = new WatchHistory
            {
                UserId = userId,
                AnimeId = request.AnimeId,
                EpisodeNumber = request.EpisodeNumber,
                WatchedProgressSeconds = request.WatchedProgressSeconds,
                TotalDurationSeconds = request.TotalDurationSeconds,
                LastWatchedAt = DateTime.UtcNow
            };
            _context.WatchHistories.Add(history);
        }
        else
        {
            history.WatchedProgressSeconds = request.WatchedProgressSeconds;
            history.TotalDurationSeconds = request.TotalDurationSeconds;
            history.LastWatchedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Lưu tiến trình xem phim thành công"));
    }
}
