import os
from dotenv import load_dotenv

load_dotenv()

print("Environment variables loaded successfully.")
print(f"Example variable (if exists): {os.getenv('EXAMPLE_VAR')}")