using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.DataAccess;
using ProjectProgressManagementSystem.Exceptions;
using ProjectProgressManagementSystem.Utilities;
using ProjectProgressManagementSystem.Maps.ModelMappers;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.Holiday;
using System.Data;

namespace ProjectProgressManagementSystem.Services.Implementations
{
    public class HolidayService : IHolidayService
    {
        private readonly ApplicationDbContext _context;
        public HolidayService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Holiday>> GetAllAsync(Region? region)
        {
            return await _context.Holidays
                .Where(h => region == null || (region.Value & h.Region) > 0)
                .ToListAsync();
        }

        public async Task<IEnumerable<PersonalHoliday>> GetAllAsync(int? userId, Region? region)
        {
            return await _context.PersonalHolidays
                .Where(ph => region == null || (region.Value & ph.User.Region) > 0)
                .Where(ph => userId == null || ph.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Holiday>> GetAllAsync(int year, int? userId, Region? region)
        {
            var holidays = await _context.Holidays
                .Where(h => region == null || (region.Value & h.Region) > 0)
                .Where(h => h.Date.Year == year).ToListAsync();
            if (userId != null)
            {
                var personalHolidays = await _context.PersonalHolidays
                    .Where(ph => region == null || (region.Value & ph.User.Region) > 0)
                    .Where(ph => ph.Date.Year == year)
                    .Where(ph => ph.UserId == userId)
                    .Include(ph => ph.User).ToListAsync();
                foreach (var personalHoliday in personalHolidays)
                {
                    if (personalHoliday.Show)
                    {
                        holidays.Add(new Holiday
                        {
                            Date = personalHoliday.Date,
                            Name = personalHoliday.Name,
                            Type = personalHoliday.Type,
                            Region = personalHoliday.User.Region
                        });
                    }
                    else
                    {
                        var holiday = holidays.Find(h => h.Date == personalHoliday.Date && h.Region == personalHoliday.User.Region);
                        holidays.Remove(holiday);
                    }
                }
            }
            return holidays.OrderBy(h => h.Date);
        }

        public async Task<IEnumerable<Holiday>> GetAllAsync(int year, int month, int? userId, Region? region)
        {
            var holidays = await _context.Holidays
                .Where(h => region == null || (region.Value & h.Region) > 0)
                .Where(h => h.Date.Year == year && h.Date.Month == month).ToListAsync();
            if (userId != null)
            {
                var personalHolidays = await _context.PersonalHolidays
                    .Where(h => h.UserId == userId)
                    .Where(h => region == null || (region.Value & h.User.Region) > 0)
                    .Where(h => h.Date.Year == year && h.Date.Month == month)
                    .Include(h => h.User).ToListAsync();
                foreach (var personalHoliday in personalHolidays)
                {
                    if (personalHoliday.Show)
                    {
                        holidays.Add(new Holiday
                        {
                            Date = personalHoliday.Date,
                            Name = personalHoliday.Name,
                            Type = personalHoliday.Type,
                            Region = personalHoliday.User.Region
                        });
                    }
                    else
                    {
                        var holiday = holidays.FirstOrDefault(h => h.Date == personalHoliday.Date && h.Region == personalHoliday.User.Region);
                        if (holiday != null) holidays.Remove(holiday);
                    }
                }
            }
            return holidays;
        }

        public async Task<HolidayViewModel> GetAsync(DateTime date, int? userId, Region? region)
        {
            var holiday = await _context.Holidays
                .AsNoTracking() // Consider using AsNoTracking if you don't need change tracking for this query
                .Where(h => region == null || (region.Value & h.Region) > 0)
                .FirstOrDefaultAsync(h => h.Date.Date == date.Date);
            var personalHoliday = await _context.PersonalHolidays
                .Include(ph => ph.User)
                .AsNoTracking()
                .Where(ph => region == null || (region.Value & ph.User.Region) > 0)
                .FirstOrDefaultAsync(ph => ph.Date.Date == date.Date && ph.UserId == userId);
            return personalHoliday switch
            {
                { Show: true } => new HolidayViewModel
                {
                    Date = personalHoliday.Date,
                    Name = personalHoliday.Name,
                    Type = personalHoliday.Type,
                    Region = personalHoliday.User.Region,
                    UserId = personalHoliday.UserId,
                    Show = personalHoliday.Show
                },
                { Show: false } => throw new RecordNotFoundException(
                    $"Could not find any holiday with date: {date.Date}"),
                _ => ViewModelMapper.ToViewModel(holiday ?? throw new RecordNotFoundException($"Could not find any holiday with date: {date.Date}"))
            };
        }

        private async Task<HolidayViewModel> CreateHolidayAsync(HolidayBase holiday, Region region)
        {
            var holidayEntity = new Holiday
            {
                Date = holiday.Date.Date,
                Name = holiday.Name,
                Type = holiday.Type,
                Region = region,
            };
            var existingEntity = await _context.Holidays.AnyAsync(h => h.Date == holiday.Date.Date);
            if (existingEntity)
            {
                throw new DuplicateEntityException($"Holiday on {holiday.Date} already exists.");
            }
            await _context.Holidays.AddAsync(holidayEntity);
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(holidayEntity);
        }

        private async Task<HolidayViewModel> CreatePersonalHolidayAsync(HolidayBase holiday, int userId)
        {
            var personalHolidayEntity = new PersonalHoliday
            {
                Date = holiday.Date.Date,
                Name = holiday.Name,
                Type = holiday.Type,
                UserId = userId,
                Show = true,
            };
            var existingEntity = await _context.PersonalHolidays.AnyAsync(h => h.Date == holiday.Date.Date);
            if (existingEntity)
            {
                throw new DuplicateEntityException($"Holiday on {holiday.Date} already exists.");
            }
            await _context.PersonalHolidays.AddAsync(personalHolidayEntity);
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(personalHolidayEntity);
        }

        public async Task<HolidayViewModel> CreateAsync(HolidayBase holiday, int? userId, Region? region)
        {
            if (userId == null && region == null)
            {
                throw new OperationNotSupportedException("Either UserId or Region is required.");
            }
            if (userId != null && region != null)
            {
                throw new OperationNotSupportedException("UserId and Region is not supported together.");
            }
            if (userId != null)
            {
                return await CreatePersonalHolidayAsync(holiday, userId.Value);
            }
            return await CreateHolidayAsync(holiday, region.Value);
        }

        public async Task<MessageViewModel> CreateAllAsync(List<Holiday> holidays, int? userId)
        {
            foreach (var holiday in holidays)
            {
                if (userId != null)
                {
                    var personalHolidayEntity = new PersonalHoliday
                    {
                        Date = holiday.Date.Date,
                        Name = holiday.Name,
                        Type = holiday.Type,
                        UserId = userId.Value,
                        Show = true,
                    };
                    await _context.PersonalHolidays.AddAsync(personalHolidayEntity);
                }
                else
                {
                    var holidayEntity = new Holiday
                    {
                        Date = holiday.Date.Date,
                        Name = holiday.Name,
                        Type = holiday.Type,
                        Region = holiday.Region,
                    };
                    await _context.Holidays.AddAsync(holidayEntity);
                }
            }
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = "Holidays added successfully."
            };
        }

        // update an existing holiday
        public async Task<HolidayViewModel> UpdateHolidayAsync(DateTime date, Region region, HolidayUpdateViewModel holiday)
        {
            var entity = await _context.Holidays
                .FirstOrDefaultAsync(h => h.Date.Date == date.Date && (region & h.Region) > 0)
                ?? throw new RecordNotFoundException($"Could not find any holiday with date: {date.Date}");
            entity.Name = holiday.Name ?? entity.Name;
            entity.Type = holiday.Type ?? entity.Type;
            entity.Region = holiday.Region ?? entity.Region;
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(entity);
        }

        // update an existing personal holiday
        public async Task<HolidayViewModel> UpdatePersonalHolidayAsync(DateTime date, int userId, HolidayUpdateViewModel holiday)
        {
            var entity = await _context.PersonalHolidays
                .FirstOrDefaultAsync(ph => ph.Date.Date == date.Date && ph.UserId == userId)
                ?? throw new RecordNotFoundException($"Could not find any personal holiday with date: {date.Date} for user {userId}");
            entity.Name = holiday.Name ?? entity.Name;
            entity.Type = holiday.Type ?? entity.Type;
            entity.UserId = holiday.UserId ?? entity.UserId;
            entity.Show = holiday.Show ?? entity.Show;
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(entity);
        }

        // import holidays from excel
        public async Task<MessageViewModel> ImportHolidaysFromExcelAsync(IFormFile excelFile)
        {
            try
            {
                // Validate the file
                if (excelFile == null || excelFile.Length == 0)
                {
                    throw new ArgumentException("Excel file is required.");
                }

                var dataTable = ExcelReader.ReadExcelFile(excelFile);
                var holidays = new List<Holiday>();

                foreach (DataRow row in dataTable.Rows)
                {
                    if (!Enum.TryParse(row["Type"].ToString(), out HolidayType holidayType))
                    {
                        throw new ArgumentException($"Invalid HolidayType: {row["Type"]}");
                    }
                    if (!Enum.TryParse(row["Region"].ToString(), out Region region))
                    {
                        throw new ArgumentException($"Invalid Region: {row["Region"]}");
                    }
                    var utcTime = DateTime.Parse(row["Date"].ToString() ?? throw new ArgumentException($"Invalid Date: {row["Date"]}"));
                    var holiday = new Holiday
                    {
                        Date = utcTime.Date,
                        Name = row["Name"].ToString(),
                        Type = holidayType,
                        Region = region,
                    };

                    holidays.Add(holiday);
                }
                // Add holidays to the database
                await _context.Holidays.AddRangeAsync(holidays);
                await _context.SaveChangesAsync();

                return new MessageViewModel
                {
                    Message = "Holidays imported successfully."
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error importing holidays from Excel: {ex.Message}");
            }
        }

        // import personal holidays from excel
        public async Task<MessageViewModel> ImportPersonalHolidaysFromExcelAsync(IFormFile excelFile)
        {
            try
            {
                // Validate the file
                if (excelFile == null || excelFile.Length == 0)
                {
                    throw new ArgumentException("Excel file is required.");
                }

                var dataTable = ExcelReader.ReadExcelFile(excelFile);
                var personalHolidays = new List<PersonalHoliday>();

                foreach (DataRow row in dataTable.Rows)
                {
                    if (!Enum.TryParse(row["Type"].ToString(), out HolidayType holidayType))
                    {
                        throw new ArgumentException($"Invalid HolidayType: {row["Type"]}");
                    }
                    if (!Enum.TryParse(row["Region"].ToString(), out Region region))
                    {
                        throw new ArgumentException($"Invalid Region: {row["Region"]}");
                    }
                    var utcTime = DateTime.Parse(row["Date"].ToString() ?? throw new ArgumentException($"Invalid Date: {row["Date"]}"));
                    var entity = new PersonalHoliday
                    {
                        Date = utcTime.Date,
                        Name = row["Name"].ToString(),
                        Type = holidayType,
                        UserId = (int)row["UserId"],
                        Show = (bool)row["Show"],
                    };

                    personalHolidays.Add(entity);
                }
                // Add personal holidays to the database
                await _context.PersonalHolidays.AddRangeAsync(personalHolidays);
                await _context.SaveChangesAsync();

                return new MessageViewModel
                {
                    Message = "Personal Holidays imported successfully."
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error importing personal holidays from Excel: {ex.Message}");
            }
        }

        public async Task<MessageViewModel> DeleteHolidayAsync(DateTime date, Region? region)
        {
            var entity = await _context.Holidays
                .Where(h => region == null || (region.Value & h.Region) > 0)
                .FirstAsync(h => h.Date.Date == date.Date);
            _context.Holidays.Remove(entity);
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = $"Holiday on date {date.Date} is deleted successfully."
            };
        }

        public async Task<MessageViewModel> DeletePersonalHolidayAsync(DateTime date, int userId, Region? region)
        {
            var entity = await _context.PersonalHolidays
                .Include(ph => ph.User)
                .Where(ph => region == null || (region.Value & ph.User.Region) > 0)
                .FirstAsync(ph => ph.Date.Date == date.Date && ph.UserId == userId);
            _context.PersonalHolidays.Remove(entity);
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = $"Personal Holiday on date {date.Date} for user with id: {userId} is deleted successfully."
            };
        }

        public async Task<MessageViewModel> DeleteAsync(DateTime date, int? userId, Region? region)
        {
            var holiday = await _context.Holidays
                .AsNoTracking()
                .Where(h => region == null || (region.Value & h.Region) > 0)
                .FirstOrDefaultAsync(h => h.Date.Date == date.Date);
            var personalHoliday = await _context.PersonalHolidays
                .AsNoTracking()
                .Where(ph => region == null || (region.Value & ph.User.Region) > 0)
                .FirstOrDefaultAsync(ph => ph.Date.Date == date.Date && ph.UserId == userId);

            if (userId != null)
            {
                if (personalHoliday != null)
                {
                    _context.PersonalHolidays.Remove(personalHoliday);
                }
                else
                {
                    if (holiday == null)
                        throw new RecordNotFoundException($"Could not find any holiday with date: {date.Date}");

                    await _context.PersonalHolidays.AddAsync(new PersonalHoliday
                    {
                        Date = holiday.Date,
                        Name = holiday.Name,
                        Type = holiday.Type,
                        UserId = userId.Value,
                        Show = false
                    });
                }
            }
            else
            {
                if (holiday != null)
                {
                    _context.Holidays.Remove(holiday);
                }
                else
                {
                    throw new RecordNotFoundException($"Could not find any holiday with date: {date.Date}");
                }
            }
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = $"Holiday on date {date.Date} {(userId != null ? $"for user with id: {userId}" : "")} is deleted successfully."
            };
        }

        // reset holidays table
        public async Task<MessageViewModel> ResetHolidaysAsync()
        {
            await _context.Holidays.ExecuteDeleteAsync();
            return new MessageViewModel
            {
                Message = "Holidays table reset successfully."
            };
        }

        // reset personal holidays table
        public async Task<MessageViewModel> ResetPersonalHolidaysAsync()
        {
            await _context.PersonalHolidays.ExecuteDeleteAsync();
            return new MessageViewModel
            {
                Message = "Personal Holidays table reset successfully."
            };
        }

        // reset holidays and personal holidays table
        public async Task<MessageViewModel> ResetAsync()
        {
            await _context.Holidays.ExecuteDeleteAsync();
            await _context.PersonalHolidays.ExecuteDeleteAsync();
            return new MessageViewModel
            {
                Message = "Holidays and Personal Holidays table reset successfully."
            };
        }
    }
}
