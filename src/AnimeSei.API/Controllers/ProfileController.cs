using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Profile;
using AnimeSei.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IAnimeSeiDbContext _context;
    private readonly ISupabaseStorageService _storageService;

    public ProfileController(IAnimeSeiDbContext context, ISupabaseStorageService storageService)
    {
        _context = context;
        _storageService = storageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var user = await _context.Users
            .Include(u => u.Inventories)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy người dùng", 404));

        var currentBadge = user.CurrentBadgeId.HasValue ? await _context.Badges.FindAsync(user.CurrentBadgeId.Value) : null;
        var currentBorder = user.CurrentBorderId.HasValue ? await _context.Borders.FindAsync(user.CurrentBorderId.Value) : null;

        var inventoryItemIds = user.Inventories.Select(i => i.ItemId).ToList();
        var ownedBadges = await _context.Badges.Where(b => inventoryItemIds.Contains(b.Id)).ToListAsync();
        var ownedBorders = await _context.Borders.Where(b => inventoryItemIds.Contains(b.Id)).ToListAsync();

        var profileData = new
        {
            user.Id,
            user.Username,
            user.Email,
            user.Role,
            user.Points,
            user.AvatarUrl,
            CurrentBadge = currentBadge,
            CurrentBorder = currentBorder,
            OwnedBadges = ownedBadges,
            OwnedBorders = ownedBorders
        };

        return Ok(ApiResponse<object>.Ok(profileData, "Lấy thông tin cá nhân thành công"));
    }

    [HttpPost("upload-avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<string>.Fail("Vui lòng chọn file hình ảnh", 400));
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy người dùng", 404));

        using var stream = file.OpenReadStream();
        var avatarUrl = await _storageService.UploadAvatarAsync(userId, stream, file.FileName, file.ContentType);

        user.AvatarUrl = avatarUrl;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { avatarUrl }, "Tải ảnh avatar lên Supabase Storage thành công!"));
    }

    [HttpPost("equip")]
    public async Task<IActionResult> EquipItem([FromBody] EquipItemRequestDto request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy người dùng", 404));

        if (request.ItemType == ItemType.Badge)
        {
            user.CurrentBadgeId = request.ItemId;
        }
        else
        {
            user.CurrentBorderId = request.ItemId;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Trang bị vật phẩm thành công!"));
    }
}
