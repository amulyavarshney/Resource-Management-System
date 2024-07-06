using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.User;

namespace ProjectProgressManagementSystem.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;

        public AuthController(IAuthService service)
        {
            _service = service;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginViewModel viewModel)
        {
            return Ok(await _service.LoginAsync(viewModel));
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<MessageViewModel>> Register(UserCreateViewModel viewModel)
        {
            return Ok(await _service.RegisterAsync(viewModel));
        }
    }
}
