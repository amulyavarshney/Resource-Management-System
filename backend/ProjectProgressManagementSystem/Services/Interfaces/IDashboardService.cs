using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels.Dashboard;

namespace ProjectProgressManagementSystem.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardViewModel> GetDashboardAsync(int year, int month, Department? department, Region? region);
        Task<ProjectDashboardViewModel> GetProjectDashboardAsync(int projectId);
        Task<ProjectDashboardViewModel> GetProjectDashboardAsync(int year, int month, int projectId);
        Task<IEnumerable<ProjectDashboardViewModel>> GetProjectDashboardAsync(int year, int month, Department? department, Region? region);
        Task<UserDashboardViewModel> GetUserDashboardAsync(int userId);
        Task<UserDashboardViewModel> GetUserDashboardAsync(int year, int month, int userId);
        Task<IEnumerable<UserDashboardViewModel>> GetUserDashboardAsync(int year, int month, Department? department, Region? region);
        Task<IEnumerable<UserDashboardViewModel>> GetUserDashboardUnderParentAsync(int year, int month, int parentId, Region? region);
        Task<IEnumerable<UserDashboardViewModel>> GetUsersWithUnfilledTimesheetAsync(int year, int month, Department? department, Region? region);
    }
}