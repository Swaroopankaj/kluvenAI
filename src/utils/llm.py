import os
from langchain_openai import ChatOpenAI

def get_llm(model_name: str = "gpt-4o"):
    """
    Initialize and return the LLM for agent processing.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    return ChatOpenAI(
        model=model_name,
        api_key=api_key,
        temperature=0.0
    )
