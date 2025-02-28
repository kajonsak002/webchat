import os
from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles 
from typing import Optional
from aift import setting
from aift.nlp.longan import tokenizer
from aift.multimodal import textqa
from aift.nlp.translation import en2th
from aift.nlp.translation import th2en
from aift.image.detection import face_blur
from dotenv import load_dotenv
import tempfile
from aift.image import thaifood
import uuid
from pathlib import Path
from aift.nlp import tag
from aift.nlp import text_cleansing
from aift.image.detection import face_detection
# Add PIL for image compression
from PIL import Image
import io
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware  # Change this line
import requests
from aift.nlp.translation import zh2th
from aift.nlp.translation import th2zh

# Add new middleware class
class AddHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if request.url.path.startswith('/uploads/'):
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
        return response

# โหลดตัวแปรจาก .env
load_dotenv()

# ตั้งค่า API Key จาก .env
setting.set_api_key(os.getenv("AIFORTHAI_API_KEY"))

app = FastAPI()

# ตั้งค่า CORS ให้ชัดเจนขึ้น
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

# Add emoji list constant
MOJI_LIST = [
    ['🙂','😄','😁','😆','😀','😊','😃'],
    ['😢','😥','😰','😓','🙁','😟','😞','😔','😣','😫','😩'],
    ['😡','😠','😤','😖'],
    ['🙄','😒','😑','😕'],
    ['😱'],
    ['😨','😧','😦'],
    ['😮','😲','😯'],
    ['😴','😪'],
    ['😋','😜','😝','😛'],
    ['😍','💕','😘','😚','😙','😗'],
    ['😌'],
    ['😐'],
    ['😷'],
    ['😳'],
    ['😵'],
    ['💔'],
    ['😎','😈'],
    ['🙃','😏','😂','😭'],
    ['😬','😅','😶'],
    ['😉'],
    ['💖','💙','💚','💗','💓','💜','💘','💛'],
    ['😇']
]

@app.post("/tokenize")
async def tokenize_text(request: TextRequest):
    tokens = tokenizer.tokenize(request.text)
    return {"tokens": tokens}

@app.post("/textqa")
async def qa_text(request: TextRequest):
    response = textqa.generate(request.text)
    return {"answer": response["content"]}

@app.post("/en2th")
async def en2th_text(request: TextRequest):
    response = en2th.translate(request.text)
    return {"translate": response}

@app.post("/th2en")
async def th2en_text(request: TextRequest):
    response = th2en.translate(request.text)
    return {"translate": response}

@app.post("/zh2th")
async def zh2th_text(request: TextRequest):
    response = zh2th.translate(request.text)
    return {"translate": response}

@app.post("/th2zh")
async def th2zh_text(request: TextRequest):
    response = th2zh.translate(request.text)
    return {"translate": response}


@app.post("/tag")
async def tag_funtion(request: TextRequest):
    response = tag.analyze(request.text, numtag=5)
    return {"tags": response}

@app.post("/text_cleansing")
async def textCleanSing(request: TextRequest):
    response = text_cleansing.clean(request.text)
    return {"textClensing": response}


@app.post("/face_blur")
async def blur_face(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(await file.read())  
            temp_file_path = temp_file.name

        response = face_blur.analyze(temp_file_path)

        os.remove(temp_file_path)

        return {
            "json_data": response.get("json_data", []),
            "URL": response.get("URL", "")
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error processing image: {str(e)}"}
        )

@app.post("/face_detection")
async def detect_face(file: UploadFile = File(...)):
    try:
        # Create unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save original file
        with open(file_path, "wb") as f:
            f.write(await file.read())
            
        # Compress image
        compressed_path = compress_image(file_path)
        compressed_filename = os.path.basename(compressed_path)
        
        # Get face detection results
        response = face_detection.analyze(compressed_path, return_json=True)
        
        # Create URLs for both original and compressed images
        base_url = "http://localhost:8000"  # Adjust according to your server
        original_url = f"{base_url}/uploads/{unique_filename}"
        compressed_url = f"{base_url}/uploads/{compressed_filename}"

        return {
            "face_detection": response,
            "original_image_url": original_url,
            "compressed_image_url": compressed_url
        }
        
    except Exception as e:
        # Clean up files in case of error
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(compressed_path):
            os.remove(compressed_path)
            
        return JSONResponse(
            status_code=500,
            content={"message": f"Error processing image: {str(e)}"}
        )

# Add helper function for image compression
def compress_image(image_path, max_size=800):
    img = Image.open(image_path)
    
    # Calculate new dimensions while maintaining aspect ratio
    ratio = min(max_size/max(img.size[0], img.size[1]) for img in [img])
    new_size = tuple([int(x*ratio) for x in img.size])
    
    # Resize and compress
    img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Save compressed image
    compressed_path = image_path.replace('.', '_compressed.')
    img.save(compressed_path, 'JPEG', quality=85, optimize=True)
    
    return compressed_path

# กำหนดโฟลเดอร์สำหรับเก็บรูปภาพ
UPLOAD_DIR = "uploads"
Path(UPLOAD_DIR).mkdir(exist_ok=True)  # สร้างโฟลเดอร์ถ้ายังไม่มี
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Add the headers middleware
app.add_middleware(AddHeadersMiddleware)

@app.post("/thai_food")
async def thai_food(file: UploadFile = File(...)):
    try:
        # สร้างชื่อไฟล์ที่ไม่ซ้ำกันโดยใช้ UUID
        file_extension = file.filename.split(".")[-1]  # ดึงนามสกุลไฟล์
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # บันทึกไฟล์ลงในโฟลเดอร์
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # วิเคราะห์รูปภาพด้วย thaifood.analyze
        response = thaifood.analyze(file_path)

        # สร้าง URL สำหรับเข้าถึงรูปภาพ (สมมติว่าใช้ static files)
        base_url = "http://localhost:8000"  # ปรับตาม URL จริงของ server
        image_url = f"{base_url}/{UPLOAD_DIR}/{unique_filename}"

        # ส่งผลลัพธ์พร้อม URL ของรูปภาพกลับไป
        return {
            "thaifood": response,
            "image_url": image_url
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error processing image: {str(e)}"}
        )

@app.post("/emoji")
async def predict_emoji(request: TextRequest):
    try:
        url = "https://api.aiforthai.in.th/emoji"
        params = {'text': request.text}
        headers = {
            'Apikey': os.getenv("AIFORTHAI_API_KEY")
        }
        
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        keys = response.json().keys()
        emojis = [MOJI_LIST[int(k)][0] for k in keys]
        
        return {
            "emojis": emojis
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error predicting emoji: {str(e)}"}
        )

# เพิ่มเส้นทางทดสอบ
@app.get("/")
async def read_root():
    return {"message": "API is running"}