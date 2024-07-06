namespace ProjectProgressManagementSystem.Models
{
    public class User : EntityBase
    {
        public uint? EmpId { get; set; }
        public string? UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public byte[]? PasswordHash { get; set; }
        public byte[]? PasswordSalt { get; set; }
        public bool IsExternal { get; set; } = false;
        public Department Department { get; set; }
        public Region Region { get; set; }
        public Role Role { get; set; } = Role.Employee;
        public int WorkHoursPerDay { get; set; } = 8;
        public int ParentId { get; set; }
        public DateTime? LastSavedTime { get; set; }
        public List<PersonalHoliday> PersonalHolidays { get; set; } = new List<PersonalHoliday>();
        public List<Leave> Leaves { get; set; } = new List<Leave>();
        public List<WeekData> WeekData { get; set; } = new List<WeekData>();
    }
}