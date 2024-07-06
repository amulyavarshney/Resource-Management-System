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
				positiveUrl:
					"https://zeiss-esb-fn-mock-test.azurewebsites.net/api/Mock_Endpoint?code=9uBac0i0kP59JZhwJ8VTaAdRaYNSJC9l/SaKLvDR6d89IescRuaD7Q==&success=true",
				positiveHeaders: [
					{
						key: "SampleHeader",
						value: "SampleValue",
					},
				],
				negativeMethod: "Get",
				negativeUrl:
					"https://zeiss-esb-fn-mock-test.azurewebsites.net/api/Mock_Endpoint?code=9uBac0i0kP59JZhwJ8VTaAdRaYNSJC9l/SaKLvDR6d89IescRuaD7Q==&success=false",
				negativeHeaders: [],
			},
		};

		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-cache",
				"EsbApi-Subscription-Key": process.env.NEXT_PUBLIC_ESB_SUB_KEY,
			},
			body: JSON.stringify(data),
		};

		try {
			const response = await axios({
				method: "post",
				url: URL,
				headers: options.headers,
				data: options.body,
			});

			if (response.status !== 200) {
				throw new Error(`HTTP error! status: ${response.status}`);
			} else {
				console.log("Mail sent successfully.");
			}
		} catch (error) {
			console.error(
				"There has been a problem with sending mail: ",
				(error as Error).message
			);
		}
	}
}

const mailService = new MailService();
export default mailService;
