using AnimeSei.Domain.Entities;

namespace AnimeSei.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(Guid userId);
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}
