"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/Loading";
import Login from "./Login";
import Register from "./Register";

const allowSelfRegistration =
	process.env.NEXT_PUBLIC_ALLOW_SELF_REGISTRATION !== "false";

export default function Auth() {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState<boolean>(true);
	const { status } = useSession();

	const updateIsLogin = useCallback(() => {
		setIsLogin((prev) => !prev);
	}, []);

	useEffect(() => {
		if (status === "authenticated") {
			router.push("/home");
		}
	}, [status, router]);

	useEffect(() => {
		if (!allowSelfRegistration) {
			setIsLogin(true);
		}
	}, []);

	if (status === "loading" || status === "authenticated") {
		return <Loading />;
	}

	if (!isLogin && allowSelfRegistration) {
		return <Register updateIsLogin={updateIsLogin} />;
	}

	return (
		<Login
			updateIsLogin={updateIsLogin}
			allowSelfRegistration={allowSelfRegistration}
		/>
	);
}
