using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.ViewModels;

namespace ProjectProgressManagementSystem.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LockController : ControllerBase
    {
        private readonly IDistributedCache _cache;

        public LockController(IDistributedCache cache)
        {
            _cache = cache;
        }

        [HttpGet]
        public ActionResult<bool> GetLock(Department? department, Region? region)
        {
            var isLockedBytes = _cache.Get($"lockTimesheet-{department}-{region}");
            if (isLockedBytes == null)
            {
                return Ok(false);
            }
            bool isLocked = BitConverter.ToBoolean(isLockedBytes);
            return Ok(isLocked);
        }

        [HttpPost]
        public ActionResult<MessageViewModel> SetLock(bool isLocked, Department? department, Region? region)
        {
            byte[] isLockedBytes = BitConverter.GetBytes(isLocked);
            _cache.Set($"lockTimesheet-{department}-{region}", isLockedBytes);
            return Ok(new MessageViewModel { Message = $"Lock changed to {isLocked}" });
        }
    }
}
