from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import io
import base64
import os
import time

app = Flask(__name__)
CORS(app)

# Global model değişkenleri
model = None
processor = None

def load_model():
    """Modeli yükle - ilk istek geldiğinde çalışır"""
    global model, processor
    try:
        print("🔄 Model yükleniyor...")
        model = AutoImageProcessor.from_pretrained("haywoodsloan/ai-image-detector-deploy")
        processor = AutoImageProcessor.from_pretrained("haywoodsloan/ai-image-detector-deploy")
        print("✅ Model başarıyla yüklendi!")
        return True
    except Exception as e:
        print(f"❌ Model yükleme hatası: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Sağlık kontrolü endpoint'i"""
    return jsonify({
        "status": "healthy",
        "model": "haywoodsloan/ai-image-detector-deploy",
        "model_loaded": model is not None,
        "timestamp": time.time()
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    """Model bilgilerini döndür"""
    return jsonify({
        "model_name": "haywoodsloan/ai-image-detector-deploy",
        "model_type": "SwinV2 (Swin Transformer V2)",
        "author": "haywoodsloan",
        "size": "781 MB",
        "description": "AI vs Real image classification model",
        "url": "https://huggingface.co/haywoodsloan/ai-image-detector-deploy"
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """Görsel analizi endpoint'i"""
    global model, processor
    
    try:
        # Model yüklü değilse yükle
        if model is None or processor is None:
            if not load_model():
                return jsonify({"error": "Model yüklenemedi"}), 500
        
        # Request kontrolü
        if 'image' not in request.json:
            return jsonify({"error": "Görsel bulunamadı"}), 400
        
        # Base64 görseli decode et
        image_data = request.json['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Görseli işle
        inputs = processor(image, return_tensors="pt")
        
        # Tahmin yap
        with torch.no_grad():
            outputs = model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        # Sonuçları parse et
        real_prob = probabilities[0][1].item() * 100
        fake_prob = probabilities[0][0].item() * 100
        
        # Tahmin belirle
        prediction = "Gerçek" if real_prob > fake_prob else "Sahte"
        confidence = max(real_prob, fake_prob)
        
        # Sonucu döndür
        result = {
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "probabilities": {
                "real": round(real_prob, 2),
                "fake": round(fake_prob, 2)
            },
            "model_used": "haywoodsloan/ai-image-detector-deploy",
            "model_info": "SwinV2-based AI vs Real detection"
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Analiz hatası: {e}")
        return jsonify({"error": f"Analiz sırasında hata: {str(e)}"}), 500

@app.route('/', methods=['GET'])
def home():
    """Ana sayfa"""
    return jsonify({
        "message": "FakeDetector API Server",
        "model": "haywoodsloan/ai-image-detector-deploy",
        "endpoints": {
            "health": "/health",
            "model_info": "/model-info", 
            "analyze": "/analyze"
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 