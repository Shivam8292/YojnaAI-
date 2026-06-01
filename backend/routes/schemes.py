from fastapi import APIRouter, HTTPException, Query
from services.retriever import get_scheme_by_id
from services.tavily_search import search_updates
from services.parser import parse_scheme_sections
from services.llm import translate_sections
import re

router = APIRouter(prefix="/api", tags=["schemes"])

def extract_apply_link(text: str) -> str:
    """
    Extracts the first URL from the text to use as a direct apply link.
    Ignores generic homepage links if possible, and cleans up trailing punctuation.
    """
    urls = re.findall(r'https?://[^\s)\]]+', text)
    for url in urls:
        url = url.rstrip('.,;:"\'?)')
        if "myscheme.gov.in" in url and (url.endswith(".in") or url.endswith(".in/")):
            continue
        return url
    return "https://www.myscheme.gov.in"

@router.get("/scheme/{scheme_id}")
async def get_scheme(scheme_id: str, lang: str = "hi"):
    """
    Retrieves the full document details of a specific scheme by its ID from ChromaDB.
    """
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme with ID '{scheme_id}' not found.")
        
    # Split text into structured sections (Details, Benefits, Eligibility, etc.)
    parsed_sections = parse_scheme_sections(scheme["document"])
    
    # Translate sections using LLM if language is Hindi
    translated_sections = translate_sections(parsed_sections, lang)
    
    # Extract direct apply link from sources or whole document
    sources_text = parsed_sections.get("sources", "")
    apply_link = extract_apply_link(sources_text)
    if apply_link == "https://www.myscheme.gov.in":
        apply_link = extract_apply_link(scheme["document"])
        
    return {
        "id": scheme["id"],
        "name": scheme["metadata"].get("scheme_name", scheme["id"]),
        "document_content": scheme["document"],
        "sections": translated_sections,
        "apply_link": apply_link,
        "metadata": scheme["metadata"]
    }


@router.get("/search-updates")
async def get_search_updates(query: str = Query(..., description="Query for Tavily web search")):
    """
    Fetches real-time updates and news articles for a scheme using Tavily Search API.
    """
    results = search_updates(query)
    return {
        "query": query,
        "results": results
    }
