from sentence_transformers import SentenceTransformer

# Load the model once at startup (module level import)
print("Initializing sentence-transformers model 'paraphrase-multilingual-MiniLM-L12-v2'...")
_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def get_embedding(text: str) -> list[float]:
    """Generates an embedding list of floats for the input text."""
    embedding = _model.encode(text)
    return embedding.tolist()
