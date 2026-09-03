using AnimeSei.Domain.Enums;

namespace AnimeSei.Domain.Entities;

public class UserInventory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ItemType ItemType { get; set; }
    public Guid ItemId { get; set; }
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int AnimeId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}

public class Rating
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int AnimeId { get; set; }
    public int Score { get; set; } // 1 to 10
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
