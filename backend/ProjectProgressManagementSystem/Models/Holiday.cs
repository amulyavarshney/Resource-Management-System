using Microsoft.EntityFrameworkCore;

namespace ProjectProgressManagementSystem.Models
{
    [PrimaryKey(nameof(Date), nameof(Region))]
    public class Holiday: HolidayBase
    {
        public Region Region { get; set; }
    }
}
