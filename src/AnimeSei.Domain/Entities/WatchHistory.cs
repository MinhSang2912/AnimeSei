namespace AnimeSei.Domain.Entities;

public class WatchHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int AnimeId { get; set; }
    public int EpisodeNumber { get; set; }
    public int WatchedProgressSeconds { get; set; }
    public int TotalDurationSeconds { get; set; }
    public bool PointAwarded { get; set; } = false;
    public DateTime LastWatchedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
