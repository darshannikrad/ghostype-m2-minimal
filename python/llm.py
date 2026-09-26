#!/usr/bin/env python3
import base64, io, os, sys
from PIL import Image
import mss


def text_model(prompt):
    from mistralai import Mistral
    key = os.getenv('MISTRAL_API_KEY')
    if not key: raise RuntimeError('MISTRAL_API_KEY is not set')
    client = Mistral(api_key=key)
    response = client.chat.complete(model=os.getenv('MISTRAL_MODEL', 'mistral-small-latest'), messages=[{'role':'user','content':prompt}])
    return response.choices[0].message.content


def screen_model(prompt):
    from google import genai
    from google.genai import types
    key = os.getenv('GOOGLE_API_KEY')
    if not key: raise RuntimeError('GOOGLE_API_KEY is not set')
    with mss.mss() as sct:
        monitor = sct.monitors[1]
        shot = sct.grab(monitor)
        image = Image.frombytes('RGB', shot.size, shot.rgb)
    buf = io.BytesIO(); image.save(buf, format='PNG')
    client = genai.Client(api_key=key)
    response = client.models.generate_content(model=os.getenv('GOOGLE_VISION_MODEL', 'gemini-2.0-flash'), contents=[types.Part.from_bytes(data=buf.getvalue(), mime_type='image/png'), prompt])
    return response.text

if len(sys.argv) < 3: raise SystemExit('usage: llm.py text|screen prompt')
print(text_model(sys.argv[2]) if sys.argv[1] == 'text' else screen_model(sys.argv[2]))
