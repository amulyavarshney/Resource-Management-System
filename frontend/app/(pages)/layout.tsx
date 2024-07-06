"use client";
import { useSession } from "next-auth/react";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import Unauthorized from "../components/Unauthorized";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { status } = useSession();

	if (status === "loading") {
		return <Loading />;
	} else if (status == "unauthenticated") {
		return <Unauthorized />;
	}

	return (
		<main className="min-h-max max-h-full bg-white dark:bg-gray-900 text-black dark:text-white">
			<Navbar />
			{children}
		</main>
	);
}
