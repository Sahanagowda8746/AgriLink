from flask import Blueprint, request, jsonify
from models import db, User
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'agrilink-jwt-secret-2024')


def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_current_user():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return None
    return User.query.get(payload['user_id'])


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', '').lower()

    if not name or not email or not password or role not in ('farmer', 'buyer'):
        return jsonify({'error': 'All fields are required and role must be farmer or buyer'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, user.role)
    return jsonify({'token': token, 'user': user.to_dict()}), 201


@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_token(user.id, user.role)
    return jsonify({'token': token, 'user': user.to_dict()}), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    # JWT is stateless; client discards token
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
def me():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify({'user': user.to_dict()}), 200
