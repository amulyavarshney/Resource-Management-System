using Microsoft.EntityFrameworkCore;

namespace ProjectProgressManagementSystem.Models
{
    public enum HolidayType
    {
        Compulsory = 0,
        Festival = 1,
    }

    public class HolidayBase
    {
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public HolidayType Type { get; set; }
    }
}
