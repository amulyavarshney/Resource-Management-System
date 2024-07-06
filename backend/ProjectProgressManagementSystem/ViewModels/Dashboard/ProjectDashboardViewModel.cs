using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels.User;

namespace ProjectProgressManagementSystem.ViewModels.Dashboard
{
    public class ProjectDashboardViewModel
    {
        public int ProjectId {  get; set; }
        public string ProjectNumber {  get; set; }
        public string ProjectTitle { get; set; }
        public string? Business { get; set; }
        public Department Department { get; set; }
        public Region Region { get; set; }
        public string? Description { get; set; }
        public int TotalIntUsers { get; set; }
        public int TotalExtUsers { get; set; }
        public int TotalUsers { get; set; }
        public int TotalIntWorkHours { get; set; }
        public int TotalExtWorkHours { get; set; }
        public int TotalWorkHours { get; set; }
        public List<UserViewModel>? Users { get; set; }
    }
}
