using AnimeSei.Domain.Enums;

namespace AnimeSei.Application.DTOs.PointShop;

public record BuyItemRequestDto(ItemType ItemType, Guid ItemId);
