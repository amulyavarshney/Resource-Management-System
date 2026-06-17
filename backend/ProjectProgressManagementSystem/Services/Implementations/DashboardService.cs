using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.DataAccess;
using ProjectProgressManagementSystem.Exceptions;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.Dashboard;
using ProjectProgressManagementSystem.ViewModels.Project;
using ProjectProgressManagementSystem.ViewModels.User;

namespace ProjectProgressManagementSystem.Services.Implementations
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardViewModel> GetDashboardAsync(int year, int month, Department? department, Region? region)
        {
            await RemoveWeekDataWithAllZero(year, month);

            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);

            var totalProjects = await _context.Projects
                .Where(project => (department == null || (department.Value & project.Department) > 0))
                .Where(project => (region == null || (region.Value & project.Region) > 0))
                .Where(project => project.DateDeleted == null || project.DateDeleted >= firstDayOfNextMonth)
                .Where(project => project.DateCreated < firstDayOfNextMonth)
                .CountAsync();

            var users = await _context.Users
                .Where(user => (department == null || (department.Value & user.Department) > 0))
                .Where(user => (region == null || (region.Value & user.Region) > 0))
                .Where(user => user.DateDeleted == null || user.DateDeleted >= firstDayOfNextMonth)
                .Where(user => user.DateCreated < firstDayOfNextMonth && user.Role != Role.Executive)
                .ToListAsync();
            var totalUsers = users.Count();
            var totalExtUsers = users.Count(user => user.IsExternal);

            var weekData = await _context.WeekData
                .Include(wd => wd.User)
                .Where(wd => wd.Year == year && wd.Month == month)
                .Where(wd => (department == null || (department.Value & wd.User.Department) > 0))
                .Where(wd => (region == null || (region.Value & wd.User.Region) > 0))
                .ToListAsync();
            var totalWorkHours = weekData.Sum(wd => wd.Week1 + wd.Week2 + wd.Week3 + wd.Week4 + (wd.Week5 ?? 0));
            var totalExtWorkHours = weekData.Where(wd => wd.User.IsExternal)
                .Sum(wd => wd.Week1 + wd.Week2 + wd.Week3 + wd.Week4 + (wd.Week5 ?? 0));

            return new DashboardViewModel
            {
                TotalProjects = totalProjects,
                TotalIntUsers = totalUsers - totalExtUsers,
                TotalExtUsers = totalExtUsers,
                TotalUsers = totalUsers,
                TotalIntWorkHours = totalWorkHours - totalExtWorkHours,
                TotalExtWorkHours = totalExtWorkHours,
                TotalWorkHours = totalWorkHours,
            };
        }

        public async Task<ProjectDashboardViewModel> GetProjectDashboardAsync(int projectId)
        {
            var projectData = await _context.Projects.FirstOrDefaultAsync(project => project.Id == projectId)
                ?? throw new RecordNotFoundException($"Could not find any Project with id: {projectId}");

            var projectWeekData = await _context.WeekData.Where(wd => wd.ProjectId == projectId).ToListAsync();
            var projectUserWeekData = await _context.WeekData.Include(wd => wd.User)
                .Where(wd => wd.ProjectId == projectId).ToListAsync();

            var totalUsers = projectWeekData.Select(wd => wd.UserId).Distinct().Count();
            var totalExtUsers = projectUserWeekData.Where(wd => wd.User.IsExternal).Select(wd => wd.UserId).Distinct().Count();
            var totalWorkHours = projectWeekData.Sum(wd => wd.Week1 + wd.Week2 + wd.Week3 + wd.Week4 + (wd.Week5 ?? 0));
            var totalExtWorkHours = projectUserWeekData.Where(wd => wd.User.IsExternal)
                .Sum(wd => wd.Week1 + wd.Week2 + wd.Week3 + wd.Week4 + (wd.Week5 ?? 0));

            return new ProjectDashboardViewModel
            {
                ProjectId = projectData.Id,
                ProjectNumber = projectData.Number,
                ProjectTitle = projectData.Title,
                Business = projectData.Business,
                Department = projectData.Department,
                Region = projectData.Region,
                Description = projectData.Description,
                TotalIntUsers = totalUsers - totalExtUsers,
                TotalExtUsers = totalExtUsers,
                TotalUsers = totalUsers,
                TotalIntWorkHours = totalWorkHours - totalExtWorkHours,
                TotalExtWorkHours = totalExtWorkHours,
                TotalWorkHours = totalWorkHours,
            };
        }

        public async Task<ProjectDashboardViewModel> GetProjectDashboardAsync(int year, int month, int projectId)
        {
            await RemoveWeekDataWithAllZero(year, month);

            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);

            var projectData = await _context.Projects
                .FirstOrDefaultAsync(project => (project.DateDeleted == null || project.DateDeleted >= firstDayOfNextMonth) && project.DateCreated < firstDayOfNextMonth && project.Id == projectId)
                ?? throw new RecordNotFoundException($"Could not find any Project with id: {projectId}");

            var weekData = await _context.WeekData.Where(wd => wd.Year == year && wd.Month == month).ToListAsync();
            var projectUserWeekData = await _context.WeekData.Include(wd => wd.User)
                .Where(wd => wd.Year == year && wd.Month == month && wd.ProjectId == projectId).ToListAsync();

            var projectWeekData = weekData.Where(wd => wd.ProjectId == projectId);
            var totalUsers = projectWeekData.Count();
            var totalExtUsers = projectUserWeekData.Count(wd => wd.User.IsExternal);
            var totalWorkHours = projectWeekData.Sum(wd => wd.Week1 + wd.Week2 + wd.Week3 + wd.Week4 + (wd.Week5 ?? 0));
            var totalExtWorkHours = projectUserWeekData.Where(wd => wd.User.IsExternal)
                .Sum(wd => wd.Week1 + wd.Week2 + wd.Week3 + wd.Week4 + (wd.Week5 ?? 0));
            var users = projectUserWeekData
                .Select(wd => new UserViewModel
                {
                    Id = wd.User.Id,
                    EmpId = wd.User.EmpId,
                    UserName = wd.User.UserName,
                    FirstName = wd.User.FirstName,
                    LastName = wd.User.LastName,
                    Email = wd.User.Email,
                    IsExternal = wd.User.IsExternal,
                    Role = wd.User.Role,
                    WorkHoursPerDay = wd.User.WorkHoursPerDay,
                    ParentId = wd.User.ParentId,
                    Region = wd.User.Region,
                    Week1Hours = wd.Week1,
                    Week2Hours = wd.Week2,
                    Week3Hours = wd.Week3,
                    Week4Hours = wd.Week4,
                    Week5Hours = wd.Week5,
                }).ToList();

            return new ProjectDashboardViewModel
            {
                ProjectId = projectData.Id,
                ProjectNumber = projectData.Number,
                ProjectTitle = projectData.Title,
                Business = projectData.Business,
                Department = projectData.Department,
                Region = projectData.Region,
                Description = projectData.Description,
                TotalIntUsers = totalUsers - totalExtUsers,
                TotalExtUsers = totalExtUsers,
                TotalUsers = totalUsers,
                TotalIntWorkHours = totalWorkHours - totalExtWorkHours,
                TotalExtWorkHours = totalExtWorkHours,
                TotalWorkHours = totalWorkHours,
                Users = users,
            };
        }

        public async Task<IEnumerable<ProjectDashboardViewModel>> GetProjectDashboardAsync(int year, int month, Department? department, Region? region)
        {
            await RemoveWeekDataWithAllZero(year, month);

            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);

            var projects = await _context.Projects
                .Where(project => (department == null || (department.Value & project.Department) > 0))
                .Where(project => (region == null || (region.Value & project.Region) > 0))
                .Where(project => project.DateDeleted == null || project.DateDeleted >= firstDayOfNextMonth)
                .Where(project => project.DateCreated < firstDayOfNextMonth)
                .Select(project => new ProjectViewModel
                {
                    Id = project.Id
                })
                .ToListAsync();

            List<ProjectDashboardViewModel> projectsDashboard = new List<ProjectDashboardViewModel>();

            foreach (var project in projects)
            {
                var data = await GetProjectDashboardAsync(year, month, project.Id);
                projectsDashboard.Add(data);
            }

            return projectsDashboard.ToList();
        }

        public async Task<UserDashboardViewModel> GetUserDashboardAsync(int userId)
        {
            var userData = await _context.Users.FirstOrDefaultAsync(user => user.Id == userId)
                ?? throw new RecordNotFoundException($"Could not find any User with id: {userId}");

            var userWeekData = await _context.WeekData.Where(wd => wd.UserId == userId).ToListAsync();
            var totalProjects = userWeekData.Select(wd => wd.ProjectId).Distinct().Count();
            var totalWeek1Hours = userWeekData.Sum(wd => wd.Week1);
            var totalWeek2Hours = userWeekData.Sum(wd => wd.Week2);
            var totalWeek3Hours = userWeekData.Sum(wd => wd.Week3);
            var totalWeek4Hours = userWeekData.Sum(wd => wd.Week4);
            var totalWeek5Hours = userWeekData.Sum(wd => wd.Week5);

            return new UserDashboardViewModel
            {
                UserId = userData.Id,
                EmpId = userData.EmpId,
                UserName = userData.UserName,
                FirstName = userData.FirstName,
                LastName = userData.LastName,
                Email = userData.Email,
                IsExternal = userData.IsExternal,
                Department = userData.Department,
                Role = userData.Role,
                WorkHoursPerDay = userData.WorkHoursPerDay,
                ParentId = userData.ParentId,
                Region = userData.Region,
                LastSavedTime = userData.LastSavedTime,
                TotalProjects = totalProjects,
                TotalWeek1Hours = totalWeek1Hours,
                TotalWeek2Hours = totalWeek2Hours,
                TotalWeek3Hours = totalWeek3Hours,
                TotalWeek4Hours = totalWeek4Hours,
                TotalWeek5Hours = totalWeek5Hours,
            };
        }

        public async Task<UserDashboardViewModel> GetUserDashboardAsync(int year, int month, int userId)
        {
            await RemoveWeekDataWithAllZero(year, month);

            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);

            var userData = await _context.Users
                .FirstOrDefaultAsync(user => (user.DateDeleted == null || user.DateDeleted >= DateTime.Now) && user.DateCreated < firstDayOfNextMonth && user.Id == userId)
                ?? throw new RecordNotFoundException($"Could not find any User with id: {userId}");

            var weekData = await _context.WeekData.Where(wd => wd.Year == year && wd.Month == month).ToListAsync();
            var userProjectWeekData = await _context.WeekData.Include(wd => wd.Project)
                .Where(wd => wd.Year == year && wd.Month == month && wd.UserId == userId)
                .Select(wd => new ProjectViewModel
                {
                    Id = wd.Project.Id,
                    Number = wd.Project.Number,
                    Title = wd.Project.Title,
                    Description = wd.Project.Description,
                    WorkingHours = wd.Week1 + wd.Week2 + wd.Week3 + wd.Week4 + (wd.Week5 ?? 0),
                }).ToListAsync();

            var userWeekData = weekData.Where(wd => wd.UserId == userId);
            var totalProjects = userWeekData.Count();
            var totalWeek1Hours = userWeekData.Sum(wd => wd.Week1);
            var totalWeek2Hours = userWeekData.Sum(wd => wd.Week2);
            var totalWeek3Hours = userWeekData.Sum(wd => wd.Week3);
            var totalWeek4Hours = userWeekData.Sum(wd => wd.Week4);
            var totalWeek5Hours = userWeekData.Sum(wd => wd.Week5);
            var projects = userProjectWeekData;

            return new UserDashboardViewModel
            {
                UserId = userData.Id,
                EmpId = userData.EmpId,
                UserName = userData.UserName,
                FirstName = userData.FirstName,
                LastName = userData.LastName,
                Email = userData.Email,
                IsExternal = userData.IsExternal,
                Department = userData.Department,
                Role = userData.Role,
                WorkHoursPerDay = userData.WorkHoursPerDay,
                ParentId = userData.ParentId,
                Region = userData.Region,
                LastSavedTime = userData.LastSavedTime,
                TotalProjects = totalProjects,
                TotalWeek1Hours = totalWeek1Hours,
                TotalWeek2Hours = totalWeek2Hours,
                TotalWeek3Hours = totalWeek3Hours,
                TotalWeek4Hours = totalWeek4Hours,
                TotalWeek5Hours = totalWeek5Hours,
                Projects = projects,
            };
        }

        public async Task<IEnumerable<UserDashboardViewModel>> GetUserDashboardAsync(int year, int month, Department? department, Region? region)
        {
            await RemoveWeekDataWithAllZero(year, month);

            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);

            var users = await _context.Users
                .Where(user => (department == null || (department.Value & user.Department) > 0))
                .Where(user => (region == null || (region.Value & user.Region) > 0))
                .Where(user => user.DateDeleted == null || user.DateDeleted >= firstDayOfNextMonth)
                .Where(user => user.DateCreated < firstDayOfNextMonth && user.Role != Role.Executive)
                .Select(user => new UserViewModel
                {
                    Id = user.Id,
                }).ToListAsync();

            List<UserDashboardViewModel> usersDashboard = new List<UserDashboardViewModel>();

            foreach (var user in users)
            {
                var data = await GetUserDashboardAsync(year, month, user.Id);
                usersDashboard.Add(data);
            }

            return usersDashboard.ToList();
        }

        public async Task<IEnumerable<UserDashboardViewModel>> GetUserDashboardUnderParentAsync(int year, int month, int parentId, Region? region)
        {
            await RemoveWeekDataWithAllZero(year, month);
            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);
            var users = await _context.Users
                .Where(user => region == null || (region.Value & user.Region) > 0)
                .Where(user => user.DateDeleted == null || user.DateDeleted >= firstDayOfNextMonth)
                .Where(user => user.ParentId == parentId)
                .ToListAsync();

            // Initialize a list to hold the final result
            List<UserDashboardViewModel> usersDashboard = new List<UserDashboardViewModel>();

            // Fetch the dashboard data for the current user
            var userData = await GetUserDashboardAsync(year, month, parentId);
            usersDashboard.Add(userData);

            // Process each user to fetch their dashboard data and recursively fetch their children
            foreach (var user in users)
            {
                // Recursively fetch children of the current user
                var children = await GetUserDashboardUnderParentAsync(year, month, user.Id, region); // Corrected to pass user.Id instead of user.ParentId
                foreach (var child in children)
                {
                    usersDashboard.Add(child);
                }
            }

            return usersDashboard;
        }

        public async Task<IEnumerable<UserDashboardViewModel>> GetUsersWithUnfilledTimesheetAsync(int year, int month, Department? department, Region? region)
        {
            await RemoveWeekDataWithAllZero(year, month);

            var firstDayOfThisMonth = new DateTime(year, month, 1);
            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);

            var users = await _context.Users
                .Where(user => (department == null || (department.Value & user.Department) > 0) && user.Role != Role.Executive)
                .Where(user => (region == null || (region.Value & user.Region) > 0))
                .Where(user => user.DateDeleted == null || user.DateDeleted >= firstDayOfNextMonth)
                .Where(user => user.DateCreated < firstDayOfNextMonth && (user.LastSavedTime == null || user.LastSavedTime < firstDayOfThisMonth))
                .Select(user => new UserViewModel
                {
                    Id = user.Id,
                }).ToListAsync();

            List<UserDashboardViewModel> usersDashboard = new List<UserDashboardViewModel>();

            foreach (var user in users)
            {
                var data = await GetUserDashboardAsync(year, month, user.Id);
                usersDashboard.Add(data);
            }

            return usersDashboard.ToList();
        }

        private async Task<MessageViewModel> RemoveWeekDataWithAllZero(int year, int month)
        {
            var weekData = await _context.WeekData.Where(wd => wd.Year == year && wd.Month == month).ToListAsync();
            var weekDataToRemove = new List<WeekData>();
            foreach (var data in weekData)
            {
                if (data is { Week1: 0, Week2: 0, Week3: 0, Week4: 0, Week5: null or 0 })
                {
                    weekDataToRemove.Add(data);
                }
            }
            _context.WeekData.RemoveRange(weekDataToRemove);
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = "Week data removed successfully!"
            };
        }
    }
}
