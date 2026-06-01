import re

def clean_boilerplate(text: str) -> str:
    """Removes common website boilerplate and scrapings from the scheme text."""
    if not text:
        return ""
        
    boilerplate = [
        "Are you sure you want to sign out?CancelSign Out",
        "Are you sure you want to sign out? CancelSign Out",
        "EngEnglish/हिंदीSign In",
        "EngEnglish/हिंदी Sign In",
        "EngEnglish/à¤¹à¤¿à¤‚à¤¦à¥€Sign In",
        "EngEnglish/à¤¹à¤¿à¤‚à¤¦à¥€ Sign In",
        "You need to sign in before applying for schemesCancelSign In",
        "You need to sign in before applying for schemes CancelSign In",
        "It seems you have already initiated your application earlier.To know more please visit CancelApply Now",
        "It seems you have already initiated your application earlier. To know more please visit CancelApply Now",
        "Something went wrong. Please try again later.Ok",
        "Something went wrong. Please try again later. Ok",
        "Was this helpful?Share",
        "Was this helpful? Share",
        "Was this helpful?  Share",
        "News and UpdatesNo new news and updates available",
        "News and Updates No new news and updates available",
        "ShareSomething went wrong. Please try again later.Ok",
        "Share Something went wrong. Please try again later.Ok",
        "ShareNews and UpdatesNo new news and updates available",
        "Share News and UpdatesNo new news and updates available",
        "©2024Powered byDigital India Corporation(DIC)",
        "©2024Powered byDigital India Corporation (DIC)",
        "Ministry of Electronics & IT (MeitY)Government of India",
        "Ministry of Electronics & IT (MeitY) Government of India",
        "Quick LinksAbout UsContact UsScreen ReaderAccessibility StatementFrequently Asked QuestionsDisclaimerTerms & ConditionsUseful LinksGet in touch",
        "Quick LinksAbout UsContact Us Screen ReaderAccessibility StatementFrequently Asked QuestionsDisclaimerTerms & ConditionsUseful LinksGet in touch",
        "4th Floor, NeGD, Electronics Niketan, 6 CGO Complex, Lodhi Road, New Delhi - 110003, Indiasupport- myscheme[at]digitalindia[dot]gov[dot]in(011) 24303714Last Updated On",
        "support- myscheme[at]digitalindia[dot]gov[dot]in",
        "support- myscheme[at]digitalindia",
        "support- myscheme",
        "Last Updated On :",
        "Powered byDigital India Corporation",
        "Digital India Corporation",
        "Government of India",
        "Ministry of Electronics",
        "Electronics Niketan",
        "CGO Complex, Lodhi Road",
        "New Delhi - 110003",
        "OkYou need to sign in",
        "OkIt seems you have",
        "OkWas this helpful?",
        "Ok Was this helpful?",
        "Ok",
        "CancelSign In",
        "CancelApply Now",
        "Sign InBackDetailsBenefitsEligibilityApplication ProcessDocuments RequiredFrequently Asked QuestionsSources And ReferencesFeedback",
        "Sign InBackDetailsBenefitsEligibilityExclusionsApplication ProcessDocuments RequiredFrequently Asked QuestionsSources And ReferencesFeedback",
        "BackDetailsBenefitsEligibilityApplication ProcessDocuments RequiredFrequently Asked QuestionsSources And ReferencesFeedback",
        "BackDetailsBenefitsEligibilityExclusionsApplication ProcessDocuments RequiredFrequently Asked QuestionsSources And ReferencesFeedback",
        "DetailsBenefitsEligibilityApplication ProcessDocuments RequiredFrequently Asked QuestionsSources And ReferencesFeedback",
        "DetailsBenefitsEligibilityExclusionsApplication ProcessDocuments RequiredFrequently Asked QuestionsSources And ReferencesFeedback",
    ]
    
    cleaned = text
    for phrase in boilerplate:
        cleaned = cleaned.replace(phrase, " ")
        
    # Replace multiple spaces with a single space
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def parse_scheme_sections(text: str) -> dict:
    """
    Cleans the input text and splits it into structured sections based on standard headings.
    """
    cleaned = clean_boilerplate(text)
    
    # List of key section headings in order of expected occurrence
    headings = [
        ("details", "Details"),
        ("benefits", "Benefits"),
        ("eligibility", "Eligibility"),
        ("exclusions", "Exclusions"),
        ("application_process", "Application Process"),
        ("documents_required", "Documents Required"),
        ("faqs", "Frequently Asked Questions"),
        ("sources", "Sources And References")
    ]
    
    # Find start index of each heading in the cleaned text
    matches = []
    for key, heading in headings:
        idx = cleaned.find(heading)
        if idx != -1:
            matches.append((key, heading, idx))
            
    # Sort matches by their index in the text
    matches.sort(key=lambda x: x[2])
    
    sections = {
        "title_description": "",
        "details": "",
        "benefits": "",
        "eligibility": "",
        "exclusions": "",
        "application_process": "",
        "documents_required": "",
        "faqs": "",
        "sources": ""
    }
    
    # If no standard headings found, return entire text in title_description
    if not matches:
        sections["title_description"] = cleaned
        return sections
        
    # Slice the text between matched headings
    # Text before the first heading is the title/general description
    sections["title_description"] = cleaned[:matches[0][2]].strip()
    
    for i in range(len(matches)):
        key, heading, start_idx = matches[i]
        content_start = start_idx + len(heading)
        
        if i + 1 < len(matches):
            next_start_idx = matches[i+1][2]
            content = cleaned[content_start:next_start_idx].strip()
        else:
            content = cleaned[content_start:].strip()
            
        # Clean leading punctuation from slice (e.g. colon or hyphens)
        content = re.sub(r'^[:\-\s]+', '', content).strip()
        sections[key] = content
        
    return sections
