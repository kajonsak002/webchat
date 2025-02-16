from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from aift import setting
from aift.nlp.longan import tokenizer
from aift.multimodal import textqa

# ตั้งค่า API Key
setting.set_api_key("kPYzRjW3YC4ikMEGdatw7zWNDU1RDe3R")

app = FastAPI()

# ✅ เปิดให้ React (localhost:3000) สามารถเรียก API ได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # อนุญาตทุกโดเมน ถ้าใช้จริงให้กำหนดเฉพาะโดเมนของแอป
    allow_credentials=True,
    allow_methods=["*"],  # อนุญาตทุก Method เช่น GET, POST, OPTIONS
    allow_headers=["*"],  # อนุญาตทุก Header
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
    return {"answer": response["content"]}  # ส่งเฉพาะข้อความ
