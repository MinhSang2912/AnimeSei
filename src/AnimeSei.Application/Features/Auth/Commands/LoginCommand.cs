using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.Application.Features.Auth.Commands;

public record LoginCommand(string EmailOrUsername, string Password) : IRequest<ApiResponse<AuthResponseDto>>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, ApiResponse<AuthResponseDto>>
{
    private readonly IAnimeSeiDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtGenerator;

    public LoginCommandHandler(IAnimeSeiDbContext context, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtGenerator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<ApiResponse<AuthResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(
            u => u.Email == request.EmailOrUsername || u.Username == request.EmailOrUsername,
            cancellationToken);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return ApiResponse<AuthResponseDto>.Fail("Tên đăng nhập/Email hoặc mật khẩu không chính xác", 400);
        }

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

        return ApiResponse<AuthResponseDto>.Ok(response, "Đăng nhập thành công");
    }
}
