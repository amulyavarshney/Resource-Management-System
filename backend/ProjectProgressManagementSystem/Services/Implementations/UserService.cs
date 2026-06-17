using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.DataAccess;
using ProjectProgressManagementSystem.Exceptions;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.Maps.ModelMappers;
using ProjectProgressManagementSystem.ViewModels.User;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.Utilities;
using System.Data;

namespace ProjectProgressManagementSystem.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        // get all users
        public async Task<IEnumerable<UserViewModel>> GetAllAsync(Department? department, Region? region)
        {
            return await _context.Users
                .Where(user => department == null || (department.Value & user.Department) > 0)
                .Where(user => region == null || (region.Value & user.Region) > 0)
                .Where(user => user.DateDeleted == null || user.DateDeleted >= DateTime.Now)
                .Select(user => new UserViewModel
                {
                    Id = user.Id,
                    EmpId = user.EmpId,
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    IsExternal = user.IsExternal,
                    IsPasswordProtected = user.PasswordHash != null,
                    Department = user.Department,
                    Region = user.Region,
                    Role = user.Role,
                    WorkHoursPerDay = user.WorkHoursPerDay,
                    ParentId = user.ParentId,
                }).ToListAsync();
        }

        // get all users
        public async Task<IEnumerable<UserViewModel>> GetManagersAsync(Department? department, Region? region)
        {
            return await _context.Users
                .Where(user => department == null || (department.Value & user.Department) > 0)
                .Where(user => region == null || (region.Value & user.Region) > 0)
                .Where(user => user.DateDeleted == null || user.DateDeleted >= DateTime.Now)
                .Where(user => user.Role != Role.Employee && user.Role != Role.Developer)
                .Select(user => new UserViewModel
                {
                    Id = user.Id,
                    EmpId = user.EmpId,
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    IsExternal = user.IsExternal,
                    IsPasswordProtected = user.PasswordHash != null,
                    Department = user.Department,
                    Region = user.Region,
                    Role = user.Role,
                    WorkHoursPerDay = user.WorkHoursPerDay,
                    ParentId = user.ParentId,
                }).ToListAsync();
        }

        // get all users in month, year
        public async Task<IEnumerable<UserViewModel>> GetAllAsync(int year, int month, Department? department, Region? region)
        {
            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);
            return await _context.Users
                .Where(user => department == null || (department.Value & user.Department) > 0)
                .Where(user => region == null || (region.Value & user.Region) > 0)
                .Where(user => user.DateDeleted == null || user.DateDeleted >= firstDayOfNextMonth)
                .Where(user => user.DateCreated < firstDayOfNextMonth)
                .Select(user => new UserViewModel
                {
                    Id = user.Id,
                    EmpId = user.EmpId,
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    IsExternal = user.IsExternal,
                    IsPasswordProtected = user.PasswordHash != null,
                    Department = user.Department,
                    Region = user.Region,
                    Role = user.Role,
                    WorkHoursPerDay = user.WorkHoursPerDay,
                    ParentId = user.ParentId,
                }).ToListAsync();
        }

        // get all users under the same parent in month, year
        public async Task<IEnumerable<UserViewModel>> GetAllAsync(int year, int month, int parentId, Department? department, Region? region)
        {
            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);
            return await _context.Users
                .Where(user => department == null || (department.Value & user.Department) > 0)
                .Where(user => region == null || (region.Value & user.Region) > 0)
                .Where(user => user.DateDeleted == null || user.DateDeleted >= firstDayOfNextMonth)
                .Where(user => user.DateCreated < firstDayOfNextMonth && user.ParentId == parentId)
                .Select(user => new UserViewModel
                {
                    Id = user.Id,
                    EmpId = user.EmpId,
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    IsExternal = user.IsExternal,
                    IsPasswordProtected = user.PasswordHash != null,
                    Department = user.Department,
                    Region = user.Region,
                    Role = user.Role,
                    WorkHoursPerDay = user.WorkHoursPerDay,
                    ParentId = user.ParentId,
                }).ToListAsync();
        }

        // get user by id
        public async Task<UserViewModel> GetByIdAsync(int id)
        {
            var user = await FromId(id);
            return ViewModelMapper.ToViewModel(user);
        }

        // create a new user
        public async Task<UserViewModel> CreateAsync(UserCreateViewModel user)
        {
            var existingUser = await _context.Users.AnyAsync(u => u.DateDeleted == null && ((user.EmpId != null && u.EmpId == user.EmpId) || u.Email == user.Email));
            if (existingUser)
            {
                throw new DuplicateEntityException("User already exists");
            }

            var parent = await _context.Users.AnyAsync(u => u.Id == user.ParentId);
            if (user.ParentId != 0 && !parent)
            {
                throw new OperationNotSupportedException("Parent does not exists");
            }

            var userEntity = EntityModelMapper.ToEntity(user);
            await _context.Users.AddAsync(userEntity);
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(userEntity);
        }

        // import users from excel
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
                var users = new List<User>();

                foreach (DataRow row in dataTable.Rows)
                {
                    var user = EntityModelMapper.ToUserEntity(row);
                    users.Add(user);
                }
                // Add users to the database
                await _context.Users.AddRangeAsync(users);
                await _context.SaveChangesAsync();

                return new MessageViewModel
                {
                    Message = "Users imported successfully."
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error importing users from Excel: {ex.Message}");
            }
        }

        // update an existing user
        public async Task<UserViewModel> UpdateAsync(int id, UserUpdateViewModel user)
        {
            var userEntity = await FromId(id);
            if (userEntity.DateDeleted != null)
            {
                throw new OperationNotSupportedException(
                    $"User with id {id} is scheduled to delete on {userEntity.DateDeleted}.");
            }
            userEntity.EmpId = user.EmpId ?? userEntity.EmpId;
            userEntity.UserName = user.UserName ?? userEntity.UserName;
            userEntity.FirstName = user.FirstName ?? userEntity.FirstName;
            userEntity.LastName = user.LastName ?? userEntity.LastName;
            userEntity.Email = user.Email ?? userEntity.Email;
            userEntity.IsExternal = user.Email?.Contains("ext") ?? userEntity.IsExternal;
            userEntity.Department = user.Department ?? userEntity.Department;
            userEntity.Region = user.Region ?? userEntity.Region;
            userEntity.Role = user.Role ?? userEntity.Role;
            userEntity.WorkHoursPerDay = user.WorkHoursPerDay ?? userEntity.WorkHoursPerDay;
            userEntity.ParentId = user.ParentId ?? userEntity.ParentId;
            userEntity.DateModified = DateTime.Now.Date;
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(userEntity);
        }

        // update last Saved Time for an existing user
        public async Task<UserViewModel> UpdateLastSavedTimeAsync(int id, DateTime lastSavedTime)
        {
            var userEntity = await FromId(id);
            userEntity.LastSavedTime = lastSavedTime;
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(userEntity);
        }

        // change password of an existing user
        public async Task<MessageViewModel> UpdatePasswordAsync(int id, PasswordCreateViewModel password)
        {
            var userEntity = await FromId(id);
            var passwordViewModel = EntityModelMapper.ToEntity(userEntity, password.OldPassword, password.NewPassword);
            userEntity.PasswordHash = passwordViewModel.PasswordHash;
            userEntity.PasswordSalt = passwordViewModel.PasswordSalt;
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = "Password changed successfully."
            };
        }

        // remove password of an existing user
        public async Task<MessageViewModel> RemovePasswordAsync(int id, string password)
        {
            var userEntity = await FromId(id);
            if (!EntityModelMapper.VerifyPasswordHash(password, userEntity.PasswordHash, userEntity.PasswordSalt))
            {
                throw new PasswordMismatchException();
            }
            userEntity.PasswordHash = null;
            userEntity.PasswordSalt = null;
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = "Password removed successfully."
            };
        }

        // delete a user
        public async Task<MessageViewModel> DeleteAsync(int id, bool? deleteNow)
        {
            var user = await FromId(id);

            // If deleteNow is not true, schedule the user for deletion on the first day of the next month.
            if (deleteNow != true)
            {
                // If the user is already scheduled for deletion, throw an exception.
                if (user.DateDeleted.HasValue)
                {
                    throw new OperationNotSupportedException($"User with id {id} is already scheduled to delete on {user.DateDeleted}.");
                }

                // Set the DateDeleted field to the first day of the next month.
                user.DateDeleted = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(1);
            }
            else if (user.DateDeleted.HasValue)
            {
                // If deleteNow is true and the user is scheduled for deletion, cancel the deletion.
                user.DateDeleted = null;
            }

            // Remove the user from the Users DbSet. This will mark the user as deleted in the ChangeTracker.
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = $"User with id {id} is deleted successfully."
            };
        }

        // reset users table
        public async Task<MessageViewModel> ResetAsync()
        {
            await _context.Users.ExecuteDeleteAsync();
            return new MessageViewModel
            {
                Message = "Users table reset successfully."
            };
        }

        private async Task<User> FromId(int id)
        {
            return await _context.Users.FirstOrDefaultAsync(user => (user.DateDeleted == null || user.DateDeleted >= DateTime.Now) && user.Id == id)
                ?? throw new RecordNotFoundException($"Could not find any User with id: {id}");
        }
    }
}
