using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.Extensions;
using ProjectProgressManagementSystem.Maps;
using ProjectProgressManagementSystem.Models;

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
            /*modelBuilder.Entity<Project>().Property<bool>("IsDeleted");
            modelBuilder.Entity<Project>().HasQueryFilter(m => EF.Property<bool>(m, "IsDeleted") == false);*/
            modelBuilder.ApplyConfiguration(new ProjectMapper());

            modelBuilder.Entity<User>().ToTable(nameof(User));
            /*modelBuilder.Entity<User>().Property<bool>("IsDeleted");
            modelBuilder.Entity<User>().HasQueryFilter(m => EF.Property<bool>(m, "IsDeleted") == false);*/
            modelBuilder.ApplyConfiguration(new UserMapper());

            modelBuilder.Entity<WeekData>().ToTable(nameof(WeekData)).HasKey(wh => new { wh.UserId, wh.ProjectId, wh.Year, wh.Month });
            //modelBuilder.Entity<Project>().HasNoKey().ToFunction("BlogsWithMultiplePosts");

            modelBuilder.Entity<Holiday>().ToTable(nameof(Holiday));
            modelBuilder.Entity<PersonalHoliday>().ToTable(nameof(PersonalHoliday));
            modelBuilder.Entity<Leave>().ToTable(nameof(Leave)).HasKey(l => new {l.Date, l.UserId});
        }

        // ref https://spin.atomicobject.com/2019/01/29/entity-framework-core-soft-delete/
        public override int SaveChanges()
        {
            // UpdateSoftDeleteStatuses();
            ChangeTracker.SetAuditProperties();
            return base.SaveChanges();
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            // UpdateSoftDeleteStatuses();
            ChangeTracker.SetAuditProperties();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // UpdateSoftDeleteStatuses();
            ChangeTracker.SetAuditProperties();
            return await base.SaveChangesAsync(cancellationToken);
        }

        public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            // UpdateSoftDeleteStatuses();
            ChangeTracker.SetAuditProperties();
            return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        /*private void UpdateSoftDeleteStatuses()
        {
            foreach (var entry in ChangeTracker.Entries())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.CurrentValues["IsDeleted"] = false;
                        break;
                    case EntityState.Deleted:
                        entry.State = EntityState.Modified;
                        entry.CurrentValues["IsDeleted"] = true;
                        break;
                }
            }
        }*/
    }
}
