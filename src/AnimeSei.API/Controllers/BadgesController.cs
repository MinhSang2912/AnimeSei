using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Badge;
using AnimeSei.Domain.Entities;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[Controller]")]
public class BadgesController : ControllerBase
{
    private readonly IAnimeSeiDbContext _context;
    private readonly IMapper _mapper;

    public BadgesController(IAnimeSeiDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<IActionResult> GetBadges()
    {
        var badges = await _context.Badges.ToListAsync();
        return Ok(ApiResponse<List<Badge>>.Ok(badges, "Lấy danh sách huy hiệu thành công"));
    }

    [HttpPost]
    public async Task<IActionResult> CreateBadge([FromBody] BadgeDto dto)
    {
        var badge = _mapper.Map<Badge>(dto);
        _context.Badges.Add(badge);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Badge>.Ok(badge, "Tạo huy hiệu mới thành công"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBadge(Guid id, [FromBody] BadgeDto dto)
    {
        var badge = await _context.Badges.FindAsync(id);
        if (badge == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy huy hiệu", 404));

        _mapper.Map(dto, badge);

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Badge>.Ok(badge, "Cập nhật huy hiệu thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBadge(Guid id)
    {
        var badge = await _context.Badges.FindAsync(id);
        if (badge == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy huy hiệu", 404));

        _context.Badges.Remove(badge);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Đã xóa huy hiệu thành công"));
    }
}
