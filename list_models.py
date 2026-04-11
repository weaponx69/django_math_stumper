import os
import google.generativeai as genai

genai.configure(api_key="AIzaSyDqXJaoNV5noT7TqO2n6PRTrc4AO7KCnM0")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
