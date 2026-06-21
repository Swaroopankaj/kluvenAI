from langgraph.graph import StateGraph, END
from src.state import VabState
from src.agents.extractor import extractor_agent
from src.agents.validator import validator_agent

def route_validation(state: VabState) -> str:
    """
    Determine the next node based on validation status.
    """
    if state["status"] == "validated":
        return END
    return END # For simplicity, end if validation fails. In a real system, we might route to a human-in-the-loop or retry.

def build_graph() -> StateGraph:
    """
    Builds and compiles the VAB extraction LangGraph.
    """
    workflow = StateGraph(VabState)

    # Add nodes
    workflow.add_node("extractor", extractor_agent)
    workflow.add_node("validator", validator_agent)

    # Define edges
    workflow.set_entry_point("extractor")
    workflow.add_edge("extractor", "validator")
    
    # Add conditional edges
    workflow.add_conditional_edges(
        "validator",
        route_validation,
    )

    return workflow.compile()
