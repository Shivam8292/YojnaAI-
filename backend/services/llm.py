import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
_client = None

if GROQ_API_KEY:
    print("Initializing Groq API client...")
    _client = Groq(api_key=GROQ_API_KEY)
else:
    print("Warning: GROQ_API_KEY not found in environment variables. LLM logic will degrade to fallback.")

def synthesize_results(user_profile: str, schemes: list, language: str) -> dict:
    """
    Sends matched ChromaDB schemes to Groq Llama-3.3 model to check eligibility
    and synthesize why the user qualifies. Returns structured JSON list.
    """
    if not _client:
        raise ValueError("Groq client not initialized. Check GROQ_API_KEY.")
        
    if not schemes:
        return {"schemes": [], "total_found": 0}
        
    # Format schemes context for the prompt
    schemes_context = ""
    for idx, s in enumerate(schemes):
        schemes_context += f"--- SCHEME {idx+1} ---\n"
        schemes_context += f"ID: {s['id']}\n"
        schemes_context += f"Name: {s['metadata'].get('scheme_name', s['id'])}\n"
        schemes_context += f"Ministry: {s['metadata'].get('ministry', 'Unknown')}\n"
        schemes_context += f"Content: {s['document'][:1500]}\n\n" # Limit text to prevent token bloat
        
    system_prompt = (
        "You are an expert government scheme eligibility finder assistant. "
        "Your task is to analyze a citizen's profile against a list of government schemes and identify "
        "only the schemes they actually qualify for.\n\n"
        "Rules:\n"
        "1. Check the criteria of each scheme in the provided context carefully against the user's details.\n"
        "2. Only return schemes that the user is eligible for. If they don't qualify, exclude it.\n"
        "3. Explain in simple, friendly words why they are eligible. Focus on the matched parameters (e.g. land, income, gender, age).\n"
        f"4. You must write the explanations (why_eligible) in the requested language: '{language}' "
        "(if 'hi' use simple conversational Hindi/Hinglish, if 'en' use English).\n"
        "5. Respond in a strict JSON format matching the schema below. Do not add any introduction or explanations outside the JSON structure.\n\n"
        "JSON SCHEMA:\n"
        "{\n"
        "  \"schemes\": [\n"
        "    {\n"
        "      \"id\": \"scheme-id-here\",\n"
        "      \"name\": \"Official Scheme Name\",\n"
        "      \"benefit\": \"Specific monetary or support benefit details from the scheme\",\n"
        "      \"why_eligible\": \"Simple explanation of eligibility in target language\",\n"
        "      \"apply_link\": \"Official apply link or portal URL (if found in context, else empty string)\",\n"
        "      \"ministry\": \"Name of the Ministry\"\n"
        "    }\n"
        "  ]\n"
        "}"
    )
    
    user_prompt = (
        f"User Profile Details: {user_profile}\n\n"
        f"Context Government Schemes:\n{schemes_context}"
    )
    
    try:
        response = _client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        raw_content = response.choices[0].message.content
        result_json = json.loads(raw_content)
        return result_json
        
    except Exception as e:
        print(f"Error invoking Groq API: {e}")
        raise e

def translate_sections(sections: dict, target_lang: str) -> dict:
    """
    Translates structured scheme sections into target language (Hindi) using Groq.
    If translation fails or client is not set, returns original sections.
    """
    if not _client or target_lang != "hi":
        return sections
        
    # We only translate sections that have non-empty values
    sections_to_translate = {k: v for k, v in sections.items() if v and k != "title_description"}
    if not sections_to_translate:
        return sections
        
    system_prompt = (
        "You are an expert government scheme details translator. "
        "Your task is to translate the provided dictionary values from English to clear, natural, and helpful Hindi (in Devanagari script). "
        "Maintain the exact dictionary keys. Do not translate key names, only translate the values. "
        "Keep technical terms like scheme names or specific requirements accurate. "
        "Respond in a strict JSON format matching the input dictionary keys exactly, without any extra text."
    )
    
    user_prompt = f"Dictionary to translate:\n{json.dumps(sections_to_translate, ensure_ascii=False)}"
    
    try:
        response = _client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        translated_data = json.loads(response.choices[0].message.content)
        
        # Merge translated values back into the original sections dict
        result = sections.copy()
        for k, v in translated_data.items():
            if k in result:
                result[k] = v
        return result
    except Exception as e:
        print(f"Error translating sections: {e}")
        return sections

