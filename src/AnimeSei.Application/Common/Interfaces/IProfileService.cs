using AnimeSei.Application.DTOs.Profile;
using AnimeSei.Domain.Entities;

namespace AnimeSei.Application.Common.Interfaces;

public interface IProfileService
{
    Task<UserProfileDto?> GetProfileAsync(Guid userId);
    Task<string?> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType);
    Task<bool> EquipItemAsync(Guid userId, EquipItemRequestDto request);
    Task<(bool IsSuccess, string ErrorMessage, User? UpdatedUser)> UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request);
    Task<(bool IsSuccess, string ErrorMessage)> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request);
}
