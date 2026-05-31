import requests
import pprint

def test_api():
    url = "http://127.0.0.1:8000/api/check-eligibility"
    payload = {
        "user_profile": "Main Bihar ka kisan hoon, 2 acre zameen hai, saal mein 80 hazar kamata hoon",
        "language": "hi",
        "state": "Bihar",
        "include_central": True,
        "include_state": True
    }
    
    print(f"Sending POST request to {url}...")
    try:
        response = requests.post(url, json=payload, timeout=20)
        print(f"Response Status Code: {response.status_code}")
        print("\nResponse Body:")
        pprint.pprint(response.json())
    except Exception as e:
        print(f"Error calling API: {e}")

if __name__ == "__main__":
    test_api()
