using AnimeSei.Application.DTOs.Admin;
using AnimeSei.Domain.Entities;
using AutoMapper;

namespace AnimeSei.Application.Common.Mappings;

public class AdminMappingProfile : Profile
{
    public AdminMappingProfile()
    {
        CreateMap<UpdateAnimeRequest, AnimeCache>()
            .ForMember(dest => dest.TitleRomaji, opt => opt.Condition(src => !string.IsNullOrWhiteSpace(src.TitleRomaji)))
            .ForMember(dest => dest.TitleEnglish, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.TitleEnglish) ? null : src.TitleEnglish.Trim()))
            .ForMember(dest => dest.TitleNative, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.TitleNative) ? null : src.TitleNative.Trim()))
            .ForMember(dest => dest.CoverImage, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.CoverImage) ? null : src.CoverImage.Trim()))
            .ForMember(dest => dest.BannerImage, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.BannerImage) ? null : src.BannerImage.Trim()))
            .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.StartDate) ? null : src.StartDate.Trim()))
            .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.EndDate) ? null : src.EndDate.Trim()))
            .ForMember(dest => dest.TrailerSite, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.TrailerSite) ? null : src.TrailerSite.Trim()))
            .ForMember(dest => dest.TrailerId, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.TrailerId) ? null : src.TrailerId.Trim()))
            // Keep specific properties untouched if they are null in the request
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<User, UserAdminDto>();
    }
}
