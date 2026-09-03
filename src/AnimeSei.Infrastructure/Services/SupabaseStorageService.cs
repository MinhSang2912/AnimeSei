using AnimeSei.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Supabase;

namespace AnimeSei.Infrastructure.Services;

public class SupabaseStorageService : ISupabaseStorageService
{
    private readonly IConfiguration _config;

    public SupabaseStorageService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType)
    {
        var supabaseUrl = _config["Supabase:Url"];
        var supabaseKey = _config["Supabase:Key"];
        var bucketName = _config["Supabase:Bucket"] ?? "avatars";

        if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey) || supabaseUrl.Contains("YOUR_SUPABASE"))
        {
            // Placeholder fallback when Supabase keys are not set yet
            return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
        }

        try
        {
            var options = new SupabaseOptions
            {
                AutoRefreshToken = true,
                AutoConnectRealtime = false
            };

            var client = new Client(supabaseUrl, supabaseKey, options);
            await client.InitializeAsync();

            var extension = Path.GetExtension(fileName);
            var path = $"avatars/{userId}_{DateTime.UtcNow.Ticks}{extension}";

            using var memoryStream = new MemoryStream();
            await fileStream.CopyToAsync(memoryStream);
            var bytes = memoryStream.ToArray();

            await client.Storage.From(bucketName).Upload(bytes, path, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = true
            });

            return client.Storage.From(bucketName).GetPublicUrl(path);
        }
        catch
        {
            // Fallback for dev / offline placeholder avatar URL
            return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
        }
    }
}
