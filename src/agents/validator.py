from src.state import VabState

def validator_agent(state: VabState) -> VabState:
    """
    Agent responsible for validating the extracted VAB data.
    """
    data = state.get("extracted_data", {})
    errors = state.get("validation_errors", [])
    
    if not data:
        errors.append("No data was extracted.")
    else:
        required_fields = ["child_name", "start_date", "end_date", "total_hours_missed"]
        for field in required_fields:
            if field not in data or data[field] is None:
                errors.append(f"Missing required field: {field}")
                
        # Additional business logic validation
        if "total_hours_missed" in data and not isinstance(data["total_hours_missed"], (int, float)):
            try:
                data["total_hours_missed"] = float(data["total_hours_missed"])
            except ValueError:
                errors.append("total_hours_missed must be a number.")

    state["validation_errors"] = errors
    if errors:
        state["status"] = "validation_failed"
    else:
        state["status"] = "validated"

    return state
