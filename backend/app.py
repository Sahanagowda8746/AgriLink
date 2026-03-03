from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from config import Config
from models import db
import os


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend (dev + production)
    CORS(
        app,
        resources={r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://agri-link-ewel.vercel.app",
            ]
        }},
        supports_credentials=True
    )



    # Initialize database
    db.init_app(app)

    # Create upload folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.farmer import farmer_bp
    from routes.buyer import buyer_bp
    from routes.ml import ml_bp
    from routes.chatbot import chatbot_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(farmer_bp, url_prefix='/api/farmer')
    app.register_blueprint(buyer_bp, url_prefix='/api/buyer')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')

    # Serve uploaded images
    @app.route('/uploads/<filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Welcome route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to AgriLink API 🌱',
            'status': 'running',
            'docs': '/api/health'
        }), 200

    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'service': 'AgriLink API'}), 200

    # Create all tables
    with app.app_context():
        db.create_all()
        _seed_data(app)

    return app


def _seed_data(app):
    """Seed demo data if database is empty."""
    from models import User, Crop

    if User.query.count() > 0:
        return  # Already seeded

    print("Seeding demo data...")

    # Demo farmer
    farmer = User(name='Rajesh Kumar', email='farmer@demo.com', role='farmer')
    farmer.set_password('password123')
    db.session.add(farmer)
    db.session.flush()

    # Demo buyer
    buyer = User(name='Priya Sharma', email='buyer@demo.com', role='buyer')
    buyer.set_password('password123')
    db.session.add(buyer)

    # Demo crops
    crops_data = [
        {'name': 'Fresh Tomatoes', 'category': 'Vegetables', 'price': 25.0, 'quantity': 500, 'unit': 'kg', 'location': 'Bangalore, Karnataka', 'description': 'Freshly harvested organic tomatoes, bright red and juicy.'},
        {'name': 'Alphonso Mangoes', 'category': 'Fruits', 'price': 180.0, 'quantity': 200, 'unit': 'kg', 'location': 'Ratnagiri, Maharashtra', 'description': 'Premium Alphonso mangoes with sweet aroma and taste.'},
        {'name': 'Basmati Rice', 'category': 'Grains', 'price': 85.0, 'quantity': 1000, 'unit': 'kg', 'location': 'Dehradun, Uttarakhand', 'description': 'Long-grain aromatic Basmati rice, aged 2 years.'},
        {'name': 'Toor Dal', 'category': 'Pulses', 'price': 95.0, 'quantity': 300, 'unit': 'kg', 'location': 'Gulbarga, Karnataka', 'description': 'High-protein split pigeon peas, freshly processed.'},
        {'name': 'Turmeric Powder', 'category': 'Spices', 'price': 145.0, 'quantity': 150, 'unit': 'kg', 'location': 'Erode, Tamil Nadu', 'description': 'Pure Erode turmeric with high curcumin content.'},
        {'name': 'Green Chillies', 'category': 'Vegetables', 'price': 40.0, 'quantity': 250, 'unit': 'kg', 'location': 'Guntur, Andhra Pradesh', 'description': 'Hot and fresh green chillies, harvested daily.'},
        {'name': 'Wheat', 'category': 'Grains', 'price': 28.0, 'quantity': 2000, 'unit': 'kg', 'location': 'Ludhiana, Punjab', 'description': 'Premium wheat grain, suitable for flour and animal feed.'},
        {'name': 'Sunflower Seeds', 'category': 'Oilseeds', 'price': 65.0, 'quantity': 400, 'unit': 'kg', 'location': 'Hubli, Karnataka', 'description': 'High oil content sunflower seeds for pressing.'},
    ]

    for c in crops_data:
        crop = Crop(farmer_id=farmer.id, **c)
        db.session.add(crop)

    db.session.commit()
    print("Demo data seeded successfully!")
    print("Demo accounts: farmer@demo.com / buyer@demo.com (password: password123)")


if __name__ == '__main__':
    app = create_app()
    print('\n🌱 AgriLink Backend Starting...')
    print('📍 API running at: http://127.0.0.1:5000')
    print('🔗 Frontend expected at: http://localhost:5173')
    print('\nDemo accounts:')
    print('  Farmer: farmer@demo.com / password123')
    print('  Buyer:  buyer@demo.com  / password123\n')
    app.run(debug=True, port=5000, host='0.0.0.0')
