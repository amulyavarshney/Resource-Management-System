using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ProjectProgressManagementSystem.Configuration;
using ProjectProgressManagementSystem.DataAccess;
using ProjectProgressManagementSystem.Exceptions;
using ProjectProgressManagementSystem.Maps.ModelMappers;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Services.Interfaces;
using ProjectProgressManagementSystem.ViewModels;
using ProjectProgressManagementSystem.ViewModels.User;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProjectProgressManagementSystem.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthService> _logger;
        private readonly AppSettings _settings;

        public AuthService(ApplicationDbContext context, ILoggerFactory loggerFactory, IOptions<AppSettings> options)
        {
            _context = context;
            _logger = loggerFactory.CreateLogger<AuthService>();
            _settings = options.Value;
        }


        public async Task<MessageViewModel> RegisterAsync(UserCreateViewModel user)
        {
            var existingUser = await _context.Users.AnyAsync(u => u.DateDeleted == null && ((user.EmpId != null && u.EmpId == user.EmpId) || u.Email == user.Email));
            if (existingUser)
            {
                throw new DuplicateEntityException($"User already exists. Registration aborted.");
            }

            var userEntity = EntityModelMapper.ToEntity(user);

            await _context.AddAsync(userEntity);

            await _context.SaveChangesAsync();
            _logger.LogInformation("Registered successfully");
            return new MessageViewModel
            {
                Message = "User registered successfully."
            };
        }

        public async Task<string> LoginAsync(LoginViewModel loginViewModel)
        {
            var userDb = await GetUserAsync(loginViewModel.Email);

            if (!EntityModelMapper.VerifyPasswordHash(loginViewModel.Password, userDb.PasswordHash, userDb.PasswordSalt))
            {
                throw new LoginFailedException();
            }
            _logger.LogInformation("Login successfully");
            return GetToken(userDb);
        }

        private string GetToken(User userDb)
        {
            var claims = new List<Claim> {
                new Claim(ClaimTypes.Email, userDb.Email),
                new Claim("Role", userDb.Role.ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.JwtSecret));
            var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddHours(2),
                SigningCredentials = signingCredentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var securityToken = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(securityToken);
        }

        private async Task<User> GetUserAsync(string email)
        {
            var userDb = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            return userDb ?? throw new LoginFailedException();
        }
    }
}
