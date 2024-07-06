using ProjectProgressManagementSystem.Models;

namespace ProjectProgressManagementSystem.ViewModels.Project
{
    public class ProjectViewModel
    {
        public int Id { get; set; }
        public string Number { get; set; }
        public string Title { get; set; }
        public string? Business { get; set; }
        public Department Department { get; set; }
        public Region Region { get; set; }
        public string? Description { get; set; }
        public int? WorkingHours { get; set; }
    }
}
