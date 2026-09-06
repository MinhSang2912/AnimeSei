namespace AnimeSei.Application.DTOs.Admin;

public class UpdateAnimeRequest
{
    public string TitleRomaji { get; set; } = string.Empty;
    public string? TitleEnglish { get; set; }
    public string? TitleNative { get; set; }
    public string? Description { get; set; }
    public string? CoverImage { get; set; }
    public string? BannerImage { get; set; }
    public int? Episodes { get; set; }
    public int? CurrentEpisodes { get; set; }
    public string? Status { get; set; }
    public string? Format { get; set; }
    public string? CountryOfOrigin { get; set; }
    public bool Is3D { get; set; }
    public List<string>? Genres { get; set; }
    public int? AverageScore { get; set; }
    public int? SeasonYear { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? TrailerSite { get; set; }
    public string? TrailerId { get; set; }
}
