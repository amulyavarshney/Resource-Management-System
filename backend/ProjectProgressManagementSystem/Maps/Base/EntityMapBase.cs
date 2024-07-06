using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectProgressManagementSystem.Models;

namespace ProjectProgressManagementSystem.Maps.Base
{
    public class EntityMapBase<TEntity> : IEntityMapBase<TEntity> where TEntity : class, IEntityBase
    {
        public virtual void Configure(EntityTypeBuilder<TEntity> builder)
        {
            //builder.HasQueryFilter(t => t.IsDeleted == false);
        }
    }
}
