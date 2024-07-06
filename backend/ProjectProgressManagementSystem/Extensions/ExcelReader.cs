using ExcelDataReader;
using System.Data;
using System.Text;

namespace ProjectProgressManagementSystem.Extensions
{
    public class ExcelReader
    {
        public static DataTable ReadExcelFile(IFormFile excelFile)
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
            using (var stream = excelFile.OpenReadStream())
            {
                using (var reader = ExcelReaderFactory.CreateReader(stream))
                {
                    var result = reader.AsDataSet(new ExcelDataSetConfiguration()
                    {
                        ConfigureDataTable = (_) => new ExcelDataTableConfiguration()
                        {
                            UseHeaderRow = true
                        }
                    });

                    return result.Tables[0];
                }
            }
        }
    }
}
