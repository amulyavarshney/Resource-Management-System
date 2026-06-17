using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.Maps.EntityConfigs;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Utilities;

namespace ProjectProgressManagementSystem.DataAccess
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<Project> Projects { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<WeekData> WeekData { get; set; }
        public DbSet<Holiday> Holidays { get; set; }
        public DbSet<PersonalHoliday> PersonalHolidays { get; set; }
        public DbSet<Leave> Leaves { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Project>().ToTable(nameof(Project));
            modelBuilder.ApplyConfiguration(new ProjectMapper());

            modelBuilder.Entity<User>().ToTable(nameof(User));
            modelBuilder.ApplyConfiguration(new UserMapper());

            modelBuilder.Entity<WeekData>().ToTable(nameof(WeekData)).HasKey(wh => new { wh.UserId, wh.ProjectId, wh.Year, wh.Month });

            modelBuilder.Entity<Holiday>().ToTable(nameof(Holiday));
            modelBuilder.Entity<PersonalHoliday>().ToTable(nameof(PersonalHoliday));
            modelBuilder.Entity<Leave>().ToTable(nameof(Leave)).HasKey(l => new {l.Date, l.UserId});
        }

        public override int SaveChanges()
        {
            ChangeTracker.SetAuditProperties();
            return base.SaveChanges();
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            ChangeTracker.SetAuditProperties();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ChangeTracker.SetAuditProperties();
            return await base.SaveChangesAsync(cancellationToken);
        }

        public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            ChangeTracker.SetAuditProperties();
            return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }
    }
}
