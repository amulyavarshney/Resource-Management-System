using Microsoft.AspNetCore.Mvc;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.User;
using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        // get all users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserViewModel>>> GetAsync(Department? department, Region? region)
        {
            return Ok(await _service.GetAllAsync(department, region));
        }

        // get all managers
        [HttpGet("managers")]
        public async Task<ActionResult<IEnumerable<UserViewModel>>> GetManagersAsync(Department? department, Region? region)
        {
            return Ok(await _service.GetManagersAsync(department, region));
        }

        // get all users in month, year
        [HttpGet("{year:int}/{month:int}")]
        public async Task<ActionResult<IEnumerable<UserViewModel>>> GetAsync(int year, int month, Department? department, Region? region)
        {
            return Ok(await _service.GetAllAsync(year, month, department, region));
        }

        // get all users under the same parent in month, year
        [HttpGet("{year:int}/{month:int}/parent/{parentId:int}")]
        public async Task<ActionResult<IEnumerable<UserViewModel>>> GetAsync(int year, int month, int parentId, Department? department, Region? region)
        {
            return Ok(await _service.GetAllAsync(year, month, parentId, department, region));
        }

        // get user by id
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserViewModel>> GetByIdAsync(int id)
        {
            return Ok(await _service.GetByIdAsync(id));
        }

        // create a new user
        [HttpPost]
        public async Task<ActionResult<UserViewModel>> CreateAsync(UserCreateViewModel user)
        {
            return Ok(await _service.CreateAsync(user));
        }

        // import users from excel
        [HttpPost("import")]
        public async Task<ActionResult<MessageViewModel>> ImportFromExcelAsync([Required] IFormFile excelFile)
        {
            return Ok(await _service.ImportFromExcelAsync(excelFile));
        }

        // update an existing user
        [HttpPatch("{id:int}")]
        public async Task<ActionResult<UserViewModel>> UpdateAsync(int id, UserUpdateViewModel user)
        {
            return Ok(await _service.UpdateAsync(id, user));
        }

        // update last Saved Time for an existing user
        [HttpPatch("{id:int}/lastSavedTime")]
        public async Task<ActionResult<UserViewModel>> UpdateAsync(int id, DateTime lastSavedTime)
        {
            return Ok(await _service.UpdateLastSavedTimeAsync(id, lastSavedTime));
        }


        // update password for an existing user
        [HttpPatch("{id:int}/changePassword")]
        public async Task<ActionResult<MessageViewModel>> UpdateAsync(int id, PasswordCreateViewModel password)
        {
            return Ok(await _service.UpdatePasswordAsync(id, password));
        }

        // remove password for an existing user
        [HttpPatch("{id:int}/removePassword")]
        public async Task<ActionResult<MessageViewModel>> UpdateAsync(int id, string password)
        {
            return Ok(await _service.RemovePasswordAsync(id, password));
        }

        // delete a user
        [HttpDelete("{id:int}")]
        public async Task<ActionResult<MessageViewModel>> DeleteAsync(int id, bool? deleteNow)
        {
            return Ok(await _service.DeleteAsync(id, deleteNow));
        }

        // reset users table
        [HttpDelete("reset")]
        public async Task<ActionResult<MessageViewModel>> ResetAsync()
        {
            return Ok(await _service.ResetAsync());
        }
    }
}
