using AnimeSei.Domain.Enums;

namespace AnimeSei.Application.DTOs.Profile;

public record EquipItemRequestDto(ItemType ItemType, Guid? ItemId);
