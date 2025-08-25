import torch
from diffusers import StableDiffusion3Pipeline

model_path = "models/<model>"

# ROCm 6.4 Konfiguration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.backends.cudnn.benchmark = True

# Pipeline mit optimierten Einstellungen für ROCm
pipeline = StableDiffusion3Pipeline.from_pretrained(
    model_path,
    torch_dtype=torch.float16,  # float16 statt bfloat16 für bessere ROCm-Kompatibilität
    variant="fp16",
    use_safetensors=True
)

# Optimierungen für Speichernutzung
pipeline.to(device)
pipeline.enable_attention_slicing(slice_size="auto")
pipeline.enable_model_cpu_offload()  # Verbesserte Version von sequential_cpu_offload

while True:
    prompt = input("Prompt: \n")
    imageName = prompt.lower().replace(" ", "_") + ".png"
    print(f"Erstelle Bild: {imageName}")

    with torch.inference_mode():  # Effizienter als torch.no_grad()
        image = pipeline(
            prompt=prompt,
            num_inference_steps=28,
            guidance_scale=4.5,
            width=512,
            height=512,
            max_sequence_length=256,
        ).images[0]

    image.save(imageName)