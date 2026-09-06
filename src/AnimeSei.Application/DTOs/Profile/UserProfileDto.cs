using AnimeSei.Domain.Entities;

namespace AnimeSei.Application.DTOs.Profile;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int Points { get; set; }
    public string? AvatarUrl { get; set; }
    public AnimeSei.Domain.Entities.Badge? CurrentBadge { get; set; }
    public AnimeSei.Domain.Entities.Border? CurrentBorder { get; set; }
    public List<AnimeSei.Domain.Entities.Badge> OwnedBadges { get; set; } = new();
    public List<AnimeSei.Domain.Entities.Border> OwnedBorders { get; set; } = new();
}
