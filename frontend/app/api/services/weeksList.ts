import leaveService from "./leave";
import holidayService from "./holiday";

export type Week = {
	start: string;
	end: string;
	days: number;
};

class WeeksList {
	async getWeeksInMonth(
		year: number,
		month: number,
		userId?: number
	): Promise<Week[]> {
		const weeks: Week[] = [];
		const holidays = await holidayService.getHolidaysInMonth(year, month);
		const leaves = await leaveService.getLeavesInMonth(
			year,
			month,
			userId || 0
		);

		// Calculate the first day of the month
		const firstDay = new Date(year, month - 1, 1);

		// if first day is between Monday and Saturday (both exclusive)
		if (1 < firstDay.getDay() && firstDay.getDay() < 6) {
			// Find the first Friday of the month
			const firstFriday = new Date(year, month - 1, 6 - firstDay.getDay());

			const holidayCount = holidayService.getHolidaysCountInAWeek(
				holidays,
				firstDay,
				firstFriday
			);

			const leaveCount = leaveService.getLeavesCountInAWeek(
				leaves,
				firstDay,
				firstFriday
			);

			weeks.push({
				start: this.formatDate(firstDay),
				end: this.formatDate(firstFriday),
				days:
					firstFriday.getDay() -
					firstDay.getDay() +
					1 -
					holidayCount -
					leaveCount,
			});
		}

		// Find the first Monday of the month
		const firstMonday = 1 + ((8 - firstDay.getDay()) % 7);

		// Calculate the last day of the month
		const lastDay = new Date(year, month, 0).getDate();

		// Loop through the weeks of the month
		for (let startDay = firstMonday; startDay <= lastDay; startDay += 7) {
			const endDay = startDay + 4 > lastDay ? lastDay : startDay + 4;

			const weekStart = new Date(year, month - 1, startDay);
			const weekEnd = new Date(year, month - 1, endDay);

			const holidayCount = holidayService.getHolidaysCountInAWeek(
				holidays,
				weekStart,
				weekEnd
			);

			const leaveCount = leaveService.getLeavesCountInAWeek(
				leaves,
				weekStart,
				weekEnd
			);

			// Add the week's start and end dates to the array
			weeks.push({
				start: this.formatDate(weekStart),
				end: this.formatDate(weekEnd),
				days:
					weekEnd.getDay() - weekStart.getDay() + 1 - holidayCount - leaveCount,
			});
		}
		return weeks;
	}

	getMonthName(month: number): string {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		return months[month - 1];
	}

	getDayName(day: number): string {
		const days = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];
		return days[day];
	}

	formatDate(date: Date): string {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear().toString().slice(2, 4);
		return `${day}/${month}/${year}`;
	}
}

const weeksList = new WeeksList();
export default weeksList;
