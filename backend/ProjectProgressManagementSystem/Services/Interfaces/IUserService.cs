using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.User;

namespace ProjectProgressManagementSystem.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserViewModel>> GetAllAsync(Department? department, Region? region);
        Task<IEnumerable<UserViewModel>> GetManagersAsync(Department? department, Region? region);
        Task<IEnumerable<UserViewModel>> GetAllAsync(int year, int month, Department? department, Region? region);
        Task<IEnumerable<UserViewModel>> GetAllAsync(int year, int month, int parentId, Department? department, Region? region);
        Task<UserViewModel> GetByIdAsync(int id);
        Task<UserViewModel> CreateAsync(UserCreateViewModel user);
        Task<MessageViewModel> ImportFromExcelAsync(IFormFile excelFile);
        Task<UserViewModel> UpdateAsync(int id, UserUpdateViewModel user);
        Task<UserViewModel> UpdateLastSavedTimeAsync(int id, DateTime lastSavedTime);
        Task<MessageViewModel> UpdatePasswordAsync(int id, PasswordCreateViewModel password);
        Task<MessageViewModel> RemovePasswordAsync(int id, string password);
        Task<MessageViewModel> DeleteAsync(int id, bool? deleteNow);
        Task<MessageViewModel> ResetAsync();
    }
}