using AutoMapper;
using AnimeSei.Domain.Entities;

namespace AnimeSei.Application.Common.Mappings;

public class AnimeCacheProfile : Profile
{
    public AnimeCacheProfile()
    {
        CreateMap<AnimeCache, AnimeCache>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Relations, opt => opt.Ignore())
            .ForMember(dest => dest.LastSyncedAt, opt => opt.Ignore());
    }
}
