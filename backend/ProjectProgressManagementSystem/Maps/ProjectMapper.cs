using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectProgressManagementSystem.Maps.Base;
using ProjectProgressManagementSystem.Models;

namespace ProjectProgressManagementSystem.Maps
{
    public class ProjectMapper : EntityMapBase<Project>
    {
        public override void Configure(EntityTypeBuilder<Project> builder)
        {
            base.Configure(builder);
        }
    }
}
