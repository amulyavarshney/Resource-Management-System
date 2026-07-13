import { useState } from "react";
import toast from "react-hot-toast";
import { UserDashboardViewModel } from "@/app/api/services/dashboard";

type CopyButtonProps = {
	users: UserDashboardViewModel[];
};

export default function CopyButton({ users }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async () => {
		try {
			const emails = users.map((user) => user.email).join("; ");
			await navigator.clipboard.writeText(emails);
			setCopied(true);
			toast.success("Emails copied");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy emails");
		}
	};

	return (
		<button
			type="button"
			title="Copy Emails"
			onClick={copyToClipboard}
			className="m-2"
			aria-label="Copy emails"
		>
			{copied ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					className="fill-current"
				>
					<path d="M14 8H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V10c0-1.103-.897-2-2-2z"></path>
					<path d="M20 2H10a2 2 0 0 0-2 2v2h8a2 2 0 0 1 2 2v8h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
				</svg>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					className="fill-current"
				>
					<path d="M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z"></path>
				</svg>
			)}
		</button>
	);
}
