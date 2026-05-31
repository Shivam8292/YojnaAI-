import os
import chromadb
from dotenv import load_dotenv
from services.embedder import get_embedding

# Load env variables
load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

# Initialize ChromaDB client once
print(f"Retriever connecting to ChromaDB at: {CHROMA_PERSIST_DIR}")
_chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
_collection = _chroma_client.get_or_create_collection(name="government_schemes")

def retrieve_schemes(
    user_profile: str, 
    n_results: int = 10, 
    state: str = None, 
    include_central: bool = True, 
    include_state: bool = True
) -> list[dict]:
    """
    Queries ChromaDB for schemes matching the user profile semantic description.
    Supports filtering by central and state schemes.
    """
    # Generate query embedding
    query_vector = get_embedding(user_profile)
    
    # Construct metadata filters based on state selection
    where_clause = {}
    
    if state:
        state_lower = state.lower().strip()
        if include_central and include_state:
            where_clause = {
                "$or": [
                    {"state": "central"},
                    {"state": state_lower}
                ]
            }
        elif include_central:
            where_clause = {"state": "central"}
        elif include_state:
            where_clause = {"state": state_lower}
    else:
        # Fallback filter if no state is provided
        if include_central and not include_state:
            where_clause = {"state": "central"}
            
    # Perform query in ChromaDB
    query_args = {
        "query_embeddings": [query_vector],
        "n_results": n_results
    }
    if where_clause:
        query_args["where"] = where_clause
        
    results = _collection.query(**query_args)
    
    # Structure output
    matched_schemes = []
    if not results or not results['ids'] or not results['ids'][0]:
        return matched_schemes
        
    for doc_id, document, metadata in zip(
        results['ids'][0],
        results['documents'][0],
        results['metadatas'][0]
    ):
        matched_schemes.append({
            "id": doc_id,
            "document": document,
            "metadata": metadata
        })
        
    return matched_schemes

def get_scheme_by_id(scheme_id: str) -> dict:
    """Retrieves a single scheme document by its unique ID."""
    try:
        res = _collection.get(ids=[scheme_id])
        if res and res['ids']:
            return {
                "id": res['ids'][0],
                "document": res['documents'][0],
                "metadata": res['metadatas'][0]
            }
    except Exception as e:
        print(f"Error getting scheme by ID: {e}")
    return None

def count_schemes() -> int:
    """Returns the count of schemes inside the collection."""
    try:
        return _collection.count()
    except Exception:
        return 0
