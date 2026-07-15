import http from "./httpInstance";

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
	/** Send mail via the backend SMTP endpoint (credentials stay on the API host). */
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

		await http.post("/mail", body);
	}
}

const mailService = new MailService();
export default mailService;
