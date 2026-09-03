namespace AnimeSei.Application.Common.Interfaces;

public interface ISupabaseStorageService
{
    Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType);
}
