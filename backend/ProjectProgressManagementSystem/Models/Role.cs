using System.ComponentModel;

namespace ProjectProgressManagementSystem.Models
{
    public enum Role
    {
        //[Description("Access to timesheet, holidays and profile pages")]
        Employee = 0,

        //[Description("Access to timesheet, holidays, profile and dashboard pages.")]
        Management = 1,
        
        //[Description("Access to holidays, dashboard, profile and admin pages")]
        Executive = 2,
        
        //[Description("Access to timesheet, holidays, dashboard, profile and admin pages")]
        Admin = 3,
        
        //[Description("Access to all pages for development and testing purposes.")]
        Developer = 4,
    }
}