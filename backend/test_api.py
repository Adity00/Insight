import httpx
import sys
import io

# Force UTF-8 for stdout to handle emojis on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Define base URL
BASE_URL = "http://localhost:8000"

def test_api():
    print(f"Testing API at {BASE_URL}...")
    
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Health Check
        print("\n--- 1. Health Check ---")
        try:
            resp = client.get("/health")
            print(f"Status: {resp.status_code}")
            print(resp.json())
            if resp.status_code != 200:
                print("Health check failed!")
                sys.exit(1)
        except httpx.ConnectError:
            print("Could not connect to server. Is it running?")
            sys.exit(1)

        # 2. Dashboard
        print("\n--- 2. Dashboard Stats ---")
        resp = client.get("/api/dashboard")
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"Total Transactions: {data['total_transactions']}")
            print(f"Success Rate: {data['success_rate']}%")
        else:
            print(f"Failed: {resp.text}")

        # 3. Create Session
        print("\n--- 3. Create Session ---")
        resp = client.post("/api/sessions")
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            session_data = resp.json()
            session_id = session_data["session_id"]
            print(f"Created Session ID: {session_id}")
        else:
            print(f"Failed to create session: {resp.text}")
            sys.exit(1)

        # 4. List Sessions
        print("\n--- 4. List Sessions ---")
        resp = client.get("/api/sessions")
        print(f"Status: {resp.status_code}")
        print(f"Sessions found: {len(resp.json())}")

        # 5. Chat Turn 1
        print("\n--- 5. Chat Turn 1 ---")
        question1 = "Which state has the highest transaction volume?"
        print(f"Question: {question1}")
        resp = client.post("/api/chat", json={"question": question1, "session_id": session_id})
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            chat_resp = resp.json()
            print(f"Answer: {chat_resp['answer']}")
            print(f"SQL Used: {chat_resp['sql_used']}")
        else:
            print(f"Chat failed: {resp.text}")

        # 6. Chat Turn 2 (Follow-up)
        print("\n--- 6. Chat Turn 2 (Follow-up) ---")
        question2 = "What is the fraud rate in those states?"
        print(f"Question: {question2}")
        resp = client.post("/api/chat", json={"question": question2, "session_id": session_id})
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            chat_resp = resp.json()
            print(f"Answer: {chat_resp['answer']}")
            print(f"SQL Used: {chat_resp['sql_used']}")
        else:
            print(f"Chat failed: {resp.text}")

if __name__ == "__main__":
    test_api()
