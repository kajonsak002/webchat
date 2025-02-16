import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from aift import setting
from aift.nlp.longan import tokenizer
from aift.multimodal import textqa
from dotenv import load_dotenv

# โหลดตัวแปรจาก .env
load_dotenv()

# ตั้งค่า API Key จาก .env
setting.set_api_key(os.getenv("AIFORTHAI_API_KEY"))

app = FastAPI()

# อนุญาตให้ React เรียก API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

@app.post("/tokenize")
async def tokenize_text(request: TextRequest):
    tokens = tokenizer.tokenize(request.text)
    return {"tokens": tokens}


@app.post("/textqa")
async def qa_text(request: TextRequest):
    response = textqa.generate(request.text)
    return {"answer": response["content"]}
