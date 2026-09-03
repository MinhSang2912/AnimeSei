namespace AnimeSei.Domain.Entities;

public class AnimeCache
{
    public int Id { get; set; } // AniList ID
    public string TitleRomaji { get; set; } = string.Empty;
    public string? TitleEnglish { get; set; }
    public string? TitleNative { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public string? BannerImage { get; set; }
    public int? Episodes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Format { get; set; }
    public string? CountryOfOrigin { get; set; }
    public bool Is3D { get; set; } = false;
    public List<string> Genres { get; set; } = new();
    public int? AverageScore { get; set; }
    public int? SeasonYear { get; set; }
    public string? StartDate { get; set; }
    public string? TrailerSite { get; set; }
    public string? TrailerId { get; set; }
    public List<AnimeRelationDto>? Relations { get; set; } = new();
    public int ViewCount { get; set; } = 0;
    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
}

public class AnimeRelationDto
{
    public int Id { get; set; }
    public string RelationType { get; set; } = string.Empty; // e.g. SEQUEL, PREQUEL, SIDE_STORY, PARENT
    public string Title { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public string? Format { get; set; }
    public int? SeasonYear { get; set; }
}
