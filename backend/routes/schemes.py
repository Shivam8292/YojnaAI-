from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["schemes"])

@router.get("/scheme/{scheme_id}")
async def get_scheme(scheme_id: str):
    return {"message": f"Scheme details placeholder for {scheme_id}"}

@router.get("/search-updates")
async def search_updates(query: str):
    return {"message": f"Search updates placeholder for query: {query}"}
