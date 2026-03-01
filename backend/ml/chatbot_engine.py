"""
Multilingual chatbot supporting English, Kannada, Hindi, and Telugu.
Rule-based responses with keyword matching.
"""

RESPONSES = {
    'en': {
        'greeting': [
            'Hello! Welcome to AgriLink. How can I help you today?',
            'Hi there! I am your AgriLink assistant. Ask me anything about farming or buying crops!'
        ],
        'how_to_sell': 'To sell crops, sign in as a Farmer, go to your dashboard and click "Add Crop". Fill in the crop details including name, price, quantity, location, and upload an image.',
        'how_to_buy': 'To buy crops, sign in as a Buyer and visit the Marketplace. You can search for crops by name or location, view details, and place an order.',
        'disease': 'To detect crop diseases, go to the Disease Detection page from your Farmer dashboard. Upload a clear image of the affected plant and our AI will analyze it.',
        'demand': 'To see demand forecasts, visit the Demand Forecast section in your Farmer dashboard. Select the crop category to see predictions for the next 12 months.',
        'transport': 'When placing an order, you can optionally book transportation. Enter your delivery address and we will arrange a vehicle to deliver the crops to you.',
        'payment': 'We support multiple payment methods: UPI, Credit/Debit Card, Net Banking, and Cash on Delivery. Your payment is secure and simulated for demo purposes.',
        'register': 'To register, click "Sign Up" on the home page. Choose your role (Farmer or Buyer), fill in your name, email, and password.',
        'price': 'Crop prices are set by farmers. You can view and compare prices on the Marketplace page.',
        'contact': 'For support, please contact us at support@agrilink.in or call our helpline: 1800-XXX-XXXX',
        'default': 'I am not sure about that. Please try asking about: selling crops, buying crops, disease detection, demand forecast, transportation, or payment.'
    },
    'kn': {
        'greeting': [
            'ನಮಸ್ಕಾರ! AgriLink ಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
            'ಹಲೋ! ನಾನು ನಿಮ್ಮ AgriLink ಸಹಾಯಕ. ಕೃಷಿ ಅಥವಾ ಬೆಳೆ ಖರೀದಿ ಬಗ್ಗೆ ಕೇಳಿ!'
        ],
        'how_to_sell': 'ಬೆಳೆ ಮಾರಾಟ ಮಾಡಲು, ರೈತರಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಿ, ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ ಮತ್ತು "ಬೆಳೆ ಸೇರಿಸು" ಕ್ಲಿಕ್ ಮಾಡಿ.',
        'how_to_buy': 'ಬೆಳೆ ಖರೀದಿಸಲು, ಖರೀದಿದಾರರಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಿ ಮತ್ತು Marketplace ಗೆ ಭೇಟಿ ನೀಡಿ.',
        'disease': 'ರೋಗ ಪತ್ತೆ ಮಾಡಲು, Disease Detection ಪುಟಕ್ಕೆ ಹೋಗಿ ಮತ್ತು ಸಸ್ಯದ ಸ್ಪಷ್ಟ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
        'demand': 'ಬೇಡಿಕೆ ಮುನ್ಸೂಚನೆ ವೀಕ್ಷಿಸಲು, ನಿಮ್ಮ ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ Demand Forecast ವಿಭಾಗಕ್ಕೆ ಹೋಗಿ.',
        'transport': 'ಆರ್ಡರ್ ಮಾಡುವಾಗ, ಸಾರಿಗೆ ಬೇಕಾದರೆ ಬುಕ್ ಮಾಡಬಹುದು. ವಿತರಣಾ ವಿಳಾಸ ನಮೂದಿಸಿ.',
        'payment': 'UPI, ಕ್ರೆಡಿಟ್/ಡೆಬಿಟ್ ಕಾರ್ಡ್, ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್ ಮತ್ತು ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ ಪಾವತಿ ವಿಧಾನಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತೇವೆ.',
        'register': 'ನೋಂದಾಯಿಸಲು, ಮನೆ ಪುಟದಲ್ಲಿ "Sign Up" ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ.',
        'price': 'ಬೆಳೆ ಬೆಲೆಗಳನ್ನು ರೈತರು ನಿಗದಿಪಡಿಸುತ್ತಾರೆ. Marketplace ನಲ್ಲಿ ಬೆಲೆಗಳನ್ನು ನೋಡಿ.',
        'contact': 'ಸಹಾಯಕ್ಕಾಗಿ, support@agrilink.in ಗೆ ಸಂಪರ್ಕಿಸಿ.',
        'default': 'ನನಗೆ ಅದರ ಬಗ್ಗೆ ಖಚಿತವಿಲ್ಲ. ಬೆಳೆ ಮಾರಾಟ, ಖರೀದಿ, ರೋಗ ಪತ್ತೆ ಅಥವಾ ಸಾರಿಗೆ ಬಗ್ಗೆ ಕೇಳಿ.'
    },
    'hi': {
        'greeting': [
            'नमस्ते! AgriLink में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ?',
            'हैलो! मैं आपका AgriLink सहायक हूँ। खेती या फसल खरीदने के बारे में पूछें!'
        ],
        'how_to_sell': 'फसल बेचने के लिए, किसान के रूप में साइन इन करें, डैशबोर्ड पर जाएं और "फसल जोड़ें" पर क्लिक करें।',
        'how_to_buy': 'फसल खरीदने के लिए, खरीदार के रूप में साइन इन करें और Marketplace पर जाएं।',
        'disease': 'रोग का पता लगाने के लिए, Disease Detection पृष्ठ पर जाएं और पौधे की स्पष्ट तस्वीर अपलोड करें।',
        'demand': 'माँग पूर्वानुमान देखने के लिए, किसान डैशबोर्ड में Demand Forecast अनुभाग पर जाएं।',
        'transport': 'ऑर्डर देते समय, आप परिवहन बुक कर सकते हैं। डिलीवरी पता दर्ज करें।',
        'payment': 'हम UPI, क्रेडिट/डेबिट कार्ड, नेट बैंकिंग और कैश ऑन डिलीवरी का समर्थन करते हैं।',
        'register': 'पंजीकरण के लिए, होम पेज पर "Sign Up" पर क्लिक करें और अपनी भूमिका चुनें।',
        'price': 'फसल की कीमतें किसान तय करते हैं। Marketplace पर कीमतें देखें।',
        'contact': 'सहायता के लिए, support@agrilink.in पर संपर्क करें।',
        'default': 'मुझे उस बारे में यकीन नहीं है। फसल बेचने, खरीदने, रोग पहचान या परिवहन के बारे में पूछें।'
    },
    'te': {
        'greeting': [
            'నమస్కారం! AgriLink కి స్వాగతం. నేను మీకు ఎలా సహాయం చేయగలను?',
            'హలో! నేను మీ AgriLink సహాయకుడిని. వ్యవసాయం లేదా పంట కొనుగోలు గురించి అడగండి!'
        ],
        'how_to_sell': 'పంటలు అమ్మడానికి, రైతుగా సైన్ ఇన్ చేయండి, డాష్‌బోర్డ్‌కు వెళ్ళి "పంట జోడించు" క్లిక్ చేయండి.',
        'how_to_buy': 'పంటలు కొనుగోలు చేయడానికి, కొనుగోలుదారుగా సైన్ ఇన్ చేసి Marketplace సందర్శించండి.',
        'disease': 'వ్యాధి గుర్తించడానికి, Disease Detection పేజీకి వెళ్ళి మొక్క స్పష్టమైన చిత్రం అప్‌లోడ్ చేయండి.',
        'demand': 'డిమాండ్ అంచనా చూడడానికి, రైతు డాష్‌బోర్డ్‌లో Demand Forecast విభాగానికి వెళ్ళండి.',
        'transport': 'ఆర్డర్ చేస్తున్నప్పుడు, రవాణా బుక్ చేయవచ్చు. డెలివరీ చిరునామా నమోదు చేయండి.',
        'payment': 'మేము UPI, క్రెడిట్/డెబిట్ కార్డ్, నెట్ బ్యాంకింగ్ మరియు క్యాష్ ఆన్ డెలివరీని సపోర్ట్ చేస్తాము.',
        'register': 'నమోదు చేసుకోవడానికి, హోమ్ పేజీలో "Sign Up" క్లిక్ చేసి మీ పాత్ర ఎంచుకోండి.',
        'price': 'పంట ధరలు రైతులు నిర్ణయిస్తారు. Marketplace లో ధరలు చూడండి.',
        'contact': 'సహాయానికి, support@agrilink.in కి సంప్రదించండి.',
        'default': 'నాకు దాని గురించి తెలియదు. పంటలు అమ్మడం, కొనుగోలు, వ్యాధి గుర్తింపు లేదా రవాణా గురించి అడగండి.'
    }
}

