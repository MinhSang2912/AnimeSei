namespace AnimeSei.Domain.Entities;

public class Episode
{
    public int Id { get; set; }
    public int AnimeId { get; set; } // Foreign key referencing AnimeCache.Id (AniList ID)
    public int EpisodeNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? EmbedUrl { get; set; } // URL iframe nhúng trực tiếp (từ Consumet, VIP embed, YouTube, Gogo...)
    public string? HlsUrl { get; set; }   // Link luồng phát HLS (.m3u8) nếu lấy được stream trực tiếp
    public string ServerName { get; set; } = "Consumet VIP"; // Tên server / provider
    public string? SubtitlesJson { get; set; } // JSON chứa danh sách subtitle (vtt / srt)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [System.Text.Json.Serialization.JsonIgnore]
    public AnimeCache? Anime { get; set; }
}
