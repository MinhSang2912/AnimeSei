using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeSei.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EpisodeController : ControllerBase
{
    private readonly IEpisodeService _episodeService;

    public EpisodeController(IEpisodeService episodeService)
    {
        _episodeService = episodeService;
    }

    [HttpGet("anime/{animeId:int}")]
    public async Task<IActionResult> GetEpisodesByAnime(int animeId)
    {
        var episodes = await _episodeService.GetEpisodesByAnimeIdAsync(animeId);
        return Ok(ApiResponse<List<Episode>>.Ok(episodes, "Lấy danh sách tập phim thành công"));
    }

    [HttpGet("anime/{animeId:int}/episodes/{episodeNumber:int}")]
    public async Task<IActionResult> GetEpisodeStream(int animeId, int episodeNumber)
    {
        var episode = await _episodeService.GetEpisodeStreamAsync(animeId, episodeNumber);
        if (episode == null)
        {
            return NotFound(ApiResponse<Episode?>.Fail("Không tìm thấy thông tin tập phim", 404));
        }

        return Ok(ApiResponse<Episode>.Ok(episode, "Lấy thông tin luồng phát tập phim thành công"));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateOrUpdateEpisode([FromBody] Episode episode)
    {
        if (episode.AnimeId <= 0 || episode.EpisodeNumber <= 0)
        {
            return BadRequest(ApiResponse<Episode?>.Fail("AnimeId và EpisodeNumber không hợp lệ", 400));
        }

        var result = await _episodeService.CreateOrUpdateEpisodeAsync(episode);
        return Ok(ApiResponse<Episode>.Ok(result, "Cập nhật tập phim thành công"));
    }
}
