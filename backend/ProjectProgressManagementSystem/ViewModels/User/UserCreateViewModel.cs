using ProjectProgressManagementSystem.Models;
using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.ViewModels.User
{
    public class UserCreateViewModel
    {
        public uint? EmpId { get; set; }

        [MaxLength(50)]
        public string FirstName { get; set; }

        [MaxLength(50)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$")]
        public string Email { get; set; }

        [MinLength(8)]
        [MaxLength(20)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")]
        public string? Password { get; set; } = null;

        [Required]
        public Department Department { get; set; }

        [Required]
        public Region Region { get; set; }

        public Role Role { get; set; } = Role.Employee;

        [Range(1, 12)]
        public int WorkHoursPerDay { get; set; } = 8;

        public int ParentId { get; set; } = 0;
    }
}