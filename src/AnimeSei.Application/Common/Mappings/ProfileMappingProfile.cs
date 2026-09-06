using AnimeSei.Application.DTOs.Profile;
using AnimeSei.Domain.Entities;
using AutoMapper;

namespace AnimeSei.Application.Common.Mappings;

public class ProfileMappingProfile : Profile
{
    public ProfileMappingProfile()
    {
        CreateMap<UpdateProfileRequestDto, User>()
            .ForMember(dest => dest.Username, opt => opt.Condition(src => !string.IsNullOrWhiteSpace(src.Username)))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username!.Trim()))
            .ForMember(dest => dest.Email, opt => opt.Condition(src => !string.IsNullOrWhiteSpace(src.Email)))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email!.Trim()))
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<User, UserProfileDto>();
    }
}
