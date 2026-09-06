using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Admin;
using AnimeSei.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeSei.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ISupabaseStorageService _storageService;

    public AdminController(IAdminService adminService, ISupabaseStorageService storageService)
    {
        _adminService = adminService;
        _storageService = storageService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _adminService.GetSystemStatsAsync();
        return Ok(ApiResponse<AdminStatsDto>.Ok(stats, "Lấy thống kê hệ thống thành công"));
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _adminService.GetUsersAsync();
        return Ok(ApiResponse<List<UserAdminDto>>.Ok(users, "Lấy danh sách người dùng thành công"));
    }

    [HttpGet("anime")]
    public async Task<IActionResult> GetAnimeList(
        [FromQuery] string? q = null,
        [FromQuery] string? format = null,
        [FromQuery] string? country = null,
        [FromQuery] string? genre = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 12)
    {
        var result = await _adminService.GetAnimeListAsync(q, format, country, genre, status, page, perPage);
        return Ok(ApiResponse<PagedResult<AnimeCache>>.Ok(result, "Lấy danh sách Anime từ CSDL thành công"));
    }

    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
    {
        var genres = await _adminService.GetGenresAsync();
        return Ok(ApiResponse<List<string>>.Ok(genres, "Lấy danh sách thể loại thành công"));
    }

    [HttpPut("anime/{id:int}")]
    public async Task<IActionResult> UpdateAnime(int id, [FromBody] UpdateAnimeRequest request)
    {
        var anime = await _adminService.UpdateAnimeAsync(id, request);
        if (anime == null)
        {
            return NotFound(ApiResponse<string>.Fail("Không tìm thấy anime để cập nhật", 404));
        }

        return Ok(ApiResponse<AnimeCache>.Ok(anime, "Cập nhật thông tin anime thành công"));
    }

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



