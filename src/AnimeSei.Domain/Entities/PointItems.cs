namespace AnimeSei.Domain.Entities;

public class Badge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int RequiredPoints { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class Border
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string FrameUrl { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int RequiredPoints { get; set; }
    public string Description { get; set; } = string.Empty;
}
