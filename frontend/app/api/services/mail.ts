import axios from "axios";

const URL = process.env.NEXT_PUBLIC_ESB_API_URL;

class MailService {
	async send(
		subject: string,
		messageBody: string,
		priority: string,
		recipients: string[],
		cc: string[],
		bcc: string[],
		attachments: string[]
	) {
		const data = {
			Subject: subject,
			MessageBody: messageBody,
			Priority: priority,
			Recipients: recipients,
			CC: cc,
			BCC: bcc,
			From: process.env.NEXT_PUBLIC_ESB_MAIL_FROM,
			Sender: process.env.NEXT_PUBLIC_ESB_MAIL_SENDER,
			ReplyTo: process.env.NEXT_PUBLIC_ESB_MAIL_REPLYTO,
			ErrorReportDetails: false,
			SaveAttachmentsExternal: false,
			Attachments: attachments,
			Callback: {
				positiveMethod: "Post",
				positiveUrl: process.env.NEXT_PUBLIC_ESB_CALLBACK_POSITIVE_URL,
				positiveHeaders: [],
				negativeMethod: "Get",
				negativeUrl: process.env.NEXT_PUBLIC_ESB_CALLBACK_NEGATIVE_URL,
				negativeHeaders: [],
			},
		};

		const headers = {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache",
			"EsbApi-Subscription-Key": process.env.NEXT_PUBLIC_ESB_SUB_KEY,
		};

		await axios.post(URL!, JSON.stringify(data), { headers });
	}
}

const mailService = new MailService();
export default mailService;
