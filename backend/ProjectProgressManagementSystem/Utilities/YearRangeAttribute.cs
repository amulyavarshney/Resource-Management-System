using System.ComponentModel.DataAnnotations;

namespace ProjectProgressManagementSystem.Utilities
{
    public class YearRangeAttribute : ValidationAttribute
    {
        private readonly int _minYear;
        private readonly int _maxYear;

        public YearRangeAttribute(int minYear)
        {
            _minYear = minYear;
            _maxYear = DateTime.Now.Year;
        }

        protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
        {
            if (value is int year)
            {
                if (year < _minYear || year > _maxYear)
                {
                    return new ValidationResult($"Year must be between {_minYear} and {_maxYear}");
                }
            }
            return ValidationResult.Success;
        }
    }
}
