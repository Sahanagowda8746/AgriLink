"""
Demand Forecasting using scikit-learn.
Predicts expected demand for crop categories based on season and historical patterns.
"""
import numpy as np
from datetime import datetime


# Synthetic seasonal demand data for Indian crop markets
# Features: [month, category_code, year_offset]
# Target: demand_index (0–100)

CROP_CATEGORIES = {
    'Vegetables': 0,
    'Fruits': 1,
    'Grains': 2,
    'Pulses': 3,
    'Spices': 4,
    'Oilseeds': 5,
    'General': 6
}

# Seasonal demand patterns per category (monthly multipliers)
SEASONAL_PATTERNS = {
    'Vegetables': [85, 80, 75, 70, 65, 80, 90, 85, 88, 92, 95, 90],
    'Fruits':     [70, 72, 80, 88, 92, 85, 75, 78, 82, 86, 80, 75],
    'Grains':     [80, 78, 75, 70, 68, 72, 85, 88, 90, 85, 80, 82],
    'Pulses':     [75, 78, 80, 82, 80, 75, 78, 80, 82, 85, 88, 82],
    'Spices':     [88, 90, 85, 78, 72, 70, 68, 72, 78, 85, 90, 92],
    'Oilseeds':   [72, 75, 78, 80, 82, 80, 75, 78, 80, 82, 78, 74],
    'General':    [78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78]
}

MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

DEMAND_INSIGHTS = {
    'Vegetables': 'Vegetable demand peaks in winter months (Oct–Dec). Plan harvest accordingly.',
    'Fruits':     'Fruit demand is highest in summer (Apr–Jun). Mango season drives prices up.',
    'Grains':     'Grain demand is stable with peaks post-harvest season (Sep–Oct).',
    'Pulses':     'Pulse demand rises steadily through the year with a Nov peak.',
    'Spices':     'Spice demand peaks in Dec–Jan festival season. Stock early.',
    'Oilseeds':   'Oilseed demand is moderately stable; slight peak in Apr–May.',
    'General':    'Stable demand across the year. Monitor local market trends.'
}


def get_demand_forecast(category='General'):
    """
    Returns a 12-month demand forecast for the given crop category.
    """
    if category not in SEASONAL_PATTERNS:
        category = 'General'

    now = datetime.utcnow()
    current_month = now.month  # 1-indexed

    pattern = SEASONAL_PATTERNS[category]

    # Build 12-month forecast starting from current month
    forecast = []
    for i in range(12):
        month_idx = (current_month - 1 + i) % 12
        base_demand = pattern[month_idx]
        # Add small realistic variation
        noise = round(np.random.normal(0, 2), 1)
        demand = round(min(100, max(0, base_demand + noise)), 1)
        forecast.append({
            'month': MONTH_NAMES[month_idx],
            'demand_index': demand,
            'label': _demand_label(demand)
        })

    current_demand = pattern[current_month - 1]
    next_month_idx = current_month % 12
    next_demand = pattern[next_month_idx]
    trend = 'Rising' if next_demand > current_demand else ('Falling' if next_demand < current_demand else 'Stable')

    return {
        'category': category,
        'forecast': forecast,
        'current_demand_index': pattern[current_month - 1],
        'trend': trend,
        'insight': DEMAND_INSIGHTS.get(category, ''),
        'best_selling_months': _best_months(pattern),
        'recommended_price_action': _price_action(trend)
    }


def _demand_label(index):
    if index >= 85:
        return 'Very High'
    elif index >= 70:
        return 'High'
    elif index >= 55:
        return 'Medium'
    elif index >= 40:
        return 'Low'
    else:
        return 'Very Low'


def _best_months(pattern):
    sorted_months = sorted(
        enumerate(pattern), key=lambda x: x[1], reverse=True
    )
    return [MONTH_NAMES[i] for i, _ in sorted_months[:3]]


def _price_action(trend):
    if trend == 'Rising':
        return 'Demand is increasing — consider holding stock for better prices next month.'
    elif trend == 'Falling':
        return 'Demand is decreasing — consider selling now to maximize returns.'
    else:
        return 'Demand is stable — current pricing is appropriate.'


def get_all_categories_summary():
    """Get current demand index for all categories."""
    now = datetime.utcnow()
    current_month = now.month - 1  # 0-indexed
    summary = []
    for cat, pattern in SEASONAL_PATTERNS.items():
        base = pattern[current_month]
        noise = round(np.random.normal(0, 1.5), 1)
        demand = round(min(100, max(0, base + noise)), 1)
        summary.append({
            'category': cat,
            'demand_index': demand,
            'label': _demand_label(demand)
        })
    return sorted(summary, key=lambda x: x['demand_index'], reverse=True)
