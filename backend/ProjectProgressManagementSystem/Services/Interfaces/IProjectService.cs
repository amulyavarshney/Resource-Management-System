using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.Project;

namespace ProjectProgressManagementSystem.Services.Interfaces
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectViewModel>> GetAllAsync(Department? department, Region? region);
        Task<IEnumerable<ProjectViewModel>> GetAllAsync(int year, int month, Department? department, Region? region);
        Task<ProjectViewModel> GetByIdAsync(int id);
        Task<ProjectViewModel> CreateAsync(ProjectCreateViewModel project);
        Task<MessageViewModel> ImportFromExcelAsync(IFormFile excelFile);
        Task<ProjectViewModel> UpdateAsync(int id, ProjectUpdateViewModel project);
        Task<MessageViewModel> DeleteAsync(int id, bool? deleteNow);
        Task<MessageViewModel> ResetAsync();
    }
}
