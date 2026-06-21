from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path
import json, os, io, csv, warnings
from datetime import datetime

load_dotenv()

app = FastAPI(title="kluvenAI")

cors_origin = os.getenv("CORS_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origin.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
if not api_key:
    warnings.warn("No API key set — AI features will be mocked")
    client = None
    DEFAULT_MODEL = ""
else:
    client = OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "kluvenAI",
        },
    )
    DEFAULT_MODEL = "nex-agi/nex-n2-pro:free"

CONFIGS_DIR = Path(__file__).parent / "configs"
CONFIGS_DIR.mkdir(exist_ok=True)

DEFAULT_CONFIGS = {
    "sambosplit": {
        "name": "SamboSplit",
        "description": "Split household bills 50/50",
        "ai_task_description": "Read the Swedish invoice or receipt. Identify the vendor, total amount in SEK, due date, and calculate exactly 50% of the total. Output clean JSON.",
        "fields_to_extract": ["vendor", "total_amount_sek", "split_amount_sek", "due_date"],
        "action_type": "swish_link",
    },
    "commuter": {
        "name": "SL Commuter",
        "description": "Extract transit receipts for work reimbursement",
        "ai_task_description": "Read the SL/Västtrafik/Skånetrafiken receipt or screenshot. Extract the purchase date, ticket type, amount in SEK, and travel date. Output clean JSON.",
        "fields_to_extract": ["purchase_date", "ticket_type", "amount_sek", "travel_date"],
        "action_type": "expense_csv",
    },
}

def load_configs():
    configs = {}
    for f in CONFIGS_DIR.glob("*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            cfg = data.get("config", data)
            config_id = cfg.get("id") or f.stem
            configs[config_id] = {
                "name": cfg.get("title", cfg.get("name", f.stem)),
                "description": cfg.get("description", ""),
                "ai_task_description": cfg.get("ai", {}).get("task_description", ""),
                "fields_to_extract": [field["key"] for field in cfg.get("fields", [])],
                "action_type": cfg.get("exports", [{}])[0].get("type", "csv_download") if cfg.get("exports") else "csv_download",
                "raw_config": data,
            }
        except Exception as e:
            warnings.warn(f"Failed to load config {f.name}: {e}")
    return configs

AVAILABLE_CONFIGS = load_configs()
AVAILABLE_CONFIGS.update(DEFAULT_CONFIGS)

@app.get("/api/configs")
def list_configs():
    return {"configs": {k: {"name": v["name"], "description": v["description"]} for k, v in AVAILABLE_CONFIGS.items()}}

@app.get("/api/config/{config_id}")
def get_config(config_id: str):
    if config_id not in AVAILABLE_CONFIGS:
        return {"error": "Config not found"}, 404
    cfg = AVAILABLE_CONFIGS[config_id]
    if "raw_config" in cfg:
        return cfg["raw_config"]
    return cfg

@app.get("/api/config/{config_id}/schema")
def get_config_schema(config_id: str):
    if config_id not in AVAILABLE_CONFIGS:
        return {"error": "Config not found"}, 404
    cfg = AVAILABLE_CONFIGS[config_id]
    raw = cfg.get("raw_config")
    if raw:
        return {
            "fields": raw.get("fields", []),
            "exports": raw.get("exports", []),
            "post_processing": raw.get("post_processing", {}),
        }
    return {"fields": [{"key": f} for f in cfg["fields_to_extract"]], "exports": [], "post_processing": {}}

@app.post("/api/process")
async def process_document(file: UploadFile = File(...), config_id: str = Form("sambosplit")):
    if config_id not in AVAILABLE_CONFIGS:
        return {"error": "Config not found"}, 404

    config = AVAILABLE_CONFIGS[config_id]
    file_bytes = await file.read()

    ext = (file.filename or "").lower()
    content = [{"type": "text", "text": "Analyze this document and output the required JSON."}]

    if ext.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
        import base64
        b64 = base64.b64encode(file_bytes).decode()
        mime = f"image/{ext.lstrip('.')}"
        content.append({"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}})
    else:
        content.append({"type": "text", "text": file_bytes.decode("utf-8", errors="ignore")})

    if client:
        system_prompt = (
            f"You are a Swedish administrative assistant. "
            f"Task: {config['ai_task_description']} "
            f"Respond ONLY with a JSON object containing these exact keys: {', '.join(config['fields_to_extract'])}"
        )
        try:
            response = client.chat.completions.create(
                model=DEFAULT_MODEL,
                # removing response_format temporarily to see if that's the cause, or wrap it
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": content},
                ],
            )
            raw_content = response.choices[0].message.content
            # strip markdown json blocks if present
            if raw_content.startswith("```json"):
                raw_content = raw_content[7:-3]
            elif raw_content.startswith("```"):
                raw_content = raw_content[3:-3]
            extracted = json.loads(raw_content)
        except Exception as e:
            return {"status": "error", "error": f"LLM Error: {str(e)}"}

    else:
        extracted = {field: f"[mock_{field}]" for field in config["fields_to_extract"]}

    result = {"status": "success", "config_id": config_id, "data": extracted, "action_type": config["action_type"]}

    raw = config.get("raw_config")
    if raw:
        result["exports"] = raw.get("exports", [])
        result["post_processing"] = raw.get("post_processing", {})

    return result

@app.post("/api/llm-agent")
async def llm_agent(body: dict):
    prompt = body.get("prompt", "")
    config_id = body.get("config_id", "vablogger")
    if not prompt.strip():
        return {"error": "Prompt is required"}, 400

    if client:
        system_prompt = (
            f"You are a knowledgeable Swedish administrative assistant. "
            f"Answer questions about VAB (Vård av barn), SamboSplit, Swedish HR portals, "
            f"Försäkringskassan, and other Swedish admin topics. "
            f"Provide clear, concise answers in the user's language."
        )
        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        reply = response.choices[0].message.content
    else:
        reply = f"[Mock LLM response] You asked about: {prompt[:100]}...\n\nThis is a simulated response. Set OPENROUTER_API_KEY in .env to enable real AI responses."

    return {"status": "success", "config_id": config_id, "response": reply}

@app.post("/api/export-csv")
async def export_csv(data: str = Form(...), config_id: str = Form(...)):
    records = json.loads(data)
    if not isinstance(records, list):
        records = [records]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=records[0].keys())
    writer.writeheader()
    writer.writerows(records)

    csv_content = output.getvalue()
    output.close()
    return {"csv": csv_content, "filename": f"kluven_{config_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
