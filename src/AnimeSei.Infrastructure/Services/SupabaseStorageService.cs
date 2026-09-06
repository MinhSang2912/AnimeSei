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
        var bucketName = (_config["Supabase:Bucket"] ?? "avatars").ToLower();

        if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey) || supabaseUrl.Contains("YOUR_SUPABASE"))
        {
            throw new Exception("Cấu hình Supabase Url hoặc Key chưa đúng trong appsettings.json");
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
            if (string.IsNullOrEmpty(extension)) extension = ".png";
            var path = $"{userId}_{DateTime.UtcNow.Ticks}{extension}";

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
        catch (Exception ex)
        {
            Console.WriteLine($"[SupabaseAvatarUploadError] Upload failed to bucket '{bucketName}': {ex}");
            throw new Exception($"Không thể tải ảnh avatar lên Supabase Storage (Bucket: '{bucketName}'). Chi tiết: {ex.Message}");
        }
    }

    public async Task<string> UploadItemImageAsync(Stream fileStream, string fileName, string contentType, string folder = "items")
    {
        var supabaseUrl = _config["Supabase:Url"];
        var supabaseKey = _config["Supabase:Key"];
        // Đặt tên bucket chính xác bằng chữ thường phân biệt Badges vs Borders (Quy chuẩn Supabase Storage)
        var targetBucket = folder.ToLower() switch
        {
            "badges" => "badges",
            "borders" => "borders",
            _ => (_config["Supabase:Bucket"] ?? "avatars").ToLower()
        };

        if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey) || supabaseUrl.Contains("YOUR_SUPABASE"))
        {
            throw new Exception("Cấu hình Supabase Url hoặc Key chưa đúng trong appsettings.json");
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
            var path = $"{Guid.NewGuid()}_{DateTime.UtcNow.Ticks}{extension}";

            using var memoryStream = new MemoryStream();
            await fileStream.CopyToAsync(memoryStream);
            var bytes = memoryStream.ToArray();

            await client.Storage.From(targetBucket).Upload(bytes, path, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = true
            });

            return client.Storage.From(targetBucket).GetPublicUrl(path);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SupabaseStorageError] Upload failed to bucket '{targetBucket}': {ex}");
            throw new Exception($"Không thể tải ảnh lên Supabase Storage (Bucket: '{targetBucket}'). Chi tiết: {ex.Message}");
        }
    }
}


