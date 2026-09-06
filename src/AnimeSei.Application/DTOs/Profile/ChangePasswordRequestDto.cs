namespace AnimeSei.Application.DTOs.Profile;

public class ChangePasswordRequestDto
{
    public required string OldPassword { get; set; }
    public required string NewPassword { get; set; }
    public required string ConfirmPassword { get; set; }
}
