namespace ProjectProgressManagementSystem.ViewModels.User
{
    public class PasswordViewModel
    {
        public byte[]? PasswordHash { get; set; }
        public byte[]? PasswordSalt { get; set; }
    }
}
