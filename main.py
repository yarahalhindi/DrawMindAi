from fastapi import FastAPI
from pydantic import BaseModel
import psycopg2
import os
import bcrypt

app = FastAPI()

# Securely grab the Neon connection string
DB_URL = os.environ.get("DATABASE_URL")

# This defines the data your frontend needs to send
class UserSignup(BaseModel):
    full_name: str
    email: str
    password: str
    user_role: str  # e.g., "Mother", "Father", "Teacher"

@app.get("/")
def test_connection():
    return {"status": "The friendly whale is connected to the database!"}

@app.post("/signup")
def create_user(user: UserSignup):
    # 1. Scramble the password so it's safe (Hashing)
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        # 2. Open connection to Neon
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()

        # 3. Insert the new user into your 'users' table
        insert_query = """
            INSERT INTO users (full_name, email, password_hash, user_role)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id;
        """
        cursor.execute(insert_query, (user.full_name, user.email, hashed_password, user.user_role))

        # 4. Get the new ID and save changes
        new_user_id = cursor.fetchone()[0]
        conn.commit()

        cursor.close()
        conn.close()

        return {"status": "Success", "message": f"Welcome {user.full_name}!", "user_id": new_user_id}

    except psycopg2.errors.UniqueViolation:
        # Catch the error if the email is already in the database
        return {"status": "Failed", "error": "An account with this email already exists."}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}