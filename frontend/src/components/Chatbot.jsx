import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// ─── Knowledge Base ───────────────────────────────────────────────────────────
const KB = {
  en: {
    greeting: "👋 Hello! I'm AgriBot, your smart farming assistant! I can explain how AgriLink works, guide you step by step, and answer your questions. What would you like to know? 🌾",
    signup: "📝 **How to Sign Up:**\n1. Click the 'Sign Up' button on the homepage\n2. Enter your name, email, and password\n3. Choose your role: **Farmer** or **Buyer**\n4. Click 'Create Account'\n5. You'll be taken to your dashboard automatically!\n\nFarmers can list their crops for sale. Buyers can browse and purchase crops.",
    login: "🔐 **How to Login:**\n1. Click 'Sign In' on the top menu\n2. Enter your email and password\n3. Click 'Login'\n4. You'll be redirected to your personal dashboard\n\nDemo accounts:\n• Farmer: farmer@demo.com / password123\n• Buyer: buyer@demo.com / password123",
    marketplace: "🛒 **Marketplace:**\nThe marketplace is where farmers list their crops and buyers can browse and buy them.\n\n**For Buyers:**\n1. Go to 'Marketplace' in the menu\n2. Browse crops by category (Vegetables, Fruits, Grains…)\n3. Click on any crop to see details\n4. Click 'Buy Now' to place an order\n\n**For Farmers:**\n• Your listed crops appear here for buyers to see",
    sell: "🌱 **How Farmers Sell Crops:**\n1. Login as a Farmer\n2. Go to your Farmer Dashboard\n3. Click 'Add New Crop'\n4. Fill in: crop name, category, price per kg, quantity, location, description\n5. Click 'Submit'\n6. Your crop is now live in the marketplace for buyers to purchase!\n\nYou earn directly — no middlemen!",
    buy: "🛍️ **How Buyers Purchase Crops:**\n1. Login as a Buyer\n2. Click 'Marketplace' in the menu\n3. Browse or search for crops\n4. Click any crop for details and farmer info\n5. Click 'Buy Now'\n6. Choose quantity\n7. Proceed to Payment\n8. Optionally book Transportation\n9. Track your order status!",
    payment: "💳 **Payment Process:**\n1. After placing an order, click 'Proceed to Payment'\n2. Review your order details and total amount\n3. Choose payment method (UPI / Card / Net Banking)\n4. Confirm payment\n5. You'll receive an order confirmation\n\nAll payments are secure and go directly to the farmer.",
    transport: "🚛 **Transportation Booking:**\nAfter placing an order, you can book transportation:\n1. Click 'Book Transport' after payment\n2. Choose vehicle type based on quantity\n3. Select pickup date\n4. Confirm booking\n\nThis helps farmers who don't have their own vehicles to deliver crops to buyers!",
    disease: "🔬 **AI Disease Detection:**\nOur smart AI can identify crop diseases from photos!\n\n**How to use:**\n1. Go to 'Disease Detection' in the Farmer Dashboard\n2. Upload a photo of the affected crop\n3. Our AI analyzes the image\n4. You get: disease name, severity, and treatment suggestions\n\nThis saves crops early and reduces losses! 🌿",
    forecast: "📊 **Demand Forecasting:**\nOur AI predicts which crops will be in high demand!\n\n**How it works:**\n1. Go to 'Demand Forecast' in your dashboard\n2. Select a crop\n3. AI shows predicted demand for next months\n4. Plan your farming accordingly!\n\nThis helps farmers grow what buyers actually need, maximizing income! 💰",
    business: "💼 **How AgriLink Works as a Business:**\n\n✅ **Farmers benefit:**\n• Sell directly to buyers — no middlemen\n• Get fair prices for crops\n• Reach buyers across the country\n• Use AI tools to improve yield\n\n✅ **Buyers benefit:**\n• Fresh crops directly from farms\n• Better prices than retail\n• Wide variety of crops\n• Transparent pricing\n\n❌ **Middlemen removed:**\nTraditionally, middlemen take 30-40% of the crop value. AgriLink connects farmers and buyers directly!",
    orders: "📦 **Order Tracking:**\n1. Go to 'My Orders' in your Buyer Dashboard\n2. See all your orders and their status:\n   • Pending → Confirmed → Shipped → Delivered\n3. Contact the farmer directly if needed\n\nFarmers can update order status from their dashboard.",
    overview: [
      "👋 **Step 1: Registration**\nFarmers and buyers create accounts on AgriLink and choose their role. It takes less than 2 minutes!",
      "🔐 **Step 2: Login**\nAfter registering, login with your email and password. You'll be taken to your personal dashboard.",
      "🌾 **Step 3: Farmer Lists Crops**\nFarmers add their crops with photos, price, quantity, and location. These appear instantly in the marketplace.",
      "🛒 **Step 4: Buyer Browses Marketplace**\nBuyers explore fresh crops from farmers across India. Filter by category, location, and price.",
      "📋 **Step 5: Buyer Places Order**\nBuyers select crops and place orders directly with farmers. No middlemen involved!",
      "💳 **Step 6: Payment**\nSecure online payment is made. Farmers receive money directly in their account.",
      "🚛 **Step 7: Transportation Booking**\nBuyers can optionally book a vehicle to transport the crops from farm to their location.",
      "📦 **Step 8: Order Tracking**\nBoth farmer and buyer can track the order status in real-time from their dashboards.",
      "✅ **Step 9: Delivery Complete**\nCrops are delivered fresh! Farmer earns fairly, buyer gets quality produce. No middlemen, no markup!"
    ],
    suggestions: ["How to Sign Up", "Explain Marketplace", "How to Sell Crops", "Explain AI Features", "Explain Business Model", "How Payments Work", "Explain Transportation", "Track My Order"],
    explainBtn: "🎯 Explain Full Platform",
    rolePrompt: "Are you a Farmer or Buyer?",
    micListening: "🎙️ Listening...",
    unknown: "🤔 I'm not sure about that. Try asking:\n• 'How do I sign up?'\n• 'How does the marketplace work?'\n• 'How do I sell crops?'\n• 'Explain AI features'\n• Or click the suggestion buttons below! 👇",
  },
  kn: {
    greeting: "👋 ನಮಸ್ಕಾರ! ನಾನು AgriBot. AgriLink ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂದು ನಾನು ವಿವರಿಸುತ್ತೇನೆ. ನೀವು ಏನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ? 🌾",
    signup: "📝 **ನೋಂದಣಿ ಹೇಗೆ:**\n1. ಮುಖಪುಟದಲ್ಲಿ 'Sign Up' ಕ್ಲಿಕ್ ಮಾಡಿ\n2. ನಿಮ್ಮ ಹೆಸರು, ಇಮೇಲ್, ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ\n3. ರೈತ ಅಥವಾ ಖರೀದಿದಾರ ಆಯ್ಕೆ ಮಾಡಿ\n4. 'Create Account' ಕ್ಲಿಕ್ ಮಾಡಿ\n5. ನಿಮ್ಮ dashboard ಗೆ ಹೋಗುತ್ತೀರಿ!",
    login: "🔐 **ಲಾಗಿನ್ ಹೇಗೆ:**\n1. 'Sign In' ಕ್ಲಿಕ್ ಮಾಡಿ\n2. ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ\n3. 'Login' ಕ್ಲಿಕ್ ಮಾಡಿ\n\nDemo: farmer@demo.com / password123",
    marketplace: "🛒 **ಮಾರುಕಟ್ಟೆ:**\nರೈತರು ತಮ್ಮ ಬೆಳೆಗಳನ್ನು ಇಲ್ಲಿ ಮಾರಾಟ ಮಾಡುತ್ತಾರೆ. ಖರೀದಿದಾರರು ನೇರವಾಗಿ ಖರೀದಿಸಬಹುದು. ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ!",
    sell: "🌱 **ಬೆಳೆ ಮಾರಾಟ ಹೇಗೆ:**\n1. ರೈತನಾಗಿ ಲಾಗಿನ್ ಮಾಡಿ\n2. 'Add New Crop' ಕ್ಲಿಕ್ ಮಾಡಿ\n3. ಬೆಳೆ ವಿವರಗಳು, ಬೆಲೆ, ಪ್ರಮಾಣ ನಮೂದಿಸಿ\n4. Submit ಮಾಡಿ - ನಿಮ್ಮ ಬೆಳೆ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ!",
    buy: "🛍️ **ಖರೀದಿ ಹೇಗೆ:**\n1. Marketplace ಗೆ ಹೋಗಿ\n2. ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ\n3. 'Buy Now' ಕ್ಲಿಕ್ ಮಾಡಿ\n4. Payment ಮಾಡಿ\n5. Transport ಬೇಕಿದ್ದರೆ ಬುಕ್ ಮಾಡಿ!",
    payment: "💳 **ಪಾವತಿ:**\nSafe ಮತ್ತು Secure ಪಾವತಿ. UPI / Card / Net Banking ಮೂಲಕ ಪಾವತಿ ಮಾಡಬಹುದು. ಹಣ ನೇರವಾಗಿ ರೈತರಿಗೆ ಹೋಗುತ್ತದೆ.",
    transport: "🚛 **ಸಾರಿಗೆ:**\nOrder ನಂತರ ವಾಹನ ಬುಕ್ ಮಾಡಬಹುದು. ರೈತರ ಜಮೀನಿನಿಂದ ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಬೆಳೆ ತರಿಸಬಹುದು!",
    disease: "🔬 **ರೋಗ ಪತ್ತೆ AI:**\nಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. AI ರೋಗ ಗುರುತಿಸಿ ಚಿಕಿತ್ಸೆ ಸೂಚಿಸುತ್ತದೆ!",
    forecast: "📊 **ಬೇಡಿಕೆ ಮುನ್ಸೂಚನೆ:**\nAI ಯಾವ ಬೆಳೆಗಳಿಗೆ ಹೆಚ್ಚು ಬೇಡಿಕೆ ಬರಲಿದೆ ಎಂದು ಹೇಳುತ್ತದೆ. ರೈತರು ಮೊದಲೇ ಯೋಜಿಸಬಹುದು!",
    business: "💼 **AgriLink ಉದ್ಯಮ:**\nರೈತರು ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಿ ಹೆಚ್ಚು ಗಳಿಸಬಹುದು. ಖರೀದಿದಾರರಿಗೆ ತಾಜಾ ಬೆಳೆ ಕಡಿಮೆ ಬೆಲೆಗೆ ಸಿಗುತ್ತದೆ. ಮಧ್ಯವರ್ತಿಗಳು ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದ ಹಣ ಈಗ ರೈತರಿಗೇ ಸಿಗುತ್ತದೆ!",
    orders: "📦 **Order ಟ್ರ್ಯಾಕಿಂಗ್:**\n'My Orders' ನಲ್ಲಿ ನಿಮ್ಮ ಎಲ್ಲ orders ನೋಡಬಹುದು. Pending → Confirmed → Shipped → Delivered.",
    overview: [
      "👋 **ಹಂತ 1:** ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರು AgriLink ನಲ್ಲಿ ನೋಂದಾಯಿಸಿಕೊಳ್ಳುತ್ತಾರೆ",
      "🔐 **ಹಂತ 2:** Email ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ",
      "🌾 **ಹಂತ 3:** ರೈತರು ಬೆಳೆಗಳನ್ನು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪ್ರಕಟಿಸುತ್ತಾರೆ",
      "🛒 **ಹಂತ 4:** ಖರೀದಿದಾರರು ತಮಗೆ ಬೇಕಾದ ಬೆಳೆಗಳನ್ನು ನೋಡುತ್ತಾರೆ",
      "📋 **ಹಂತ 5:** ಖರೀದಿದಾರರು ಆರ್ಡರ್ ಮಾಡುತ್ತಾರೆ",
      "💳 **ಹಂತ 6:** Secure Payment ಮಾಡುತ್ತಾರೆ",
      "🚛 **ಹಂತ 7:** Transport ಬೇಕಿದ್ದರೆ ಬುಕ್ ಮಾಡಬಹುದು",
      "📦 **ಹಂತ 8:** Order status ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದು",
      "✅ **ಹಂತ 9:** ತಾಜಾ ಬೆಳೆ ಡೆಲಿವರಿ ಆಗುತ್ತದೆ!"
    ],
    suggestions: ["ನೋಂದಣಿ ಹೇಗೆ", "ಮಾರುಕಟ್ಟೆ ವಿವರ", "ಬೆಳೆ ಮಾರಾಟ", "AI ವೈಶಿಷ್ಟ್ಯಗಳು", "ವ್ಯಾಪಾರ ವಿವರ"],
    explainBtn: "🎯 ಸಂಪೂರ್ಣ ವಿವರಣೆ",
    rolePrompt: "ನೀವು ರೈತರೇ ಅಥವಾ ಖರೀದಿದಾರರೇ?",
    micListening: "🎙️ ಕೇಳುತ್ತಿದ್ದೇನೆ...",
    unknown: "🤔 ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ ಅಥವಾ ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ 👇",
  },
  hi: {
    greeting: "👋 नमस्ते! मैं AgriBot हूँ। AgriLink को समझने में मैं आपकी मदद करूँगा। आप क्या जानना चाहते हैं? 🌾",
    signup: "📝 **साइन अप कैसे करें:**\n1. होमपेज पर 'Sign Up' पर क्लिक करें\n2. नाम, ईमेल, पासवर्ड डालें\n3. किसान या खरीदार चुनें\n4. 'Create Account' पर क्लिक करें\n5. आप अपने डैशबोर्ड पर पहुँचेंगे!",
    login: "🔐 **लॉगिन कैसे करें:**\n1. 'Sign In' पर क्लिक करें\n2. ईमेल और पासवर्ड डालें\n3. 'Login' दबाएं\n\nDemo: farmer@demo.com / password123",
    marketplace: "🛒 **बाज़ार:**\nयहाँ किसान अपनी फसलें बेचते हैं और खरीदार सीधे खरीद सकते हैं। कोई बिचौलिया नहीं!",
    sell: "🌱 **फसल कैसे बेचें:**\n1. किसान के रूप में लॉगिन करें\n2. 'Add New Crop' पर क्लिक करें\n3. फसल का नाम, कीमत, मात्रा भरें\n4. Submit करें — आपकी फसल बाज़ार में दिखने लगेगी!",
    buy: "🛍️ **फसल कैसे खरीदें:**\n1. Marketplace पर जाएं\n2. पसंदीदा फसल चुनें\n3. 'Buy Now' दबाएं\n4. Payment करें\n5. Transport बुक करें (ऐच्छिक)!",
    payment: "💳 **भुगतान:**\nSafe और Secure. UPI / Card / Net Banking से भुगतान करें। पैसे सीधे किसान को जाते हैं।",
    transport: "🚛 **परिवहन:**\nऑर्डर के बाद वाहन बुक करें। किसान के खेत से आपके दरवाज़े तक फसल आएगी!",
    disease: "🔬 **AI रोग पहचान:**\nफसल की फोटो अपलोड करें। AI बीमारी पहचाने और इलाज सुझाएगा!",
    forecast: "📊 **मांग पूर्वानुमान:**\nAI बताएगा कि किस फसल की ज़्यादा मांग होगी। किसान पहले से योजना बना सकते हैं!",
    business: "💼 **AgriLink व्यापार:**\nकिसान सीधे बेचकर ज़्यादा कमाते हैं। खरीदारों को ताज़ी फसल सस्ते में मिलती है। बिचौलिए हटते हैं!",
    orders: "📦 **ऑर्डर ट्रैकिंग:**\n'My Orders' में सभी ऑर्डर देखें। Pending → Confirmed → Shipped → Delivered।",
    overview: [
      "👋 **चरण 1:** किसान और खरीदार AgriLink पर पंजीकरण करते हैं",
      "🔐 **चरण 2:** ईमेल और पासवर्ड से लॉगिन करें",
      "🌾 **चरण 3:** किसान बाज़ार में फसल जोड़ते हैं",
      "🛒 **चरण 4:** खरीदार बाज़ार में फसलें देखते हैं",
      "📋 **चरण 5:** खरीदार ऑर्डर देते हैं",
      "💳 **चरण 6:** Secure Payment होता है",
      "🚛 **चरण 7:** Transport बुक कर सकते हैं",
      "📦 **चरण 8:** ऑर्डर स्टेटस ट्रैक करें",
      "✅ **चरण 9:** ताज़ी फसल डिलीवर होती है!"
    ],
    suggestions: ["साइन अप करें", "बाज़ार समझें", "फसल बेचें", "AI फीचर्स", "व्यापार मॉडल"],
    explainBtn: "🎯 पूरा प्लेटफॉर्म समझाएं",
    rolePrompt: "आप किसान हैं या खरीदार?",
    micListening: "🎙️ सुन रहा हूँ...",
    unknown: "🤔 कृपया दोबारा पूछें या नीचे के बटन दबाएं 👇",
  },
  te: {
    greeting: "👋 నమస్కారం! నేను AgriBot. AgriLink గురించి వివరిస్తాను. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు? 🌾",
    signup: "📝 **నమోదు ఎలా:**\n1. 'Sign Up' పై క్లిక్ చేయండి\n2. పేరు, ఇమెయిల్, పాస్‌వర్డ్ నమోదు చేయండి\n3. రైతు లేదా కొనుగోలుదారు ఎంచుకోండి\n4. 'Create Account' క్లిక్ చేయండి!",
    login: "🔐 **లాగిన్ ఎలా:**\n1. 'Sign In' క్లిక్ చేయండి\n2. ఇమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి\n\nDemo: farmer@demo.com / password123",
    marketplace: "🛒 **మార్కెట్‌ప్లేస్:**\nరైతులు పంటలను నేరుగా అమ్ముతారు. కొనుగోలుదారులు నేరుగా కొనవచ్చు. దళారులు లేరు!",
    sell: "🌱 **పంటలు అమ్మడం ఎలా:**\n1. రైతుగా లాగిన్ అవ్వండి\n2. 'Add New Crop' క్లిక్ చేయండి\n3. పంట వివరాలు, ధర నింపండి\n4. Submit చేయండి!",
    buy: "🛍️ **కొనుగోలు ఎలా:**\n1. Marketplace కి వెళ్ళండి\n2. పంట ఎంచుకోండి\n3. 'Buy Now' నొక్కండి\n4. Payment చేయండి!",
    payment: "💳 **చెల్లింపు:**\nUPI / Card / Net Banking ద్వారా సురక్షిత చెల్లింపు. డబ్బు నేరుగా రైతుకు వెళ్తుంది.",
    transport: "🚛 **రవాణా:**\nఆర్డర్ తర్వాత వాహనం బుక్ చేయండి. పంట మీ ఇంటికి వస్తుంది!",
    disease: "🔬 **AI వ్యాధి నిర్ణయ:**\nపంట ఫోటో అప్‌లోడ్ చేయండి. AI వ్యాధిని గుర్తించి చికిత్స సూచిస్తుంది!",
    forecast: "📊 **డిమాండ్ అంచనా:**\nAI ఏ పంటలకు ఎక్కువ డిమాండ్ ఉంటుందో చెప్తుంది. రైతులు ముందే ప్లాన్ చేయవచ్చు!",
    business: "💼 **AgriLink వ్యాపారం:**\nరైతులు నేరంగా అమ్మి ఎక్కువ సంపాదిస్తారు. కొనుగోలుదారులకు తాజా పంటలు తక్కువ ధరకు దొరుకుతాయి!",
    orders: "📦 **ఆర్డర్ ట్రాకింగ్:**\n'My Orders' లో అన్ని ఆర్డర్‌లు చూడవచ్చు.",
    overview: [
      "👋 **దశ 1:** నమోదు - రైతులు మరియు కొనుగోలుదారులు సైన్ అప్ చేస్తారు",
      "🔐 **దశ 2:** లాగిన్ చేసి డాష్‌బోర్డ్ యాక్సెస్ చేయండి",
      "🌾 **దశ 3:** రైతులు పంటలు జోడిస్తారు",
      "🛒 **దశ 4:** కొనుగోలుదారులు మార్కెట్‌ప్లేస్ చూస్తారు",
      "📋 **దశ 5:** కొనుగోలుదారులు ఆర్డర్ చేస్తారు",
      "💳 **దశ 6:** సురక్షిత చెల్లింపు జరుగుతుంది",
      "🚛 **దశ 7:** రవాణా బుక్ చేయవచ్చు",
      "📦 **దశ 8:** ఆర్డర్ స్థితి ట్రాక్ చేయండి",
      "✅ **దశ 9:** తాజా పంటలు డెలివరీ అవుతాయి!"
    ],
    suggestions: ["సైన్ అప్ ఎలా", "మార్కెట్‌ప్లేస్ వివరం", "పంట అమ్మడం", "AI ఫీచర్స్", "వ్యాపార నమూనా"],
    explainBtn: "🎯 మొత్తం వివరించు",
    rolePrompt: "మీరు రైతా లేదా కొనుగోలుదారా?",
    micListening: "🎙️ వింటున్నాను...",
    unknown: "🤔 మళ్ళీ అడగండి లేదా కింది బటన్లు నొక్కండి 👇",
  }
}

