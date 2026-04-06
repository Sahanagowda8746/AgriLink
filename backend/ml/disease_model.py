"""
Disease Detection using image analysis.
Simulates a CNN-based classifier with color and texture heuristics.

STRICT PLANT-ONLY MODE:
  - Only real plant leaf / crop images are processed.
  - If ANY doubt about whether the image shows a real leaf → REJECT immediately.
  - Confidence threshold: 70%. Below that, the image is treated as invalid.
  - Never give disease output for non-leaf images.

In a production system, replace with a trained TensorFlow/PyTorch model.
"""
from PIL import Image, ImageStat, ImageFilter
import io
import random


DISEASES = [
    {
        'name': 'Healthy',
        'cause': 'No disease detected. The plant is receiving adequate nutrients and care.',
        'description': 'Your crop appears healthy with vibrant green coloration and no visible signs of infection or stress.',
        'treatment': 'No treatment needed. Maintain proper irrigation, balanced fertilization, and regular monitoring for early signs of disease.',
        'severity': 'None',
        'visual_clues': 'Uniform green color, no spots or discoloration',
        'confidence': None
    },
    {
        'name': 'Leaf Blight',
        'cause': 'Caused by fungal pathogens (Alternaria, Helminthosporium) often triggered by humid conditions and poor air circulation.',
        'description': 'Leaf blight presents as brown, water-soaked lesions that expand rapidly across the leaf surface, leading to premature defoliation.',
        'treatment': 'Apply copper-based or mancozeb fungicide every 7–10 days. Remove and destroy infected leaves immediately. Improve air circulation between plants. Avoid wetting foliage during irrigation.',
        'severity': 'Moderate',
        'visual_clues': 'Brown/tan lesions with dark borders, irregular shape',
        'confidence': None
    },
    {
        'name': 'Powdery Mildew',
        'cause': 'Caused by obligate fungal parasites (Erysiphe, Podosphaera). Thrives in warm, dry days with cool humid nights.',
        'description': 'Powdery mildew forms a white to grey powdery coating on leaf surfaces, stems, and buds. Affected tissue eventually yellows and dies.',
        'treatment': 'Apply sulfur-based fungicide or neem oil spray every 7 days. Reduce humidity around plants. Prune overcrowded areas for better airflow. Use potassium bicarbonate as an organic alternative.',
        'severity': 'Mild',
        'visual_clues': 'White or grey powdery patches on upper leaf surface',
        'confidence': None
    },
    {
        'name': 'Leaf Rust',
        'cause': 'Caused by Puccinia fungal species. Spread through wind-borne spores, favored by moderate temperatures and high humidity.',
        'description': 'Rust fungus produces distinctive orange-brown to reddish pustules (uredinia) on leaf undersides, causing chlorosis and early leaf drop.',
        'treatment': 'Apply triazole or strobilurin fungicide at first sign of infection. Rotate crops each season. Plant resistant varieties. Destroy crop debris after harvest to break the disease cycle.',
        'severity': 'Severe',
        'visual_clues': 'Orange-brown pustules on leaf undersides, yellowing around lesions',
        'confidence': None
    },
    {
        'name': 'Bacterial Spot',
        'cause': 'Caused by Xanthomonas bacteria. Spreads through rain splash, contaminated tools, and infected seeds.',
        'description': 'Bacterial spot creates small, dark, water-soaked lesions surrounded by yellow halos. Spots may merge, causing large necrotic areas and fruit blemishes.',
        'treatment': 'Apply copper-based bactericide. Avoid overhead irrigation to prevent water splash. Remove and dispose of infected plant tissue. Treat seeds with hot water before planting (50°C for 25 minutes).',
        'severity': 'Moderate',
        'visual_clues': 'Small dark spots with yellow halos, water-soaked appearance',
        'confidence': None
    },
    {
        'name': 'Nutrient Deficiency',
        'cause': 'Deficiency of key macronutrients (Nitrogen, Iron, Magnesium) due to poor soil fertility, incorrect pH, or over-watering leaching nutrients.',
        'description': 'Yellowing of leaves (chlorosis) starting from older leaves (N deficiency) or young leaves (Fe/Mg deficiency). Interveinal yellowing is a common pattern.',
        'treatment': 'Conduct a soil test to identify specific deficient nutrients. Apply appropriate fertilizer (NPK blend or micronutrient mix). Adjust soil pH to 6.0–7.0. Use foliar spray of diluted micronutrients for quick recovery.',
        'severity': 'Mild',
        'visual_clues': 'Yellowing leaves, interveinal chlorosis, stunted growth',
        'confidence': None
    },
    {
        'name': 'Pest Damage',
        'cause': 'Caused by chewing insects (caterpillars, beetles, leaf miners) or sucking pests (aphids, whiteflies, spider mites).',
        'description': 'Irregular holes, tunnels, or skeletonized areas on leaves. May also show as distorted or curled foliage, silvery streaks, or visible frass from insects.',
        'treatment': 'Identify the pest type first. For chewing insects, apply neem oil or pyrethrin spray. For sucking pests, use insecticidal soap solution. Introduce natural predators (ladybirds, lacewings). Inspect plants weekly.',
        'severity': 'Moderate',
        'visual_clues': 'Holes in leaves, chewed edges, silvery streaks, visible insects',
        'confidence': None
    }
]


