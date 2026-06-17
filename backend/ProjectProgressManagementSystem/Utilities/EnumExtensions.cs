using System.ComponentModel;
using System.Reflection;

namespace ProjectProgressManagementSystem.Utilities
{
    public static class EnumExtensions
    {
        public static string GetDescription(this Enum value)
        {
            var field = value.GetType().GetField(value.ToString());
            var attribute = field?.GetCustomAttribute<DescriptionAttribute>();
            return attribute == null ? value.ToString() : attribute.Description;
        }

        public static bool TryParseByDescription<TEnum>(string description, out TEnum result) where TEnum : Enum
        {
            var type = typeof(TEnum);
            if (!type.IsEnum) throw new InvalidOperationException($"Type {type} is not Enum");

            foreach (var field in type.GetFields())
            {
                if (Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute)) is DescriptionAttribute attribute)
                {
                    if (attribute.Description == description)
                    {
                        result = (TEnum)field.GetValue(null);
                        return true;
                    }
                }
                else
                {
                    if (field.Name == description)
                    {
                        result = (TEnum)field.GetValue(null);
                        return true;
                    }
                }
            }

            result = default(TEnum);
            return false;
        }
    }
}
