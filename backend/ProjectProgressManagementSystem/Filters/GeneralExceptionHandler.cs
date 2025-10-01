using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using ProjectProgressManagementSystem.Exceptions;

namespace ProjectProgressManagementSystem.Filters
{
    public class GeneralExceptionHandler : IActionFilter, IOrderedFilter
    {
        public int Order { get; set; }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (context.Exception == null)
            {
                return;
            }

            var exception = context.Exception;
            ProblemDetails problem = new ProblemDetails
            {
                Title = "An error occurred while processing your request.",
                Detail = exception.Message
            };

            int statusCode = 500;
            if (exception is RecordNotFoundException)
            {
                statusCode = 404;
                problem.Title = "Resource not found";
            }
            else if (exception is DomainInvariantException)
            {
                statusCode = 400;
                problem.Title = "Invalid request";
            }

            problem.Status = statusCode;
            context.Result = new ObjectResult(problem) { StatusCode = statusCode };
            context.ExceptionHandled = true;
        }
        public void OnActionExecuting(ActionExecutingContext context)
        {
        }
    }
}
