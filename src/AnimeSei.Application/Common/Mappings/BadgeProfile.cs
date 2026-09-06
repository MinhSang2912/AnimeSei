using AnimeSei.Application.DTOs.Badge;
using AnimeSei.Domain.Entities;
using AutoMapper;

namespace AnimeSei.Application.Common.Mappings;

public class BadgeProfile : Profile
{
    public BadgeProfile()
    {
        CreateMap<BadgeDto, Badge>();
        CreateMap<Badge, BadgeDto>();
    }
}
