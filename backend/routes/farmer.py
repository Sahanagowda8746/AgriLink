from flask import Blueprint, request, jsonify, current_app
from models import db, Crop, Order
from routes.auth import get_current_user
import os
from werkzeug.utils import secure_filename
import uuid

farmer_bp = Blueprint('farmer', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def require_farmer(f):
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        if user.role != 'farmer':
            return jsonify({'error': 'Farmer access required'}), 403
        return f(user, *args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper


@farmer_bp.route('/crops', methods=['POST'])
def add_crop():
    user = get_current_user()
    if not user or user.role != 'farmer':
        return jsonify({'error': 'Unauthorized'}), 401

    name = request.form.get('name', '').strip()
    category = request.form.get('category', 'General').strip()
    price = request.form.get('price', 0)
    quantity = request.form.get('quantity', 0)
    unit = request.form.get('unit', 'kg').strip()
    location = request.form.get('location', '').strip()
    description = request.form.get('description', '').strip()

    if not name or not location:
        return jsonify({'error': 'Crop name and location are required'}), 400

    image_path = ''
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, filename))
            image_path = f'/uploads/{filename}'

    crop = Crop(
        farmer_id=user.id,
        name=name,
        category=category,
        price=float(price),
        quantity=float(quantity),
        unit=unit,
        location=location,
        description=description,
        image_path=image_path
    )
    db.session.add(crop)
    db.session.commit()
    return jsonify({'message': 'Crop added successfully', 'crop': crop.to_dict()}), 201


@farmer_bp.route('/crops', methods=['GET'])
def get_farmer_crops():
    user = get_current_user()
    if not user or user.role != 'farmer':
        return jsonify({'error': 'Unauthorized'}), 401

    crops = Crop.query.filter_by(farmer_id=user.id).order_by(Crop.created_at.desc()).all()
    return jsonify({'crops': [c.to_dict() for c in crops]}), 200


@farmer_bp.route('/crops/<int:crop_id>', methods=['DELETE'])
def delete_crop(crop_id):
    user = get_current_user()
    if not user or user.role != 'farmer':
        return jsonify({'error': 'Unauthorized'}), 401

    crop = Crop.query.filter_by(id=crop_id, farmer_id=user.id).first()
    if not crop:
        return jsonify({'error': 'Crop not found'}), 404

    db.session.delete(crop)
    db.session.commit()
    return jsonify({'message': 'Crop deleted'}), 200


@farmer_bp.route('/orders', methods=['GET'])
def get_farmer_orders():
    user = get_current_user()
    if not user or user.role != 'farmer':
        return jsonify({'error': 'Unauthorized'}), 401

    # Get orders for all crops owned by this farmer
    farmer_crop_ids = [c.id for c in user.crops]
    orders = Order.query.filter(Order.crop_id.in_(farmer_crop_ids)).order_by(Order.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict() for o in orders]}), 200


@farmer_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    user = get_current_user()
    if not user or user.role != 'farmer':
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    new_status = data.get('status', '')

    valid_statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered']
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400

    order = Order.query.get(order_id)
    if not order or order.crop.farmer_id != user.id:
        return jsonify({'error': 'Order not found'}), 404

    order.status = new_status
    db.session.commit()
    return jsonify({'message': 'Status updated', 'order': order.to_dict()}), 200


@farmer_bp.route('/stats', methods=['GET'])
def farmer_stats():
    user = get_current_user()
    if not user or user.role != 'farmer':
        return jsonify({'error': 'Unauthorized'}), 401

    total_crops = Crop.query.filter_by(farmer_id=user.id).count()
    farmer_crop_ids = [c.id for c in user.crops]
    total_orders = Order.query.filter(Order.crop_id.in_(farmer_crop_ids)).count()
    total_revenue = sum(
        o.total_price for o in Order.query.filter(
            Order.crop_id.in_(farmer_crop_ids),
            Order.payment_status == 'Paid'
        ).all()
    )

    return jsonify({
        'total_crops': total_crops,
        'total_orders': total_orders,
        'total_revenue': round(total_revenue, 2)
    }), 200
