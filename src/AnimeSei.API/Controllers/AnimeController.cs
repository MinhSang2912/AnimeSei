using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AnimeSei.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnimeController : ControllerBase
{
    private readonly IAnimeService _animeService;

    public AnimeController(IAnimeService animeService)
    {
        _animeService = animeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] string? q = null,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] string? format = null,
        [FromQuery] bool? is3D = null,
        [FromQuery] string? country = null,
        [FromQuery] string? genre = null)
    {
        var result = await _animeService.GetAnimeListAsync(q, page, perPage, format, is3D, country, genre);
        return Ok(ApiResponse<PagedResult<AnimeCache>>.Ok(result, "Lấy danh sách anime thành công"));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var anime = await _animeService.GetAnimeByIdAsync(id);
        if (anime == null)
        {
            return NotFound(ApiResponse<AnimeCache?>.Fail("Không tìm thấy bộ phim này", 404));
        }

        return Ok(ApiResponse<AnimeCache>.Ok(anime, "Lấy thông tin chi tiết anime thành công"));
    }
}
