namespace AnimeSei.Application.DTOs.Badge;

public class BadgeDto
{
    public string Name { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int RequiredPoints { get; set; }
    public string Description { get; set; } = string.Empty;
}
