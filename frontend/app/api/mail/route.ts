import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";

export const runtime = "nodejs";

type MailBody = {
	subject: string;
	messageBody: string;
	priority?: string;
	recipients: string[];
	cc?: string[];
	bcc?: string[];
	attachments?: string[];
};

function esbConfig() {
	// Prefer server-only names; fall back to legacy NEXT_PUBLIC_* during migration.
	return {
		url: process.env.ESB_API_URL || process.env.NEXT_PUBLIC_ESB_API_URL,
		subKey: process.env.ESB_SUB_KEY || process.env.NEXT_PUBLIC_ESB_SUB_KEY,
		from: process.env.ESB_MAIL_FROM || process.env.NEXT_PUBLIC_ESB_MAIL_FROM,
		sender: process.env.ESB_MAIL_SENDER || process.env.NEXT_PUBLIC_ESB_MAIL_SENDER,
		replyTo: process.env.ESB_MAIL_REPLYTO || process.env.NEXT_PUBLIC_ESB_MAIL_REPLYTO,
		positiveUrl:
			process.env.ESB_CALLBACK_POSITIVE_URL ||
			process.env.NEXT_PUBLIC_ESB_CALLBACK_POSITIVE_URL,
		negativeUrl:
			process.env.ESB_CALLBACK_NEGATIVE_URL ||
			process.env.NEXT_PUBLIC_ESB_CALLBACK_NEGATIVE_URL,
	};
}

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
	}

	const cfg = esbConfig();
	if (!cfg.url || !cfg.subKey) {
		return NextResponse.json(
			{ detail: "Mail service is not configured" },
			{ status: 503 }
		);
	}

	let body: MailBody;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
	}

	if (!body.subject || !body.messageBody || !Array.isArray(body.recipients)) {
		return NextResponse.json(
			{ detail: "subject, messageBody, and recipients are required" },
			{ status: 400 }
		);
	}

	const payload = {
		Subject: body.subject,
		MessageBody: body.messageBody,
		Priority: body.priority ?? "Normal",
		Recipients: body.recipients,
		CC: body.cc ?? [],
		BCC: body.bcc ?? [],
		From: cfg.from,
		Sender: cfg.sender,
		ReplyTo: cfg.replyTo,
		ErrorReportDetails: false,
		SaveAttachmentsExternal: false,
		Attachments: body.attachments ?? [],
		Callback: {
			positiveMethod: "Post",
			positiveUrl: cfg.positiveUrl,
			positiveHeaders: [],
			negativeMethod: "Get",
			negativeUrl: cfg.negativeUrl,
			negativeHeaders: [],
		},
	};

	try {
		const response = await fetch(cfg.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-cache",
				"EsbApi-Subscription-Key": cfg.subKey,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const detail = await response.text();
			return NextResponse.json(
				{ detail: detail || "ESB mail request failed" },
				{ status: 502 }
			);
		}

		return NextResponse.json({ message: "Mail sent" });
	} catch (error) {
		console.error("ESB mail proxy error", error);
		return NextResponse.json({ detail: "Failed to send mail" }, { status: 502 });
	}
}
