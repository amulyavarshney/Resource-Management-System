"use client";
import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/Loading";
import Login from "./Login";
import Register from "./Register";

export default function Auth() {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState<boolean>(true);
	const { status } = useSession();

	const updateIsLogin = useCallback(() => {
		setIsLogin(!isLogin);
	}, [isLogin]);

	if (status == "authenticated") {
		router.push("/home");
	} else if (status == "loading") {
		return <Loading />;
	} else {
		return (
			<>
				{isLogin ? (
					<Login updateIsLogin={updateIsLogin} />
				) : (
					<Register updateIsLogin={updateIsLogin} />
				)}
			</>
		);
	}
}
