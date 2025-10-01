using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels.Dashboard;

namespace ProjectProgressManagementSystem.Controllers
{
    [Authorize]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;

        public DashboardController(IDashboardService dashboardService)
        {
            _service = dashboardService;
        }

        [HttpGet("{year:int}/{month:int}")]
        public async Task<ActionResult<UserDashboardViewModel>> GetDashboardAsync(int year, int month, Department? department, Region? region)
        {
            return Ok(await _service.GetDashboardAsync(year, month, department, region));
        }

        [HttpGet("project/{projectId:int}")]
        public async Task<ActionResult<ProjectDashboardViewModel>> GetProjectDashboardAsync(int projectId)
        {
            return Ok(await _service.GetProjectDashboardAsync(projectId));
        }

        [HttpGet("{year:int}/{month:int}/project")]
        public async Task<ActionResult<IEnumerable<ProjectDashboardViewModel>>> GetProjectDashboardAsync(int year, int month, Department? department, Region? region)
        {
            return Ok(await _service.GetProjectDashboardAsync(year, month, department, region));
        }

        [HttpGet("{year:int}/{month:int}/project/{projectId:int}")]
        public async Task<ActionResult<ProjectDashboardViewModel>> GetProjectDashboardAsync(int year, int month, int projectId)
        {
            return Ok(await _service.GetProjectDashboardAsync(year, month, projectId));
        }

        [HttpGet("user/{userId:int}")]
        public async Task<ActionResult<UserDashboardViewModel>> GetUserDashboardAsync(int userId)
        {
            return Ok(await _service.GetUserDashboardAsync(userId));
        }

        [HttpGet("{year:int}/{month:int}/user")]
        public async Task<ActionResult<IEnumerable<UserDashboardViewModel>>> GetUserDashboardAsync(int year, int month, Department? department, Region? region)
        {
            return Ok(await _service.GetUserDashboardAsync(year, month, department, region));
        }

        [HttpGet("{year:int}/{month:int}/parent/{parentId:int}")]
        public async Task<ActionResult<IEnumerable<UserDashboardViewModel>>> GetUserDashboardUnderParentAsync(int year, int month, int parentId, Region? region)
        {
            return Ok(await _service.GetUserDashboardUnderParentAsync(year, month, parentId, region));
        }

        [HttpGet("{year:int}/{month:int}/users-with-unfilled-timesheet")]
        public async Task<ActionResult<IEnumerable<UserDashboardViewModel>>> GetUsersWithUnfilledTimesheetAsync(int year, int month, Department? department, Region? region)
        {
            return Ok(await _service.GetUsersWithUnfilledTimesheetAsync(year, month, department, region));
        }

        [HttpGet("{year:int}/{month:int}/user/{userId:int}")]
        public async Task<ActionResult<UserDashboardViewModel>> GetUserDashboardAsync(int year, int month, int userId)
        {
            return Ok(await _service.GetUserDashboardAsync(year, month, userId));
        }
    }
}
