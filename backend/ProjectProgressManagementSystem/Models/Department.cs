namespace ProjectProgressManagementSystem.Models
{
    [Flags]
    public enum Department
    {
        // Integer in powers of 2
        D1 = 1,
        D2 = 2,
        //ZDP = 4,
        // next will be 4, 8, 16, 32 and so on...
    }
}
