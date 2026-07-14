from io import BytesIO

import openpyxl
from fastapi import UploadFile

from app.core.exceptions import DomainInvariantException

MAX_EXCEL_BYTES = 5 * 1024 * 1024
_ALLOWED_CONTENT_TYPES = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/octet-stream",
}


async def read_excel(file: UploadFile) -> list[dict]:
    """Read an uploaded Excel file and return rows as a list of dicts keyed by header."""
    filename = (file.filename or "").lower()
    if not filename.endswith((".xlsx", ".xls")):
        raise DomainInvariantException("Upload must be an Excel file (.xlsx or .xls)")
    if file.content_type and file.content_type not in _ALLOWED_CONTENT_TYPES:
        raise DomainInvariantException("Unsupported file content type for Excel import")

    contents = await file.read()
    if len(contents) > MAX_EXCEL_BYTES:
        raise DomainInvariantException("Excel file too large (max 5 MB)")

    wb = openpyxl.load_workbook(BytesIO(contents), read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []
    headers = [str(h) if h is not None else "" for h in rows[0]]
    result = []
    for row in rows[1:]:
        result.append({headers[i]: row[i] for i in range(len(headers))})
    wb.close()
    return result
