using Microsoft.AspNetCore.Mvc;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LeaveController: ControllerBase
    {
        private readonly ILeaveService _service;

        public LeaveController(ILeaveService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Leave>>> GetAllAsync(DateTime? date)
        {
            return Ok(await _service.GetAllAsync(date));
        }

        [HttpGet("{year:int}/{month:int}/{userId:int}")]
        public async Task<ActionResult<IEnumerable<Leave>>> GetAllAsync(int year, int month, int userId)
        {
            return Ok(await _service.GetAllAsync(year, month, userId));
        }

        [HttpGet("{userId:int}")]
        public async Task<ActionResult<IEnumerable<Leave>>> GetAllAsync(DateTime? date, int userId)
        {
            return Ok(await _service.GetAllAsync(date, userId));
        }

        [HttpPost]
        public async Task<ActionResult<MessageViewModel>> CreateAsync(LeaveCreateViewModel leave)
        {
            return Ok(await _service.CreateAsync(leave));
        }

        [HttpPost("add")]
        public async Task<ActionResult<MessageViewModel>> CreateAllAsync(List<LeaveCreateViewModel> leaves)
        {
            return Ok(await _service.CreateAllAsync(leaves));
        }

        [HttpPost("import")]
        public async Task<ActionResult<MessageViewModel>> ImportFromExcelAsync([Required] IFormFile excelFile)
        {
            return Ok(await _service.ImportFromExcelAsync(excelFile));
        }

        [HttpDelete("{userId:int}")]
        public async Task<ActionResult<MessageViewModel>> DeleteAsync([Required] DateTime date, int userId)
        {
            return Ok(await _service.DeleteAsync(date, userId));
        }

        [HttpDelete("reset")]
        public async Task<ActionResult<MessageViewModel>> ResetAsync()
        {
            return Ok(await _service.ResetAsync());
        }
    }
}
