import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "./contexts/AuthContext";
import ToasterContext from "./contexts/ToasterContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Resource Management System",
	description: "Management Tool for Project Tracking, User Management and Timesheet",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>
					<ToasterContext />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
