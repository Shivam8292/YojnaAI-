from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["eligibility"])

@router.post("/check-eligibility")
async def check_eligibility():
    return {"message": "Eligibility check placeholder"}