# ---------------------------------------------------------------------------
# STRICT INVALID RESPONSE (single authoritative message for all non-leaf images)
# ---------------------------------------------------------------------------
_INVALID_MSG = (
    'This is not a valid plant leaf image. '
    'Please upload a clear image of a crop or leaf for disease detection.'
)
_UNCLEAR_MSG = (
    'Image is unclear. Please upload a clear close-up leaf image.'
)

# Minimum confidence required to proceed to disease detection
_MIN_CONFIDENCE = 70.0


def validate_is_plant_image(img, stat):
    """
    STRICT validator: image must POSITIVELY prove it contains a real plant leaf.
    Any doubt → reject immediately. Fail-safe by design.

    Returns:
        (is_plant: bool, reason: str, plant_confidence: float)
    """
    r_mean, g_mean, b_mean = stat.mean
    r_std, g_std, b_std = stat.stddev

    brightness = (r_mean + g_mean + b_mean) / 3
    avg_std    = (r_std + g_std + b_std) / 3

    # ── HARD REJECT TESTS (any match → immediately invalid) ──────────────────

    # 1. Blurry, blank, or near-uniform image (paper, plain background, fogged lens)
    if avg_std < 12:
        return False, 'unclear', 0.0

    # 2. Too dark (covered lens, night shot, phone screen off)
    if brightness < 30:
        return False, 'unclear', 0.0

    # 3. Overexposed / white background / blank paper
    if brightness > 235 and avg_std < 22:
        return False, 'unclear', 0.0

    # 4. Human skin tones (selfie, hand, face)
    #    Skin: R strongly > G > B, warm tones, relatively smooth
    if (r_mean > 150 and g_mean > 90 and b_mean < 140
            and r_mean - b_mean > 55 and g_mean - b_mean > 20
            and avg_std < 55):
        return False, 'non_plant', 0.0

    # 5. Blue dominant (phone screen, sky, water body)
    if b_mean > r_mean + 25 and b_mean > g_mean + 25 and b_mean > 130:
        return False, 'non_plant', 0.0

    # 6. Near-grey / achromatic (phone body, book cover, concrete, metal)
    if (abs(r_mean - g_mean) < 12 and abs(g_mean - b_mean) < 12
            and abs(r_mean - b_mean) < 12 and avg_std < 40):
        return False, 'non_plant', 0.0

    # 7. Very saturated red (red object, book cover, brick wall) without green
    if r_mean > 160 and g_mean < 90 and b_mean < 90:
        return False, 'non_plant', 0.0

    # 8. Pure / heavily saturated purple or pink (flowers skipped intentionally
    #    but non-botanical purple backgrounds are caught here)
    if b_mean > 140 and r_mean > 130 and g_mean < 100:
        return False, 'non_plant', 0.0

    # ── POSITIVE LEAF EVIDENCE (image must pass at least one) ────────────────
    green_dominance = g_mean - max(r_mean, b_mean)

    # Healthy leaf: clearly green-dominant
    strong_green   = green_dominance > 10 and g_mean > 80

    # Yellowing leaf (nutrient deficiency / early disease)
    yellow_leaf    = (r_mean > 130 and g_mean > 120 and b_mean < 100
                      and abs(r_mean - g_mean) < 55 and brightness < 210)

    # Brown / withered leaf (blight, rust, drought stress)
    brown_leaf     = (r_mean > 90 and g_mean < r_mean - 5
                      and b_mean < g_mean - 5 and brightness < 170
                      and avg_std > 15)

    # Mixed / textured green-brown (partially diseased leaf)
    textured_plant = (g_mean > 70 and avg_std > 25 and brightness < 195
                      and green_dominance > 0)

    has_positive_evidence = strong_green or yellow_leaf or brown_leaf or textured_plant

    if not has_positive_evidence:
        # No positive leaf evidence found → reject (fail-safe)
        return False, 'non_plant', 0.0

    # ── CONFIDENCE SCORE ─────────────────────────────────────────────────────
    # Built from: how green-dominant the image is + how much texture it has
    base = 55.0
    base += max(green_dominance * 1.8, 0)   # strong green → higher confidence
    base += avg_std * 0.35                   # texture richness
    if yellow_leaf:  base += 5
    if brown_leaf:   base += 4
    confidence_score = min(96.0, base)

    return True, 'valid', round(confidence_score, 1)


