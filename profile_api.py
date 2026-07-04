import time
import requests
import uuid

def profile_endpoint():
    # Register/Login
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    reg_res = requests.post("http://127.0.0.1:8001/api/auth/register", json={
        "name": "Test User",
        "email": unique_email,
        "password": "Password123!"
    })
    
    if reg_res.status_code != 200:
        print(f"Failed to register: {reg_res.text}")
        return
        
    login_res = requests.post("http://127.0.0.1:8001/api/auth/login", data={
        "username": unique_email,
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test Trading Portfolio
    print("Fetching portfolio...")
    res1 = requests.get("http://127.0.0.1:8001/api/paper-trading/portfolio", headers=headers)
    if res1.status_code == 200:
        print(f"Portfolio loaded: {res1.text[:100]}")
    else:
        print(f"Failed Portfolio: {res1.status_code} - {res1.text}")
        
    print("Fetching dashboard data...")
    res2 = requests.get("http://127.0.0.1:8001/api/dashboard/market-overview", headers=headers)
    if res2.status_code == 200:
        print(f"Dashboard loaded: {res2.text[:100]}")
    else:
        print(f"Failed Dashboard: {res2.status_code} - {res2.text}")

if __name__ == "__main__":
    profile_endpoint()
