"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/app/contexts/AuthContext";
import CardSettings from "./components/CardSettings";
import CardProfile from "./components/CardProfile";
import userService, { User } from "@/app/api/services/user";

export default function Profile() {
	const { data: session } = useSession();
	const [user, setUser] = useState<User>();

	useEffect(() => {
		const fetchUser = async () => {
			if (session?.user) {
				const res = await userService.getUser(session?.user.id);
				setUser(res);
			}
		};
		fetchUser();
	}, [session]);

	return (
		<div className="h-screen dark:bg-gray-900">
			<div className="flex flex-wrap md:flex-nowrap gap-4 m-4">
				{user && <CardProfile user={user} />}
				{user && <CardSettings user={user} setUser={setUser} />}
			</div>
		</div>
	);
}
