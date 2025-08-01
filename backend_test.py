#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Messaging App
Tests all backend APIs including registration, messages, translation, and language support
"""

import requests
import json
import base64
import time
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE}")

class BackendTester:
    def __init__(self):
        self.test_results = {}
        self.registered_users = []
        self.created_messages = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results[test_name] = {"success": success, "details": details}
        
    def test_registration_system(self):
        """Test phone number registration with hash-based nickname generation"""
        print("\n=== Testing Registration System ===")
        
        # Test data with realistic phone numbers and phrases
        test_cases = [
            {"phone_number": "+1234567890", "phrase": "hello world"},
            {"phone_number": "+9876543210", "phrase": "good morning"},
            {"phone_number": "+5555555555", "phrase": "nice day"}
        ]
        
        for i, test_case in enumerate(test_cases):
            try:
                response = requests.post(f"{API_BASE}/register", json=test_case, timeout=10)
                
                if response.status_code == 200:
                    user_data = response.json()
                    
                    # Verify required fields
                    required_fields = ['id', 'phone_number', 'nickname', 'avatar_base64', 'created_at']
                    missing_fields = [field for field in required_fields if field not in user_data]
                    
                    if missing_fields:
                        self.log_test(f"Registration Test {i+1} - Field Validation", False, 
                                    f"Missing fields: {missing_fields}")
                        continue
                    
                    # Verify phone number matches
                    if user_data['phone_number'] != test_case['phone_number']:
                        self.log_test(f"Registration Test {i+1} - Phone Number", False, 
                                    f"Phone mismatch: expected {test_case['phone_number']}, got {user_data['phone_number']}")
                        continue
                    
                    # Verify nickname is generated (hash-based)
                    if not user_data['nickname'] or len(user_data['nickname']) < 5:
                        self.log_test(f"Registration Test {i+1} - Nickname Generation", False, 
                                    f"Invalid nickname: {user_data['nickname']}")
                        continue
                    
                    # Verify avatar is base64 encoded
                    if not user_data['avatar_base64'] or not self.is_valid_base64(user_data['avatar_base64']):
                        self.log_test(f"Registration Test {i+1} - Avatar Generation", False, 
                                    "Invalid or missing avatar base64")
                        continue
                    
                    self.registered_users.append(user_data)
                    self.log_test(f"Registration Test {i+1}", True, 
                                f"User registered with nickname: {user_data['nickname']}")
                    
                else:
                    self.log_test(f"Registration Test {i+1}", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Registration Test {i+1}", False, f"Exception: {str(e)}")
        
        # Test duplicate registration
        if test_cases:
            try:
                response = requests.post(f"{API_BASE}/register", json=test_cases[0], timeout=10)
                if response.status_code == 200:
                    user_data = response.json()
                    # Should return existing user
                    self.log_test("Duplicate Registration Test", True, 
                                "Correctly handled duplicate registration")
                else:
                    self.log_test("Duplicate Registration Test", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("Duplicate Registration Test", False, f"Exception: {str(e)}")
    
    def test_user_retrieval(self):
        """Test user retrieval operations"""
        print("\n=== Testing User Retrieval ===")
        
        # Test get all users
        try:
            response = requests.get(f"{API_BASE}/users", timeout=10)
            if response.status_code == 200:
                users = response.json()
                if isinstance(users, list) and len(users) >= len(self.registered_users):
                    self.log_test("Get All Users", True, f"Retrieved {len(users)} users")
                else:
                    self.log_test("Get All Users", False, f"Expected list with at least {len(self.registered_users)} users")
            else:
                self.log_test("Get All Users", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get All Users", False, f"Exception: {str(e)}")
        
        # Test get specific user
        if self.registered_users:
            user_id = self.registered_users[0]['id']
            try:
                response = requests.get(f"{API_BASE}/users/{user_id}", timeout=10)
                if response.status_code == 200:
                    user = response.json()
                    if user['id'] == user_id:
                        self.log_test("Get Specific User", True, f"Retrieved user: {user['nickname']}")
                    else:
                        self.log_test("Get Specific User", False, "User ID mismatch")
                else:
                    self.log_test("Get Specific User", False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("Get Specific User", False, f"Exception: {str(e)}")
    
    def test_message_system(self):
        """Test message creation and retrieval operations"""
        print("\n=== Testing Message System ===")
        
        if not self.registered_users:
            self.log_test("Message System", False, "No registered users available for testing")
            return
        
        sender_id = self.registered_users[0]['id']
        
        # Test different message types
        message_tests = [
            {
                "sender_id": sender_id,
                "content": "Hello, this is a test message!",
                "message_type": "text"
            },
            {
                "sender_id": sender_id,
                "content": "Voice message test",
                "message_type": "voice",
                "voice_base64": "dGVzdCB2b2ljZSBkYXRh"  # base64 encoded "test voice data"
            },
            {
                "sender_id": sender_id,
                "content": "Image message test",
                "message_type": "image",
                "image_base64": "dGVzdCBpbWFnZSBkYXRh"  # base64 encoded "test image data"
            },
            {
                "sender_id": sender_id,
                "content": "Location message test",
                "message_type": "location",
                "location_data": {"lat": 40.7128, "lng": -74.0060, "address": "New York, NY"}
            }
        ]
        
        for i, message_data in enumerate(message_tests):
            try:
                response = requests.post(f"{API_BASE}/messages", json=message_data, timeout=10)
                
                if response.status_code == 200:
                    message = response.json()
                    
                    # Verify required fields
                    required_fields = ['id', 'sender_id', 'content', 'message_type', 'timestamp']
                    missing_fields = [field for field in required_fields if field not in message]
                    
                    if missing_fields:
                        self.log_test(f"Message Creation Test {i+1}", False, 
                                    f"Missing fields: {missing_fields}")
                        continue
                    
                    # Verify sender_id matches
                    if message['sender_id'] != sender_id:
                        self.log_test(f"Message Creation Test {i+1}", False, 
                                    f"Sender ID mismatch")
                        continue
                    
                    # Verify message type
                    if message['message_type'] != message_data['message_type']:
                        self.log_test(f"Message Creation Test {i+1}", False, 
                                    f"Message type mismatch")
                        continue
                    
                    self.created_messages.append(message)
                    self.log_test(f"Message Creation Test {i+1} ({message_data['message_type']})", True, 
                                f"Message created with ID: {message['id']}")
                    
                else:
                    self.log_test(f"Message Creation Test {i+1}", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Message Creation Test {i+1}", False, f"Exception: {str(e)}")
        
        # Test message retrieval
        try:
            response = requests.get(f"{API_BASE}/messages", timeout=10)
            if response.status_code == 200:
                messages = response.json()
                if isinstance(messages, list) and len(messages) >= len(self.created_messages):
                    self.log_test("Message Retrieval", True, f"Retrieved {len(messages)} messages")
                else:
                    self.log_test("Message Retrieval", False, 
                                f"Expected at least {len(self.created_messages)} messages")
            else:
                self.log_test("Message Retrieval", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Message Retrieval", False, f"Exception: {str(e)}")
    
    def test_translation_system(self):
        """Test the built-in translation functionality"""
        print("\n=== Testing Translation System ===")
        
        # Test translation with common phrases
        translation_tests = [
            {"text": "hello", "target_language": "es"},
            {"text": "goodbye", "target_language": "fr"},
            {"text": "thank you", "target_language": "de"},
            {"text": "hello world", "target_language": "zh"},
            {"text": "random text that won't translate", "target_language": "ja"}
        ]
        
        for i, test_data in enumerate(translation_tests):
            try:
                response = requests.post(f"{API_BASE}/translate", json=test_data, timeout=10)
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Verify response structure
                    required_fields = ['original', 'translated', 'language']
                    missing_fields = [field for field in required_fields if field not in result]
                    
                    if missing_fields:
                        self.log_test(f"Translation Test {i+1}", False, 
                                    f"Missing fields: {missing_fields}")
                        continue
                    
                    # Verify original text matches
                    if result['original'] != test_data['text']:
                        self.log_test(f"Translation Test {i+1}", False, 
                                    f"Original text mismatch")
                        continue
                    
                    # Verify language code matches
                    if result['language'] != test_data['target_language']:
                        self.log_test(f"Translation Test {i+1}", False, 
                                    f"Language code mismatch")
                        continue
                    
                    # Check if translation occurred (should be different from original for known phrases)
                    if test_data['text'].lower() in ['hello', 'goodbye', 'thank you']:
                        if result['translated'] == result['original']:
                            self.log_test(f"Translation Test {i+1}", False, 
                                        f"No translation occurred for known phrase")
                            continue
                    
                    self.log_test(f"Translation Test {i+1}", True, 
                                f"'{result['original']}' -> '{result['translated']}' ({result['language']})")
                    
                else:
                    self.log_test(f"Translation Test {i+1}", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Translation Test {i+1}", False, f"Exception: {str(e)}")
    
    def test_language_support(self):
        """Test the 52 languages API endpoint"""
        print("\n=== Testing Language Support ===")
        
        try:
            response = requests.get(f"{API_BASE}/languages", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                
                # Verify response structure
                if 'languages' not in result or 'total' not in result:
                    self.log_test("Language Support API", False, 
                                "Missing 'languages' or 'total' fields")
                    return
                
                languages = result['languages']
                total = result['total']
                
                # Verify it's a list
                if not isinstance(languages, list):
                    self.log_test("Language Support API", False, 
                                "Languages should be a list")
                    return
                
                # Verify we have close to 52 languages
                if total < 50:  # Allow some flexibility
                    self.log_test("Language Support API", False, 
                                f"Expected ~52 languages, got {total}")
                    return
                
                # Verify language structure
                if languages:
                    first_lang = languages[0]
                    if 'code' not in first_lang or 'name' not in first_lang:
                        self.log_test("Language Support API", False, 
                                    "Language objects missing 'code' or 'name' fields")
                        return
                
                # Verify some expected languages are present
                expected_codes = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ru', 'ar', 'hi']
                present_codes = [lang['code'] for lang in languages]
                missing_codes = [code for code in expected_codes if code not in present_codes]
                
                if missing_codes:
                    self.log_test("Language Support API", False, 
                                f"Missing expected language codes: {missing_codes}")
                    return
                
                self.log_test("Language Support API", True, 
                            f"Successfully retrieved {total} languages")
                
            else:
                self.log_test("Language Support API", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Language Support API", False, f"Exception: {str(e)}")
    
    def test_hash_consistency(self):
        """Test that hash-based nicknames are generated consistently"""
        print("\n=== Testing Hash Consistency ===")
        
        test_phone = "+1111111111"
        test_phrase = "consistency test"
        
        nicknames = []
        
        # Register same user multiple times (should return same user)
        for i in range(3):
            try:
                response = requests.post(f"{API_BASE}/register", 
                                       json={"phone_number": test_phone, "phrase": test_phrase}, 
                                       timeout=10)
                
                if response.status_code == 200:
                    user_data = response.json()
                    nicknames.append(user_data['nickname'])
                else:
                    self.log_test("Hash Consistency Test", False, 
                                f"Registration failed: HTTP {response.status_code}")
                    return
                    
            except Exception as e:
                self.log_test("Hash Consistency Test", False, f"Exception: {str(e)}")
                return
        
        # All nicknames should be identical
        if len(set(nicknames)) == 1:
            self.log_test("Hash Consistency Test", True, 
                        f"Consistent nickname generation: {nicknames[0]}")
        else:
            self.log_test("Hash Consistency Test", False, 
                        f"Inconsistent nicknames: {nicknames}")
    
    def is_valid_base64(self, s):
        """Check if string is valid base64"""
        try:
            if isinstance(s, str):
                s = s.encode('ascii')
            return base64.b64encode(base64.b64decode(s)) == s
        except Exception:
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend Testing")
        print(f"Backend URL: {API_BASE}")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run tests in order of priority
        self.test_registration_system()
        self.test_user_retrieval()
        self.test_message_system()
        self.test_translation_system()
        self.test_language_support()
        self.test_hash_consistency()
        
        end_time = time.time()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print(f"Test Duration: {end_time - start_time:.2f} seconds")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for test_name, result in self.test_results.items():
                if not result['success']:
                    print(f"  • {test_name}: {result['details']}")
        
        print("\n✅ PASSED TESTS:")
        for test_name, result in self.test_results.items():
            if result['success']:
                print(f"  • {test_name}")
        
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = BackendTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)