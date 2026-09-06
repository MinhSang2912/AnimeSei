namespace AnimeSei.Application.DTOs.Border;

public class BorderDto
{
    public string Name { get; set; } = string.Empty;
    public string FrameUrl { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int RequiredPoints { get; set; }
    public string Description { get; set; } = string.Empty;
}
