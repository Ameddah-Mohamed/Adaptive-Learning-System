"""
Code Execution Sandbox & Coding Lab API Endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import ollama

from src.evaluator.sandbox_runner import CodeSandboxRunner, TASKS
from src.evaluator.coding_tasks.task_01_bpe import STARTER_CODE as BPE_STARTER
from src.evaluator.coding_tasks.task_02_attention import STARTER_CODE as ATTN_STARTER
from src.evaluator.coding_tasks.task_03_perplexity import STARTER_CODE as PERP_STARTER
from src.models.prompts import CODE_DEBUGGER_SYSTEM_PROMPT
from backend.app.core.config import settings

router = APIRouter(prefix="/sandbox", tags=["Sandbox"])

runner = CodeSandboxRunner(timeout_seconds=6.0)

TASK_METADATA = {
    "task_01_bpe": {
        "id": "task_01_bpe",
        "title": "Assignment 1: Byte-Pair Encoding (BPE) Tokenizer",
        "chapter": "Chapter 02: Tokenization & Normalization",
        "difficulty": "Intermediate",
        "starter_code": BPE_STARTER,
        "description": "Implement the core iterative merge routine and tokenizer for Byte-Pair Encoding (BPE). Learn pair frequencies from subword strings and apply merges to unseen words."
    },
    "task_02_attention": {
        "id": "task_02_attention",
        "title": "Assignment 2: Scaled Dot-Product Attention (PyTorch)",
        "chapter": "Chapter 09: The Transformer",
        "difficulty": "Advanced",
        "starter_code": ATTN_STARTER,
        "description": "Implement Scaled Dot-Product Attention in PyTorch: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V. Handle proper tensor transposition, optional causal masking, and value projection."
    },
    "task_03_perplexity": {
        "id": "task_03_perplexity",
        "title": "Assignment 3: Language Model Perplexity Calculator",
        "chapter": "Chapter 03: Language Modeling",
        "difficulty": "Beginner",
        "starter_code": PERP_STARTER,
        "description": "Implement the mathematical calculation of Perplexity given sequence token log-probabilities: PP = exp(- (1/N) * sum ln P). Test against known distributions."
    }
}


class RunCodeRequest(BaseModel):
    task_id: str
    code: str
    request_ai_diagnosis: bool = True
    model: Optional[str] = None


@router.get("/tasks")
async def list_tasks():
    return list(TASK_METADATA.values())


@router.get("/tasks/{task_id}")
async def get_task(task_id: str):
    task = TASK_METADATA.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/run")
async def run_code(req: RunCodeRequest):
    try:
        run_res = runner.run_submission(req.task_id, req.code)
        
        # If code failed and AI diagnosis is requested, call local coder model
        ai_diagnosis = None
        if run_res.get("has_error") and req.request_ai_diagnosis:
            model_name = req.model or settings.CODER_LLM or settings.DEFAULT_LLM
            task_info = TASK_METADATA.get(req.task_id, {})
            diag_prompt = f"""### Assignment:
{task_info.get('title')} ({task_info.get('chapter')})

### Student Code Submission:
```python
{req.code}
```

### Unit Test Execution Log / Traceback:
```
{run_res.get('output')}
```

### Instructions:
1. Explain concisely why the test failed or where the runtime bug is (e.g. tensor shapes, masking order, off-by-one).
2. Provide a concrete hint or the fixed snippet.
3. Be constructive and pedagogically sound.
"""
            try:
                ai_resp = ollama.chat(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": CODE_DEBUGGER_SYSTEM_PROMPT},
                        {"role": "user", "content": diag_prompt}
                    ],
                    options={"temperature": 0.2}
                )
                ai_diagnosis = ai_resp.get("message", {}).get("content", "")
            except Exception as ex:
                ai_diagnosis = f"Could not generate AI diagnostic hint: {str(ex)}"
                
        return {
            "execution": run_res,
            "ai_diagnosis": ai_diagnosis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
