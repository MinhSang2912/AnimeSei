using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.DTOs.Profile;
using AnimeSei.Domain.Entities;
using AnimeSei.Domain.Enums;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly IAnimeSeiDbContext _context;
    private readonly ISupabaseStorageService _storageService;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;

    public ProfileService(IAnimeSeiDbContext context, ISupabaseStorageService storageService, IMapper mapper, IPasswordHasher passwordHasher)
    {
        _context = context;
        _storageService = storageService;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Inventories)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        var currentBadge = user.CurrentBadgeId.HasValue ? await _context.Badges.FindAsync(user.CurrentBadgeId.Value) : null;
        var currentBorder = user.CurrentBorderId.HasValue ? await _context.Borders.FindAsync(user.CurrentBorderId.Value) : null;

        var inventoryItemIds = user.Inventories.Select(i => i.ItemId).ToList();
        var ownedBadges = await _context.Badges.Where(b => inventoryItemIds.Contains(b.Id)).ToListAsync();
        var ownedBorders = await _context.Borders.Where(b => inventoryItemIds.Contains(b.Id)).ToListAsync();

        var profileDto = _mapper.Map<UserProfileDto>(user);
        profileDto.CurrentBadge = currentBadge;
        profileDto.CurrentBorder = currentBorder;
        profileDto.OwnedBadges = ownedBadges;
        profileDto.OwnedBorders = ownedBorders;

        return profileDto;
    }

    public async Task<string?> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        var avatarUrl = await _storageService.UploadAvatarAsync(userId, fileStream, fileName, contentType);

        user.AvatarUrl = avatarUrl;
        await _context.SaveChangesAsync(default);

        return avatarUrl;
    }

    public async Task<bool> EquipItemAsync(Guid userId, EquipItemRequestDto request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        if (request.ItemType == ItemType.Badge)
        {
            user.CurrentBadgeId = request.ItemId;
        }
        else
        {
            user.CurrentBorderId = request.ItemId;
        }

        await _context.SaveChangesAsync(default);
        return true;
    }

    public async Task<(bool IsSuccess, string ErrorMessage, User? UpdatedUser)> UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return (false, "Không tìm thấy người dùng", null);

        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            var usernameExists = await _context.Users.AnyAsync(u => u.Id != userId && u.Username.ToLower() == request.Username.Trim().ToLower());
            if (usernameExists)
            {
                return (false, "Tên người dùng đã tồn tại", null);
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Id != userId && u.Email == request.Email.Trim());
            if (emailExists)
            {
                return (false, "Email đã được sử dụng bởi người dùng khác", null);
            }
        }

        _mapper.Map(request, user);

        await _context.SaveChangesAsync(default);
        return (true, string.Empty, user);
    }

    public async Task<(bool IsSuccess, string ErrorMessage)> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return (false, "Không tìm thấy người dùng");

        if (!_passwordHasher.VerifyPassword(request.OldPassword, user.PasswordHash))
        {
            return (false, "Mật khẩu cũ không chính xác");
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync(default);

        return (true, string.Empty);
    }
}
