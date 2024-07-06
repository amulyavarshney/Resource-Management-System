using Microsoft.EntityFrameworkCore;

namespace ProjectProgressManagementSystem.Models
{
    [PrimaryKey(nameof(Date), nameof(UserId))]
    public class PersonalHoliday: HolidayBase
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public bool Show { get; set; }
    }
}
