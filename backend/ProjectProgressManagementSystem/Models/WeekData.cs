using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using ProjectProgressManagementSystem.Utilities;

namespace ProjectProgressManagementSystem.Models
{
    [PrimaryKey(nameof(UserId), nameof(ProjectId), nameof(Year), nameof(Month))]
    public class WeekData
    {
        [Key, Column(Order = 1)]
        [YearRange(2000)]
        public int Year { get; set; } = DateTime.Now.Year;

        [Key, Column(Order = 2)]
        [Range(1, 12)]
        public int Month { get; set; } = DateTime.Now.Month;

        [Key, Column(Order = 3)]
        public int UserId { get; set; }
        public User User { get; set; }

        [Key, Column(Order = 4)]
        public int ProjectId { get; set; }
        public Project Project { get; set; }

        public int Week1 { get; set; }
        public int Week2 { get; set; }
        public int Week3 { get; set; }
        public int Week4 { get; set; }
        public int? Week5 { get; set; }
    }
}
