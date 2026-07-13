import axios from "axios";

export type MailSendRequest = {
	subject: string;
	messageBody: string;
	priority?: string;
	recipients: string[];
	cc?: string[];
	bcc?: string[];
	attachments?: string[];
};

class MailService {
	/**
	 * Send mail via the Next.js `/api/mail` proxy so ESB credentials stay
	 * server-side (never NEXT_PUBLIC_* in the browser bundle).
	 */
	async send(
		subject: string,
		messageBody: string,
		priority: string,
		recipients: string[],
		cc: string[],
		bcc: string[],
		attachments: string[]
	) {
		const body: MailSendRequest = {
			subject,
			messageBody,
			priority,
			recipients,
			cc,
			bcc,
			attachments,
		};

		await axios.post("/api/mail", body);
	}
}

const mailService = new MailService();
export default mailService;
