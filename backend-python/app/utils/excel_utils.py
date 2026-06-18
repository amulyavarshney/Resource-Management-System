from io import BytesIO

import openpyxl
from fastapi import UploadFile


async def read_excel(file: UploadFile) -> list[dict]:
    """Read an uploaded Excel file and return rows as a list of dicts keyed by header."""
    contents = await file.read()
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
