namespace AnimeSei.Application.DTOs.WatchHistory;

public record SaveProgressRequestDto(int AnimeId, int EpisodeNumber, int WatchedProgressSeconds, int TotalDurationSeconds);
