import os
from huggingface_hub import snapshot_download

def download_dataset():
    print("Downloading shrijayan/gov_myscheme dataset from Hugging Face...")
    
    # Resolve directory path relative to this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    local_dir = os.path.abspath(os.path.join(current_dir, "../../gov_myscheme_data"))
    
    os.makedirs(local_dir, exist_ok=True)
    
    # Download dataset files
    downloaded_path = snapshot_download(
        repo_id="shrijayan/gov_myscheme",
        repo_type="dataset",
        local_dir=local_dir,
        ignore_patterns=["*.git*", "*.gitattributes"]
    )
    
    # Check downloaded files in text_data directory
    text_data_dir = os.path.join(local_dir, "text_data")
    total_files = 0
    pdf_files = 0
    
    if os.path.exists(text_data_dir):
        files_list = os.listdir(text_data_dir)
        total_files = len(files_list)
        pdf_files = len([f for f in files_list if f.lower().endswith('.pdf')])
        
    print(f"\nDownload finished. Saved to: {downloaded_path}")
    print(f"Total files in text_data: {total_files}")
    print(f"Total PDFs in text_data: {pdf_files}")

if __name__ == "__main__":
    download_dataset()
