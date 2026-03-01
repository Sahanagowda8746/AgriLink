"""
Disease Detection using image analysis.
Simulates a CNN-based classifier with color and texture heuristics.
In a production system, replace with a trained TensorFlow/PyTorch model.
"""
from PIL import Image, ImageStat
import io
import random


DISEASES = [
    {
        'name': 'Healthy',
        'description': 'Your crop appears healthy. Continue regular care and monitoring.',
        'treatment': 'No treatment needed. Maintain proper irrigation and fertilization.',
        'severity': 'None',
        'confidence': None  # Will be set dynamically
    },
    {
        'name': 'Leaf Blight',
        'description': 'Leaf blight is a fungal disease causing brown spots and wilting.',
        'treatment': 'Apply copper-based fungicide. Remove and destroy infected leaves. Improve air circulation.',
        'severity': 'Moderate',
        'confidence': None
    },
    {
        'name': 'Powdery Mildew',
        'description': 'Powdery mildew causes white powdery coating on leaves.',
        'treatment': 'Apply sulfur-based fungicide or neem oil spray. Reduce humidity. Prune overcrowded areas.',
        'severity': 'Mild',
        'confidence': None
    },
    {
        'name': 'Leaf Rust',
        'description': 'Rust fungus causes orange-brown pustules on leaf surfaces.',
        'treatment': 'Apply triazole fungicide. Rotate crops. Use resistant varieties next season.',
        'severity': 'Severe',
        'confidence': None
    },
    {
        'name': 'Bacterial Spot',
        'description': 'Bacterial infection causing dark water-soaked spots with yellow halos.',
        'treatment': 'Apply copper bactericide. Avoid overhead irrigation. Remove infected plant material.',
        'severity': 'Moderate',
        'confidence': None
    }
]


def analyze_image(image_bytes):
    """
    Analyze crop image and return disease prediction.
    Uses color statistics as a proxy for disease indicators.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))

        stat = ImageStat.Stat(img)
        r_mean, g_mean, b_mean = stat.mean
        r_std, g_std, b_std = stat.stddev

        # Heuristic scoring:
        # High green → healthy
        # Low green, high brown/yellow → blight or rust
        # High brightness variance → powdery mildew likelihood
        # Dark spots pattern → bacterial spot

        green_dominance = g_mean - max(r_mean, b_mean)
        brightness = (r_mean + g_mean + b_mean) / 3
        color_variance = (r_std + g_std + b_std) / 3

        if green_dominance > 15 and brightness > 80:
            disease_idx = 0  # Healthy
            confidence = min(95, 75 + green_dominance * 0.5)
        elif r_mean > g_mean + 20 and b_mean < 100:
            disease_idx = 3  # Leaf Rust (red-orange dominant)
            confidence = min(92, 65 + (r_mean - g_mean) * 0.4)
        elif color_variance > 40 and brightness > 130:
            disease_idx = 2  # Powdery Mildew (high brightness, varied)
            confidence = min(90, 60 + color_variance * 0.5)
        elif brightness < 80 and g_mean < 90:
            disease_idx = 4  # Bacterial Spot (dark image)
            confidence = min(88, 55 + (80 - brightness) * 0.6)
        else:
            disease_idx = 1  # Leaf Blight (default non-healthy)
            confidence = min(85, 50 + abs(green_dominance) * 0.3 + 20)

        result = DISEASES[disease_idx].copy()
        result['confidence'] = round(confidence, 1)

        # Add alternative possibilities
        others = [i for i in range(len(DISEASES)) if i != disease_idx]
        random.shuffle(others)
        remaining = round(100 - confidence, 1)
        alternatives = []
        for idx in others[:3]:
            share = round(remaining / 3, 1)
            alternatives.append({
                'name': DISEASES[idx]['name'],
                'probability': share
            })
        result['alternatives'] = alternatives

        return result

    except Exception as e:
        # Fallback if image processing fails
        return {
            'name': 'Analysis Error',
            'description': f'Could not process the image: {str(e)}',
            'treatment': 'Please upload a clear image of the crop leaf or plant.',
            'severity': 'Unknown',
            'confidence': 0,
            'alternatives': []
        }
