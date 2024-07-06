namespace ProjectProgressManagementSystem.Models
{
    public class Project : EntityBase
    {
        public string Number { get; set; }
        public string Title { get; set; }
        public string? Business { get; set; }
        public Department Department { get; set; }
        public Region Region { get; set; }
        public string? Description { get; set; }
        public List<WeekData> WeekData { get; set; } = new List<WeekData>();
    }
}