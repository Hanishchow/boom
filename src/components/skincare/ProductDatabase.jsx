// Indian Pharmacy Product Database - OTC, Affordable, Widely Available
export const INDIAN_PHARMACY_PRODUCTS = {
  cleansers: [
    {
      name: "Cetaphil Gentle Skin Cleanser",
      brand: "Cetaphil",
      active_ingredients: ["Glycerin", "Sodium Lauryl Sulfate (mild)"],
      suitable_for: ["dry", "sensitive", "normal", "combination"],
      addresses: ["dryness", "sensitivity"],
      price_min: 250,
      price_max: 450,
      availability: "high",
      is_generic: false
    },
    {
      name: "Simple Kind to Skin Refreshing Facial Wash",
      brand: "Simple",
      active_ingredients: ["Pro-Vitamin B5", "Vitamin E"],
      suitable_for: ["sensitive", "normal", "combination"],
      addresses: ["sensitivity", "dullness"],
      price_min: 280,
      price_max: 400,
      availability: "high",
      is_generic: false
    },
    {
      name: "Minimalist 2% Salicylic Acid Face Wash",
      brand: "Minimalist",
      active_ingredients: ["Salicylic Acid 2%", "LHA"],
      suitable_for: ["oily", "combination"],
      addresses: ["acne", "oiliness", "blackheads"],
      price_min: 299,
      price_max: 350,
      availability: "high",
      is_generic: false
    },
    {
      name: "Re'equil Oil Control Face Wash",
      brand: "Re'equil",
      active_ingredients: ["Zinc PCA", "Niacinamide"],
      suitable_for: ["oily", "combination"],
      addresses: ["oiliness", "acne"],
      price_min: 350,
      price_max: 450,
      availability: "high",
      is_generic: false
    },
    {
      name: "Ahaglow Face Wash",
      brand: "Ahaglow",
      active_ingredients: ["Glycolic Acid", "Aloe Vera"],
      suitable_for: ["normal", "combination", "oily"],
      addresses: ["dullness", "texture", "pigmentation"],
      price_min: 280,
      price_max: 380,
      availability: "high",
      is_generic: true
    },
    {
      name: "Episoft Cleansing Lotion",
      brand: "Episoft",
      active_ingredients: ["Oat Extract", "Glycerin"],
      suitable_for: ["dry", "sensitive"],
      addresses: ["dryness", "sensitivity"],
      price_min: 200,
      price_max: 300,
      availability: "high",
      is_generic: true
    }
  ],
  moisturizers: [
    {
      name: "Cetaphil Moisturizing Lotion",
      brand: "Cetaphil",
      active_ingredients: ["Glycerin", "Sweet Almond Oil"],
      suitable_for: ["dry", "sensitive", "normal"],
      addresses: ["dryness", "sensitivity"],
      price_min: 300,
      price_max: 500,
      availability: "high",
      is_generic: false
    },
    {
      name: "Minimalist Sepicalm 3% + Oat Moisturizer",
      brand: "Minimalist",
      active_ingredients: ["Sepicalm 3%", "Oat Extract", "Squalane"],
      suitable_for: ["sensitive", "dry", "normal"],
      addresses: ["sensitivity", "redness", "dryness"],
      price_min: 349,
      price_max: 450,
      availability: "high",
      is_generic: false
    },
    {
      name: "Re'equil Ceramide & Hyaluronic Acid Moisturizer",
      brand: "Re'equil",
      active_ingredients: ["Ceramides", "Hyaluronic Acid"],
      suitable_for: ["dry", "sensitive", "normal"],
      addresses: ["dryness", "barrier repair"],
      price_min: 550,
      price_max: 700,
      availability: "high",
      is_generic: false
    },
    {
      name: "Venusia Max Intensive Moisturizing Cream",
      brand: "Venusia",
      active_ingredients: ["Ceramides", "Shea Butter"],
      suitable_for: ["dry", "sensitive"],
      addresses: ["extreme dryness", "eczema-prone"],
      price_min: 350,
      price_max: 500,
      availability: "high",
      is_generic: true
    },
    {
      name: "Sebamed Clear Face Gel",
      brand: "Sebamed",
      active_ingredients: ["Hyaluronic Acid", "Aloe Vera"],
      suitable_for: ["oily", "combination", "acne-prone"],
      addresses: ["oiliness", "acne"],
      price_min: 400,
      price_max: 550,
      availability: "high",
      is_generic: false
    },
    {
      name: "Physiogel AI Cream",
      brand: "Physiogel",
      active_ingredients: ["BioMimic Technology", "Squalane"],
      suitable_for: ["sensitive", "dry"],
      addresses: ["sensitivity", "redness", "irritation"],
      price_min: 500,
      price_max: 700,
      availability: "high",
      is_generic: false
    }
  ],
  sunscreens: [
    {
      name: "La Shield Fisico SPF 50",
      brand: "La Shield",
      active_ingredients: ["Zinc Oxide", "Titanium Dioxide"],
      suitable_for: ["sensitive", "dry", "normal", "combination", "oily"],
      addresses: ["sun protection", "sensitivity"],
      price_min: 500,
      price_max: 650,
      availability: "high",
      is_generic: false
    },
    {
      name: "Episoft AC SPF 30",
      brand: "Episoft",
      active_ingredients: ["Zinc Oxide", "Silicones"],
      suitable_for: ["oily", "acne-prone", "combination"],
      addresses: ["sun protection", "oiliness"],
      price_min: 350,
      price_max: 450,
      availability: "high",
      is_generic: true
    },
    {
      name: "Re'equil Ultra Matte Dry Touch Sunscreen SPF 50",
      brand: "Re'equil",
      active_ingredients: ["Chemical filters", "Silica"],
      suitable_for: ["oily", "combination"],
      addresses: ["sun protection", "oiliness"],
      price_min: 450,
      price_max: 550,
      availability: "high",
      is_generic: false
    },
    {
      name: "Minimalist SPF 50 Sunscreen",
      brand: "Minimalist",
      active_ingredients: ["Multi-Vitamin", "Chemical filters"],
      suitable_for: ["normal", "combination", "oily"],
      addresses: ["sun protection", "antioxidant"],
      price_min: 399,
      price_max: 499,
      availability: "high",
      is_generic: false
    },
    {
      name: "Ipca Acne UV Gel SPF 30",
      brand: "Ipca",
      active_ingredients: ["Zinc Oxide", "Niacinamide"],
      suitable_for: ["oily", "acne-prone"],
      addresses: ["sun protection", "acne"],
      price_min: 300,
      price_max: 400,
      availability: "high",
      is_generic: true
    },
    {
      name: "Photostable Gold SPF 55",
      brand: "Photostable",
      active_ingredients: ["Avobenzone", "Octocrylene"],
      suitable_for: ["normal", "combination", "dry"],
      addresses: ["sun protection", "hydration"],
      price_min: 450,
      price_max: 600,
      availability: "high",
      is_generic: true
    }
  ],
  serums: [
    {
      name: "Minimalist 10% Niacinamide Serum",
      brand: "Minimalist",
      active_ingredients: ["Niacinamide 10%", "Zinc"],
      suitable_for: ["oily", "combination", "normal"],
      addresses: ["oiliness", "pores", "acne", "pigmentation"],
      price_min: 349,
      price_max: 450,
      availability: "high",
      is_generic: false
    },
    {
      name: "Minimalist 2% Alpha Arbutin Serum",
      brand: "Minimalist",
      active_ingredients: ["Alpha Arbutin 2%", "Hyaluronic Acid"],
      suitable_for: ["all"],
      addresses: ["pigmentation", "dark spots", "uneven tone"],
      price_min: 399,
      price_max: 500,
      availability: "high",
      is_generic: false
    },
    {
      name: "Minimalist Vitamin C 10% Serum",
      brand: "Minimalist",
      active_ingredients: ["Ethyl Ascorbic Acid 10%"],
      suitable_for: ["normal", "combination", "dry"],
      addresses: ["dullness", "pigmentation", "aging"],
      price_min: 449,
      price_max: 550,
      availability: "high",
      is_generic: false
    },
    {
      name: "Re'equil Glow Boosting Serum",
      brand: "Re'equil",
      active_ingredients: ["Vitamin C", "Ferulic Acid"],
      suitable_for: ["normal", "dry", "combination"],
      addresses: ["dullness", "aging", "pigmentation"],
      price_min: 650,
      price_max: 800,
      availability: "high",
      is_generic: false
    },
    {
      name: "Minimalist 0.3% Retinol Serum",
      brand: "Minimalist",
      active_ingredients: ["Retinol 0.3%", "Squalane"],
      suitable_for: ["normal", "combination"],
      addresses: ["aging", "texture", "fine lines"],
      price_min: 499,
      price_max: 600,
      availability: "high",
      is_generic: false
    },
    {
      name: "Minimalist 2% Hyaluronic Acid Serum",
      brand: "Minimalist",
      active_ingredients: ["Hyaluronic Acid 2%", "B5"],
      suitable_for: ["all"],
      addresses: ["dryness", "dehydration", "plumping"],
      price_min: 349,
      price_max: 450,
      availability: "high",
      is_generic: false
    }
  ],
  exfoliators: [
    {
      name: "Minimalist 25% AHA + 2% BHA Peeling Solution",
      brand: "Minimalist",
      active_ingredients: ["AHA 25%", "BHA 2%"],
      suitable_for: ["normal", "oily", "combination"],
      addresses: ["texture", "pigmentation", "acne marks"],
      price_min: 499,
      price_max: 600,
      availability: "high",
      is_generic: false
    },
    {
      name: "Re'equil AHA 12% + BHA 2% Exfoliating Serum",
      brand: "Re'equil",
      active_ingredients: ["AHA 12%", "BHA 2%"],
      suitable_for: ["normal", "oily", "combination"],
      addresses: ["texture", "acne", "pigmentation"],
      price_min: 550,
      price_max: 700,
      availability: "high",
      is_generic: false
    },
    {
      name: "Glyco 6 Glycolic Acid Cream",
      brand: "Glyco",
      active_ingredients: ["Glycolic Acid 6%"],
      suitable_for: ["normal", "oily", "combination"],
      addresses: ["texture", "dullness", "mild pigmentation"],
      price_min: 200,
      price_max: 300,
      availability: "high",
      is_generic: true
    }
  ],
  spot_treatments: [
    {
      name: "Clindamycin Nicotinamide Gel",
      brand: "Generic",
      active_ingredients: ["Clindamycin 1%", "Nicotinamide 4%"],
      suitable_for: ["oily", "acne-prone"],
      addresses: ["acne", "pimples"],
      price_min: 100,
      price_max: 180,
      availability: "high",
      is_generic: true
    },
    {
      name: "Benzoyl Peroxide 2.5% Gel",
      brand: "Generic",
      active_ingredients: ["Benzoyl Peroxide 2.5%"],
      suitable_for: ["oily", "acne-prone"],
      addresses: ["acne", "bacteria"],
      price_min: 80,
      price_max: 150,
      availability: "high",
      is_generic: true
    },
    {
      name: "Kojivit Gel",
      brand: "Kojivit",
      active_ingredients: ["Kojic Acid", "Arbutin", "Vitamin C"],
      suitable_for: ["all"],
      addresses: ["pigmentation", "dark spots"],
      price_min: 250,
      price_max: 350,
      availability: "high",
      is_generic: true
    }
  ],
  toners: [
    {
      name: "Minimalist PHA 3% Toner",
      brand: "Minimalist",
      active_ingredients: ["PHA 3%", "Multi-Ceramide"],
      suitable_for: ["sensitive", "dry", "normal"],
      addresses: ["sensitivity", "texture", "hydration"],
      price_min: 299,
      price_max: 399,
      availability: "high",
      is_generic: false
    },
    {
      name: "Re'equil Pore Refining Toner",
      brand: "Re'equil",
      active_ingredients: ["Niacinamide", "Willow Bark"],
      suitable_for: ["oily", "combination"],
      addresses: ["pores", "oiliness"],
      price_min: 350,
      price_max: 450,
      availability: "high",
      is_generic: false
    }
  ],
  lip_balm: [
    {
      name: "Vaseline Lip Therapy",
      brand: "Vaseline",
      active_ingredients: ["Petroleum Jelly", "Cocoa Butter"],
      suitable_for: ["all"],
      addresses: ["dry lips", "chapped lips"],
      price_min: 100,
      price_max: 200,
      availability: "high",
      is_generic: false
    },
    {
      name: "Boroline Lip Balm",
      brand: "Boroline",
      active_ingredients: ["Boric Acid", "Lanolin"],
      suitable_for: ["all"],
      addresses: ["dry lips", "cracked lips"],
      price_min: 50,
      price_max: 100,
      availability: "high",
      is_generic: true
    }
  ]
};

