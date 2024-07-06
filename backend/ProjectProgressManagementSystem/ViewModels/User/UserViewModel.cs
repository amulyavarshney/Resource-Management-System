using ProjectProgressManagementSystem.Models;

namespace ProjectProgressManagementSystem.ViewModels.User
{
    public class UserViewModel
    {
        public int Id { get; set; }
        public uint? EmpId { get; set; }
        public string? UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public bool IsExternal { get; set; }
        public bool IsPasswordProtected { get; set; }
        public Department Department {  get; set; }
        public Region Region { get; set; }
        public Role Role { get; set; }
        public int WorkHoursPerDay { get; set; }
        public int ParentId { get; set; }
        public DateTime? LastSavedTime { get; set; }
        public int? Week1Hours { get; set; }
        public int? Week2Hours { get; set; }
        public int? Week3Hours { get; set; }
        public int? Week4Hours { get; set; }
        public int? Week5Hours { get; set; }
    }
}