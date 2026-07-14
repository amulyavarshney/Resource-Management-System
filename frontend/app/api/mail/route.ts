import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";

export const runtime = "nodejs";

const MAX_RECIPIENTS = 5;
const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_CHARS = 8_000_000; // ~6MB base64

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
	// Server-only env vars — never fall back to NEXT_PUBLIC_* (would risk
	// baking secrets into the browser bundle if misconfigured).
	return {
		url: process.env.ESB_API_URL,
		subKey: process.env.ESB_SUB_KEY,
		from: process.env.ESB_MAIL_FROM,
		sender: process.env.ESB_MAIL_SENDER,
		replyTo: process.env.ESB_MAIL_REPLYTO,
		positiveUrl: process.env.ESB_CALLBACK_POSITIVE_URL,
		negativeUrl: process.env.ESB_CALLBACK_NEGATIVE_URL,
	};
}

function normalizeEmails(emails: string[] | undefined): string[] {
	if (!emails?.length) return [];
	return emails.map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);
	const sessionEmail = session?.user?.email?.trim().toLowerCase();
	if (!session?.user || !sessionEmail) {
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

	const recipients = normalizeEmails(body.recipients);
	const cc = normalizeEmails(body.cc);
	const bcc = normalizeEmails(body.bcc);

	if (recipients.length === 0 || recipients.length > MAX_RECIPIENTS) {
		return NextResponse.json(
			{ detail: `recipients must contain 1–${MAX_RECIPIENTS} addresses` },
			{ status: 400 }
		);
	}

	// Open-relay prevention: only the signed-in user may be mailed.
	const allTargets = [...recipients, ...cc, ...bcc];
	if (allTargets.some((email) => email !== sessionEmail)) {
		return NextResponse.json(
			{ detail: "Mail may only be sent to the authenticated user" },
			{ status: 403 }
		);
	}

	const attachments = body.attachments ?? [];
	if (attachments.length > MAX_ATTACHMENTS) {
		return NextResponse.json(
			{ detail: `At most ${MAX_ATTACHMENTS} attachments are allowed` },
			{ status: 400 }
		);
	}
	if (attachments.some((a) => a.length > MAX_ATTACHMENT_CHARS)) {
		return NextResponse.json({ detail: "Attachment too large" }, { status: 400 });
	}

	const payload = {
		Subject: body.subject,
		MessageBody: body.messageBody,
		Priority: body.priority ?? "Normal",
		Recipients: recipients,
		CC: cc,
		BCC: bcc,
		From: cfg.from,
		Sender: cfg.sender,
		ReplyTo: cfg.replyTo,
		ErrorReportDetails: false,
		SaveAttachmentsExternal: false,
		Attachments: attachments,
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
