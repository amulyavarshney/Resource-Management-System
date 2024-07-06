using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.User;

namespace ProjectProgressManagementSystem.Services.Interfaces
{
    public interface IAuthService
    {
        Task<MessageViewModel> RegisterAsync(UserCreateViewModel user);
        Task<string> LoginAsync(LoginViewModel loginViewModel);
    }
}
