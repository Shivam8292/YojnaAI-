import os
import requests
from dotenv import load_dotenv

# Load env variables
load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

def search_updates(query: str) -> list[dict]:
    """
    Searches the web using Tavily API for the given query.
    Returns the top 2 results containing title, url, and snippet.
    """
    if not TAVILY_API_KEY:
        print("Warning: TAVILY_API_KEY not configured. Skipping search updates.")
        return []
        
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "light",
        "include_answer": False,
        "max_results": 2
    }
    
    try:
        response = requests.post(url, json=payload, timeout=8)
        if response.status_code == 200:
            data = response.json()
            raw_results = data.get("results", [])
            
            structured_results = []
            for r in raw_results:
                structured_results.append({
                    "title": r.get("title", "Latest Update"),
                    "url": r.get("url", ""),
                    "snippet": r.get("content", r.get("snippet", ""))
                })
            return structured_results
    except Exception as e:
        print(f"Error calling Tavily Search API: {e}")
        
    return []
