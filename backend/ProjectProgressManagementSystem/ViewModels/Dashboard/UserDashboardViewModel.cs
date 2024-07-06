using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels.Project;

namespace ProjectProgressManagementSystem.ViewModels.Dashboard
{
    public class UserDashboardViewModel
    {
        public int UserId { get; set; }
        public uint? EmpId { get; set; }
        public string? UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public bool IsExternal { get; set; }
        public Department Department { get; set; }
        public Role Role { get; set; }
        public int WorkHoursPerDay { get; set; }
        public int ParentId { get; set; }
        public Region Region { get; set; }
        public DateTime? LastSavedTime { get; set; }
        public int TotalProjects { get; set; }
        public int TotalWeek1Hours { get; set; }
        public int TotalWeek2Hours { get; set; }
        public int TotalWeek3Hours { get; set; }
        public int TotalWeek4Hours { get; set; }
        public int? TotalWeek5Hours { get; set; }
        public List<ProjectViewModel>? Projects { get; set; }
    }
}
