import { useEffect, useState } from "react";

type Timeleft = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

export default function Timer({ deadline }: { deadline: Date }) {
	deadline = new Date(deadline.getFullYear(), deadline.getMonth()+1, 0, 0, 0, 0);
	const calculateTimeLeft = () => {
		const difference = +new Date(deadline) - +new Date();
		let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

		if (difference > 0) {
			timeLeft = {
				days: Math.floor(difference / (1000 * 60 * 60 * 24)),
				hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
				minutes: Math.floor((difference / 1000 / 60) % 60),
				seconds: Math.floor((difference / 1000) % 60),
			};
		}

		return timeLeft;
	};

	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

	useEffect(() => {
		const timer = setTimeout(() => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		return () => clearTimeout(timer);
	});

	return (
		<div className="flex-col m-5">
			<div className="flex items-center justify-center gap-1.5">
				<div className="rounded-xl border border-indigo-600 dark:border-gray-200 py-1.5 min-w-[80px] flex items-center justify-center flex-col gap-0 aspect-square px-1.5">
					<h3 className="countdown-element days font-manrope font-semibold text-2xl text-indigo-600 dark:text-white text-center">
						{timeLeft.days}
					</h3>
					<p className="text-sm font-inter capitalize font-normal text-indigo-600 dark:text-white text-center w-full">
						days
					</p>
				</div>
				<h3 className="font-manrope font-semibold text-2xl text-gray-900">:</h3>
				<div className="rounded-xl border border-indigo-600 dark:border-gray-200 py-1.5 min-w-[80px] flex items-center justify-center flex-col gap-0 aspect-square px-1.5">
					<h3 className="countdown-element hours font-manrope font-semibold text-2xl text-indigo-600 dark:text-white text-center">
						{timeLeft.hours}
					</h3>
					<p className="text-sm font-inter capitalize font-normal text-indigo-600 dark:text-white text-center w-full">
						Hour
					</p>
				</div>
				<h3 className="font-manrope font-semibold text-2xl text-gray-900">:</h3>
				<div className="rounded-xl border border-indigo-600 dark:border-gray-200 py-1.5 min-w-[80px] flex items-center justify-center flex-col gap-0 aspect-square px-1.5">
					<h3 className="countdown-element minutes font-manrope font-semibold text-2xl text-indigo-600 dark:text-white text-center">
						{timeLeft.minutes}
					</h3>
					<p className="text-sm font-inter capitalize font-normal text-indigo-600 dark:text-white text-center w-full">
						Minutes
					</p>
				</div>
				<h3 className="font-manrope font-semibold text-2xl text-gray-900">:</h3>
				<div className="rounded-xl border border-indigo-600 dark:border-gray-200 py-1.5 min-w-[80px] flex items-center justify-center flex-col gap-0 aspect-square px-1.5">
					<h3 className="countdown-element seconds sec font-manrope font-semibold text-2xl text-indigo-600 dark:text-white text-center">
						{timeLeft.seconds}
					</h3>
					<p className="text-sm font-inter capitalize font-normal text-indigo-600 dark:text-white text-center w-full">
						Seconds
					</p>
				</div>
			</div>
			<p className="mt-2 text-sm text-indigo-500 dark:text-white text-center">
				Time is running out to fill your timesheet.
			</p>
			<p className="text-sm text-indigo-500 dark:text-white text-center">
				Hurry up before it&apos;s locked!
			</p>
		</div>
	);
}
