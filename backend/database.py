import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Path to the service account key file
key_path = os.getenv("FIREBASE_KEY_PATH", "firebase_key.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

import json
import os

# Path to local fallback storage
LOCAL_STORAGE = "audits_db.json"

def _load_local():
    if os.path.exists(LOCAL_STORAGE):
        try:
            with open(LOCAL_STORAGE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def _save_local(data):
    current = _load_local()
    current[data['audit_id']] = data
    with open(LOCAL_STORAGE, "w") as f:
        json.dump(current, f)

def save_audit(audit_data):
    # Always save a local backup first for immediate history availability
    _save_local(audit_data)
    
    try:
        # Then try to sync to Firestore
        doc_ref = db.collection('audits').document(audit_data['audit_id'])
        doc_ref.set(audit_data)
    except Exception as e:
        print(f"Firestore Sync Error (Local backup exists): {e}")
    
    return audit_data['audit_id']

def get_audit(audit_id, user_id=None):
    try:
        doc_ref = db.collection('audits').document(audit_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            # Security check: verify user_id matches
            if user_id and data.get('user_id') != user_id:
                return None
            return data
    except Exception as e:
        print(f"Firestore Error (Falling back to local): {e}")
        data = _load_local().get(audit_id)
        if data and user_id and data.get('user_id') != user_id:
            return None
        return data
    return None

def get_all_audits(user_id=None):
    try:
        audits_ref = db.collection('audits')
        if user_id:
            # Note: This requires a composite index (user_id, timestamp) in Firestore
            # If it fails, we fall back to local or non-ordered fetch
            audits_ref = audits_ref.where('user_id', '==', user_id)
        
        audits_ref = audits_ref.order_by('timestamp', direction=firestore.Query.DESCENDING)
        docs = audits_ref.stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        print(f"Firestore Query Error (Falling back to local filtering): {e}")
        local_data = _load_local()
        all_audits = list(local_data.values())
        
        # STRICT FILTERING
        if user_id:
            all_audits = [a for a in all_audits if a.get('user_id') == user_id]
        else:
            # If no user_id is provided, return nothing to be safe
            return []
        
        return sorted(all_audits, key=lambda x: x['timestamp'], reverse=True)
