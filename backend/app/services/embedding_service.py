from openai import OpenAI

from app.config import settings

client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)

EMBEDDING_MODEL = "openai/text-embedding-3-small"
BATCH_SIZE = 100


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a list of texts using OpenAI's embedding model via OpenRouter."""
    all_embeddings = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        response = client.embeddings.create(model=EMBEDDING_MODEL, input=batch)
        all_embeddings.extend([item.embedding for item in response.data])
    return all_embeddings
