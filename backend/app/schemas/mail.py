from pydantic import BaseModel, Field


class MailSendRequest(BaseModel):
    subject: str = Field(min_length=1, max_length=500)
    message_body: str = Field(alias="messageBody", min_length=1)
    priority: str = "Normal"
    recipients: list[str] = Field(min_length=1, max_length=5)
    cc: list[str] = Field(default_factory=list)
    bcc: list[str] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}