// Ingredient conflict rules
export const INGREDIENT_CONFLICTS = [
  {
    ingredient1: "Retinol",
    ingredient2: "Benzoyl Peroxide",
    reason: "Can cause excessive irritation and reduce efficacy of both"
  },
  {
    ingredient1: "Retinol",
    ingredient2: "Vitamin C",
    reason: "Different pH requirements - use at different times (Vit C morning, Retinol evening)"
  },
  {
    ingredient1: "Retinol",
    ingredient2: "AHA",
    reason: "Over-exfoliation risk - do not use on same day"
  },
  {
    ingredient1: "Retinol",
    ingredient2: "BHA",
    reason: "Over-exfoliation risk - do not use on same day"
  },
  {
    ingredient1: "Niacinamide",
    ingredient2: "Vitamin C",
    reason: "May reduce efficacy if used together - apply separately with gap"
  },
  {
    ingredient1: "AHA",
    ingredient2: "BHA",
    reason: "Combined use can be too harsh for sensitive skin - alternate days"
  }
];

// Climate-based adjustments
export const CLIMATE_ADJUSTMENTS = {
  hot_humid: {
    prefer: ["lightweight", "gel", "oil-free", "mattifying"],
    avoid: ["heavy creams", "oil-based"],
    spf_importance: "critical"
  },
  hot_dry: {
    prefer: ["hydrating", "ceramides", "hyaluronic acid"],
    avoid: ["alcohol-based", "over-exfoliation"],
    spf_importance: "critical"
  },
  cold_dry: {
    prefer: ["rich moisturizers", "oils", "occlusives"],
    avoid: ["foam cleansers", "harsh exfoliants"],
    spf_importance: "moderate"
  },
  moderate: {
    prefer: ["balanced formulas"],
    avoid: [],
    spf_importance: "high"
  },
  polluted: {
    prefer: ["antioxidants", "barrier repair", "double cleansing"],
    avoid: [],
    additional: "Focus on PM routine cleansing"
  }
};

// Budget multipliers
export const BUDGET_FILTERS = {
  budget: { max_price: 400, prefer_generic: true },
  "mid-range": { max_price: 700, prefer_generic: false },
  premium: { max_price: 1500, prefer_generic: false }
};

export default INDIAN_PHARMACY_PRODUCTS;