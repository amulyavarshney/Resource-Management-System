using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.WeekData;

namespace ProjectProgressManagementSystem.Services.Interfaces
{
    public interface IWeekDataService
    {
        Task<IEnumerable<WeekData>> GetAllAsync();
        Task<WeekDataViewModel> GetByIdAsync(WeekDataKey key);
        Task<IEnumerable<WeekData>> GetByYearAndMonthAsync(int year, int month);
        Task<WeekDataViewModel> CreateAsync(WeekDataKey key, WeekDataViewModel workHours);
        Task<MessageViewModel> ImportFromExcelAsync(IFormFile excelFile);
        Task<WeekDataViewModel> UpdateAsync(WeekDataKey key, WeekDataViewModel workHours);
        Task<WeekDataViewModel> DeleteAsync(WeekDataKey key);
        Task<MessageViewModel> ResetAsync();
    }
}
