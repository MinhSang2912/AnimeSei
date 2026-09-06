using AnimeSei.Application.Common.Interfaces;
using AnimeSei.Application.Common.Models;
using AnimeSei.Application.DTOs.Profile;
using Microsoft.AspNetCore.Mvc;

namespace AnimeSei.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var profileData = await _profileService.GetProfileAsync(userId);
        if (profileData == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy người dùng", 404));

        return Ok(ApiResponse<UserProfileDto>.Ok(profileData, "Lấy thông tin cá nhân thành công"));
    }

    [HttpPost("upload-avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<string>.Fail("Vui lòng chọn file hình ảnh", 400));
        }

        using var stream = file.OpenReadStream();
        var avatarUrl = await _profileService.UploadAvatarAsync(userId, stream, file.FileName, file.ContentType);

        if (avatarUrl == null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy người dùng", 404));

        return Ok(ApiResponse<object>.Ok(new { avatarUrl }, "Tải ảnh avatar lên Supabase Storage thành công!"));
    }

    [HttpPost("equip")]
    public async Task<IActionResult> EquipItem([FromBody] EquipItemRequestDto request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var success = await _profileService.EquipItemAsync(userId, request);
        if (!success) return NotFound(ApiResponse<string>.Fail("Không tìm thấy người dùng", 404));

        return Ok(ApiResponse<string>.Ok("Trang bị vật phẩm thành công!"));
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var (isSuccess, errorMessage, updatedUser) = await _profileService.UpdateProfileAsync(userId, request);
        
        if (!isSuccess)
        {
            if (errorMessage == "Không tìm thấy người dùng") return NotFound(ApiResponse<string>.Fail(errorMessage, 404));
            return BadRequest(ApiResponse<string>.Fail(errorMessage, 400));
        }

        return Ok(ApiResponse<object>.Ok(new { updatedUser!.Username, updatedUser.Email }, "Cập nhật thông tin thành công"));
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(ApiResponse<string>.Fail("Mật khẩu xác nhận không khớp", 400));
        }
        
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.Fail("Vui lòng đăng nhập", 401));
        }

        var (isSuccess, errorMessage) = await _profileService.ChangePasswordAsync(userId, request);
        
        if (!isSuccess)
        {
            if (errorMessage == "Không tìm thấy người dùng") return NotFound(ApiResponse<string>.Fail(errorMessage, 404));
            return BadRequest(ApiResponse<string>.Fail(errorMessage, 400));
        }

        return Ok(ApiResponse<string>.Ok("Đổi mật khẩu thành công"));
    }
}
