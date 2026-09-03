using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Auth;
using AnimeSei.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.Application.Features.Auth.Commands;

public record RegisterCommand(string Username, string Email, string Password) : IRequest<ApiResponse<AuthResponseDto>>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, ApiResponse<AuthResponseDto>>
{
    private readonly IAnimeSeiDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtGenerator;

    public RegisterCommandHandler(IAnimeSeiDbContext context, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtGenerator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<ApiResponse<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
        {
            return ApiResponse<AuthResponseDto>.Fail("Email đã tồn tại trên hệ thống", 400);
        }

        if (await _context.Users.AnyAsync(u => u.Username == request.Username, cancellationToken))
        {
            return ApiResponse<AuthResponseDto>.Fail("Tên đăng nhập đã tồn tại", 400);
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = "User",
            Points = 0
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtGenerator.GenerateRefreshToken(user.Id);

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = new AuthResponseDto(
            user.Id,
            user.Username,
            user.Email,
            user.Role,
            accessToken,
            refreshToken.Token,
            user.Points,
            user.AvatarUrl
        );

        return ApiResponse<AuthResponseDto>.Ok(response, "Đăng ký tài khoản thành công");
    }
}
