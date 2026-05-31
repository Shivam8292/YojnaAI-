import os
import glob
import pdfplumber
import chromadb
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

# Configuration
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../gov_myscheme_data/text_data"))

def extract_text_from_pdf(pdf_path):
    """Extracts and cleans text from a PDF file using pdfplumber."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text_parts = []
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            
            full_text = "\n".join(text_parts)
            # Clean extra whitespace
            clean_text = " ".join(full_text.split())
            return clean_text
    except Exception as e:
        print(f"Warning: Failed to extract text from {pdf_path}. Error: {e}")
        return None

def main():
    print(f"Connecting to ChromaDB at: {CHROMA_PERSIST_DIR}")
    chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    collection = chroma_client.get_or_create_collection(name="government_schemes")
    
    print("Loading SentenceTransformer model 'paraphrase-multilingual-MiniLM-L12-v2'...")
    embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    # Get all PDF paths
    search_pattern = os.path.join(DATA_DIR, "*.pdf")
    pdf_paths = glob.glob(search_pattern)
    print(f"Found {len(pdf_paths)} total PDF files in data directory.")
    
    # Filter files
    valid_pdfs = []
    for path in pdf_paths:
        filename = os.path.basename(path)
        if "copy" in filename.lower():
            # Skip copy files as requested
            continue
        valid_pdfs.append(path)
        
    print(f"Filtered to {len(valid_pdfs)} candidate files (skipped copies).")
    
    # Batch processing parameters
    batch_size = 100
    total_stored = 0
    
    # Track existing IDs in collection to avoid re-ingesting
    try:
        existing_ids = set(collection.get()["ids"])
        print(f"ChromaDB already contains {len(existing_ids)} documents.")
    except Exception:
        existing_ids = set()
        
    ids_batch = []
    documents_batch = []
    metadatas_batch = []
    embeddings_batch = []
    
    for idx, pdf_path in enumerate(valid_pdfs):
        filename = os.path.basename(pdf_path)
        doc_id = os.path.splitext(filename)[0]
        
        # Check if already ingested
        if doc_id in existing_ids:
            continue
            
        # Extract text
        text = extract_text_from_pdf(pdf_path)
        if not text or len(text) < 50:
            # Skip empty or short texts
            continue
            
        ids_batch.append(doc_id)
        documents_batch.append(text)
        metadatas_batch.append({
            "source_file": filename,
            "state": "central" # Default metadata as requested
        })
        
        # When batch is full or at end, process and insert
        if len(ids_batch) >= batch_size or idx == len(valid_pdfs) - 1:
            if ids_batch:
                print(f"Processing batch of {len(ids_batch)} files (Progress: {idx+1}/{len(valid_pdfs)})...")
                try:
                    # Generate embeddings in batch
                    embeddings = embedding_model.encode(documents_batch, show_progress_bar=False)
                    embeddings_list = [emb.tolist() for emb in embeddings]
                    
                    # Add to ChromaDB
                    collection.add(
                        ids=ids_batch,
                        documents=documents_batch,
                        metadatas=metadatas_batch,
                        embeddings=embeddings_list
                    )
                    
                    total_stored += len(ids_batch)
                    print(f"Batch inserted. Total new stored in this run: {total_stored}")
                except Exception as e:
                    print(f"Error during batch insertion: {e}")
                
                # Reset batches
                ids_batch = []
                documents_batch = []
                metadatas_batch = []
                embeddings_batch = []
                
    # Final check for any remaining items in last batch
    if ids_batch:
        try:
            embeddings = embedding_model.encode(documents_batch, show_progress_bar=False)
            embeddings_list = [emb.tolist() for emb in embeddings]
            collection.add(
                ids=ids_batch,
                documents=documents_batch,
                metadatas=metadatas_batch,
                embeddings=embeddings_list
            )
            total_stored += len(ids_batch)
        except Exception as e:
            print(f"Error during final batch insertion: {e}")
            
    print(f"Ingestion complete. {total_stored} new schemes stored.")

if __name__ == "__main__":
    main()
