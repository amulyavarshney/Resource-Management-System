using ProjectProgressManagementSystem.Models;

namespace ProjectProgressManagementSystem.ViewModels
{
    public class LeaveCreateViewModel
    {
        public DateTime Date { get; set; }
        public string Type { get; set; }
        public string Session { get; set; }
        public int UserId { get; set; }
    }
}
