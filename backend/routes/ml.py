from flask import Blueprint, request, jsonify, current_app
from ml.disease_model import analyze_image
from ml.demand_model import get_demand_forecast, get_all_categories_summary
import os

ml_bp = Blueprint('ml', __name__)


@ml_bp.route('/disease', methods=['POST'])
def disease_detection():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Read image bytes
    image_bytes = file.read()
    if len(image_bytes) == 0:
        return jsonify({'error': 'Empty file'}), 400

    result = analyze_image(image_bytes)
    return jsonify({'result': result}), 200


@ml_bp.route('/demand', methods=['GET'])
def demand_forecast():
    category = request.args.get('category', 'General')
    result = get_demand_forecast(category)
    return jsonify({'forecast': result}), 200


@ml_bp.route('/demand/all', methods=['GET'])
def all_demand():
    summary = get_all_categories_summary()
    return jsonify({'categories': summary}), 200
