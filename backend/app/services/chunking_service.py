from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_text(text: str) -> list[dict]:
    """Split text into chunks with character offsets."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_text(text)

    result = []
    offset = 0
    for chunk in chunks:
        start = text.find(chunk[:50], offset)
        if start == -1:
            start = offset
        end = start + len(chunk)
        result.append({
            "text": chunk,
            "char_start": start,
            "char_end": end,
        })
        offset = max(offset, start + 1)

    return result
