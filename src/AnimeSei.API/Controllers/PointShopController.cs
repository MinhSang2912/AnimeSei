using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.PointShop;
using AnimeSei.Domain.Entities;
using AnimeSei.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PointShopController : ControllerBase
{
    private readonly IAnimeSeiDbContext _context;

    public PointShopController(IAnimeSeiDbContext context)
    {
        _context = context;
    }

    [HttpGet("items")]
    public async Task<IActionResult> GetItems()
    {
        var badges = await _context.Badges.ToListAsync();
        var borders = await _context.Borders.ToListAsync();

        return Ok(ApiResponse<object>.Ok(new { badges, borders }, "Lấy danh sách vật phẩm cửa hàng thành công"));
    }

    [HttpPost("buy")]
    public async Task<IActionResult> BuyItem([FromBody] BuyItemRequestDto request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy người dùng", 404));

        int requiredPoints = 0;
        if (request.ItemType == ItemType.Badge)
        {
            var badge = await _context.Badges.FindAsync(request.ItemId);
            if (badge == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy huy hiệu", 404));
            requiredPoints = badge.RequiredPoints;
        }
        else
        {
            var border = await _context.Borders.FindAsync(request.ItemId);
            if (border == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy viền khung", 404));
            requiredPoints = border.RequiredPoints;
        }

        if (user.Points < requiredPoints)
        {
            return BadRequest(ApiResponse<string>.Fail($"Bạn cần tối thiểu {requiredPoints} điểm để đổi vật phẩm này", 400));
        }

        // Check if already purchased
        var existing = await _context.UserInventories.FirstOrDefaultAsync(
            i => i.UserId == userId && i.ItemType == request.ItemType && i.ItemId == request.ItemId);

        if (existing != null)
        {
            return BadRequest(ApiResponse<string>.Fail("Bạn đã sở hữu vật phẩm này rồi", 400));
        }

        user.Points -= requiredPoints;

        _context.UserInventories.Add(new UserInventory
        {
            UserId = userId,
            ItemType = request.ItemType,
            ItemId = request.ItemId
        });

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { newPoints = user.Points }, "Đổi vật phẩm thành công!"));
    }
}
