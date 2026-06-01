import os
import chromadb
from dotenv import load_dotenv

# Load env variables
load_dotenv()

def reset_database():
    CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    print(f"Resetting ChromaDB database at: {CHROMA_PERSIST_DIR}...")
    
    try:
        client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        client.delete_collection("government_schemes")
        print("Collection 'government_schemes' deleted successfully from database.")
    except Exception as e:
        print(f"Note: Could not delete collection programmatically (might not exist yet): {e}")
        
    print("Database reset completed successfully. You can now re-run ingestion.")

if __name__ == "__main__":
    reset_database()
