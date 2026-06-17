using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using ProjectProgressManagementSystem.Models;
using ProjectProgressManagementSystem.Utilities;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ProjectProgressManagementSystem.Utilities
{
    public class EnumSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema model, SchemaFilterContext context)
        {
            if (context.Type == typeof(Department) || context.Type == typeof(Region))
            {
                model.Enum.Clear();
                var enumValues = Enum.GetValues(context.Type).Cast<Enum>().ToList();
                GenerateCombinations(enumValues, 0, new List<Enum>(), model);
            }
            else if (context.Type.IsEnum)
            {
                model.Enum.Clear();
                Enum.GetNames(context.Type)
                    .ToList()
                    .ForEach(name =>
                    {
                        var enumValue = (Enum)Enum.Parse(context.Type, name);
                        model.Enum.Add(new OpenApiString(enumValue.GetDescription()));
                    });
            }
        }

        private void GenerateCombinations(List<Enum> enumValues, int startIndex, List<Enum> currentCombination, OpenApiSchema model)
        {
            if (currentCombination.Any())
            {
                var combinationString = string.Join(", ", currentCombination.Select(e => e.GetDescription()));
                model.Enum.Add(new OpenApiString(combinationString));
            }

            for (var i = startIndex; i < enumValues.Count; i++)
            {
                currentCombination.Add(enumValues[i]);
                GenerateCombinations(enumValues, i + 1, currentCombination, model);
                currentCombination.RemoveAt(currentCombination.Count - 1);
            }
        }
    }
}
