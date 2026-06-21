import operator
from typing import TypedDict, Annotated, List, Dict, Any

class VabState(TypedDict):
    """
    State definition for the VAB extraction workflow.
    """
    messages: Annotated[List[dict], operator.add]
    document_content: str
    extracted_data: Dict[str, Any]
    validation_errors: List[str]
    status: str
