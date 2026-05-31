import os
import chromadb
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

def test_query():
    persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    print(f"Connecting to ChromaDB at: {persist_dir}")
    
    try:
        client = chromadb.PersistentClient(path=persist_dir)
        collection = client.get_collection(name="government_schemes")
        
        count = collection.count()
        print(f"Total documents currently in collection: {count}")
        
        if count == 0:
            print("Database is currently empty. Please wait for ingestion progress.")
            return
            
        query = "kisan ke liye yojana"
        print(f"\nQuerying for: '{query}'...")
        
        print("Loading SentenceTransformer model for query embedding...")
        model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        query_vector = model.encode(query).tolist()
        
        results = collection.query(
            query_embeddings=[query_vector],
            n_results=3
        )
        
        print("\nTop 3 Matched Schemes:")
        for idx, (doc_id, doc, metadata, distance) in enumerate(zip(
            results['ids'][0], 
            results['documents'][0], 
            results['metadatas'][0],
            results['distances'][0]
        )):
            print(f"\n[{idx+1}] ID: {doc_id} (Cosine Distance: {distance:.4f})")
            print(f"Source File: {metadata.get('source_file')}")
            print(f"Snippet: {doc[:250]}...")
            
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")

if __name__ == "__main__":
    test_query()
