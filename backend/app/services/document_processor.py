from pathlib import Path

from app.utils.text_cleaning import clean_text


def extract_text(file_path: str, file_type: str) -> str:
    """Extract text from a file based on its type."""
    path = Path(file_path)

    if file_type in ("txt", "md"):
        return _extract_plain(path)
    elif file_type == "pdf":
        return _extract_pdf(path)
    elif file_type == "docx":
        return _extract_docx(path)
    elif file_type == "csv":
        return _extract_csv(path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def _extract_plain(path: Path) -> str:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = path.read_text(encoding="latin-1")
    return clean_text(text)


def _extract_pdf(path: Path) -> str:
    from pypdf import PdfReader

    try:
        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return clean_text("\n\n".join(pages))
    except Exception:
        from unstructured.partition.pdf import partition_pdf

        elements = partition_pdf(str(path))
        return clean_text("\n\n".join(str(el) for el in elements))


def _extract_docx(path: Path) -> str:
    from docx import Document

    doc = Document(str(path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return clean_text("\n\n".join(paragraphs))


def _extract_csv(path: Path) -> str:
    import pandas as pd

    df = pd.read_csv(str(path))
    rows = []
    for _, row in df.iterrows():
        parts = [f"{col}: {val}" for col, val in row.items() if pd.notna(val)]
        rows.append(". ".join(parts))
    return clean_text("\n\n".join(rows))
