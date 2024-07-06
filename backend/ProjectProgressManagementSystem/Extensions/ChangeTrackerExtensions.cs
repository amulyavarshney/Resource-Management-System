using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore;
using ProjectProgressManagementSystem.Models;

namespace ProjectProgressManagementSystem.Extensions
{
    public static class ChangeTrackerExtensions
    {
        // This method is responsible for handling the deletion logic.
        public static void SetAuditProperties(this ChangeTracker changeTracker)
        {
            changeTracker.DetectChanges();

            // Get the entries that are marked as deleted.
            IEnumerable<EntityEntry> entities =
                changeTracker
                    .Entries()
                    .Where(t => t.Entity is IEntityBase && t.State == EntityState.Deleted);

            if (entities.Any())
            {
                foreach (EntityEntry entry in entities)
                {
                    IEntityBase entity = (IEntityBase)entry.Entity;

                    // Check if the entity is not scheduled for deletion
                    if (!entity.DateDeleted.HasValue)
                    {
                        // Set the DateDeleted field to the current date.
                        entity.DateDeleted = DateTime.Now.Date;
                    }
                    // Mark the entity as modified. This will trigger an update operation when SaveChanges is called.
                    entry.State = EntityState.Modified;
                }
            }
        }
    }
}
