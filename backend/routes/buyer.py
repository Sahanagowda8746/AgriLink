from flask import Blueprint, request, jsonify
from models import db, Crop, Order, Transport
from routes.auth import get_current_user

buyer_bp = Blueprint('buyer', __name__)


@buyer_bp.route('/marketplace', methods=['GET'])
def marketplace():
    search = request.args.get('search', '').strip().lower()
    location = request.args.get('location', '').strip().lower()
    category = request.args.get('category', '').strip().lower()

    query = Crop.query

    if search:
        query = query.filter(Crop.name.ilike(f'%{search}%'))
    if location:
        query = query.filter(Crop.location.ilike(f'%{location}%'))
    if category:
        query = query.filter(Crop.category.ilike(f'%{category}%'))

    crops = query.filter(Crop.quantity > 0).order_by(Crop.created_at.desc()).all()
    return jsonify({'crops': [c.to_dict() for c in crops]}), 200


@buyer_bp.route('/crops/<int:crop_id>', methods=['GET'])
def get_crop_detail(crop_id):
    crop = Crop.query.get(crop_id)
    if not crop:
        return jsonify({'error': 'Crop not found'}), 404
    return jsonify({'crop': crop.to_dict()}), 200


@buyer_bp.route('/purchase', methods=['POST'])
def purchase():
    user = get_current_user()
    if not user or user.role != 'buyer':
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    crop_id = data.get('crop_id')
    quantity = float(data.get('quantity', 1))
    transport_needed = bool(data.get('transport_needed', False))
    delivery_address = data.get('delivery_address', '').strip()

    crop = Crop.query.get(crop_id)
    if not crop:
        return jsonify({'error': 'Crop not found'}), 404
    if crop.quantity < quantity:
        return jsonify({'error': 'Insufficient quantity available'}), 400

    total_price = round(crop.price * quantity, 2)

    order = Order(
        crop_id=crop_id,
        buyer_id=user.id,
        quantity=quantity,
        total_price=total_price,
        transport_needed=transport_needed,
        delivery_address=delivery_address,
        status='Pending',
        payment_status='Unpaid'
    )
    db.session.add(order)

    # Reduce available quantity
    crop.quantity -= quantity
    db.session.commit()

    # If transport needed, create transport record
    if transport_needed and delivery_address:
        transport = Transport(
            order_id=order.id,
            delivery_address=delivery_address,
            vehicle_type='Truck',
            driver_name='Ravi Kumar',
            driver_phone='+91-9876543210',
            status='Scheduled',
            estimated_delivery='2-3 business days'
        )
        db.session.add(transport)
        db.session.commit()

    return jsonify({'message': 'Order placed successfully', 'order': order.to_dict()}), 201


@buyer_bp.route('/orders', methods=['GET'])
def get_buyer_orders():
    user = get_current_user()
    if not user or user.role != 'buyer':
        return jsonify({'error': 'Unauthorized'}), 401

    orders = Order.query.filter_by(buyer_id=user.id).order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        d = o.to_dict()
        if o.transport:
            d['transport'] = o.transport.to_dict()
        result.append(d)
    return jsonify({'orders': result}), 200


@buyer_bp.route('/payment/<int:order_id>', methods=['POST'])
def simulate_payment(order_id):
    user = get_current_user()
    if not user or user.role != 'buyer':
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    payment_method = data.get('payment_method', 'UPI')

    order = Order.query.filter_by(id=order_id, buyer_id=user.id).first()
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if order.payment_status == 'Paid':
        return jsonify({'error': 'Already paid'}), 400

    order.payment_status = 'Paid'
    order.status = 'Confirmed'
    db.session.commit()

    transaction_id = f'TXN{order.id:06d}{hash(payment_method) % 10000:04d}'
    return jsonify({
        'message': 'Payment successful',
        'transaction_id': transaction_id,
        'payment_method': payment_method,
        'amount': order.total_price,
        'order': order.to_dict()
    }), 200


@buyer_bp.route('/transport/<int:order_id>', methods=['POST'])
def book_transport(order_id):
    user = get_current_user()
    if not user or user.role != 'buyer':
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    delivery_address = data.get('delivery_address', '').strip()
    vehicle_type = data.get('vehicle_type', 'Truck')

    order = Order.query.filter_by(id=order_id, buyer_id=user.id).first()
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Check if transport already exists
    if order.transport:
        return jsonify({'error': 'Transport already booked'}), 400

    transport = Transport(
        order_id=order_id,
        delivery_address=delivery_address,
        vehicle_type=vehicle_type,
        driver_name='Ravi Kumar',
        driver_phone='+91-9876543210',
        status='Scheduled',
        estimated_delivery='2-3 business days'
    )
    db.session.add(transport)
    order.transport_needed = True
    order.delivery_address = delivery_address
    db.session.commit()

    return jsonify({'message': 'Transport booked', 'transport': transport.to_dict()}), 201


@buyer_bp.route('/stats', methods=['GET'])
def buyer_stats():
    user = get_current_user()
    if not user or user.role != 'buyer':
        return jsonify({'error': 'Unauthorized'}), 401

    total_orders = Order.query.filter_by(buyer_id=user.id).count()
    total_spent = sum(
        o.total_price for o in Order.query.filter_by(
            buyer_id=user.id, payment_status='Paid'
        ).all()
    )
    pending_orders = Order.query.filter_by(buyer_id=user.id, status='Pending').count()

    return jsonify({
        'total_orders': total_orders,
        'total_spent': round(total_spent, 2),
        'pending_orders': pending_orders
    }), 200
