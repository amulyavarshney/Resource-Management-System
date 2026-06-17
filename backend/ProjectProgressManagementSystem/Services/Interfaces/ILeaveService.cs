using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.Leave;

namespace ProjectProgressManagementSystem.Services.Interfaces
{
    public interface ILeaveService
    {
        Task<IEnumerable<Leave>> GetAllAsync(DateTime? date);
        Task<IEnumerable<Leave>> GetAllAsync(int year, int month, int userId);
        Task<IEnumerable<Leave>> GetAllAsync(DateTime? date, int userId);
        Task<Leave> CreateAsync(LeaveCreateViewModel leave);
        Task<MessageViewModel> CreateAllAsync(List<LeaveCreateViewModel> leaves);
        Task<MessageViewModel> ImportFromExcelAsync(IFormFile excelFile);
        Task<MessageViewModel> DeleteAsync(DateTime date, int userId);
        Task<MessageViewModel> ResetAsync();
    }
}
