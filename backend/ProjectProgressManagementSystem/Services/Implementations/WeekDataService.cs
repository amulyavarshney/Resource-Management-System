using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.DataAccess;
using ProjectProgressManagementSystem.Exceptions;
using ProjectProgressManagementSystem.Utilities;
using ProjectProgressManagementSystem.Maps.ModelMappers;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.WeekData;
using System.Data;

namespace ProjectProgressManagementSystem.Services.Implementations
{
    public class WeekDataService : IWeekDataService
    {
        private readonly ApplicationDbContext _context;
        public WeekDataService(ApplicationDbContext context)
        {
            _context = context;
        }

        // get all week data
        public async Task<IEnumerable<WeekData>> GetAllAsync()
        {
            return await _context.WeekData.ToListAsync();
        }

        // get all week data by Year and Month
        public async Task<IEnumerable<WeekData>> GetByYearAndMonthAsync(int year, int month)
        {
            var workHoursEntity = await _context.WeekData.Where(wh => wh.Year == year && wh.Month == month).ToListAsync();
            if (workHoursEntity == null)
                throw new RecordNotFoundException($"Could not find week data for {month}, {year}");
            return workHoursEntity;
        }

        // get week data by WeekDataKey
        public async Task<WeekDataViewModel> GetByIdAsync(WeekDataKey key)
        {
            var workHoursEntity = await FromId(key);
            return ViewModelMapper.ToViewModel(workHoursEntity);
        }

        // create week data by WeekDataKey
        public async Task<WeekDataViewModel> CreateAsync(WeekDataKey key, WeekDataViewModel workHours)
        {
            var workHoursEntity = EntityModelMapper.ToEntity(key, workHours);
            await _context.WeekData.AddAsync(workHoursEntity);
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(workHoursEntity);
        }

        // import week data from excel
        public async Task<MessageViewModel> ImportFromExcelAsync(IFormFile excelFile)
        {
            try
            {
                // Validate the file
                if (excelFile == null || excelFile.Length == 0)
                {
                    throw new ArgumentException("Excel file is required.");
                }

                var dataTable = ExcelReader.ReadExcelFile(excelFile);
                var workHours = new List<WeekData>();

                foreach (DataRow row in dataTable.Rows)
                {
                    var weekData = new WeekData
                    {
                        Year = Parser.ParseInt(row, "Year"),
                        Month = Parser.ParseInt(row, "Month"),
                        UserId = Parser.ParseInt(row, "UserId"),
                        ProjectId = Parser.ParseInt(row, "ProjectId"),
                        Week1 = Parser.ParseInt(row, "Week1"),
                        Week2 = Parser.ParseInt(row, "Week2"),
                        Week3 = Parser.ParseInt(row, "Week3"),
                        Week4 = Parser.ParseInt(row, "Week4"),
                        Week5 = Parser.ParseWeekData(row),
                    };
                    workHours.Add(weekData);
                }
                // Add work hours to the database
                await _context.WeekData.AddRangeAsync(workHours);
                await _context.SaveChangesAsync();

                return new MessageViewModel
                {
                    Message = "Work Hours imported successfully."
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error importing work hours from Excel: {ex}");
            }
        }

        // update an existing week data by WeekDataKey
        public async Task<WeekDataViewModel> UpdateAsync(WeekDataKey key, WeekDataViewModel workHours)
        {
            var workHoursEntity = await _context.WeekData.FirstOrDefaultAsync(w => w.UserId == key.UserId && w.ProjectId == key.ProjectId && w.Year == key.Year && w.Month == key.Month);

            if (workHoursEntity == null)
            {
                // Add a new entry to the database
                workHoursEntity = EntityModelMapper.ToEntity(key, workHours);
                await _context.WeekData.AddAsync(workHoursEntity);
            }
            else
            {
                workHoursEntity.Week1 = workHours.Week1;
                workHoursEntity.Week2 = workHours.Week2;
                workHoursEntity.Week3 = workHours.Week3;
                workHoursEntity.Week4 = workHours.Week4;
                workHoursEntity.Week5 = workHours.Week5 == null ? workHoursEntity.Week5 : workHours.Week5;
            }

            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(workHoursEntity);
        }

        // delete a weekData
        public async Task<WeekDataViewModel> DeleteAsync(WeekDataKey key)
        {
            var data = await _context.WeekData.FirstAsync(wh => wh.UserId == key.UserId && wh.ProjectId == key.ProjectId && wh.Year == key.Year && wh.Month == key.Month);
            _context.WeekData.Remove(data);
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(data);
        }

        // reset weekData table
        public async Task<MessageViewModel> ResetAsync()
        {
            await _context.WeekData.ExecuteDeleteAsync();
            return new MessageViewModel
            {
                Message = "WeekData table reset successfully."
            };
        }

        private async Task<WeekData> FromId(WeekDataKey key)
        {
            var workHoursEntity = await _context.WeekData.FirstOrDefaultAsync(wh => wh.UserId == key.UserId && wh.ProjectId == key.ProjectId && wh.Year == key.Year && wh.Month == key.Month);
            return workHoursEntity ?? new WeekData
            {
                Month = key.Month,
                Year = key.Year,
                UserId = key.UserId,
                ProjectId = key.ProjectId,
                Week1 = 0,
                Week2 = 0,
                Week3 = 0,
                Week4 = 0,
                Week5 = 0,
            };
        }
    }
}
