using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.WeekData;
using ProjectProgressManagementSystem.ViewModels.User;
using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.Controllers
{
    [Authorize]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class WeekDataController : ControllerBase
    {
        private readonly IWeekDataService _service;

        public WeekDataController(IWeekDataService service)
        {
            _service = service;
        }
        private WeekDataKey CreateWeekDataKey(int userId, int projectId, int year, int month)
        {
            return new WeekDataKey
            {
                UserId = userId,
                ProjectId = projectId,
                Year = year,
                Month = month
            };
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserViewModel>>> GetAsync()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{year:int}/{month:int}")]
        public async Task<ActionResult<WeekDataViewModel>> GetByIdAsync(int year, int month)
        {
            return Ok(await _service.GetByYearAndMonthAsync(year, month));
        }

        [HttpGet("{userId:int}/{projectId:int}/{year:int}/{month:int}")]
        public async Task<ActionResult<WeekDataViewModel>> GetByIdAsync(int userId, int projectId, int year, int month)
        {
            var key = CreateWeekDataKey(userId, projectId, year, month);
            return Ok(await _service.GetByIdAsync(key));
        }

        [HttpPost("{userId:int}/{projectId:int}/{year:int}/{month:int}")]
        public async Task<ActionResult<WeekDataViewModel>> CreateAsync(int userId, int projectId, int year, int month, WeekDataViewModel workHours)
        {
            var key = CreateWeekDataKey(userId, projectId, year, month);
            return Ok(await _service.CreateAsync(key, workHours));
        }

        // import users from excel
        [HttpPost("import")]
        public async Task<ActionResult<MessageViewModel>> ImportFromExcelAsync([Required] IFormFile excelFile)
        {
            return Ok(await _service.ImportFromExcelAsync(excelFile));
        }

        [HttpPut("{userId:int}/{projectId:int}/{year:int}/{month:int}")]
        public async Task<ActionResult<WeekDataViewModel>> UpdateAsync(int userId, int projectId, int year, int month, WeekDataViewModel workHours)
        {
            var key = CreateWeekDataKey(userId, projectId, year, month);
            return Ok(await _service.UpdateAsync(key, workHours));
        }

        // delete a row
        [HttpDelete("{userId:int}/{projectId:int}/{year:int}/{month:int}")]
        public async Task<ActionResult<WeekDataViewModel>> DeleteAsync(int userId, int projectId, int year, int month)
        {
            var key = CreateWeekDataKey(userId, projectId, year, month);
            return Ok(await _service.DeleteAsync(key));
        }

        // reset weekData table
        [HttpDelete("reset")]
        public async Task<ActionResult<MessageViewModel>> ResetAsync()
        {
            return Ok(await _service.ResetAsync());
        }
    }
}
