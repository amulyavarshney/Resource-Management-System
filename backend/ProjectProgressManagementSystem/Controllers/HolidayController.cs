using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.Holiday;
using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.Controllers
{
    [Authorize]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class HolidayController: ControllerBase
    {
        private readonly IHolidayService _service;

        public HolidayController(IHolidayService service)
        {
            _service = service;
        }

        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Holiday>>> GetAllAsync(Region? region)
        {
            return Ok(await _service.GetAllAsync(region));
        }

        [HttpGet("personal")]
        public async Task<ActionResult<IEnumerable<PersonalHoliday>>> GetAllAsync(int? userId, Region? region)
        {
            return Ok(await _service.GetAllAsync(userId, region));
        }

        //[HttpGet("{month:int}")]
        //public async Task<ActionResult<IEnumerable<Holiday>>> GetHolidaysAsync(int month)
        //{
        //    return Ok(await _service.GetHolidaysAsync(month));
        //}

        [HttpGet("{year:int}")]
        public async Task<ActionResult<IEnumerable<Holiday>>> GetAllAsync(int year, int? userId, Region? region)
        {
            return Ok(await _service.GetAllAsync(year, userId, region));
        }

        [HttpGet("{year:int}/{month:int}")]
        public async Task<ActionResult<IEnumerable<Holiday>>> GetAllAsync(int year, int month, int? userId, Region? region)
        {
            return Ok(await _service.GetAllAsync(year, month, userId, region));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Holiday>>> GetAsync([Required] DateTime date, int? userId, Region? region)
        {
            return Ok(await _service.GetAsync(date, userId, region));
        }

        [HttpPost]
        public async Task<ActionResult<MessageViewModel>> CreateAsync(HolidayBase holiday, int? userId, Region? region)
        {
            return Ok(await _service.CreateAsync(holiday, userId, region));
        }

        //[HttpPost("add")]
        //public async Task<ActionResult<MessageViewModel>> CreateAllAsync(List<Holiday> holidays, int? userId)
        //{
        //    return Ok(await _service.CreateAllAsync(holidays, userId));
        //}

        [HttpPost("importHolidays")]
        public async Task<ActionResult<MessageViewModel>> ImportHolidaysFromExcelAsync([Required] IFormFile excelFile)
        {
            return Ok(await _service.ImportHolidaysFromExcelAsync(excelFile));
        }

        [HttpPost("importPersonalHolidays")]
        public async Task<ActionResult<MessageViewModel>> ImportPersonalHolidaysFromExcelAsync([Required] IFormFile excelFile)
        {
            return Ok(await _service.ImportPersonalHolidaysFromExcelAsync(excelFile));
        }

        // update an existing holiday
        [HttpPatch]
        public async Task<ActionResult<HolidayViewModel>> UpdateAsync([Required] DateTime date, Region region, HolidayUpdateViewModel holiday)
        {
            return Ok(await _service.UpdateHolidayAsync(date, region, holiday));
        }

        // update an existing personal holiday
        [HttpPatch("{userId:int}")]
        public async Task<ActionResult<HolidayViewModel>> UpdateAsync([Required] DateTime date, int userId, HolidayUpdateViewModel holiday)
        {
            return Ok(await _service.UpdatePersonalHolidayAsync(date, userId, holiday));
        }

        [HttpDelete]
        public async Task<ActionResult<MessageViewModel>> DeleteAsync([Required] DateTime date, int? userId, Region? region)
        {
            return Ok(await _service.DeleteAsync(date, userId, region));
        }

        [HttpDelete("resetHolidays")]
        public async Task<ActionResult<MessageViewModel>> ResetHolidaysAsync()
        {
            return Ok(await _service.ResetHolidaysAsync());
        }

        [HttpDelete("resetPersonalHolidays")]
        public async Task<ActionResult<MessageViewModel>> ResetPersonalHolidaysAsync()
        {
            return Ok(await _service.ResetPersonalHolidaysAsync());
        }

        [HttpDelete("reset")]
        public async Task<ActionResult<MessageViewModel>> ResetAsync()
        {
            return Ok(await _service.ResetAsync());
        }
    }
}
