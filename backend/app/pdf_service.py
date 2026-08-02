from io import BytesIO
import logging
import re

import pdfplumber
from pypdf import PdfReader
from pypdf.errors import PdfReadError

MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024
MAX_PDF_PAGES = 20
MIN_EXTRACTED_TEXT_CHARACTERS = 50

logger = logging.getLogger(__name__)


class PdfValidationError(ValueError):
    """Raised when an uploaded file is not an acceptable PDF."""


class PdfTextExtractionError(ValueError):
    """Raised when readable text cannot be extracted from a PDF."""


def _normalize_text(text: str) -> str:
    cleaned_lines: list[str] = []

    for raw_line in text.replace("\x00", "").splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()

        if line:
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines).strip()


def _has_readable_word_structure(text: str) -> bool:
    tokens = re.findall(r"[^\W_]+", text, flags=re.UNICODE)

    if len(tokens) < 5:
        return False

    single_character_tokens = sum(
        len(token) == 1 for token in tokens
    )
    single_character_ratio = single_character_tokens / len(tokens)
    average_token_length = sum(map(len, tokens)) / len(tokens)

    return (
        single_character_ratio < 0.40
        and average_token_length < 20
    )


def _extract_with_pdfplumber(pdf_bytes: bytes) -> str:
    extracted_pages: list[str] = []

    try:
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = (
                    page.extract_text(
                        x_tolerance_ratio=0.20,
                        y_tolerance=3,
                        use_text_flow=True,
                    )
                    or ""
                )

                if page_text.strip():
                    extracted_pages.append(page_text)
    except Exception:
        logger.warning(
            "pdfplumber extraction failed; using pypdf fallback",
            exc_info=True,
        )
        return ""

    return _normalize_text("\n".join(extracted_pages))


def _extract_with_pypdf(reader: PdfReader) -> str:
    extracted_pages: list[str] = []

    for page_number, page in enumerate(reader.pages, start=1):
        try:
            page_text = page.extract_text() or ""
        except (PdfReadError, KeyError, TypeError, ValueError) as error:
            raise PdfTextExtractionError(
                f"Teks pada halaman {page_number} tidak dapat dibaca.",
            ) from error

        if page_text.strip():
            extracted_pages.append(page_text)

    return _normalize_text("\n".join(extracted_pages))


def extract_text_from_pdf(pdf_bytes: bytes) -> tuple[str, int]:
    if not pdf_bytes:
        raise PdfValidationError("File PDF kosong.")

    if len(pdf_bytes) > MAX_PDF_SIZE_BYTES:
        raise PdfValidationError("Ukuran PDF melebihi batas 5 MB.")

    if b"%PDF-" not in pdf_bytes[:1024]:
        raise PdfValidationError(
            "Isi file tidak memiliki format PDF yang valid.",
        )

    try:
        reader = PdfReader(BytesIO(pdf_bytes), strict=False)
    except (PdfReadError, OSError, ValueError) as error:
        raise PdfValidationError(
            "PDF rusak atau tidak dapat dibaca.",
        ) from error

    if reader.is_encrypted:
        raise PdfValidationError(
            "PDF yang dilindungi password belum didukung.",
        )

    try:
        page_count = len(reader.pages)
    except (PdfReadError, KeyError, TypeError, ValueError) as error:
        raise PdfValidationError(
            "Daftar halaman PDF tidak dapat dibaca.",
        ) from error

    if page_count == 0:
        raise PdfValidationError("PDF tidak memiliki halaman.")

    if page_count > MAX_PDF_PAGES:
        raise PdfValidationError(
            f"PDF memiliki {page_count} halaman. Batas maksimum adalah "
            f"{MAX_PDF_PAGES} halaman.",
        )

    normalized_text = _extract_with_pdfplumber(pdf_bytes)

    if not _has_readable_word_structure(normalized_text):
        normalized_text = _extract_with_pypdf(reader)

    if len(normalized_text) < MIN_EXTRACTED_TEXT_CHARACTERS:
        raise PdfTextExtractionError(
            "PDF tidak memiliki cukup teks yang dapat dibaca. "
            "Gunakan CV PDF berbasis teks, bukan hasil scan atau foto.",
        )

    if not _has_readable_word_structure(normalized_text):
        raise PdfTextExtractionError(
            "PDF berisi teks, tetapi susunan karakternya tidak dapat "
            "dipulihkan secara akurat. Coba ekspor ulang CV sebagai "
            "PDF standar.",
        )

    return normalized_text, page_count