using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Admin;
using AnimeSei.Domain.Entities;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly IAnimeSeiDbContext _context;
    private readonly IMapper _mapper;

    public AdminService(IAnimeSeiDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<AdminStatsDto> GetSystemStatsAsync()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalCachedAnime = await _context.AnimeCaches.CountAsync();
        var totalWatchHistory = await _context.WatchHistories.CountAsync();
        var totalComments = await _context.Comments.CountAsync();

        return new AdminStatsDto
        {
            TotalUsers = totalUsers,
            TotalCachedAnime = totalCachedAnime,
            TotalWatchHistory = totalWatchHistory,
            TotalComments = totalComments
        };
    }

    public async Task<List<UserAdminDto>> GetUsersAsync()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
            
        return _mapper.Map<List<UserAdminDto>>(users);
    }

    public async Task<PagedResult<AnimeCache>> GetAnimeListAsync(string? q, string? format, string? country, string? genre, string? status, int page, int perPage)
    {
        page = Math.Max(1, page);
        perPage = Math.Clamp(perPage, 1, 100);

        var query = _context.AnimeCaches.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.Trim().ToLower();
            query = query.Where(a => 
                EF.Functions.Like(a.TitleRomaji.ToLower(), $"%{search}%") ||
                (a.TitleEnglish != null && EF.Functions.Like(a.TitleEnglish.ToLower(), $"%{search}%")) ||
                (a.TitleNative != null && EF.Functions.Like(a.TitleNative.ToLower(), $"%{search}%")));
        }

        if (!string.IsNullOrWhiteSpace(format) && !string.Equals(format, "ALL", StringComparison.OrdinalIgnoreCase))
        {
            var fmtUpper = format.ToUpper();
            query = query.Where(a => a.Format != null && a.Format.ToUpper() == fmtUpper);
        }

        if (!string.IsNullOrWhiteSpace(country) && !string.Equals(country, "ALL", StringComparison.OrdinalIgnoreCase))
        {
            var countryUpper = country.ToUpper();
            query = query.Where(a => a.CountryOfOrigin != null && a.CountryOfOrigin.ToUpper() == countryUpper);
        }

        if (!string.IsNullOrWhiteSpace(genre) && !string.Equals(genre, "ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(a => a.Genres.Contains(genre));
        }

        if (!string.IsNullOrWhiteSpace(status) && !string.Equals(status, "ALL", StringComparison.OrdinalIgnoreCase))
        {
            var statusUpper = status.ToUpper();
            query = query.Where(a => a.Status != null && a.Status.ToUpper() == statusUpper);
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.Id)
            .Skip((page - 1) * perPage)
            .Take(perPage)
            .ToListAsync();

        return new PagedResult<AnimeCache>
        {
            Items = items,
            CurrentPage = page,
            Total = totalItems,
            LastPage = (int)Math.Ceiling((double)totalItems / perPage),
            HasNextPage = page * perPage < totalItems
        };
    }

    public async Task<List<string>> GetGenresAsync()
    {
        var rawGenres = await _context.AnimeCaches
            .AsNoTracking()
            .Select(a => a.Genres)
            .ToListAsync();

        return rawGenres
            .SelectMany(g => g)
            .Where(g => !string.IsNullOrWhiteSpace(g))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(g => g)
            .ToList();
    }

    public async Task<AnimeCache?> UpdateAnimeAsync(int id, UpdateAnimeRequest request)
    {
        var anime = await _context.AnimeCaches.FirstOrDefaultAsync(a => a.Id == id);
        if (anime == null)
        {
            return null;
        }

        _mapper.Map(request, anime);
        
        if (!string.IsNullOrWhiteSpace(request.Status)) anime.Status = request.Status.Trim().ToUpper();
        if (!string.IsNullOrWhiteSpace(request.Format)) anime.Format = request.Format.Trim().ToUpper();
        if (!string.IsNullOrWhiteSpace(request.CountryOfOrigin)) anime.CountryOfOrigin = request.CountryOfOrigin.Trim().ToUpper();
        
        anime.LastSyncedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(default);

        return anime;
    }
}
