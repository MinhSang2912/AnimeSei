namespace AnimeSei.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = "User";
    public int Points { get; set; } = 0;
    public Guid? CurrentBadgeId { get; set; }
    public Guid? CurrentBorderId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<WatchHistory> WatchHistories { get; set; } = new List<WatchHistory>();
    public ICollection<UserInventory> Inventories { get; set; } = new List<UserInventory>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
}
