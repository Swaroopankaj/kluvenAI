import sys
import json
from src.graph import build_graph
from src.state import VabState

def run_vab_workflow(document_text: str) -> dict:
    """
    Executes the VAB LangGraph workflow on the given document text.
    """
    app = build_graph()
    
    # Initialize state
    initial_state: VabState = {
        "messages": [],
        "document_content": document_text,
        "extracted_data": {},
        "validation_errors": [],
        "status": "started"
    }

    # Run the graph
    print("Starting VAB extraction workflow...")
    final_state = app.invoke(initial_state)
    
    if final_state["status"] == "validated":
        print("\n✅ Validation Successful!")
    else:
        print("\n❌ Validation Failed.")
        for err in final_state["validation_errors"]:
            print(f" - {err}")
            
    print("\nExtracted Data:")
    print(json.dumps(final_state["extracted_data"], indent=2))
    
    return final_state

if __name__ == "__main__":
    sample_text = (
        "Förskolefrånvaro - Intyg\n"
        "Barnets namn: Astrid Lindgren\n"
        "Frånvaroperiod: 2026-06-15 till 2026-06-17\n"
        "Antal timmar VAB: 24 timmar"
    )
    
    # If a file path is passed as an argument
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                sample_text = f.read()
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            sys.exit(1)
            
    run_vab_workflow(sample_text)
