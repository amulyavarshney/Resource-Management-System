using System.ComponentModel;
using Microsoft.EntityFrameworkCore;

namespace ProjectProgressManagementSystem.Models
{
    public enum LeaveType
    {
        [Description("Casual Leave")] 
        Casual = 0,

        [Description("Planned Leave")]
        Planned = 1,

        [Description("Sick Leave")]
        Sick = 2,

        [Description("Unplanned Leave")]
        Unplanned = 3,
    }

    public enum LeaveSession
    {
        [Description("Full Day")]
        FullDay = 0,

        [Description("Half Day")]
        HalfDay = 1,
    }

    [PrimaryKey(nameof(Date), nameof(UserId))]
    public class Leave
    {
        public DateTime Date { get; set; }
        public LeaveType Type { get; set; }
        public LeaveSession Session { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
