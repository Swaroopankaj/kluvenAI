import json
from langchain_core.prompts import ChatPromptTemplate
from src.state import VabState
from src.utils.llm import get_llm

def extractor_agent(state: VabState) -> VabState:
    """
    Agent responsible for extracting VAB data from the document content.
    """
    llm = get_llm()
    document = state["document_content"]

    system_prompt = (
        "You are an expert Swedish administrative assistant specializing in VAB (Vård av barn). "
        "Your task is to analyze the provided document text and extract the following details into JSON:\n"
        "- child_name: The name of the sick child.\n"
        "- start_date: The start date of the absence (YYYY-MM-DD).\n"
        "- end_date: The end date of the absence (YYYY-MM-DD).\n"
        "- total_hours_missed: The total number of hours missed as a number.\n"
        "Respond ONLY with valid JSON."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", "Document content:\n{document}"),
    ])

    chain = prompt | llm
    response = chain.invoke({"document": document})
    
    try:
        # Extract JSON from the markdown block or direct response
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        extracted_data = json.loads(content)
        state["extracted_data"] = extracted_data
        state["status"] = "extracted"
    except Exception as e:
        state["validation_errors"].append(f"Failed to parse LLM response: {str(e)}")
        state["status"] = "error"

    return state