def analyze_image(image_bytes):
    """
    STRICT plant-only disease detection pipeline.

    Step 1 — Validate: image must prove it is a real leaf (fail-safe: doubt → reject).
    Step 2 — Confidence gate: < 70% → rejected as unclear.
    Step 3 — Disease heuristics: color/texture patterns → specific disease.
    Step 4 — Return enriched result with cause, treatment, tip.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))

        stat = ImageStat.Stat(img)
        r_mean, g_mean, b_mean = stat.mean
        r_std, g_std, b_std = stat.stddev

        # --- Step 1: Validate the image is a plant/crop ---
        is_plant, reason, val_confidence = validate_is_plant_image(img, stat)

        if not is_plant:
            # reason is 'unclear' or 'non_plant' — both use strict rejection
            msg = _UNCLEAR_MSG if reason == 'unclear' else _INVALID_MSG
            return {'valid': False, 'type': 'invalid_image', 'message': msg}

        # --- Step 2: Compute disease heuristics ---
        green_dominance = g_mean - max(r_mean, b_mean)
        brightness = (r_mean + g_mean + b_mean) / 3
        color_variance = (r_std + g_std + b_std) / 3

        # Yellow-tone indicator: high R+G, low B  → nutrient deficiency
        yellow_score = (r_mean + g_mean) / 2 - b_mean

        # White/grey-bright indicator: high brightness, high variance → powdery mildew
        mildew_score = brightness - 100 + color_variance

        # Orange-red dominant → rust
        rust_score = r_mean - g_mean - b_mean * 0.3

        # Dark & low-green → bacterial spot
        spot_score = (80 - brightness) + (90 - g_mean) * 0.5

        # Irregular dark patches → pest damage
        pest_score = r_std * 0.4 + g_std * 0.4 + (100 - brightness) * 0.2

        if green_dominance > 20 and brightness > 90:
            disease_idx = 0          # Healthy
            confidence = min(96, 78 + green_dominance * 0.4)

        elif yellow_score > 60 and b_mean < 110:
            disease_idx = 5          # Nutrient Deficiency (yellow leaves)
            confidence = min(91, 62 + yellow_score * 0.3)

        elif mildew_score > 80 and brightness > 140 and g_mean > 120:
            disease_idx = 2          # Powdery Mildew (bright, whitish)
            confidence = min(90, 58 + color_variance * 0.45)

        elif rust_score > 30 and r_mean > g_mean + 15 and b_mean < 120:
            disease_idx = 3          # Leaf Rust (orange-red tones)
            confidence = min(93, 63 + rust_score * 0.35)

        elif spot_score > 30 and brightness < 85:
            disease_idx = 4          # Bacterial Spot (dark, low green)
            confidence = min(88, 54 + spot_score * 0.4)

        elif pest_score > 30 and color_variance > 30:
            disease_idx = 6          # Pest Damage (irregular texture)
            confidence = min(87, 52 + pest_score * 0.35)

        elif green_dominance > 5:
            disease_idx = 1          # Leaf Blight (default non-healthy green)
            confidence = min(85, 50 + abs(green_dominance) * 0.4 + 15)

        else:
            disease_idx = 1          # Fallback
            confidence = min(70, 40 + color_variance * 0.3)

        confidence = round(confidence, 1)

        # --- Step 3: Strict confidence guard (70% threshold) ---
        if confidence < _MIN_CONFIDENCE:
            return {
                'valid': False,
                'type': 'low_confidence',
                'message': _UNCLEAR_MSG
            }

        # --- Step 4: Build enriched result ---
        result = DISEASES[disease_idx].copy()
        result['valid'] = True
        result['confidence'] = confidence

        # Alternatives from remaining diseases
        others = [i for i in range(len(DISEASES)) if i != disease_idx]
        random.shuffle(others)
        remaining = round(100 - confidence, 1)
        alternatives = []
        for idx in others[:3]:
            share = round(remaining / 3, 1)
            alternatives.append({
                'name': DISEASES[idx]['name'],
                'probability': share
            })
        result['alternatives'] = alternatives

        # Guidance tip
        result['user_tip'] = (
            'For best accuracy, take a close-up photo of a single affected leaf in bright natural light, '
            'ensuring the leaf fills most of the frame with no heavy shadows.'
        )

        return result

    except Exception as e:
        return {
            'valid': False,
            'type': 'invalid_image',
            'message': f'Could not process the image ({str(e)}). Please upload a valid plant image.'
        }
