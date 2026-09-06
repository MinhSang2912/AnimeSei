using AnimeSei.Application.DTOs.Border;
using AnimeSei.Domain.Entities;
using AutoMapper;

namespace AnimeSei.Application.Common.Mappings;

public class BorderProfile : Profile
{
    public BorderProfile()
    {
        CreateMap<BorderDto, Border>();
        CreateMap<Border, BorderDto>();
    }
}
