import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def run_test():
    print("1. Uploading resume...")
    files = {'files': ('dummy.pdf', 'John Doe\nSoftware Engineer\nPython, React', 'application/pdf')}
    res = requests.post(f"{BASE_URL}/upload", files=files)
    if res.status_code != 200:
        print("Upload failed")
        return
    
    data = res.json()
    candidate_id = data['candidates'][0]['id']
    print(f"Candidate ID: {candidate_id}")
    
    print("2. Analyzing...")
    jd = {
        "title": "Software Engineer",
        "description": "Looking for Python and React dev",
        "required_skills": ["Python", "React"],
        "preferred_skills": [],
        "min_experience_years": 1
    }
    res = requests.post(f"{BASE_URL}/analyze", json={"job_description": jd})
    if res.status_code != 200:
        print(f"Analysis failed: {res.text}")
        return
    
    print("3. Shortlisting...")
    res = requests.post(f"{BASE_URL}/candidates/{candidate_id}/shortlist")
    if res.status_code != 200:
        print(f"Shortlist failed: {res.text}")
        return
    
    print("4. Verifying status...")
    res = requests.get(f"{BASE_URL}/candidates/{candidate_id}")
    candidate = res.json()
    print(f"Status: {candidate['status']}")
    
    if candidate['status'] == 'shortlisted':
        print("SUCCESS: Candidate is shortlisted.")
    else:
        print(f"FAILURE: Candidate status is {candidate['status']}")

if __name__ == "__main__":
    run_test()
