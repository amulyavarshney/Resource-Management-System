using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.WeekData;
using ProjectProgressManagementSystem.ViewModels.Holiday;
using ProjectProgressManagementSystem.ViewModels.Project;
using ProjectProgressManagementSystem.ViewModels.User;

namespace ProjectProgressManagementSystem.Maps.ModelMappers
{
    public static class ViewModelMapper
    {
        public static HolidayViewModel ToViewModel(Holiday holiday)
        {
            var viewModel = new HolidayViewModel
            {
                Date = holiday.Date.Date,
                Name = holiday.Name,
                Type = holiday.Type,
                Region = holiday.Region
            };
            return viewModel;
        }

        public static HolidayViewModel ToViewModel(PersonalHoliday personalHoliday)
        {
            var viewModel = new HolidayViewModel
            {
                Date = personalHoliday.Date.Date,
                Name = personalHoliday.Name,
                Type = personalHoliday.Type,
                UserId = personalHoliday.UserId,
                Show = personalHoliday.Show
            };
            return viewModel;
        }

        public static ProjectViewModel ToViewModel(Project project)
        {
            var viewModel = new ProjectViewModel
            {
                Id = project.Id,
                Number = project.Number,
                Title = project.Title,
                Business = project.Business,
                Department = project.Department,
                Region = project.Region,
                Description = project.Description,
            };
            return viewModel;
        }

        public static UserViewModel ToViewModel(User user)
        {
            var viewModel = new UserViewModel
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
                LastSavedTime = user.LastSavedTime,
            };
            return viewModel;
        }

        public static WeekDataViewModel ToViewModel(WeekData workHours)
        {
            var viewModel = new WeekDataViewModel
            {
                Week1 = workHours.Week1,
                Week2 = workHours.Week2,
                Week3 = workHours.Week3,
                Week4 = workHours.Week4,
                Week5 = workHours.Week5,
            };
            return viewModel;
        }
    }
}
