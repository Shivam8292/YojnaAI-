from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from services.retriever import retrieve_schemes
from services.llm import synthesize_results

router = APIRouter(prefix="/api", tags=["eligibility"])

class EligibilityRequest(BaseModel):
    user_profile: str = Field(..., max_length=500, description="Citizen profile details")
    language: str = Field("hi", pattern="^(hi|en)$", description="Language preference: 'hi' or 'en'")
    state: str = Field(..., description="Selected state or UT name")
    include_central: bool = Field(True, description="Whether to search central schemes")
    include_state: bool = Field(True, description="Whether to search state-specific schemes")

@router.post("/check-eligibility")
async def check_eligibility(payload: EligibilityRequest):
    """
    POST route to assess a user's scheme eligibility.
    Retrieves matching documents from ChromaDB and passes them to Llama-3.3 on Groq
    to filter and generate personalized explanations.
    """
    # Sanitize user input profile details (removing HTML tags/scripts)
    clean_profile = payload.user_profile.replace("<", "").replace(">", "").strip()
    
    # Retrieve top matches from vector storage
    try:
        matched_docs = retrieve_schemes(
            user_profile=clean_profile,
            n_results=10,
            state=payload.state,
            include_central=payload.include_central,
            include_state=payload.include_state
        )
    except Exception as e:
        print(f"Retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"Database retrieval failed: {str(e)}")
        
    if not matched_docs:
        return {
            "schemes": [],
            "total_found": 0,
            "language": payload.language,
            "llm_synthesized": True
        }
        
    # Attempt synthesis using Groq
    try:
        synthesis_result = synthesize_results(
            user_profile=clean_profile,
            schemes=matched_docs,
            language=payload.language
        )
        
        # Add metadata and flags
        schemes_list = synthesis_result.get("schemes", [])
        return {
            "schemes": schemes_list,
            "total_found": len(schemes_list),
            "language": payload.language,
            "llm_synthesized": True
        }
        
    except Exception as e:
        print(f"Groq Synthesis failed, activating fallback logic: {e}")
        
        # Fallback logic: return top Chroma matches directly with standard message
        fallback_schemes = []
        for doc in matched_docs[:5]:
            scheme_id = doc["id"]
            scheme_name = doc["metadata"].get("scheme_name", scheme_id)
            ministry = doc["metadata"].get("ministry", "Central Government")
            
            # Simple language fallback
            if payload.language == "hi":
                why_eligible = f"Aap is yojana ke yogy ho sakte hain. Kripya niyam aur sharten check karein."
                benefit = "Yojana ke nirdeshon ke anusar labh prapt hoga."
            else:
                why_eligible = f"You might be eligible for this scheme. Please check the official guidelines for details."
                benefit = "Benefits are provided as per scheme guidelines."
                
            fallback_schemes.append({
                "id": scheme_id,
                "name": scheme_name,
                "benefit": benefit,
                "why_eligible": why_eligible,
                "apply_link": "https://www.myscheme.gov.in",
                "ministry": ministry
            })
            
        return {
            "schemes": fallback_schemes,
            "total_found": len(fallback_schemes),
            "language": payload.language,
            "llm_synthesized": False,
            "error_warning": "Groq synthesis offline. Showing matching candidates directly."
        }
