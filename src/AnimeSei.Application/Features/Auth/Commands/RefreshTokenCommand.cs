using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AnimeSei.Application.Features.Auth.Commands;

public record RefreshTokenCommand(string AccessToken, string RefreshToken) : IRequest<ApiResponse<AuthResponseDto>>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, ApiResponse<AuthResponseDto>>
{
    private readonly IAnimeSeiDbContext _context;
    private readonly IJwtTokenGenerator _jwtGenerator;

    public RefreshTokenCommandHandler(IAnimeSeiDbContext context, IJwtTokenGenerator jwtGenerator)
    {
        _context = context;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<ApiResponse<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var existingToken = await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == request.RefreshToken, cancellationToken);

        if (existingToken == null || existingToken.IsRevoked || existingToken.ExpiresAt < DateTime.UtcNow)
        {
            return ApiResponse<AuthResponseDto>.Fail("RefreshToken không hợp lệ hoặc đã hết hạn", 401);
        }

        var user = existingToken.User;
        if (user == null)
        {
            return ApiResponse<AuthResponseDto>.Fail("Không tìm thấy người dùng", 404);
        }

        // Revoke current token & generate new pair
        existingToken.IsRevoked = true;
        var newAccessToken = _jwtGenerator.GenerateAccessToken(user);
        var newRefreshToken = _jwtGenerator.GenerateRefreshToken(user.Id);

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = new AuthResponseDto(
            user.Id,
            user.Username,
            user.Email,
            user.Role,
            newAccessToken,
            newRefreshToken.Token,
            user.Points,
            user.AvatarUrl
        );

        return ApiResponse<AuthResponseDto>.Ok(response, "Lấy lại AccessToken thành công");
    }
}
