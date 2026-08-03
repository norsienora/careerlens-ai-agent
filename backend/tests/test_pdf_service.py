import pytest

from app.pdf_service import (
    MAX_PDF_SIZE_BYTES,
    PdfValidationError,
    extract_text_from_pdf,
)


def test_rejects_empty_pdf() -> None:
    with pytest.raises(
        PdfValidationError,
        match="File PDF kosong",
    ):
        extract_text_from_pdf(b"")


def test_rejects_oversized_pdf() -> None:
    oversized_pdf = b"%PDF-" + (b"0" * MAX_PDF_SIZE_BYTES)

    with pytest.raises(
        PdfValidationError,
        match="Ukuran PDF melebihi batas 5 MB",
    ):
        extract_text_from_pdf(oversized_pdf)


def test_rejects_non_pdf_content() -> None:
    non_pdf_content = b"This content is not a PDF document."

    with pytest.raises(
        PdfValidationError,
        match="format PDF yang valid",
    ):
        extract_text_from_pdf(non_pdf_content)