import requests
import json
import time

WEBHOOK_URL = "https://realsoftapps.com/n8n/webhook-test/DataDiscovery"
USER_ID = 1

questions = [
    "what do you have about transportation",
    "tell me more about it",
    "what are the main categories",
    "show me details about public transport",
    "what about private transportation options",
    "are there any statistics available",
    "what is the most popular transportation method",
    "can you summarize what we discussed"
]

def send_message(message, thread_id=None):
    payload = {
        "user_id": USER_ID,
        "message": message,
        "thread_id": thread_id
    }
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending message: {e}")
        return None

def main():
    thread_id = None
    
    print("=" * 80)
    print("Testing Transportation Flow - 8 Questions")
    print("=" * 80)
    print()
    
    for i, question in enumerate(questions, 1):
        print(f"Question {i}: {question}")
        print("-" * 80)
        
        response = send_message(question, thread_id)
        
        if response:
            if isinstance(response, list):
                response = response[0]
            
            if response.get("chat_id") and thread_id is None:
                thread_id = response["chat_id"]
                print(f"Thread ID established: {thread_id}")
            
            print(f"Response: {response.get('message_text', 'No response text')}")
            print(f"Chat ID: {response.get('chat_id', 'N/A')}")
            print(f"Message ID: {response.get('message_id', 'N/A')}")
            
            if response.get("metadata"):
                metadata = response["metadata"]
                if metadata.get("suggested_questions"):
                    print(f"Suggested Questions: {metadata['suggested_questions']}")
        else:
            print("Failed to get response")
        
        print()
        
        if i < len(questions):
            time.sleep(1)
    
    print("=" * 80)
    print(f"Test completed. Final Thread ID: {thread_id}")
    print("=" * 80)

if __name__ == "__main__":
    main()

