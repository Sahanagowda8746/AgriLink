from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'farmer' or 'buyer'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    crops = db.relationship('Crop', backref='farmer', lazy=True,
                            foreign_keys='Crop.farmer_id')
    orders_as_buyer = db.relationship('Order', backref='buyer', lazy=True,
                                       foreign_keys='Order.buyer_id')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }


class Crop(db.Model):
    __tablename__ = 'crops'
    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80), default='General')
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), default='kg')
    location = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    image_path = db.Column(db.String(300), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship('Order', backref='crop', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'farmer_id': self.farmer_id,
            'farmer_name': self.farmer.name if self.farmer else '',
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'quantity': self.quantity,
            'unit': self.unit,
            'location': self.location,
            'description': self.description,
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat()
        }


class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.id'), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Pending')  # Pending, Confirmed, Shipped, Delivered
    transport_needed = db.Column(db.Boolean, default=False)
    delivery_address = db.Column(db.String(300), default='')
    payment_status = db.Column(db.String(30), default='Unpaid')  # Unpaid, Paid
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transport = db.relationship('Transport', backref='order', lazy=True, uselist=False)

    def to_dict(self):
        return {
            'id': self.id,
            'crop_id': self.crop_id,
            'crop_name': self.crop.name if self.crop else '',
            'buyer_id': self.buyer_id,
            'buyer_name': self.buyer.name if self.buyer else '',
            'farmer_name': self.crop.farmer.name if self.crop and self.crop.farmer else '',
            'quantity': self.quantity,
            'total_price': self.total_price,
            'status': self.status,
            'transport_needed': self.transport_needed,
            'delivery_address': self.delivery_address,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else ''
        }


class Transport(db.Model):
    __tablename__ = 'transports'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    delivery_address = db.Column(db.String(300), nullable=False)
    vehicle_type = db.Column(db.String(50), default='Truck')
    driver_name = db.Column(db.String(120), default='Ravi Kumar')
    driver_phone = db.Column(db.String(20), default='+91-9876543210')
    status = db.Column(db.String(50), default='Scheduled')  # Scheduled, In Transit, Delivered
    estimated_delivery = db.Column(db.String(50), default='2-3 days')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'delivery_address': self.delivery_address,
            'vehicle_type': self.vehicle_type,
            'driver_name': self.driver_name,
            'driver_phone': self.driver_phone,
            'status': self.status,
            'estimated_delivery': self.estimated_delivery,
            'created_at': self.created_at.isoformat()
        }
