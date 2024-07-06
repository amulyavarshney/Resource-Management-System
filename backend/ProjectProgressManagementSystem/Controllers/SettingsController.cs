//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Caching.Distributed;
//using ProjectProgressManagementSystem.ViewModels;

//namespace ProjectProgressManagementSystem.Controllers
//{
//    [Route("api/v1/[controller]")]
//    [ApiController]
//    public class SettingsController : ControllerBase
//    {
//        private readonly IDistributedCache _cache;

//        public SettingsController(IDistributedCache cache)
//        {
//            _cache = cache;
//        }

//        [HttpGet()]
//        public ActionResult<bool> GetFavourites(int userId)
//        {
//            var isLockedBytes = _cache.Get("lock");
//            if (isLockedBytes == null)
//            {
//                return Ok(false);
//            }
//            bool isLocked = BitConverter.ToBoolean(isLockedBytes);
//            return Ok(isLocked);
//        }

//        [HttpPost()]
//        public ActionResult<MessageViewModel> SetFavourites(bool isLocked)
//        {
//            byte[] isLockedBytes = BitConverter.GetBytes(isLocked);
//            //HttpContext.Session.Set("lock", isLockedBytes);
//            _cache.Set("lock", isLockedBytes);
//            return Ok(new MessageViewModel { Message = $"Lock changed to {isLocked}" });
//        }
//    }
//}
