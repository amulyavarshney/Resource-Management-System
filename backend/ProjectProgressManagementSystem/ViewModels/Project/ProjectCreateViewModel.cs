using ProjectProgressManagementSystem.Models;
using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.ViewModels.Project
{
    public class ProjectCreateViewModel
    {
        [Required] public string Number { get; set; }
        [Required] public string Title { get; set; }
        public string? Business { get; set; }
        public Department Department { get; set; }
        public Region Region { get; set; }
        public string? Description { get; set; } = string.Empty;
    }
}