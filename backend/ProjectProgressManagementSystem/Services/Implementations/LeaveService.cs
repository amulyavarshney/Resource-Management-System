using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.DataAccess;
using ProjectProgressManagementSystem.Exceptions;
using ProjectProgressManagementSystem.Utilities;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.Leave;
using System.Data;

namespace ProjectProgressManagementSystem.Services.Implementations
{
    public class LeaveService : ILeaveService
    {
        private readonly ApplicationDbContext _context;
        public LeaveService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Leave>> GetAllAsync(DateTime? date)
        {
            var dateOnly = date?.Date;
            return await _context.Leaves.Where(l => dateOnly == null || l.Date.Date == dateOnly).ToListAsync();
        }

        public async Task<IEnumerable<Leave>> GetAllAsync(int year, int month, int userId)
        {
            return await _context.Leaves.Where(l => l.UserId == userId && l.Date.Year == year && l.Date.Month == month).ToListAsync();
        }

        public async Task<IEnumerable<Leave>> GetAllAsync(DateTime? date, int userId)
        {
            var dateOnly = date?.Date;
            return await _context.Leaves.Where(l => (dateOnly == null || l.Date.Date == dateOnly) && l.UserId == userId).ToListAsync();
        }

        public async Task<Leave> CreateAsync(LeaveCreateViewModel leave)
        {
            if (!EnumExtensions.TryParseByDescription<LeaveType>(leave.Type, out var type))
            {
                throw new ArgumentException($"Invalid LeaveType: {leave.Type}");
            }

            if (!EnumExtensions.TryParseByDescription<LeaveSession>(leave.Session, out var session))
            {
                throw new ArgumentException($"Invalid LeaveSession: {leave.Session}");
            }

            if (leave.Date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
            {
                throw new OperationNotSupportedException("Invalid Day: Can't apply leave on Weekend.");
            }

            var isHoliday = await _context.Holidays.AnyAsync(h => h.Date.Date == leave.Date.Date);
            if (isHoliday)
            {
                throw new OperationNotSupportedException("Invalid Day: Can't apply leave on Holiday.");
            }

            var entity = new Leave
            {
                Date = leave.Date.Date,
                Type = type,
                Session = session,
                UserId = leave.UserId,
            };

            var leaveExists = await _context.Leaves.AnyAsync(l => l.Date.Date == leave.Date.Date && l.UserId == leave.UserId);
            if (leaveExists)
            {
                var existingLeave = await _context.Leaves.FirstAsync(l => l.Date.Date == leave.Date.Date && l.UserId == leave.UserId);
                existingLeave.Type = entity.Type;
                existingLeave.Session = entity.Session;
                await _context.SaveChangesAsync();
                return existingLeave;
            }

            await _context.Leaves.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<MessageViewModel> CreateAllAsync(List<LeaveCreateViewModel> leaves)
        {
            foreach (var leave in leaves)
            {
                if (!EnumExtensions.TryParseByDescription<LeaveType>(leave.Type, out var type))
                {
                    throw new ArgumentException($"Invalid LeaveType: {leave.Type}");
                }
                
                if (!EnumExtensions.TryParseByDescription<LeaveSession>(leave.Session, out var session))
                {
                    throw new ArgumentException($"Invalid LeaveSession: {leave.Session}");
                }

                if (leave.Date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
                {
                    throw new OperationNotSupportedException("Invalid Day: Can't apply leave on Weekend.");
                }

                var isHoliday = await _context.Holidays.AnyAsync(h => h.Date.Date == leave.Date.Date);
                if (isHoliday)
                {
                    throw new OperationNotSupportedException("Invalid Day: Can't apply leave on Holiday.");
                }

                var entity = new Leave
                {
                    Date = leave.Date,
                    Type = type,
                    Session = session,
                    UserId = leave.UserId,
                };
                var leaveExists = await _context.Leaves.AnyAsync(l => l.Date.Date == leave.Date.Date && l.UserId == leave.UserId);
                if (leaveExists)
                {
                    var existingLeave = await _context.Leaves.FirstAsync(l => l.Date.Date == leave.Date.Date && l.UserId == leave.UserId);
                    if (existingLeave == entity)
                    {
                        throw new DuplicateEntityException("Leave already exists");
                    }

                    existingLeave.Type = entity.Type;
                    existingLeave.Session = entity.Session;
                }
                else
                    await _context.Leaves.AddAsync(entity);
            }
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = "Leaves added successfully."
            };
        }

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
                var leaves = new List<Leave>();

                foreach (DataRow row in dataTable.Rows)
                {
                    if (!EnumExtensions.TryParseByDescription<LeaveType>(row["Type"].ToString()!, out var type))
                    {
                        throw new ArgumentException($"Invalid LeaveType: {row["Type"]}");
                    }

                    if (!EnumExtensions.TryParseByDescription<LeaveSession>(row["Session"].ToString()!, out var session))
                    {
                        throw new ArgumentException($"Invalid LeaveSession: {row["Session"]}");
                    }

                    var leave = DateTime.Parse(row["Date"].ToString() ?? throw new InvalidOperationException($"Invalid Date: {row["Date"]}"));

                    if (leave.Date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
                    {
                        throw new OperationNotSupportedException("Invalid Day: Can't apply leave on Weekend.");
                    }

                    var isHoliday = await _context.Holidays.AnyAsync(h => h.Date.Date == leave.Date.Date);
                    if (isHoliday)
                    {
                        throw new OperationNotSupportedException("Invalid Day: Can't apply leave on Holiday.");
                    }

                    var userId = Parser.ParseInt(row, "UserId");
                    var entity = new Leave
                    {
                        Date = leave.Date,
                        Type = type,
                        Session = session,
                        UserId = userId,
                    };

                    var leaveExists = await _context.Leaves.AnyAsync(l => l.Date.Date == leave.Date.Date && l.UserId == userId);
                    if (leaveExists)
                    {
                        var existingLeave = await _context.Leaves.FirstAsync(l => l.Date.Date == leave.Date.Date && l.UserId == userId);
                        if (existingLeave == entity)
                        {
                            throw new DuplicateEntityException("Leave already exists");
                        }

                        existingLeave.Type = entity.Type;
                        existingLeave.Session = entity.Session;
                    }
                    else
                        leaves.Add(entity);
                }
                // Add leaves to the database
                await _context.Leaves.AddRangeAsync(leaves);
                await _context.SaveChangesAsync();

                return new MessageViewModel
                {
                    Message = "Leaves imported successfully."
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error importing leaves from Excel: {ex.Message}");
            }
        }

        public async Task<MessageViewModel> DeleteAsync(DateTime date, int userId)
        {
            var entity = await _context.Leaves.FirstAsync(l => l.Date.Date == date.Date && l.UserId == userId);
            _context.Leaves.Remove(entity);
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = $"Leave on date {date.Date} for user with userId {userId} is deleted successfully."
            };
        }

        public async Task<MessageViewModel> ResetAsync()
        {
            await _context.Leaves.ExecuteDeleteAsync();
            return new MessageViewModel
            {
                Message = "Leaves table reset successfully."
            };
        }

        private async Task<Leave> FromKey(DateTime date, int userId)
        {
            return await _context.Leaves.FirstOrDefaultAsync(l => l.Date.Date == date.Date && l.UserId == userId)
                ?? throw new RecordNotFoundException($"Could not find any leave with date {date.Date} and userId {userId}.");
        }
    }
}
