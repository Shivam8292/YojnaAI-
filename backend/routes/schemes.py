from fastapi import APIRouter, HTTPException, Query
from services.retriever import get_scheme_by_id
from services.tavily_search import search_updates

router = APIRouter(prefix="/api", tags=["schemes"])

@router.get("/scheme/{scheme_id}")
async def get_scheme(scheme_id: str):
    """
    Retrieves the full document details of a specific scheme by its ID from ChromaDB.
    """
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme with ID '{scheme_id}' not found.")
        
    return {
        "id": scheme["id"],
        "name": scheme["metadata"].get("scheme_name", scheme["id"]),
        "document_content": scheme["document"],
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
