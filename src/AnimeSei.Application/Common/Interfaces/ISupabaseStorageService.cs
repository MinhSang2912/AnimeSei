namespace AnimeSei.Application.Common.Interfaces;

public interface ISupabaseStorageService
{
    Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType);
    Task<string> UploadItemImageAsync(Stream fileStream, string fileName, string contentType, string folder = "items");
}
