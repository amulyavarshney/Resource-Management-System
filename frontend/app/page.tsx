"use client";
import { useSession } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
		session ? router.push("/home") : router.push("/auth");
	}, [session, router]);

	return null;
}
