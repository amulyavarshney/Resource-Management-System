"use client";
import { useEffect } from "react";
import { useSession } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { status } = useSession();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.replace("/auth");
		}
	}, [status, router]);

	if (status === "loading" || status === "unauthenticated") {
		return <Loading />;
	}

	return (
		<main className="min-h-max max-h-full bg-white dark:bg-gray-900 text-black dark:text-white">
			<Navbar />
			{children}
		</main>
	);
}
