import os
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Load configuration from environment variables
JIRA_WEBHOOK_SECRET = os.getenv('JIRA_WEBHOOK_SECRET')
GCP_SA_KEY = json.loads(os.getenv('GCP_SA_KEY'))
GROUP_MAPPING = json.loads(os.getenv('GROUP_MAPPING'))

def main(request):
    # Verify JIRA webhook signature
    signature = request.headers.get('X-Jira-Signature')
    if not verify_signature(request.data, JIRA_WEBHOOK_SECRET, signature):
        return {'status': 'error', 'message': 'Invalid signature'}, 401
    
    # Parse JIRA event
    event = request.get_json()
    if event['webhookEvent'] != 'jira:issue_updated':
        return {'status': 'skipped', 'message': 'Not an issue update event'}
    
    # Check if it's a new developer ticket
    issue = event['issue']
    if issue['fields']['issuetype']['name'] == 'New Developer' and issue['fields']['status']['name'] == 'Resolved':
        user_email = issue['fields']['customfield_12345']  # Replace with actual custom field ID
        role = issue['fields']['customfield_12346']        # Replace with actual custom field ID
        
        # Add user to appropriate Google Group
        group_key = GROUP_MAPPING.get(role)
        if group_key:
            add_member_to_group(user_email, group_key)
            return {'status': 'success', 'message': f'User {user_email} added to {group_key}'}
        else:
            return {'status': 'error', 'message': f'No group mapping for role {role}'}
    
    return {'status': 'skipped', 'message': 'Not a resolved New Developer ticket'}

def verify_signature(payload, secret, signature):
    # Implement JIRA webhook signature verification
    # This is a placeholder - actual implementation required
    return True

def add_member_to_group(user_email, group_key):
    # Authenticate with Google Admin SDK
    credentials = service_account.Credentials.from_service_account_info(
        GCP_SA_KEY,
        scopes=['https://www.googleapis.com/auth/admin.directory.group.member']
    ).with_subject('admin@example.com')  # Replace with admin email
    
    service = build('admin', 'directory_v1', credentials=credentials)
    
    member_body = {
        'email': user_email,
        'role': 'MEMBER'
    }
    
    service.members().insert(
        groupKey=group_key,
        body=member_body
    ).execute()

if __name__ == '__main__':
    # For local testing
    class MockRequest:
        def __init__(self, data, headers):
            self.data = data
            self.headers = headers
        
        def get_json(self):
            return json.loads(self.data)
    
    # Mock data for testing
    test_data = json.dumps({
        'webhookEvent': 'jira:issue_updated',
        'issue': {
            'fields': {
                'issuetype': {'name': 'New Developer'},
                'status': {'name': 'Resolved'},
                'customfield_12345': 'newuser@example.com',
                'customfield_12346': 'developer'
            }
        }
    })
    test_headers = {'X-Jira-Signature': 'test-signature'}
    print(main(MockRequest(test_data, test_headers)))