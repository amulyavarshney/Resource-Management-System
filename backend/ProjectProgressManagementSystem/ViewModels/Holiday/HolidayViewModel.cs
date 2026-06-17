using ProjectProgressManagementSystem.Models;

namespace ProjectProgressManagementSystem.ViewModels.Holiday
{
    public class HolidayViewModel
    {
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public HolidayType Type { get; set; }
        public Region? Region { get; set; }
        public int? UserId { get; set; }
        public bool? Show { get; set; }
    }
}
