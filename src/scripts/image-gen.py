import torch
from diffusers import BitsAndBytesConfig, StableDiffusion3Pipeline

model_path = "/models/<model>"

# 4-Bit-Quantisierung (FP4)
nf4_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="fp4",
    bnb_4bit_compute_dtype=torch.float16
)

pipeline = StableDiffusion3Pipeline.from_pretrained(
    model_path,
    torch_dtype=torch.bfloat16,
    quantization_config=nf4_config,
    # load_in_4bit=True,
    # bnb_4bit_quant_type="fp4",
    # bnb_4bit_compute_dtype=torch.float16
)

pipeline.enable_attention_slicing()
pipeline.enable_sequential_cpu_offload()

while True:
    prompt = input("Prompt: \n")
    imageName = prompt.lower().replace(" ", "_") + ".png"
    print(imageName)

    image = pipeline(
        prompt=prompt,
        num_inference_steps=28,
        guidance_scale=4.5,
        width=512,
        height=512,
        max_sequence_length=256,
    ).images[0]

    image.save(imageName)
