from flask import Blueprint, request, jsonify
from ml.chatbot_engine import get_response

chatbot_bp = Blueprint('chatbot', __name__)


@chatbot_bp.route('', methods=['POST'])
def chatbot():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    message = data.get('message', '').strip()
    language = data.get('language', 'en').strip()

    if not message:
        return jsonify({'error': 'Message is required'}), 400

    reply = get_response(message, language)
    return jsonify({
        'reply': reply,
        'language': language
    }), 200
