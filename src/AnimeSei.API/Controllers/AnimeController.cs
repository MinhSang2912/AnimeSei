using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AnimeSei.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnimeController : ControllerBase
{
    private readonly IAniListService _aniListService;

    public AnimeController(IAniListService aniListService)
    {
        _aniListService = aniListService;
    }

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] string? format = "TV",
        [FromQuery] bool? is3D = null,
        [FromQuery] string? country = "JP")
    {
        var result = await _aniListService.GetRecentAnimeAsync(page, perPage, format, is3D, country);
        return Ok(ApiResponse<PagedResult<AnimeCache>>.Ok(result, "Lấy danh sách anime ra mắt gần đây nhất thành công"));
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string q,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] string? format = null,
        [FromQuery] bool? is3D = null,
        [FromQuery] string? country = null)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return await GetRecent(page, perPage, format, is3D, country);
        }

        var result = await _aniListService.SearchAnimeAsync(q, page, perPage, format, is3D, country);
        return Ok(ApiResponse<PagedResult<AnimeCache>>.Ok(result, "Tìm kiếm anime thành công"));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var anime = await _aniListService.GetAnimeByIdAsync(id);
        if (anime == null)
        {
            return NotFound(ApiResponse<AnimeCache?>.Fail("Không tìm thấy bộ phim này", 404));
        }

        return Ok(ApiResponse<AnimeCache>.Ok(anime, "Lấy thông tin chi tiết anime thành công"));
    }
}
