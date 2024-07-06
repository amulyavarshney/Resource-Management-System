using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectProgressManagementSystem.Maps.Base;
using ProjectProgressManagementSystem.Models;

namespace ProjectProgressManagementSystem.Maps
{
    public class UserMapper : EntityMapBase<User>
    {
        public override void Configure(EntityTypeBuilder<User> builder)
        {
            base.Configure(builder);
        }
    }
}
