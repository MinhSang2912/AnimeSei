namespace AnimeSei.Application.DTOs.Auth;

public record AuthResponseDto(
    Guid UserId,
    string Username,
    string Email,
    string Role,
    string AccessToken,
    string RefreshToken,
    int Points,
    string? AvatarUrl
);

public record RegisterRequestDto(string Username, string Email, string Password);

public record LoginRequestDto(string EmailOrUsername, string Password);
