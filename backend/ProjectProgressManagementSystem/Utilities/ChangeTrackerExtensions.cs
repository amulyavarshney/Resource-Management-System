using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.Models;

namespace ProjectProgressManagementSystem.Utilities
{
    public static class ChangeTrackerExtensions
    {
        public static void SetAuditProperties(this ChangeTracker changeTracker)
        {
            changeTracker.DetectChanges();

            IEnumerable<EntityEntry> entities =
                changeTracker
                    .Entries()
                    .Where(t => t.Entity is IEntityBase && t.State == EntityState.Deleted);

            if (entities.Any())
            {
                foreach (EntityEntry entry in entities)
                {
                    IEntityBase entity = (IEntityBase)entry.Entity;

                    if (!entity.DateDeleted.HasValue)
                    {
                        entity.DateDeleted = DateTime.Now.Date;
                    }
                    entry.State = EntityState.Modified;
                }
            }
        }
    }
}
