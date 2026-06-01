import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import glob
import pdfplumber
import chromadb
from dotenv import load_dotenv
from services.parser import clean_boilerplate

# Load environment variables
load_dotenv()

# Configuration
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../gov_myscheme_data/text_data"))

STATES_LIST = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Delhi", "Jammu and Kashmir", 
    "Ladakh", "Lakshadweep", "Puducherry"
]

def detect_state(text, filename):
    """Detects if a scheme belongs to a specific state based on filename or text snippet."""
    name_lower = filename.lower()
    
    # 1. Check filename keywords/suffixes (e.g. "aay-goa.pdf" -> Goa, "amas-haryana.pdf" -> Haryana)
    for state in STATES_LIST:
        state_lower = state.lower()
        state_compact = state_lower.replace(" ", "")
        
        if f"-{state_compact}" in name_lower or f"_{state_compact}" in name_lower or f"-{state_lower}" in name_lower or f"_{state_lower}" in name_lower:
            return state_lower
            
    # 2. Check the first 500 characters of the text for the state name
    snippet = text[:500].lower()
    for state in STATES_LIST:
        state_lower = state.lower()
        if state_lower in snippet:
            return state_lower
            
    # 3. Check common state abbreviations in filename prefix
    if name_lower.startswith("up"):
        return "uttar pradesh"
    elif name_lower.startswith("br") or name_lower.startswith("bh"):
        return "bihar"
    elif name_lower.startswith("mp"):
        return "madhya pradesh"
    elif name_lower.startswith("mh"):
        return "maharashtra"
    elif name_lower.startswith("jh"):
        return "jharkhand"
    elif name_lower.startswith("pb"):
        return "punjab"
    elif name_lower.startswith("rj"):
        return "rajasthan"
    elif name_lower.startswith("gj"):
        return "gujarat"
    elif name_lower.startswith("kl"):
        return "kerala"
    elif name_lower.startswith("ka"):
        return "karnataka"
    elif name_lower.startswith("ap"):
        return "andhra pradesh"
    elif name_lower.startswith("ts") or name_lower.startswith("tg"):
        return "telangana"
    elif name_lower.startswith("wb"):
        return "west bengal"
        
    return "central"

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
            # Clean using our parser service to remove web scraping garbage
            clean_text = clean_boilerplate(full_text)
            return clean_text
    except Exception as e:
        print(f"Warning: Failed to extract text from {pdf_path}. Error: {e}")
        return None

def main():
    print(f"Connecting to ChromaDB at: {CHROMA_PERSIST_DIR}")
    chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    collection = chroma_client.get_or_create_collection(name="government_schemes")
    
    # Get all PDF paths
    search_pattern = os.path.join(DATA_DIR, "*.pdf")
    pdf_paths = glob.glob(search_pattern)
    print(f"Found {len(pdf_paths)} total PDF files in data directory.")
    
    # Filter files to skip copies and restrict to Bihar, UP, and a selection of Central schemes
    valid_pdfs = []
    central_count = 0
    for path in pdf_paths:
        filename = os.path.basename(path).lower()
        if "copy" in filename:
            continue
            
        # Is it a Bihar or UP scheme?
        is_bihar_or_up = ("bihar" in filename or "up" in filename or 
                          filename.startswith("br") or filename.startswith("bh") or 
                          filename.startswith("up"))
                          
        if is_bihar_or_up:
            valid_pdfs.append(path)
        elif central_count < 150: # Limit general central schemes to 150 to save RAM/time
            # Check if it has another state suffix
            has_other_state = False
            for state in STATES_LIST:
                state_compact = state.lower().replace(" ", "")
                if f"-{state_compact}" in filename or f"_{state_compact}" in filename:
                    has_other_state = True
                    break
            if not has_other_state:
                valid_pdfs.append(path)
                central_count += 1
        
    print(f"Filtered to {len(valid_pdfs)} relevant candidate files (Bihar, UP, and 150 Central schemes).")
    
    # Retrieve existing document IDs in ChromaDB
    try:
        existing_ids = set(collection.get()["ids"])
        print(f"ChromaDB already contains {len(existing_ids)} documents.")
    except Exception:
        existing_ids = set()
        
    to_process = [p for p in valid_pdfs if os.path.splitext(os.path.basename(p))[0] not in existing_ids]
    print(f"Need to process {len(to_process)} new files.")
    
    if not to_process:
        print("No new documents to ingest.")
        return

    print("Loading SentenceTransformer model 'paraphrase-multilingual-MiniLM-L12-v2'...")
    from sentence_transformers import SentenceTransformer
    embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    print("Starting sequential ingestion...")
    
    batch_size = 50
    ids_batch = []
    documents_batch = []
    metadatas_batch = []
    total_stored = 0
    
    for idx, pdf_path in enumerate(to_process):
        filename = os.path.basename(pdf_path)
        doc_id = os.path.splitext(filename)[0]
        
        # Extract and clean text
        text = extract_text_from_pdf(pdf_path)
        if not text or len(text) < 50:
            continue
            
        # Detect state metadata
        state_detected = detect_state(text, filename)
        
        ids_batch.append(doc_id)
        documents_batch.append(text)
        metadatas_batch.append({
            "source_file": filename,
            "scheme_name": doc_id.replace("-", " ").title(),
            "state": state_detected
        })
        
        # When batch is full or at end, process and insert
        if len(ids_batch) >= batch_size or idx == len(to_process) - 1:
            if ids_batch:
                print(f"Embedding and inserting batch of {len(ids_batch)} files (Progress: {idx+1}/{len(to_process)})...")
                try:
                    # Generate embeddings
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
                
    print(f"Ingestion complete. {total_stored} new schemes stored.")

if __name__ == "__main__":
    main()
