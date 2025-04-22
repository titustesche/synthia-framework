import torch
from diffusers import StableDiffusion3Pipeline

model_path = "/home/titus/KI-Modelle/stable-diffusion-3.5-large"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch_dtype = torch.float16  # ROCm prefers float16

# Load pipeline
pipeline = StableDiffusion3Pipeline.from_pretrained(
    model_path,
    torch_dtype=torch_dtype,
)

# Enable memory-efficient attention
pipeline.enable_attention_slicing()

pipeline.to(device)

while True:
    prompt = input("Prompt: \n")
    image_name = prompt.lower().replace(" ", "_") + ".png"
    print(image_name)

    image = pipeline(
        prompt=prompt,
        num_inference_steps=28,
        guidance_scale=4.0,
        width=1024,
        height=1024
    ).images[0]

    image.save(image_name)
