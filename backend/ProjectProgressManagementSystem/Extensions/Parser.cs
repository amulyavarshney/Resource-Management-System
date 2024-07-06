using ProjectProgressManagementSystem.Models;
using System.Data;

namespace ProjectProgressManagementSystem.Extensions
{
    public class Parser
    {
        public static DateTime? ParseDate(DataRow row, string dateField)
        {
            if (row.Table.Columns.Contains(dateField) && !row.IsNull(dateField))
            {
                string unparsedDate = row[dateField].ToString()!;
                if (!DateTime.TryParse(unparsedDate, out DateTime date))
                {
                    throw new ArgumentException($"Invalid Date: {unparsedDate}");
                }
                return date;
            }
            return null;
        }

        public static Department ParseDepartment(DataRow row)
        {
            if (!Enum.TryParse(row["Department"].ToString(), out Department department))
            {
                throw new ArgumentException($"Invalid Department: {row["Department"]}");
            }
            return department;
        }

        public static Region ParseRegion(DataRow row)
        {
            if (!Enum.TryParse(row["Region"].ToString(), out Region region))
            {
                throw new ArgumentException($"Invalid Region: {row["Region"]}");
            }
            return region;
        }

        public static int ParseInt(DataRow row, string field)
        {
            if (row.Table.Columns.Contains(field) && !row.IsNull(field))
            {
                if (!double.TryParse(row[field].ToString(), out double output))
                {
                    throw new ArgumentException($"Invalid {field}: {row[field]}");
                }
                return (int)output;
            }
            return 0;
        }

        public static uint ParseUint(DataRow row, string field)
        {
            if (row.Table.Columns.Contains(field) && !row.IsNull(field))
            {
                if (!double.TryParse(row[field].ToString(), out double output))
                {
                    throw new ArgumentException($"Invalid {field}: {row[field]}");
                }
                return (uint)output;
            }
            return 0;
        }

        public static bool ParseIsExternal(DataRow row)
        {
            if (row.Table.Columns.Contains("IsExternal") && !row.IsNull("IsExternal"))
            {
                if (!bool.TryParse(row["IsExternal"].ToString(), out bool isExternal))
                {
                    throw new ArgumentException($"Invalid IsExternal: {row["IsExternal"]}");
                }
                return isExternal;
            }
            return row["Email"].ToString()!.Contains("ext");
        }

        public static byte[]? ParsePassword(DataRow row, string field)
        {
            if (row.Table.Columns.Contains(field) && !row.IsNull(field))
            {
                return (byte[])row[field];
            }
            return null;
        }

        public static Role ParseRole(DataRow row)
        {
            if (row.Table.Columns.Contains("Role") && !row.IsNull("Role"))
            {
                if (!Enum.TryParse(row["Role"].ToString(), out Role role))
                {
                    throw new ArgumentException($"Invalid Role: {row["Role"]}");
                }
                return role;
            }
            return Role.Employee;
        }

        public static string? ParseString(DataRow row, string field)
        {
            if (row.Table.Columns.Contains(field) && !row.IsNull(field))
            {
                return row[field].ToString();
            }
            return null;
        }

        public static int? ParseWeekData(DataRow row)
        {
            if (row.Table.Columns.Contains("Week5") && !row.IsNull("Week5"))
            {
                if (!double.TryParse(row["Week5"].ToString(), out double week5))
                {
                    throw new ArgumentException($"Invalid Week5 hours: {row["Week5"]}");
                }
                return (int)week5;
            }
            return null;
        }
    }
}
