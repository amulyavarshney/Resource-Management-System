import Image from "next/image";
import { toast } from "react-hot-toast";

type ToastProps = {
	heading?: string;
	message: string;
	imagePath?: string;
};

export default function Toast({ heading, message, imagePath }: ToastProps) {
	return toast.custom(
		(t) => (
			<div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5">
				<div className="flex-1 w-0 p-4">
					<div className="flex items-start">
						{imagePath && (
							<div className="flex-shrink-0 pt-0.5">
								<Image
									className="h-10 w-10 rounded-full"
									src={imagePath}
									alt="Toast Logo"
									width={40}
									height={40}
								/>
							</div>
						)}
						<div className="ml-3 flex-1">
							<p className="text-sm font-medium text-gray-900">{heading}</p>
							<p className="mt-1 text-sm text-gray-500">{message}</p>
						</div>
					</div>
				</div>
				<div className="flex border-l border-gray-200">
					<button
						onClick={() => toast.dismiss(t.id)}
						className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
					>
						Close
					</button>
				</div>
			</div>
		),
		{
			position: "top-center",
		}
	);
}