// ─── Voice Language Codes ─────────────────────────────────────────────────────
const VOICE_LANG = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN', te: 'te-IN' }
const LANG_LABELS = { en: '🇬🇧 English', kn: '🇮🇳 ಕನ್ನಡ', hi: '🇮🇳 हिन्दी', te: '🇮🇳 తెలుగు' }

// ─── Intent Matching ──────────────────────────────────────────────────────────
function getResponse(text, lang) {
  const t = text.toLowerCase()
  const kb = KB[lang]
  if (/sign.?up|register|creat.*acc|how.*join/i.test(t)) return kb.signup
  if (/sign.?in|login|log.?in|password/i.test(t)) return kb.login
  if (/market|browse|shop/i.test(t)) return kb.marketplace
  if (/sell|list.*crop|add.*crop|farmer.*earn/i.test(t)) return kb.sell
  if (/buy|purchas|order.*crop|how.*buy/i.test(t)) return kb.buy
  if (/pay|payment|upi|card/i.test(t)) return kb.payment
  if (/transport|vehicle|deliver|ship/i.test(t)) return kb.transport
  if (/diseas|detect|photo|image|upload/i.test(t)) return kb.disease
  if (/forecast|demand|predict|which crop/i.test(t)) return kb.forecast
  if (/business|model|earn|middl|profit|benefit/i.test(t)) return kb.business
  if (/track|order.?status|my order/i.test(t)) return kb.orders
  if (/hello|hi|hey|help|namaste|namaskara/i.test(t)) return kb.greeting
  return kb.unknown
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Chatbot() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const [role, setRole] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [walkStep, setWalkStep] = useState(-1)
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const walkTimerRef = useRef(null)
  const speechDelayRef = useRef(null)  // pending speech timeout
  const activeUttRef = useRef(null)    // current SpeechSynthesisUtterance

  // Init on open
  useEffect(() => {
    if (open && messages.length === 0) {
      const detectedRole = user?.role || null
      setRole(detectedRole)
      addBotMessage(KB[lang].greeting)
    }
  }, [open])

  useEffect(() => {
    if (user?.role) setRole(user.role)
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Cleanup on unmount
  useEffect(() => () => {
    stopAllSpeech()
    clearTimeout(walkTimerRef.current)
  }, [])

  // ── Core speech helpers (defined first — used by addBotMessage below) ───────
  const stopAllSpeech = () => {
    clearTimeout(speechDelayRef.current)
    if (activeUttRef.current) {
      activeUttRef.current.onstart = null
      activeUttRef.current.onend   = null
      activeUttRef.current.onerror = null
      activeUttRef.current = null
    }
    try { window.speechSynthesis?.cancel() } catch (_) {}
    setSpeaking(false)
  }

  const addBotMessage = (text, speak = true) => {
    setMessages(prev => [...prev, { role: 'bot', text, id: Date.now(), lang }])
    if (speak) speakText(text, lang)
  }

  const replayMsg = (text, msgLang) => {
    speakText(text, msgLang || lang)
  }

  const speakText = (text, language) => {
    if (!window.speechSynthesis) return
    // Step 1: hard-stop everything
    stopAllSpeech()
    // Step 2: wait 300ms for the synthesis queue to fully flush
    speechDelayRef.current = setTimeout(() => {
      const clean = text.replace(/[*_#`]/g, '').replace(/\n/g, '. ')
      const utt = new SpeechSynthesisUtterance(clean)
      utt.lang  = VOICE_LANG[language]
      utt.rate  = 0.9
      utt.pitch = 1.0
      // Find native voice for the language
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(v => v.lang.startsWith(VOICE_LANG[language]))
                     || voices.find(v => v.lang.startsWith(language))
      if (preferred) utt.voice = preferred
      utt.onstart = () => setSpeaking(true)
      utt.onend   = () => { setSpeaking(false); activeUttRef.current = null }
      utt.onerror = () => { setSpeaking(false); activeUttRef.current = null }
      activeUttRef.current = utt
      window.speechSynthesis.speak(utt)
    }, 300)
  }

  const sendMessage = (text) => {
    const msg = (text || input).trim()
    if (!msg) return
    // Cancel any running speech and walkthrough first
    stopAllSpeech()
    clearTimeout(walkTimerRef.current)
    setWalkStep(-1)
    setInput('')
    setTyping(false)
    setMessages(prev => [...prev, { role: 'user', text: msg, id: Date.now() }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      // Always respond in the currently selected language
      const response = getResponse(msg, lang)
      addBotMessage(response)
    }, 500)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const changeLang = (newLang) => {
    // Stop everything before switching language
    stopAllSpeech()
    clearTimeout(walkTimerRef.current)
    setWalkStep(-1)
    setTyping(false)
    setLang(newLang)
    setMessages([])
    // Delay greeting so state update for lang has settled
    setTimeout(() => {
      const greeting = KB[newLang].greeting
      setMessages([{ role: 'bot', text: greeting, id: Date.now(), lang: newLang }])
      speakText(greeting, newLang)
    }, 350)
  }

  // ── Walk-through ─────────────────────────────────────────────────────────
  const startWalkthrough = () => {
    stopAllSpeech()
    clearTimeout(walkTimerRef.current)
    setMessages([])
    setTyping(false)
    setWalkStep(0)
    // Capture lang at this moment so walkthrough always uses the same language
    const walklang = lang
    runWalkStep(0, walklang)
  }

  const runWalkStep = (step, walklang) => {
    const steps = KB[walklang].overview
    if (step >= steps.length) { setWalkStep(-1); return }
    setWalkStep(step)
    setTyping(true)
    walkTimerRef.current = setTimeout(() => {
      setTyping(false)
      const text = steps[step]
      setMessages(prev => [...prev, { role: 'bot', text, id: Date.now() + step, lang: walklang }])
      speakText(text, walklang)
      // Wait for speech to finish before next step
      // Estimate: 300ms delay + ~60ms per character at rate 0.9
      const duration = 300 + Math.max(3500, text.length * 60)
      walkTimerRef.current = setTimeout(() => runWalkStep(step + 1, walklang), duration)
    }, 700)
  }

  // ── Voice Input ───────────────────────────────────────────────────────────
  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      addBotMessage("Voice input is not supported in this browser. Please type your question.")
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const rec = new SpeechRecognition()
    recognitionRef.current = rec
    rec.lang = VOICE_LANG[lang]
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onstart = () => setListening(true)
    rec.onresult = (e) => {
      const spoken = e.results[0][0].transcript
      setListening(false)
      sendMessage(spoken)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    rec.start()
  }

  const stopSpeaking = () => {
    stopAllSpeech()
    clearTimeout(walkTimerRef.current)
    setWalkStep(-1)
  }

  const kb = KB[lang]

  return (
    <>
      {/* Floating Toggle Button */}
      <button className={`agribot-fab ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} title="AgriBot AI Assistant">
        <span className="agribot-fab-icon">{open ? '✕' : '🌾'}</span>
        {!open && <span className="agribot-fab-badge">AI</span>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="agribot-window">
          {/* Header */}
          <div className="agribot-header">
            <div className="agribot-header-left">
              <div className={`agribot-avatar-wrap ${speaking ? 'speaking' : ''}`}>
                <div className="agribot-avatar">🤖</div>
                {speaking && (
                  <div className="agribot-wave">
                    {[1,2,3,4,5].map(i => <span key={i} className={`wave-bar bar-${i}`} />)}
                  </div>
                )}
              </div>
              <div>
                <div className="agribot-name">AgriBot</div>
                <div className="agribot-status">
                  {listening ? '🔴 Listening...' : speaking ? '🔊 Speaking...' : '🟢 Online'}
                </div>
              </div>
            </div>
            <div className="agribot-header-right">
              <div className="agribot-lang-lock">🔒 {LANG_LABELS[lang].split(' ')[1]}</div>
              <select className="agribot-lang" value={lang} onChange={e => changeLang(e.target.value)}>
                {Object.entries(LANG_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Speaking banner */}
          {speaking && (
            <div className="agribot-speaking-bar">
              <span className="speaking-dots"><span/><span/><span/></span>
              {lang === 'en' ? 'AI is speaking in English…'
                : lang === 'kn' ? 'AI ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುತ್ತಿದೆ…'
                : lang === 'hi' ? 'AI हिन्दी में बोल रहा है…'
                : 'AI తెలుగులో మాట్లాడుతోంది…'}
              <button className="stop-speak-btn" onClick={stopSpeaking}>⏹</button>
            </div>
          )}

          {/* Role Selector */}
          {!role && (
            <div className="agribot-role-bar">
              <span>{kb.rolePrompt}</span>
              <div className="agribot-role-btns">
                <button className="role-btn farmer-btn" onClick={() => setRole('farmer')}>🌱 Farmer</button>
                <button className="role-btn buyer-btn" onClick={() => setRole('buyer')}>🛒 Buyer</button>
              </div>
            </div>
          )}

          {/* Walk progress */}
          {walkStep >= 0 && (
            <div className="agribot-progress">
              <div className="progress-bar" style={{ width: `${((walkStep+1)/KB[lang].overview.length)*100}%` }} />
              <span>Step {walkStep+1} of {KB[lang].overview.length}</span>
            </div>
          )}

          {/* Messages */}
          <div className="agribot-messages">
            {messages.map((m) => (
              <div key={m.id} className={`agribot-msg ${m.role}`}>
                {m.role === 'bot' && <span className="msg-avatar">🤖</span>}
                <div className="msg-bubble-wrap">
                  <div className="msg-bubble">{m.text}</div>
                  {m.role === 'bot' && (
                    <button
                      className="msg-replay-btn"
                      onClick={() => replayMsg(m.text, m.lang)}
                      title="Replay in selected language"
                    >🔊</button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="agribot-msg bot">
                <span className="msg-avatar">🤖</span>
                <div className="msg-bubble typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Buttons */}
          <div className="agribot-quick-actions">
            <button className="quick-btn" onClick={() => sendMessage(lang==='en'?'How to sign up?':lang==='kn'?'ನೋಂದಣಿ ಹೇಗೆ':lang==='hi'?'साइन अप कैसे करें':'సైన్ అప్ ఎలా')}>📝 {lang==='en'?'Explain Login':lang==='kn'?'ಲಾಗಿನ್':lang==='hi'?'लॉगिन':'లాగిన్'}</button>
            <button className="quick-btn" onClick={() => sendMessage(lang==='en'?'Explain Marketplace':lang==='kn'?'ಮಾರುಕಟ್ಟೆ ವಿವರ':lang==='hi'?'बाज़ार समझें':'మార్కెట్‌ప్లేస్ వివరం')}>🛒 {lang==='en'?'Marketplace':lang==='kn'?'ಮಾರುಕಟ್ಟೆ':lang==='hi'?'बाज़ार':'మార్కెట్'}</button>
            <button className="quick-btn" onClick={() => sendMessage(lang==='en'?'Explain AI features':lang==='kn'?'AI ವೈಶಿಷ್ಟ್ಯಗಳು':lang==='hi'?'AI फीचर्स':'AI ఫీచర్స్')}>🔬 {lang==='en'?'AI Features':lang==='kn'?'AI':lang==='hi'?'AI':'AI'}</button>
            <button className="quick-btn" onClick={() => sendMessage(lang==='en'?'Explain Business model':lang==='kn'?'ವ್ಯಾಪಾರ ವಿವರ':lang==='hi'?'व्यापार मॉडल':'వ్యాపార నమూనా')}>💼 {lang==='en'?'Business':lang==='kn'?'ವ್ಯಾಪಾರ':lang==='hi'?'व्यापार':'వ్యాపారం'}</button>
          </div>
          {/* Suggestion Chips */}
          <div className="agribot-chips">
            {kb.suggestions.map((s, i) => (
              <button key={i} className="chip" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>

          {/* Explain Platform Button */}
          <button className="agribot-explain-btn" onClick={startWalkthrough}>
            {kb.explainBtn}
          </button>

          {/* Input Row */}
          <div className="agribot-input-row">
            <button
              className={`agribot-mic ${listening ? 'active' : ''}`}
              onClick={toggleMic}
              title={listening ? 'Stop' : 'Speak'}
            >
              {listening ? '⏹' : '🎙️'}
            </button>
            <input
              className="agribot-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            {speaking
              ? <button className="agribot-stop" onClick={stopSpeaking} title="Stop speaking">🔇</button>
              : <button className="agribot-send" onClick={() => sendMessage()} title="Send">➤</button>
            }
          </div>
        </div>
      )}
    </>
  )
}
