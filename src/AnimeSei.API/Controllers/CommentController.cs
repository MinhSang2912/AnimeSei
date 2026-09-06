using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Comment;
using AnimeSei.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentController : ControllerBase
{
    private readonly IAnimeSeiDbContext _context;

    public CommentController(IAnimeSeiDbContext context)
    {
        _context = context;
    }

    [HttpGet("anime/{animeId:int}")]
    public async Task<IActionResult> GetCommentsByAnime(int animeId)
    {
        var comments = await _context.Comments
            .Include(c => c.User)
            .Where(c => c.AnimeId == animeId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Content,
                c.CreatedAt,
                User = new
                {
                    c.User.Username,
                    c.User.AvatarUrl,
                    CurrentBadge = c.User.CurrentBadgeId.HasValue ? _context.Badges.FirstOrDefault(b => b.Id == c.User.CurrentBadgeId.Value) : null,
                    CurrentBorder = c.User.CurrentBorderId.HasValue ? _context.Borders.FirstOrDefault(b => b.Id == c.User.CurrentBorderId.Value) : null
                }
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(comments, "Lấy danh sách bình luận thành công"));
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserComments()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var comments = await _context.Comments
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Content,
                c.CreatedAt,
                Anime = _context.AnimeCaches
                    .Where(a => a.Id == c.AnimeId)
                    .Select(a => new { a.Id, a.TitleRomaji, a.CoverImage })
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(comments, "Lấy lịch sử bình luận thành công"));
    }

    [HttpPost]
    public async Task<IActionResult> AddComment([FromBody] CreateCommentRequestDto request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập để bình luận", 401));
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(ApiResponse<string>.Fail("Nội dung bình luận không được để trống", 400));
        }

        var comment = new Comment
        {
            UserId = userId,
            AnimeId = request.AnimeId,
            Content = request.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);
        var currentBadge = user?.CurrentBadgeId.HasValue == true ? await _context.Badges.FindAsync(user.CurrentBadgeId.Value) : null;
        var currentBorder = user?.CurrentBorderId.HasValue == true ? await _context.Borders.FindAsync(user.CurrentBorderId.Value) : null;

        var result = new
        {
            comment.Id,
            comment.Content,
            comment.CreatedAt,
            User = new
            {
                Username = user?.Username ?? "User",
                AvatarUrl = user?.AvatarUrl,
                CurrentBadge = currentBadge,
                CurrentBorder = currentBorder
            }
        };

        return Ok(ApiResponse<object>.Ok(result, "Đăng bình luận thành công"));
    }
}
