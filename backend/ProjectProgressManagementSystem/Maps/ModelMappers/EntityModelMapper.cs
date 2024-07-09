using ProjectProgressManagementSystem.Exceptions;
using ProjectProgressManagementSystem.Extensions;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.Project;
using ProjectProgressManagementSystem.ViewModels.User;
using System.Data;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace ProjectProgressManagementSystem.Maps.ModelMappers
{
    public class EntityModelMapper
    {
        public static Project ToEntity(ProjectCreateViewModel project)
        {
            return new Project
            {
                Number = project.Number,
                Title = project.Title,
                Business = project.Business,
                Department = project.Department,
                Region = project.Region,
                Description = project.Description,
                DateCreated = DateTime.Now.Date,
            };
        }

        public static Project ToProjectEntity(DataRow row)
        {
            return new Project
            {
                Number = row["Number"].ToString(),
                Title = row["Title"].ToString(),
                Business = Parser.ParseString(row, "Business"),
                Department = Parser.ParseDepartment(row),
                Region = Parser.ParseRegion(row),
                Description = Parser.ParseString(row, "Description"),
                DateCreated = Parser.ParseDate(row, "DateCreated") ?? DateTime.Now.Date,
                DateModified = Parser.ParseDate(row, "DateModified"),
                DateDeleted = Parser.ParseDate(row, "DateDeleted"),
            };
        }

        public static Project ToEntity(Project projectEntity, ProjectUpdateViewModel project)
        {
            return new Project
            {
                Number = project.Number ?? projectEntity.Number,
                Title = project.Title ?? projectEntity.Title,
                Business = project.Business ?? projectEntity.Business,
                Department = project.Department ?? projectEntity.Department,
                Region = project.Region ?? projectEntity.Region,
                Description = project.Description ?? projectEntity.Description,
                DateCreated = DateTime.Now.Date,
            };
        }

        public static User ToEntity(UserCreateViewModel user)
        {
            var textInfo = new CultureInfo("en-US", false).TextInfo;
            var firstName = textInfo.ToTitleCase(user.FirstName);
            var lastName = textInfo.ToTitleCase(user.LastName);

            CreatePasswordHashAndSalt(user.Password, out byte[]? passwordHash, out byte[]? passwordSalt);
            return new User
            {
                EmpId = user.EmpId,
                FirstName = firstName,
                LastName = lastName,
                Email = user.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                IsExternal = user.Email.Contains("ext"),
                Department = user.Department,
                Region = user.Region,
                Role = user.Role,
                WorkHoursPerDay = user.WorkHoursPerDay,
                ParentId = user.ParentId,
                DateCreated = DateTime.Now.Date,
            };
        }

        public static User ToUserEntity(DataRow row)
        {
            var textInfo = new CultureInfo("en-US", false).TextInfo;
            var userName = textInfo.ToTitleCase(row["UserName"].ToString());
            var firstName = textInfo.ToTitleCase(row["FirstName"].ToString());
            var lastName = textInfo.ToTitleCase(row["LastName"].ToString());

            return new User
            {
                EmpId = Parser.ParseUint(row, "EmpId"),
                UserName = userName,
                FirstName = firstName,
                LastName = lastName,
                Email = row["Email"].ToString()!,
                PasswordHash = Parser.ParsePassword(row, "PasswordHash"),
                PasswordSalt = Parser.ParsePassword(row, "PasswordSalt"),
                IsExternal = Parser.ParseIsExternal(row),
                Department = Parser.ParseDepartment(row),
                Region = Parser.ParseRegion(row),
                Role = Parser.ParseRole(row),
                WorkHoursPerDay = Parser.ParseInt(row, "WorkHoursPerDay"),
                ParentId = Parser.ParseInt(row, "ParentId"),
                DateCreated = Parser.ParseDate(row, "DateCreated") ?? DateTime.Now.Date,
                DateModified = Parser.ParseDate(row, "DateModified"),
                DateDeleted = Parser.ParseDate(row, "DateDeleted"),
            };
        }

        public static User ToEntity(User userEntity, UserUpdateViewModel user)
        {
            return new User
            {
                //Id = userEntity.Id,
                EmpId = user.EmpId ?? userEntity.EmpId,
                UserName = user.UserName ?? userEntity.UserName,
                FirstName = user.FirstName ?? userEntity.FirstName,
                LastName = user.LastName ?? userEntity.LastName,
                Email = user.Email ?? userEntity.Email,
                PasswordHash = userEntity.PasswordHash,
                PasswordSalt = userEntity.PasswordSalt,
                IsExternal = user.Email?.Contains("ext") ?? userEntity.IsExternal,
                Department = user.Department ?? userEntity.Department,
                Region = user.Region ?? userEntity.Region,
                Role = user.Role ?? userEntity.Role,
                WorkHoursPerDay = user.WorkHoursPerDay ?? userEntity.WorkHoursPerDay,
                ParentId = user.ParentId ?? userEntity.ParentId,
                DateModified = DateTime.Now.Date,
            };
        }

        public static PasswordViewModel ToEntity(User user, string? oldPassword, string newPassword)
        {
            if (oldPassword != null && !VerifyPasswordHash(oldPassword, user.PasswordHash, user.PasswordSalt))
            {
                throw new PasswordMismatchException();
            }
            if (oldPassword == newPassword)
            {
                throw new Exception("Old and New Password are same.");
            }
            CreatePasswordHashAndSalt(newPassword, out byte[]? passwordHash, out byte[]? passwordSalt);
            return new PasswordViewModel
            {
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
            };
        }

        public static bool VerifyPasswordHash(string? rawPassword, byte[]? passwordHash, byte[]? passwordSalt)
        {
            if (rawPassword != null && passwordSalt == null && passwordHash == null)
            {
                return false;
            }
            if (passwordSalt == null && passwordHash == null)
            {
                return true;
            }
            if (rawPassword == null)
            {
                return false;
            }
            using var hmac = new HMACSHA512(passwordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawPassword));

            for (var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != passwordHash[i])
                {
                    return false;
                }
            }

            return true;
        }

        private static void CreatePasswordHashAndSalt(string? rawPassword, out byte[]? passwordHash, out byte[]? passwordSalt)
        {
            if (rawPassword == null)
            {
                passwordSalt = null;
                passwordHash = null;
            }
            else
            {
                using var hmac = new HMACSHA512();
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawPassword));
                passwordSalt = hmac.Key;
            }
        }

        public static WeekData ToEntity(WeekDataKey key, WeekDataViewModel workHours)
        {
            return new WeekData
            {
                UserId = key.UserId,
                ProjectId = key.ProjectId,
                Year = key.Year,
                Month = key.Month,
                Week1 = workHours.Week1,
                Week2 = workHours.Week2,
                Week3 = workHours.Week3,
                Week4 = workHours.Week4,
                Week5 = workHours.Week5,
            };
        }
    }
}
