using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels;

namespace ProjectProgressManagementSystem.Services.Interfaces
{
    public interface IHolidayService
    {
        Task<IEnumerable<Holiday>> GetAllAsync(Region? region);
        Task<IEnumerable<PersonalHoliday>> GetAllAsync(int? userId, Region? region);
        Task<IEnumerable<Holiday>> GetAllAsync(int year, int? userId, Region? region);
        Task<IEnumerable<Holiday>> GetAllAsync(int year, int month, int? userId, Region? region);
        Task<HolidayViewModel> GetAsync(DateTime date, int? userId, Region? region);
        Task<HolidayViewModel> CreateAsync(HolidayBase holiday, int? userId, Region? region);
        //Task<MessageViewModel> CreateAllAsync(List<Holiday> holidays, int? userId);
        Task<HolidayViewModel> UpdateHolidayAsync(DateTime date, Region region, HolidayUpdateViewModel holiday);
        Task<HolidayViewModel> UpdatePersonalHolidayAsync(DateTime date, int userId, HolidayUpdateViewModel holiday);
        Task<MessageViewModel> ImportHolidaysFromExcelAsync(IFormFile excelFile);
        Task<MessageViewModel> ImportPersonalHolidaysFromExcelAsync(IFormFile excelFile);
        Task<MessageViewModel> DeleteAsync(DateTime date, int? userId, Region? region);
        Task<MessageViewModel> ResetHolidaysAsync();
        Task<MessageViewModel> ResetPersonalHolidaysAsync(); 
        Task<MessageViewModel> ResetAsync();
    }
}
