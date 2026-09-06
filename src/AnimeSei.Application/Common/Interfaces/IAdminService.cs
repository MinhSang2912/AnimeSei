using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Admin;
using AnimeSei.Domain.Entities;

namespace AnimeSei.Application.Common.Interfaces;

public interface IAdminService
{
    Task<AdminStatsDto> GetSystemStatsAsync();
    Task<List<UserAdminDto>> GetUsersAsync();
    Task<PagedResult<AnimeCache>> GetAnimeListAsync(string? q, string? format, string? country, string? genre, string? status, int page, int perPage);
    Task<List<string>> GetGenresAsync();
    Task<AnimeCache?> UpdateAnimeAsync(int id, UpdateAnimeRequest request);
}
