using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using ProjectProgressManagementSystem.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ProjectProgressManagementSystem.Extensions
{
    public class EnumSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema model, SchemaFilterContext context)
        {
            if (context.Type == typeof(Department) || context.Type == typeof(Region))
            {
                model.Enum.Clear();

                // Generate all possible combinations
                var enumValues = Enum.GetValues(context.Type).Cast<Enum>().ToList();
                GenerateCombinations(enumValues, 0, new List<Enum>(), model);
            }
            else if (context.Type.IsEnum)
            {
                model.Enum.Clear();

                // Add all enum values
                Enum.GetNames(context.Type)
                    .ToList()
                    .ForEach(name =>
                    {
                        var enumValue = (Enum)Enum.Parse(context.Type, name);
                        var description = enumValue.GetDescription(); 
                        model.Enum.Add(new OpenApiString(description));
                    });
            }
        }

        private void GenerateCombinations(List<Enum> enumValues, int startIndex, List<Enum> currentCombination, OpenApiSchema model)
        {
            // Add the current combination to the model
            if (currentCombination.Any())
            {
                var combinationString = string.Join(", ", currentCombination.Select(e => e.GetDescription()));
                // Check if currentCombination has more than one element
                model.Enum.Add(new OpenApiString(combinationString));
            }

            for (var i = startIndex; i < enumValues.Count; i++)
            {
                // Add the current enum value to the combination
                currentCombination.Add(enumValues[i]);

                // Generate combinations with the current enum value included
                GenerateCombinations(enumValues, i + 1, currentCombination, model);

                // Remove the current enum value from the combination
                currentCombination.RemoveAt(currentCombination.Count - 1);
            }
        }
    }
}