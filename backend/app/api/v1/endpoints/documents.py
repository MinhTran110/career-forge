from fastapi import APIRouter, Response
from pydantic import BaseModel
from app.services.typst_compiler import typst_compiler


router = APIRouter()


class CompilePdfRequest(BaseModel):
    markdown_content: str


@router.post("/compile-pdf")
async def compile_pdf(payload: CompilePdfRequest):
    pdf_bytes = typst_compiler.compile_to_pdf(payload.markdown_content)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=tailored-resume.pdf"}
    )
