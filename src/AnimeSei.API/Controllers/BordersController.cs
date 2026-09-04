using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/borders")]
public class BordersController : ControllerBase
{
    private readonly IAnimeSeiDbContext _context;

    public BordersController(IAnimeSeiDbContext context)
    {
        _context = context;
    }

    public record BorderDto(string Name, string FrameUrl, string? ImageUrl, int RequiredPoints, string Description);

    [HttpGet]
    public async Task<IActionResult> GetBorders()
    {
        var borders = await _context.Borders.ToListAsync();
        return Ok(ApiResponse<List<Border>>.Ok(borders, "Lấy danh sách viền thành công"));
    }

    [HttpPost]
    public async Task<IActionResult> CreateBorder([FromBody] BorderDto dto)
    {
        var border = new Border
        {
            Name = dto.Name,
            FrameUrl = dto.FrameUrl,
            ImageUrl = dto.ImageUrl,
            RequiredPoints = dto.RequiredPoints,
            Description = dto.Description
        };
        _context.Borders.Add(border);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Border>.Ok(border, "Tạo viền mới thành công"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBorder(Guid id, [FromBody] BorderDto dto)
    {
        var border = await _context.Borders.FindAsync(id);
        if (border == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy viền", 404));

        border.Name = dto.Name;
        border.FrameUrl = dto.FrameUrl;
        border.ImageUrl = dto.ImageUrl;
        border.RequiredPoints = dto.RequiredPoints;
        border.Description = dto.Description;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Border>.Ok(border, "Cập nhật viền thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBorder(Guid id)
    {
        var border = await _context.Borders.FindAsync(id);
        if (border == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy viền", 404));

        _context.Borders.Remove(border);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Đã xóa viền thành công"));
    }
}
