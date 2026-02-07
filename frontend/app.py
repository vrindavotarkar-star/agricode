import streamlit as st
import requests
import json
from typing import Optional

# Configure page
st.set_page_config(
    page_title="Kisan Call Centre Query Assistant",
    page_icon="🌾",
    layout="wide"
)

# API base URL
API_BASE_URL = "http://localhost:8000"

# Session state for authentication
if 'token' not in st.session_state:
    st.session_state.token = None
if 'user' not in st.session_state:
    st.session_state.user = None

def login(username: str, password: str) -> Optional[str]:
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            data={"username": username, "password": password}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            st.error(f"Login failed: {response.json().get('detail', 'Unknown error')}")
            return None
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return None

def register(user_data: dict) -> bool:
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/register",
            json=user_data
        )
        if response.status_code == 200:
            st.success("Registration successful! Please login.")
            return True
        else:
            st.error(f"Registration failed: {response.json().get('detail', 'Unknown error')}")
            return False
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return False

def query_assistant(query: str) -> Optional[dict]:
    if not st.session_state.token:
        st.error("Please login first")
        return None

    try:
        headers = {"Authorization": f"Bearer {st.session_state.token}"}
        response = requests.post(
            f"{API_BASE_URL}/api/query",
            json={"query": query},
            headers=headers
        )
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Query failed: {response.json().get('detail', 'Unknown error')}")
            return None
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return None

def main():
    st.title("🌾 Kisan Call Centre Query Assistant")
    st.markdown("Your AI-powered agricultural advisory system")

    # Sidebar for authentication
    with st.sidebar:
        st.header("Authentication")

        if st.session_state.token:
            st.success(f"Logged in as: {st.session_state.user}")
            if st.button("Logout"):
                st.session_state.token = None
                st.session_state.user = None
                st.rerun()
        else:
            tab1, tab2 = st.tabs(["Login", "Register"])

            with tab1:
                with st.form("login_form"):
                    username = st.text_input("Username")
                    password = st.text_input("Password", type="password")
                    submitted = st.form_submit_button("Login")

                    if submitted:
                        token = login(username, password)
                        if token:
                            st.session_state.token = token
                            st.session_state.user = username
                            st.rerun()

            with tab2:
                with st.form("register_form"):
                    reg_username = st.text_input("Username")
                    reg_email = st.text_input("Email")
                    reg_mobile = st.text_input("Mobile Number")
                    reg_password = st.text_input("Password", type="password")
                    reg_location = st.text_input("Location (optional)")
                    reg_crop_type = st.text_input("Crop Type (optional)")
                    reg_category = st.selectbox("Category", ["", "small_farmer", "large_farmer"])
                    submitted = st.form_submit_button("Register")

                    if submitted:
                        user_data = {
                            "username": reg_username,
                            "email": reg_email,
                            "mobile_number": reg_mobile,
                            "password": reg_password,
                            "location": reg_location or None,
                            "crop_type": reg_crop_type or None,
                            "category": reg_category or None
                        }
                        register(user_data)

    # Main content
    if st.session_state.token:
        st.header("Agricultural Query Assistant")

        # Query input
        query = st.text_area("Enter your agricultural query:", height=100,
                           placeholder="e.g., How to control pests in rice crop?")

        if st.button("Get Advice", type="primary"):
            if query.strip():
                with st.spinner("Processing your query..."):
                    result = query_assistant(query)

                    if result:
                        # Display offline response
                        st.subheader("📚 Offline Knowledge Base Response")
                        st.info(result["offline_response"])

                        # Display AI response if available
                        if result["ai_response"]:
                            st.subheader("🤖 AI-Generated Response")
                            st.success(result["ai_response"])
                        else:
                            st.warning("AI response not available. Showing offline results only.")
            else:
                st.warning("Please enter a query")

        # Query history (placeholder)
        st.header("Recent Queries")
        st.info("Query history feature coming soon...")
    else:
        st.info("Please login to access the agricultural query assistant.")

if __name__ == "__main__":
    main()
