"""
LoRA Fine-Tuning Pipeline (Teammate 2 Task: Deliverable 3 - PEFT / LoRA Fine-Tuning).

TODO for Teammate 2:
1. Load training data from data/sft/nlp_sft_train.jsonl (240 pairs) and val from data/sft/nlp_sft_val.jsonl (60 pairs).
2. Configure Hugging Face / PEFT:
   - Base model: Qwen/Qwen2.5-Coder-7B-Instruct (or local equivalent)
   - Target modules: ["q_proj", "k_proj", "v_proj", "o_proj"]
   - LoRA config: r=16, alpha=32, lora_dropout=0.05
3. Train with SFTTrainer (TRL) for 3-5 epochs.
4. Save adapter to models/adapters/nlp_tutor_lora/adapter_model.safetensors.
5. Evaluate on validation split and run benchmark.

Refer to: docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md
"""


def main():
    """
    TODO (Teammate 2): Implement PEFT / SFTTrainer training loop.
    """
    print("[Teammate 2 Task] Implement LoRA training pipeline in src/models/train_lora.py")
    print("  Training Data: data/sft/nlp_sft_train.jsonl (240 curriculum pairs)")
    print("  Validation Data: data/sft/nlp_sft_val.jsonl (60 held-out pairs)")


if __name__ == "__main__":
    main()