KEYWORDS = {
    'greeting': ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'greet', 'start', 'help',
                 'నమస్కారం', 'హలో', 'ನಮಸ್ಕಾರ', 'हैलो', 'नमस्ते'],
    'how_to_sell': ['sell', 'sale', 'add crop', 'list crop', 'farmer', 'upload crop',
                    'ಮಾರಾಟ', 'मेरी फसल', 'అమ్మడం', 'विक्री'],
    'how_to_buy': ['buy', 'purchase', 'order', 'marketplace', 'crop', 'shop',
                   'ಖರೀದಿ', 'खरीद', 'కొనుగోలు', 'बाजार'],
    'disease': ['disease', 'detect', 'sick', 'ill', 'leaf', 'infection', 'blight', 'mildew', 'rust',
                'ರೋಗ', 'रोग', 'వ్యాధి', 'ಪತ್ತೆ'],
    'demand': ['demand', 'forecast', 'predict', 'market', 'price trend', 'season',
               'ಬೇಡಿಕೆ', 'माँग', 'డిమాండ్', 'मूल्य'],
    'transport': ['transport', 'delivery', 'shipping', 'vehicle', 'truck', 'deliver',
                  'ಸಾರಿಗೆ', 'परिवहन', 'రవాణా', 'डिलीवरी'],
    'payment': ['payment', 'pay', 'upi', 'card', 'cash', 'invoice', 'money',
                'ಪಾವತಿ', 'भुगतान', 'చెల్లింపు', 'पेमेंट'],
    'register': ['register', 'signup', 'sign up', 'account', 'create', 'join',
                 'ನೋಂದಾಯಿಸು', 'पंजीकरण', 'నమోదు'],
    'price': ['price', 'cost', 'rate', 'how much', 'rupee', 'inr',
              'ಬೆಲೆ', 'कीमत', 'ధర'],
    'contact': ['contact', 'support', 'help', 'phone', 'email', 'call',
                'ಸಂಪರ್ಕ', 'संपर्क', 'సంప్రదింపు']
}

import random


def get_response(message: str, language: str = 'en') -> str:
    lang = language.lower()
    if lang not in RESPONSES:
        lang = 'en'

    responses = RESPONSES[lang]
    msg_lower = message.lower()

    # Match keywords to find intent
    for intent, keywords in KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in msg_lower:
                val = responses.get(intent, responses['default'])
                if isinstance(val, list):
                    return random.choice(val)
                return val

    val = responses.get('default', 'I am here to help! Ask me about selling crops, buying crops, disease detection, or transportation.')
    if isinstance(val, list):
        return random.choice(val)
    return val
