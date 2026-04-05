#!/usr/bin/env python3
"""
AgentPassport Lite - Python AI Agent Example

This demonstrates how an AI agent can safely call the AgentPassport gateway
to access Google Calendar WITHOUT ever handling authentication tokens.

The gateway retrieves the user's token server-side and calls the real API.
The AI agent only receives calendar data.
"""

import requests
import json
import sys

# Configuration
GATEWAY_URL = "http://localhost:3000"  # Change to deployed URL for production


def get_calendar_events():
    """
    Fetch calendar events from the AgentPassport secure gateway.
    
    This is the ONLY endpoint the AI agent calls.
    No tokens are passed - the gateway handles all credentials.
    """
    try:
        response = requests.get(
            f"{GATEWAY_URL}/api/get-events",
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        return {"error": "Could not connect to gateway. Is the server running?"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Gateway error: {str(e)}"}


def process_events(data):
    """Parse and display calendar events."""
    if "error" in data:
        print(f"❌ Error: {data['error']}")
        return False

    if not data.get("success"):
        print(f"❌ Failed to fetch events: {data.get('message', 'Unknown error')}")
        return False

    events = data.get("events", [])
    
    if not events:
        print("📅 No upcoming events found")
        return True

    print(f"\n📅 Calendar Events ({len(events)} total):\n")
    for i, event in enumerate(events, 1):
        start_time = event["start"].get("dateTime") or event["start"].get("date")
        print(f"{i}. {event['summary']}")
        print(f"   Time: {start_time}")
        if event.get("description"):
            print(f"   Description: {event['description']}")
        if event.get("organizer"):
            organizer = event["organizer"].get("displayName") or event["organizer"].get("email")
            print(f"   Organizer: {organizer}")
        print()
    
    return True


def main():
    """Main function."""
    print("🤖 AgentPassport Lite - AI Agent Demo")
    print("=" * 50)
    print("Calling secure gateway to fetch calendar events...\n")

    # Step 1: Call the gateway (no token in request!)
    print("[AI Agent] Calling /api/get-events endpoint...")
    data = get_calendar_events()

    # Step 2: Process and display results
    print(f"[AI Agent] Received response from gateway\n")
    success = process_events(data)

    # Step 3: Security Note
    print("\n" + "=" * 50)
    print("🔒 Security Note:")
    print("   ✓ This agent NEVER sees the access token")
    print("   ✓ Gateway uses Auth0 Token Vault to manage credentials")
    print("   ✓ Agent calls /api/get-events with NO authentication")
    print("   ✓ Gateway retrieves token server-side and calls Google API")
    print("   ✓ Calendar data returned to agent (token never exposed)")
    print("=" * 50)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
