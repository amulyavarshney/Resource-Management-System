using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.DataAccess;
using ProjectProgressManagementSystem.Exceptions;
using ProjectProgressManagementSystem.Extensions;
using ProjectProgressManagementSystem.Maps.ModelMappers;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.Project;
using System.Data;

namespace ProjectProgressManagementSystem.Services.Implementations
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;
        public ProjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        // get all projects
        public async Task<IEnumerable<ProjectViewModel>> GetAllAsync(Department? department, Region? region)
        {
            return await _context.Projects
                .Where(project => department == null || (department.Value & project.Department) > 0)
                .Where(project => region == null || (region.Value & project.Region) > 0)
                .Where(project => project.DateDeleted == null || project.DateDeleted >= DateTime.Now)
                .Select(project => new ProjectViewModel
                {
                    Id = project.Id,
                    Number = project.Number,
                    Title = project.Title,
                    Business = project.Business,
                    Department = project.Department,
                    Region = project.Region,
                    Description = project.Description,
                }).ToListAsync();
        }

        // get all projects in month, year
        public async Task<IEnumerable<ProjectViewModel>> GetAllAsync(int year, int month, Department? department, Region? region)
        {
            var firstDayOfNextMonth = new DateTime(year, month, 1).AddMonths(1);
            return await _context.Projects
                .Where(project => department == null || (department.Value & project.Department) > 0)
                .Where(project => region == null || (region.Value & project.Region) > 0)
                .Where(project => project.DateDeleted == null || project.DateDeleted >= firstDayOfNextMonth)
                .Where(project => project.DateCreated < firstDayOfNextMonth)
                .Select(project => new ProjectViewModel
                {
                    Id = project.Id,
                    Number = project.Number,
                    Title = project.Title,
                    Business = project.Business,
                    Department = project.Department,
                    Region = project.Region,
                    Description = project.Description,
                }).ToListAsync();
        }

        // get project by id
        public async Task<ProjectViewModel> GetByIdAsync(int id)
        {
            var project = await FromId(id);
            return ViewModelMapper.ToViewModel(project);
        }

        // create a new project
        public async Task<ProjectViewModel> CreateAsync(ProjectCreateViewModel project)
        {
            var existingProject = await _context.Projects.AnyAsync(p => p.DateDeleted == null && (p.Number == project.Number || p.Title == project.Title));
            if (existingProject)
            {
                throw new DuplicateEntityException($"Project already exists in {project.Department} department.");
            }
            var projectEntity = EntityModelMapper.ToEntity(project);
            await _context.Projects.AddAsync(projectEntity);
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(projectEntity);
        }

        // import projects from excel
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
                var projects = new List<Project>();

                foreach (DataRow row in dataTable.Rows)
                {
                    var project = EntityModelMapper.ToProjectEntity(row);
                    projects.Add(project);
                }
                // Add users to the database
                await _context.Projects.AddRangeAsync(projects);
                await _context.SaveChangesAsync();

                return new MessageViewModel
                {
                    Message = "Projects imported successfully."
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error importing projects from Excel: {ex.Message}");
            }
        }

        // update an existing project
        public async Task<ProjectViewModel> UpdateAsync(int id, ProjectUpdateViewModel project)
        {
            var projectEntity = await FromId(id);
            if (projectEntity.DateDeleted != null)
            {
                throw new OperationNotSupportedException($"Project with id {id} is scheduled to delete on {projectEntity.DateDeleted}.");
            }
            if (project.Number == null && project.Title == null)
            {
                projectEntity.Department = project.Department ?? projectEntity.Department;
                projectEntity.Description = project.Description ?? projectEntity.Description;
                await _context.SaveChangesAsync();
                return ViewModelMapper.ToViewModel(projectEntity);
            }
            var today = DateTime.Now;
            var lastDateOfPreviousMonth = new DateTime(today.Year, today.Month-1, DateTime.DaysInMonth(today.Year, today.Month-1));
            projectEntity.DateModified = DateTime.Now.Date;
            projectEntity.DateDeleted = lastDateOfPreviousMonth;
            var newProjectEntity = EntityModelMapper.ToEntity(projectEntity, project);
            await _context.Projects.AddAsync(newProjectEntity);
            await _context.SaveChangesAsync();
            return ViewModelMapper.ToViewModel(newProjectEntity);
        }

        // delete a project
        public async Task<MessageViewModel> DeleteAsync(int id, bool? deleteNow)
        {
            var project = await FromId(id);

            // If deleteNow is not true, schedule the project for deletion on the first day of the next month.
            if (deleteNow != true)
            {
                // If the project is already scheduled for deletion, throw an exception.
                if (project.DateDeleted.HasValue)
                {
                    throw new OperationNotSupportedException($"Project with id {id} is scheduled to delete on {project.DateDeleted}.");
                }

                // Set the DateDeleted field to the first day of the next month.
                project.DateDeleted = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(1);
            }
            else if (project.DateDeleted.HasValue)
            {
                // If deleteNow is true and the project is scheduled for deletion, cancel the deletion.
                project.DateDeleted = null;
            }

            // Remove the project from the Projects DbSet. This will mark the project as deleted in the ChangeTracker.
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return new MessageViewModel
            {
                Message = $"Project with id {id} is deleted successfully."
            };
        }

        // reset projects table
        public async Task<MessageViewModel> ResetAsync()
        {
            await _context.Projects.ExecuteDeleteAsync();
            return new MessageViewModel
            {
                Message = "Projects table reset successfully."
            };
        }

        private async Task<Project> FromId(int id)
        {
            var projectDb = await _context.Projects.FirstAsync(project => (project.DateDeleted == null || project.DateDeleted >= DateTime.Now) && project.Id == id);
            return projectDb ?? throw new RecordNotFoundException($"Could not find any Project with id: {id}");
        }
    }
}
