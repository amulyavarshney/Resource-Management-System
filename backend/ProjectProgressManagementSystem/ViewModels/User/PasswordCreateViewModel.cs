using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.ViewModels.User
{
    public class PasswordCreateViewModel
    {
        public string? OldPassword { get; set; } = null;

        [MinLength(8)]
        [MaxLength(20)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")]
        public string NewPassword { get; set; }
    }
}