using ProjectProgressManagementSystem.Models;
using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.ViewModels.User
{
    public class UserUpdateViewModel
    {
        public uint? EmpId { get; set; }
        [MaxLength(50)]
        public string? UserName { get; set; }
        [MaxLength(50)]
        public string? FirstName { get; set; }

        [MaxLength(50)]
        public string? LastName { get; set; }

        [EmailAddress]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$")]
        public string? Email { get; set; }
        public Department? Department { get; set; }
        public Region? Region { get; set; }
        public Role? Role { get; set; }
        public int? WorkHoursPerDay { get; set; }
        public int? ParentId { get; set; }
        public DateTime? LastSavedTime { get; set; }
    }
}