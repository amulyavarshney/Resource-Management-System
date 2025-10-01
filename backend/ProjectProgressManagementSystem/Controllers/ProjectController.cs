using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.Project;
using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.Controllers
{
    [Authorize]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _service;

        public ProjectController(IProjectService service)
        {
            _service = service;
        }

        // get all projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectViewModel>>> GetAsync(Department? department, Region? region)
        {
            return Ok(await _service.GetAllAsync(department, region));
        }

        // get all projects in month, year
        [HttpGet("{year:int}/{month:int}")]
        public async Task<ActionResult<IEnumerable<ProjectViewModel>>> GetAsync(int year, int month, Department? department, Region? region)
        {
            return Ok(await _service.GetAllAsync(year, month, department, region));
        }

        // get project by id
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProjectViewModel>> GetByIdAsync(int id)
        {
            return Ok(await _service.GetByIdAsync(id));
        }

        // create a new project
        [HttpPost]
        public async Task<ActionResult<ProjectViewModel>> CreateAsync(ProjectCreateViewModel project)
        {
            return Ok(await _service.CreateAsync(project));
        }

        // import projects from excel
        [HttpPost("import")]
        public async Task<ActionResult<MessageViewModel>> ImportFromExcelAsync([Required] IFormFile excelFile)
        {
            return Ok(await _service.ImportFromExcelAsync(excelFile));
        }

        // update an existing project
        [HttpPatch("{id:int}")]
        public async Task<ActionResult<ProjectViewModel>> UpdateAsync(int id, ProjectUpdateViewModel project)
        {
            return Ok(await _service.UpdateAsync(id, project));
        }

        // delete a project
        [HttpDelete("{id:int}")]
        public async Task<ActionResult<MessageViewModel>> DeleteAsync(int id, bool? deleteNow)
        {
            return Ok(await _service.DeleteAsync(id, deleteNow));
        }

        // reset projects table
        [HttpDelete("reset")]
        public async Task<ActionResult<MessageViewModel>> ResetAsync()
        {
            return Ok(await _service.ResetAsync());
        }
    }
}
