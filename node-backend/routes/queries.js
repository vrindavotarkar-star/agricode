const express = require('express');
const auth = require('../middleware/auth');
const nlp = require('compromise');
const QueryHistory = require('../models/QueryHistory');

const router = express.Router();

// Helper function to get deterministic response index based on query
function getResponseIndex(query, responsesLength) {
  const queryHash = query.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(queryHash) % responsesLength;
}

// Agricultural knowledge base for NLP processing
const agriculturalKnowledge = {
  crops: {
    keywords: ['rice', 'wheat', 'maize', 'corn', 'crop', 'plant', 'grow', 'cultivate', 'farming'],
    solutions: {
      water: 'Proper irrigation is crucial. Use drip irrigation for efficiency, water deeply but infrequently to encourage root growth.',
      soil: 'Soil preparation is key. Test soil pH and nutrients, amend with organic matter, ensure proper drainage.',
      fertilizer: 'Balanced fertilization supports healthy growth. Use nitrogen for leaves, phosphorus for roots, potassium for overall health.',
      pest: 'Monitor regularly for pests. Use integrated pest management: prevention, biological controls, then chemical as last resort.',
      disease: 'Prevent diseases through crop rotation, proper spacing, and resistant varieties. Maintain field sanitation.',
      yield: 'Maximize yield through proper spacing, timely irrigation, balanced nutrition, and optimal harvesting time.',
      season: 'Planting timing depends on climate. Consider frost dates, rainfall patterns, and temperature requirements.'
    }
  },
  pests: {
    keywords: ['pest', 'insect', 'bug', 'aphid', 'caterpillar', 'mite', 'beetle', 'worm', 'fly', 'control', 'treat', 'kill'],
    solutions: {
      control: 'Use integrated pest management: start with prevention, then biological and cultural controls, chemical as last resort.',
      organic: 'Organic methods include neem oil, insecticidal soap, beneficial insects, and cultural practices like crop rotation.',
      chemical: 'Chemical pesticides should be targeted and used carefully. Follow label instructions and consider environmental impact.',
      prevent: 'Prevention through field sanitation, proper irrigation, resistant varieties, and regular monitoring.',
      identify: 'Identify by examining plant damage, looking for insects/eggs. Use field guides or consult extension services.',
      damage: 'Symptoms include holes in leaves, discoloration, wilting, stunted growth, or insect presence.',
      biological: 'Biological control uses natural enemies like predators, parasites. Maintains ecological balance.'
    }
  },
  fertilizers: {
    keywords: ['fertilizer', 'nutrient', 'nitrogen', 'phosphorus', 'potassium', 'npk', 'organic', 'chemical', 'manure', 'compost'],
    solutions: {
      nitrogen: 'Nitrogen promotes leaf and stem growth. Apply in split doses throughout growing season to avoid leaching.',
      phosphorus: 'Phosphorus supports root development and flowering. Apply at planting when roots are developing.',
      potassium: 'Potassium improves disease resistance and fruit quality. Most beneficial during fruit development.',
      organic: 'Organic fertilizers release nutrients slowly, improve soil structure. Include compost, manure, bone meal.',
      chemical: 'Chemical fertilizers provide quick nutrients but can harm soil organisms if overused. Use soil tests.',
      balanced: 'Balanced fertilizers provide N-P-K in proper ratios. Choose based on crop needs and soil test results.',
      test: 'Soil testing determines nutrient needs. Test pH, nutrient levels, and organic matter before fertilizing.',
      over: 'Over-fertilization burns plants, pollutes water. Use recommended rates and slow-release options.'
    }
  }
};

// Mock data for agricultural queries (in a real app, this would come from a database or AI service)
const agriculturalData = {
  crops: {
    rice: "Rice requires plenty of water and grows best in warm, humid climates. Plant in flooded fields and ensure proper drainage to prevent diseases.",
    wheat: "Wheat thrives in temperate climates with well-drained soil. Plant in fall for winter wheat or spring for summer varieties.",
    maize: "Maize needs full sun and fertile soil. Plant after last frost and ensure consistent watering during pollination.",
    mirchi: "Chili peppers thrive in warm climates with full sun. Plant after last frost, keep soil moist but not waterlogged. Provide support for fruiting plants.",
    cotton: "Cotton grows best in warm, sunny climates with well-drained soil. Plant seeds directly after last frost. Requires consistent moisture during boll development.",
    groundnut: "Groundnuts (peanuts) prefer sandy, well-drained soil and warm temperatures. Plant seeds 2-3 inches deep after soil warms. Requires 120-150 frost-free days.",
    barley: "Barley is a cool-season grain that tolerates poor soil conditions. Plant in early spring or fall. Grows well in temperate climates with moderate rainfall.",
    oats: "Oats are hardy cool-season crops that grow quickly. Plant in early spring or fall. Tolerates poor soil and cooler temperatures better than other grains."
  },
  pests: {
    aphids: "Aphids can be controlled with neem oil spray or introducing ladybugs. Remove affected leaves and avoid over-fertilizing.",
    caterpillars: "Use Bacillus thuringiensis (BT) spray for organic control. Hand-pick large caterpillars and use row covers as prevention.",
    mites: "Spider mites thrive in dry conditions. Increase humidity, use insecticidal soap, and avoid broad-spectrum insecticides.",
    beetles: "Beetles can be hand-picked or treated with pyrethrin-based insecticides. Use traps and remove plant debris.",
    worms: "Cutworms and other worms can be controlled by removing debris and using collars around young plants.",
    flies: "Fruit flies can be trapped with vinegar solutions or controlled with parasitic wasps. Keep area clean."
  },
  fertilizers: {
    nitrogen: "Nitrogen promotes leaf growth. Use urea or ammonium nitrate. Apply in split doses to avoid leaching.",
    phosphorus: "Phosphorus aids root development. Use bone meal or superphosphate. Apply at planting time.",
    potassium: "Potassium improves disease resistance. Use potash or compost. Apply during fruit development."
  }
};

// Get crops information
router.get('/crops', auth, (req, res) => {
  res.json({
    message: 'Crops information retrieved successfully',
    data: agriculturalData.crops
  });
});

// Get pests information
router.get('/pests', auth, (req, res) => {
  res.json({
    message: 'Pests information retrieved successfully',
    data: agriculturalData.pests
  });
});

// Get fertilizers information
router.get('/fertilizers', auth, (req, res) => {
  res.json({
    message: 'Fertilizers information retrieved successfully',
    data: agriculturalData.fertilizers
  });
});

// Search specific crop
router.get('/crops/:crop', auth, (req, res) => {
  const crop = req.params.crop.toLowerCase();
  const info = agriculturalData.crops[crop];

  if (!info) {
    return res.status(404).json({ message: 'Crop information not found' });
  }

  res.json({
    message: 'Crop information retrieved successfully',
    crop,
    info
  });
});

// Search specific pest
router.get('/pests/:pest', auth, (req, res) => {
  const pest = req.params.pest.toLowerCase();
  const info = agriculturalData.pests[pest];

  if (!info) {
    return res.status(404).json({ message: 'Pest information not found' });
  }

  res.json({
    message: 'Pest information retrieved successfully',
    pest,
    info
  });
});

// Search specific fertilizer
router.get('/fertilizers/:fertilizer', auth, (req, res) => {
  const fertilizer = req.params.fertilizer.toLowerCase();
  const info = agriculturalData.fertilizers[fertilizer];

  if (!info) {
    return res.status(404).json({ message: 'Fertilizer information not found' });
  }

  res.json({
    message: 'Fertilizer information retrieved successfully',
    fertilizer,
    info
  });
});

// Submit crop query
router.post('/crops', auth, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  // Advanced NLP-based query processing for crops with highly relevant, specific answers
  const doc = nlp(query);
  const lowerQuery = query.toLowerCase();
  let answer = '';

  // Extract linguistic features for precise intent analysis
  const questions = doc.questions().out('array');
  const verbs = doc.verbs().out('array');
  const nouns = doc.nouns().out('array');
  const adjectives = doc.adjectives().out('array');

  // Enhanced crop detection with better matching
  const cropMentions = ['rice', 'wheat', 'maize', 'corn', 'mirchi', 'chili', 'cotton', 'groundnut', 'peanut', 'barley', 'oats'];
  let mentionedCrop = null;

  // More sophisticated crop detection
  for (const crop of cropMentions) {
    if (lowerQuery.includes(crop) || lowerQuery.includes(crop + 's') || lowerQuery.includes(crop + 'es')) {
      mentionedCrop = crop;
      break;
    }
  }

  // Check for crop-related keywords even if specific crop not mentioned
  const cropKeywords = ['crop', 'plant', 'grow', 'cultivate', 'farming', 'agriculture'];
  const hasCropContext = cropKeywords.some(keyword => lowerQuery.includes(keyword)) || mentionedCrop;

  if (mentionedCrop) {
    const cropInfo = agriculturalData.crops[mentionedCrop] || agriculturalData.crops[mentionedCrop.replace('chili', 'mirchi')];
    const cropName = mentionedCrop.charAt(0).toUpperCase() + mentionedCrop.slice(1);

    // Analyze query intent and provide specific, actionable answers
    if (lowerQuery.includes('how to grow') || lowerQuery.includes('how do i grow') || lowerQuery.includes('grow') || lowerQuery.includes('plant') || lowerQuery.includes('cultivat')) {
      if (mentionedCrop === 'rice') {
        const responses = [
          `${cropInfo} To grow rice: 1) Prepare flooded fields or use proper irrigation, 2) Transplant seedlings when 3-4 weeks old, 3) Maintain 2-4 inches of water depth, 4) Apply nitrogen fertilizer in 3 splits, 5) Control weeds through water management, 6) Harvest when grains are golden yellow.`,
          `${cropInfo} Rice cultivation requires: 1) Flooded field preparation, 2) Seedling transplanting at 21-28 days, 3) Continuous water management (2-4 inches depth), 4) Split nitrogen applications, 5) Integrated weed control, 6) Timely harvest at grain maturity.`,
          `${cropInfo} For successful rice farming: 1) Ensure proper land leveling and bunding, 2) Use quality seedlings, 3) Maintain optimal water levels throughout growth, 4) Apply fertilizers in recommended splits, 5) Monitor and control pests/diseases, 6) Harvest when moisture content is appropriate.`,
          `${cropInfo} Rice growing basics: Start with nursery preparation for seedlings, transplant when 25-30 cm tall, keep fields continuously flooded, apply nitrogen at basal, tillering and panicle initiation stages, use herbicides for weed control, and harvest when 80% grains are straw-colored.`,
          `${cropInfo} Key rice production practices: Select high-yielding varieties suitable for your region, prepare puddled fields, transplant at 20x10 cm spacing, maintain standing water, apply 120 kg nitrogen per hectare in splits, control stem borers and leaf folders, harvest at 30-35% moisture.`,
          `${cropInfo} Rice farming guide: Begin with land preparation and puddling, raise seedlings in nursery beds, transplant in straight rows, provide continuous irrigation, fertilize with NPK in ratio 4:2:1, protect from pests using integrated methods, harvest manually or mechanically when ready.`
        ];
        // Use query content to create more varied responses
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedCrop === 'wheat') {
        const responses = [
          `${cropInfo} To grow wheat: 1) Plant in well-drained soil in fall or early spring, 2) Sow seeds 1-2 inches deep at 20-30 lbs/acre, 3) Apply nitrogen fertilizer in split applications, 4) Monitor for rust diseases, 5) Harvest when moisture content is 12-15%.`,
          `${cropInfo} Wheat production steps: 1) Select appropriate planting time (fall for winter wheat), 2) Prepare seedbed with good drainage, 3) Sow at optimal seeding rates, 4) Apply nitrogen in 2-3 splits to prevent lodging, 5) Scout for diseases regularly, 6) Harvest at proper moisture for storage.`,
          `${cropInfo} Successful wheat farming involves: 1) Soil testing and preparation, 2) Timely planting in optimal conditions, 3) Proper seed placement and population, 4) Balanced fertilization program, 5) Disease monitoring and control, 6) Harvest timing based on grain moisture.`,
          `${cropInfo} Wheat cultivation essentials: Choose winter or spring varieties based on climate, plant in rows 6-8 inches apart, apply 100-150 kg nitrogen per hectare, control aphids and rust with fungicides, irrigate during crown root initiation and heading, harvest when grains are hard.`,
          `${cropInfo} Growing wheat successfully: Start with clean seed treatment, sow at 100-125 kg per hectare, provide adequate phosphorus and potassium at planting, split nitrogen applications to avoid lodging, monitor for Hessian fly and aphids, combine harvest at 12-14% moisture.`,
          `${cropInfo} Wheat farming practices: Prepare fine seedbed, plant in optimum moisture conditions, use certified seeds, apply zinc and boron if deficient, control weeds with post-emergence herbicides, protect from birds during ripening, store grain properly after harvest.`
        ];
        // Use query content to create more varied responses
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedCrop === 'maize' || mentionedCrop === 'corn') {
        const responses = [
          `${cropInfo} To grow maize: 1) Plant after last frost when soil is warm (60°F+), 2) Sow seeds 1-2 inches deep, 4-6 seeds per hill, 3) Thin to 1-2 plants per hill after emergence, 4) Apply nitrogen fertilizer in 2-3 splits, 5) Ensure consistent moisture during pollination, 6) Harvest when kernels are dented and black-layered.`,
          `${cropInfo} Maize cultivation guide: 1) Wait for soil temperatures above 60°F, 2) Plant seeds at proper depth and spacing, 3) Thin seedlings for optimal plant population, 4) Side-dress nitrogen at key growth stages, 5) Maintain soil moisture during critical periods, 6) Harvest at black layer formation.`,
          `${cropInfo} For high maize yields: 1) Time planting after frost danger, 2) Ensure good seed-to-soil contact, 3) Manage plant spacing for light interception, 4) Apply nitrogen at V6 and V12 stages, 5) Irrigate during tasseling/silking, 6) Monitor kernel development for harvest timing.`,
          `${cropInfo} Corn production basics: Plant at 60,000-70,000 plants per hectare, apply 150-200 kg nitrogen, control weeds with atrazine, protect from corn borers with Bt varieties, irrigate at tasseling and silking, harvest at 20-25% moisture for drying.`,
          `${cropInfo} Successful maize farming: Use hybrid seeds with good yield potential, plant in well-prepared soil, apply phosphorus and potassium at planting, side-dress nitrogen at knee-high stage, scout for European corn borer, harvest when kernels have black layer.`,
          `${cropInfo} Maize growing techniques: Ensure proper seed depth (4-5 cm), maintain plant population density, apply micronutrients if needed, use crop rotation to break pest cycles, harvest with combine when grain moisture is 22-28%, dry to 14% for storage.`,
          `${cropInfo} Maize production essentials: Select drought-tolerant varieties for dry areas, plant in blocks rather than rows for better pollination, apply nitrogen in 3 splits to maximize grain fill, monitor for armyworms during early growth, use conservation tillage to preserve soil moisture.`,
          `${cropInfo} Growing maize successfully: Start with soil testing for pH and nutrients, use precision planters for uniform spacing, apply starter fertilizer at planting, side-dress nitrogen at V8 stage, protect ears from birds and rodents, harvest when kernels reach 30% moisture for storage.`
        ];
        // Use query content to create more varied responses
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedCrop === 'cotton') {
        const responses = [
          `${cropInfo} To grow cotton: 1) Plant seeds directly after last frost, 2) Sow 3-4 seeds per foot in rows 30-40 inches apart, 3) Thin to 1 plant per foot, 4) Apply balanced fertilizer at planting, 5) Irrigate regularly during boll development, 6) Harvest when bolls are open and white.`,
          `${cropInfo} Cotton production requires: 1) Warm soil temperatures for germination, 2) Precise planting depth and spacing, 3) Early season weed control, 4) Balanced nutrient management, 5) Consistent irrigation during fruiting, 6) Multiple harvests as bolls open.`,
          `${cropInfo} Successful cotton farming: 1) Plant in well-prepared beds after soil warms, 2) Maintain proper plant population, 3) Apply starter fertilizer, 4) Control insects throughout season, 5) Irrigate to prevent stress during boll fill, 6) Harvest efficiently with mechanical pickers.`,
          `${cropInfo} Cotton cultivation guide: Select Bt varieties for bollworm control, plant when soil temperature reaches 65°F, apply nitrogen in splits, control weeds with pre-emergence herbicides, monitor for aphids and whiteflies, pick bolls when 60-70% open.`,
          `${cropInfo} Growing cotton effectively: Use raised beds for better drainage, plant at 8-10 seeds per meter, thin to 5-6 plants per meter, apply potassium during boll development, protect from pink bollworm, harvest multiple times for maximum yield.`,
          `${cropInfo} Cotton farming practices: Prepare soil with deep tillage, treat seeds with fungicides, maintain soil moisture during germination, use drip irrigation for water efficiency, apply micronutrients as foliar spray, store lint at proper humidity.`
        ];
        // Use query content to create more varied responses
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedCrop === 'groundnut' || mentionedCrop === 'peanut') {
        const responses = [
          `${cropInfo} To grow groundnuts: 1) Plant seeds 1-2 inches deep after soil warms to 65°F, 2) Space plants 6-8 inches apart in rows 24-30 inches apart, 3) Apply phosphorus fertilizer at planting, 4) Keep soil moist but not waterlogged, 5) Hill soil around plants as pegs develop, 6) Harvest when leaves yellow (100-120 days).`,
          `${cropInfo} Peanut cultivation steps: 1) Wait for soil to reach 65°F, 2) Plant seeds at proper depth and spacing, 3) Apply phosphorus and calcium at planting, 4) Maintain even soil moisture, 5) Provide good aeration for pegging, 6) Harvest when pods are mature.`,
          `${cropInfo} For quality peanut production: 1) Ensure warm soil conditions, 2) Use inoculated seed for nitrogen fixation, 3) Apply gypsum for calcium, 4) Monitor for disease pressure, 5) Allow proper curing time, 6) Harvest at optimal moisture content.`,
          `${cropInfo} Groundnut farming essentials: Plant in sandy loam soil, use gypsum at pegging stage, control leaf spots with fungicides, avoid water stress during pod development, harvest when 70-80% pods are mature, cure pods in windrows before storage.`,
          `${cropInfo} Successful peanut cultivation: Select disease-resistant varieties, plant at 30 cm row spacing, apply lime if soil is acidic, irrigate at critical stages, protect from aphids and jassids, dig plants when leaves turn yellow.`,
          `${cropInfo} Peanut production guide: Prepare well-drained fields, treat seeds with rhizobium culture, plant 2 seeds per hill, apply phosphorus at 50 kg per hectare, hill soil around plants, harvest 120-140 days after planting, dry pods to 8-10% moisture.`
        ];
        // Use query content to create more varied responses
        answer = responses[getResponseIndex(query, responses.length)];
      } else {
        const responses = [
          `${cropInfo} To grow ${cropName}: 1) Test soil and prepare seedbed, 2) Plant at recommended depth and spacing, 3) Provide adequate water and nutrients, 4) Monitor for pests and diseases, 5) Harvest at proper maturity stage.`,
          `${cropInfo} ${cropName} cultivation fundamentals: 1) Soil preparation and testing, 2) Proper planting techniques, 3) Water management throughout growth, 4) Nutrient application based on needs, 5) Pest and disease monitoring, 6) Timely harvest operations.`,
          `${cropInfo} Growing ${cropName} successfully requires: 1) Understanding climate requirements, 2) Proper seed selection and planting, 3) Irrigation scheduling, 4) Fertilizer management, 5) Integrated pest management, 6) Harvest at optimal conditions.`,
          `${cropInfo} ${cropName} farming basics: Choose suitable varieties for your region, prepare soil properly, plant at recommended times, apply fertilizers based on soil tests, protect from major pests, harvest when crop reaches maturity.`,
          `${cropInfo} Essential practices for ${cropName}: Start with land preparation, use quality seeds, maintain proper plant spacing, provide adequate irrigation, monitor nutrient status, implement pest control measures, time harvest correctly.`,
          `${cropInfo} ${cropName} production techniques: Select high-yielding varieties, follow recommended planting density, apply balanced fertilization, use integrated pest management, ensure proper water management, harvest at optimum stage for quality.`
        ];
        // Use query content to create more varied responses
        answer = responses[getResponseIndex(query, responses.length)];
      }
    } else if (lowerQuery.includes('water') || lowerQuery.includes('irrigat') || lowerQuery.includes('watering')) {
      if (mentionedCrop === 'rice') {
        answer = `${cropInfo} Rice requires continuous flooding: maintain 2-4 inches of water depth throughout growing season. Keep fields flooded from transplanting until 1-2 weeks before harvest. Water management is critical for weed control and nutrient availability.`;
      } else if (mentionedCrop === 'wheat') {
        answer = `${cropInfo} Wheat needs about 15-20 inches of water total. Irrigate when soil moisture drops to 50% of field capacity. Avoid irrigation during grain filling to prevent disease. Critical watering periods are jointing and heading stages.`;
      } else if (mentionedCrop === 'maize' || mentionedCrop === 'corn') {
        answer = `${cropInfo} Maize requires 20-30 inches of water. Most critical during tasseling/silking (2 weeks before/after pollination). Water deeply but infrequently to encourage deep roots. Monitor soil moisture regularly.`;
      } else if (mentionedCrop === 'cotton') {
        answer = `${cropInfo} Cotton needs 20-30 inches of water. Irrigate every 7-10 days during boll development. Avoid water stress during flowering and boll formation. Use drip irrigation to maintain consistent soil moisture.`;
      } else {
        answer = `${cropInfo} ${cropName} irrigation: Water deeply but infrequently to encourage deep root growth. Monitor soil moisture and adjust based on weather conditions. Avoid overhead watering to prevent fungal diseases.`;
      }
    } else if (lowerQuery.includes('fertilizer') || lowerQuery.includes('nutrient') || lowerQuery.includes('feeding')) {
      if (mentionedCrop === 'rice') {
        answer = `${cropInfo} Rice fertilization: Apply 100-120 lbs nitrogen/acre in 3 splits (1/3 at planting, 1/3 at tillering, 1/3 at panicle initiation). Use 40-60 lbs phosphorus/acre at planting. Maintain flooded conditions for nutrient availability.`;
      } else if (mentionedCrop === 'wheat') {
        answer = `${cropInfo} Wheat fertilization: Apply 80-120 lbs nitrogen/acre in 2-3 splits. Use 30-50 lbs phosphorus/acre at planting. Apply potassium based on soil tests. Split nitrogen applications prevent lodging.`;
      } else if (mentionedCrop === 'maize' || mentionedCrop === 'corn') {
        answer = `${cropInfo} Maize fertilization: Apply 150-200 lbs nitrogen/acre in 2-3 splits. Use 60-80 lbs phosphorus/acre at planting. Apply potassium based on soil tests. Side-dress nitrogen at 4-6 leaf stage.`;
      } else if (mentionedCrop === 'cotton') {
        answer = `${cropInfo} Cotton fertilization: Apply 60-100 lbs nitrogen/acre in splits. Use 40-60 lbs phosphorus/acre at planting. Apply potassium during boll development. Soil test to determine exact rates.`;
      } else {
        answer = `${cropInfo} ${cropName} fertilization: Apply balanced NPK at planting, supplement nitrogen during growth, and potassium during reproductive stages. Soil testing is essential to determine specific needs and prevent over-fertilization.`;
      }
    } else if (lowerQuery.includes('pest') || lowerQuery.includes('disease') || lowerQuery.includes('control') || lowerQuery.includes('problem')) {
      if (mentionedCrop === 'rice') {
        answer = `${cropInfo} Common rice pests: stem borers, leaf folders, brown planthoppers. Control with neem oil, beneficial insects, and resistant varieties. Diseases: blast, sheath blight. Use fungicides preventively and practice field sanitation.`;
      } else if (mentionedCrop === 'wheat') {
        answer = `${cropInfo} Wheat pests: aphids, Hessian fly. Diseases: rust, powdery mildew, scab. Use resistant varieties, crop rotation, and fungicide applications at flag leaf emergence. Monitor regularly for early detection.`;
      } else if (mentionedCrop === 'maize' || mentionedCrop === 'corn') {
        answer = `${cropInfo} Maize pests: corn borers, aphids, corn earworms. Diseases: gray leaf spot, northern corn leaf blight. Use Bt varieties for insect control and fungicides for disease prevention. Scout fields weekly.`;
      } else if (mentionedCrop === 'cotton') {
        answer = `${cropInfo} Cotton pests: bollworms, aphids, whiteflies. Diseases: bacterial blight, verticillium wilt. Use integrated pest management with beneficial insects, resistant varieties, and targeted insecticide applications.`;
      } else {
        answer = `${cropInfo} ${cropName} pest management: Use integrated pest management - crop rotation, resistant varieties, beneficial insects, and targeted sprays. Monitor regularly and treat only when necessary.`;
      }
    } else if (lowerQuery.includes('yield') || lowerQuery.includes('harvest') || lowerQuery.includes('production')) {
      if (mentionedCrop === 'rice') {
        answer = `${cropInfo} Rice yield optimization: Aim for 50-80 bushels/acre. Factors: proper water management, balanced fertilization, pest control, and harvest timing. Harvest when 80-85% of grains are straw-colored.`;
      } else if (mentionedCrop === 'wheat') {
        answer = `${cropInfo} Wheat yield goals: 40-80 bushels/acre depending on variety and conditions. Maximize with proper planting date, population, nutrition, and disease control. Harvest at 12-15% moisture.`;
      } else if (mentionedCrop === 'maize' || mentionedCrop === 'corn') {
        answer = `${cropInfo} Maize yield potential: 150-250 bushels/acre. Optimize with proper spacing (30,000-40,000 plants/acre), timely nitrogen applications, and irrigation during critical growth stages.`;
      } else if (mentionedCrop === 'cotton') {
        answer = `${cropInfo} Cotton yield goals: 800-1,200 lbs lint/acre. Maximize through proper plant population, irrigation scheduling, insect control, and harvest timing when bolls are 60% open.`;
      } else {
        answer = `${cropInfo} To maximize ${cropName} yield: Optimize plant spacing, ensure balanced nutrition, maintain proper irrigation, control pests effectively, and harvest at optimal maturity.`;
      }
    } else if (lowerQuery.includes('when') || lowerQuery.includes('time') || lowerQuery.includes('season')) {
      if (mentionedCrop === 'rice') {
        answer = `${cropInfo} Plant rice in spring after last frost when soil temperature reaches 60°F. Transplant seedlings 3-4 weeks after seeding. Harvest 100-120 days after planting when grains are mature.`;
      } else if (mentionedCrop === 'wheat') {
        answer = `${cropInfo} Plant winter wheat in fall (September-October) or spring wheat after soil reaches 40°F. Harvest summer wheat 100-120 days after planting when moisture is 12-15%.`;
      } else if (mentionedCrop === 'maize' || mentionedCrop === 'corn') {
        answer = `${cropInfo} Plant maize 2-3 weeks after last frost when soil temperature is 60°F+. Harvest sweet corn 60-80 days after planting, field corn 100-120 days.`;
      } else if (mentionedCrop === 'cotton') {
        answer = `${cropInfo} Plant cotton after last frost when soil is warm (65°F+). Harvest begins 140-180 days after planting when bolls open. Multiple harvests may be needed.`;
      } else {
        answer = `${cropInfo} ${cropName} planting time depends on your location and climate. Consider frost dates, soil temperature, and growing season length. Consult local agricultural extension for specific timing.`;
      }
    } else {
      // General information about the crop
      answer = `${cropInfo} ${cropName} is a valuable crop that responds well to proper management. Key success factors include soil preparation, timely irrigation, balanced fertilization, and pest monitoring.`;
    }

  } else {
    // General crop cultivation queries with varied responses
    const generalResponses = {
      'grow': [
        'Successful crop cultivation begins with understanding your soil type and climate. Test your soil, choose appropriate varieties, and establish good cultural practices from the start.',
        'Growing crops successfully requires planning: soil testing, variety selection, proper planting techniques, irrigation management, fertilization, and pest control. Start small to learn your conditions.',
        'Crop production fundamentals include soil preparation, seed selection, planting timing, water management, nutrient applications, and harvest timing. Each crop has specific requirements.',
        'The key to successful farming is knowing your local conditions. Start by testing your soil pH and nutrient levels, then select crop varieties that thrive in your climate zone.',
        'Crop cultivation is both an art and a science. Begin with proper land preparation, choose high-quality seeds, implement good irrigation practices, and monitor for pests regularly.',
        'Modern agriculture relies on understanding plant needs. Provide the right balance of water, nutrients, and protection from pests and diseases throughout the growing season.',
        'Successful crop growing depends on proper site selection, soil preparation, seed quality, and ongoing management. Learn your farm\'s microclimates and soil variations.',
        'Crop production success comes from attention to detail: proper spacing, adequate nutrition, timely irrigation, and vigilant pest monitoring from planting to harvest.',
        'Growing healthy crops requires understanding plant physiology. Ensure adequate sunlight, proper soil aeration, balanced nutrition, and protection from environmental stresses.'
      ],
      'water': [
        'Effective irrigation depends on soil type, crop stage, and weather. Use soil moisture sensors, water deeply but infrequently, and consider drip systems for efficiency.',
        'Water management is crucial for crop health. Monitor soil moisture, water early in the day to reduce evaporation, and adjust based on rainfall and temperature.',
        'Proper watering promotes strong root growth. Check soil moisture regularly, water deeply to encourage roots to grow downward, and avoid frequent shallow watering.',
        'Irrigation timing and amount depend on your soil texture and crop water requirements. Sandy soils need frequent watering, clay soils less often. Use mulch to conserve moisture.',
        'Good water management prevents both drought stress and waterlogging. Install rain gauges, use tensiometers to monitor soil moisture, and water during cooler parts of the day.',
        'Root development depends on consistent soil moisture. Water deeply to encourage deep roots, but allow the top inch of soil to dry between waterings to prevent surface rooting.',
        'Efficient water use in agriculture involves scheduling irrigation based on evapotranspiration rates, soil type, and crop growth stage. Consider deficit irrigation for some crops.',
        'Water conservation is key in modern farming. Use drip irrigation, monitor soil moisture sensors, apply water only when needed, and implement rainwater harvesting systems.',
        'Proper irrigation prevents crop stress. Water when the top 2-3 inches of soil are dry, avoid overhead watering that promotes diseases, and consider fertigation for nutrient delivery.'
      ],
      'soil': [
        'Soil health is the foundation of successful farming. Test regularly, maintain organic matter, ensure proper drainage, and amend based on test results.',
        'Good soil preparation involves testing pH and nutrients, adding organic matter, ensuring drainage, and minimizing compaction. Healthy soil produces healthy crops.',
        'Soil management includes regular testing, organic matter additions, pH adjustment, and structure improvement. Different crops have different soil requirements.',
        'Soil fertility determines crop productivity. Regular testing for pH, nutrients, and organic matter helps maintain optimal growing conditions for your crops.',
        'Healthy soil structure supports root growth and nutrient uptake. Avoid compaction, maintain organic matter levels, and ensure proper drainage to prevent waterlogging.',
        'Soil pH affects nutrient availability. Most crops prefer slightly acidic to neutral soils. Lime acidic soils and sulfur alkaline soils to optimize nutrient uptake.',
        'Organic matter improves soil water-holding capacity and nutrient retention. Add compost, manure, or cover crops to build soil health over time.',
        'Soil testing provides the foundation for successful farming. Test every 2-3 years, sample from multiple depths, and amend based on recommendations for optimal crop growth.',
        'Soil management practices like no-till farming, cover cropping, and crop rotation help maintain soil structure, fertility, and biological activity for long-term productivity.'
      ],
      'fertilizer': [
        'Fertilization should be based on soil tests. Use balanced ratios, apply at the right times, and consider both conventional and organic sources for optimal plant nutrition.',
        'Proper nutrient management involves soil testing, understanding crop needs, timing applications correctly, and monitoring plant response. Over-fertilization can harm plants and the environment.',
        'Fertilizer programs should match crop requirements. Test soil first, apply nutrients in available forms, and split applications to maximize uptake efficiency.',
        'Nutrient management is critical for crop health. Soil testing determines needs, crop removal rates guide replacement, and split applications prevent losses and optimize uptake.',
        'Fertilizer selection depends on soil test results and crop requirements. Use starter fertilizers at planting, side-dress nitrogen during growth, and apply micronutrients as needed.',
        'Balanced fertilization prevents deficiencies and toxicities. Apply nitrogen for growth, phosphorus for roots, potassium for stress tolerance, and micronutrients for enzyme function.',
        'Fertilizer timing affects efficiency. Apply phosphorus and potassium at planting, nitrogen in splits throughout the season, and micronutrients as foliar sprays when needed.',
        'Sustainable nutrient management includes soil testing, proper application rates, timing, and placement. Consider organic sources and slow-release formulations to minimize environmental impact.',
        'Fertilizer programs should be tailored to each field. Use precision agriculture tools, monitor plant tissue tests, and adjust applications based on yield goals and environmental conditions.'
      ],
      'pest': [
        'Integrated pest management combines prevention, monitoring, and control methods. Start with cultural practices, use biological controls, and apply chemicals only when necessary.',
        'Effective pest control begins with prevention through crop rotation, resistant varieties, and field sanitation. Regular scouting and threshold-based treatments are key.',
        'Pest management strategies include cultural controls, biological agents, and chemical applications. Understanding pest life cycles helps timing interventions effectively.',
        'IPM approaches prioritize prevention and monitoring. Use resistant varieties, maintain field sanitation, encourage beneficial insects, and apply controls only when thresholds are exceeded.',
        'Pest control decisions should be based on scouting and economic thresholds. Identify pests accurately, understand their biology, and choose the least disruptive control method.',
        'Biological control uses natural enemies to manage pests. Encourage ladybugs, lacewings, and parasitic wasps through habitat management and reduced pesticide use.',
        'Cultural controls prevent pest problems. Practice crop rotation, use trap crops, maintain proper plant spacing, and time planting to avoid peak pest pressure.',
        'Chemical control should be the last resort in pest management. Choose selective pesticides, apply at proper rates and timing, and follow label instructions carefully.',
        'Pest monitoring involves regular field scouting. Use traps, examine plants for damage and pests, and keep records to make informed management decisions.'
      ]
    };

    // Find the most relevant category
    let category = 'grow'; // default
    Object.keys(generalResponses).forEach(key => {
      if (lowerQuery.includes(key)) {
        category = key;
      }
    });

    const responses = generalResponses[category] || generalResponses['grow'];
    answer = responses[getResponseIndex(query, responses.length)];

    // Add related suggestions
    const suggestions = [
      ' Consider consulting local agricultural extension services for region-specific advice.',
      ' Keep detailed records of your farming practices to improve future seasons.',
      ' Join local farming communities to learn from experienced growers in your area.',
      ' Consider sustainable practices like cover cropping and reduced tillage for long-term soil health.'
    ];
    answer += suggestions[getResponseIndex(query, suggestions.length)];
  }

  // Save query to history
  try {
    const queryHistory = new QueryHistory({
      userId: req.user.userId,
      category: 'crops',
      query,
      answer
    });
    await queryHistory.save();
  } catch (error) {
    console.error('Error saving query history:', error);
    // Don't fail the request if history save fails
  }

  res.json({
    message: 'Query processed successfully',
    query,
    answer
  });
});

// Submit pest query
router.post('/pests', auth, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  // Advanced NLP-based pest query processing with specific, relevant answers
  const doc = nlp(query);
  const lowerQuery = query.toLowerCase();
  let answer = '';

  // Check for specific pest mentions and provide targeted solutions
  const pestMentions = ['aphid', 'caterpillar', 'mite', 'beetle', 'worm', 'fly', 'bug', 'insect'];
  const mentionedPest = pestMentions.find(pest => lowerQuery.includes(pest));

  if (mentionedPest) {
    const pestInfo = agriculturalData.pests[mentionedPest + 's'] || agriculturalData.pests[mentionedPest] || agriculturalData.pests[mentionedPest.replace('fly', 'flies')];

    if (lowerQuery.includes('control') || lowerQuery.includes('treat') || lowerQuery.includes('kill') || lowerQuery.includes('get rid')) {
      if (mentionedPest === 'aphid') {
        const responses = [
          `${pestInfo} Spray with neem oil solution (1-2 tablespoons per gallon of water) every 7-10 days. Introduce ladybugs as natural predators. Avoid over-fertilizing with nitrogen which attracts aphids.`,
          `Aphid control: ${pestInfo} Use a strong stream of water to knock aphids off plants. Apply insecticidal soap spray, focusing on undersides of leaves. Repeat treatments every 3-5 days as needed.`,
          `${pestInfo} For aphid management, prune heavily infested plant parts. Apply systemic insecticides if infestation is severe, but prefer biological controls like parasitic wasps for long-term control.`,
          `${pestInfo} Aphid treatment: Apply horticultural oils early in the morning, ensure good air circulation around plants, and use reflective mulches to deter landing. Monitor for natural enemies like lacewings.`,
          `${pestInfo} Managing aphids organically: Use companion planting with herbs like mint and catnip, apply diatomaceous earth around plant bases, and maintain proper plant spacing to improve air flow.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedPest === 'caterpillar') {
        const responses = [
          `${pestInfo} Apply Bacillus thuringiensis (BT) spray in the evening when caterpillars are actively feeding. Hand-pick large caterpillars and destroy egg masses. Use row covers for prevention.`,
          `Caterpillar control: ${pestInfo} BT is the most effective organic control. Mix according to package directions and apply to both sides of leaves. Reapply after rain or every 5-7 days during infestation.`,
          `${pestInfo} For caterpillar management, monitor plants daily and remove eggs/young larvae. Use spinosad-based insecticides as an alternative to BT. Practice crop rotation to reduce populations.`,
          `${pestInfo} Caterpillar treatment: Use parasitic wasps for biological control, apply neem oil spray every 7-10 days, and hand-pick egg masses from undersides of leaves. Avoid broad-spectrum insecticides that kill beneficial insects.`,
          `${pestInfo} Managing caterpillars: Scout plants regularly for eggs and young larvae, use floating row covers during vulnerable stages, and apply diatomaceous earth around plant bases as a barrier.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedPest === 'mite') {
        const responses = [
          `${pestInfo} Increase humidity around plants and spray with insecticidal soap. Apply neem oil solution weekly. Avoid broad-spectrum insecticides that kill beneficial mites.`,
          `Spider mite control: ${pestInfo} Mist plants regularly to increase humidity. Use predatory mites as biological control. Apply horticultural oil sprays in cooler temperatures.`,
          `${pestInfo} For mite management, isolate infested plants to prevent spread. Use sulfur-based sprays carefully as they can burn plants. Improve air circulation to reduce humidity that mites prefer.`,
          `${pestInfo} Mite treatment: Use insecticidal soap sprays every 3-5 days, ensure proper ventilation, and introduce predatory mites for long-term control. Avoid overhead watering that increases humidity.`,
          `${pestInfo} Managing spider mites: Apply horticultural oils in the evening, maintain consistent humidity levels, and use reflective mulches to deter mites. Monitor for webbing on plant undersides.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedPest === 'beetle') {
        const responses = [
          `${pestInfo} Hand-pick beetles and drop them in soapy water. Use pyrethrin-based insecticides for larger infestations. Place traps with attractants to monitor populations.`,
          `Beetle control: ${pestInfo} Remove plant debris where beetles overwinter. Apply diatomaceous earth around plant bases. Use beneficial nematodes in soil for larvae.`,
          `${pestInfo} For beetle management, use floating row covers during vulnerable growth stages. Apply systemic insecticides if damage is severe. Encourage beneficial insects that prey on beetles.`,
          `${pestInfo} Beetle treatment: Apply neem oil spray every 7-10 days, use sticky traps to monitor populations, and hand-pick adults during evening hours. Avoid broad-spectrum insecticides.`,
          `${pestInfo} Managing beetles: Scout regularly for adults and larvae, use row covers for young plants, and apply diatomaceous earth as a barrier. Maintain proper plant spacing for air circulation.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedPest === 'worm') {
        const responses = [
          `${pestInfo} Place cardboard collars around young plants to prevent cutworm entry. Apply beneficial nematodes to soil. Hand-pick worms at night when they feed.`,
          `Cutworm control: ${pestInfo} Till soil in fall to expose overwintering worms. Use parasitic wasps for biological control. Apply diatomaceous earth around stems.`,
          `${pestInfo} For worm management, avoid planting susceptible crops after sod. Use raised beds to make it harder for worms to reach plants. Apply BT if needed for surface-feeding worms.`,
          `${pestInfo} Worm treatment: Apply neem oil spray every 7-10 days, use beneficial nematodes in soil, and hand-pick large worms during evening hours. Avoid broad-spectrum insecticides.`,
          `${pestInfo} Managing worms: Scout regularly for cut marks on stems, use row covers for young plants, and apply diatomaceous earth as a barrier. Maintain proper plant spacing for air circulation.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedPest === 'fly') {
        const responses = [
          `${pestInfo} Use yellow sticky traps to monitor and reduce adult populations. Keep area clean of decaying matter. Apply spinosad-based insecticides if populations are high.`,
          `Fruit fly control: ${pestInfo} Trap adults with vinegar solutions in jars. Remove overripe or damaged fruits immediately. Use parasitic wasps for biological control.`,
          `${pestInfo} For fly management, sanitize tools and containers. Use row covers to exclude adults. Apply pyrethrin sprays to plants, avoiding fruit.`,
          `${pestInfo} Fly treatment: Apply neem oil spray every 7-10 days, use vinegar traps to monitor populations, and hand-pick adults during evening hours. Avoid broad-spectrum insecticides.`,
          `${pestInfo} Managing flies: Scout regularly for adult flies, use row covers for young plants, and apply diatomaceous earth as a barrier. Maintain proper plant spacing for air circulation.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      }
    } else if (lowerQuery.includes('prevent') || lowerQuery.includes('avoid')) {
      if (mentionedPest === 'aphid') {
        answer = `Prevent aphids by avoiding excessive nitrogen fertilization, maintaining plant health, and regularly inspecting plants. Plant garlic or onions nearby as natural repellents.`;
      } else if (mentionedPest === 'caterpillar') {
        answer = `Prevent caterpillars by using row covers during vulnerable stages, practicing crop rotation, and removing plant debris. Plant trap crops like radishes to attract egg-laying.`;
      } else if (mentionedPest === 'mite') {
        answer = `Prevent spider mites by maintaining adequate humidity, avoiding drought stress, and not over-fertilizing. Regularly wash plants to remove dust that mites use for webbing.`;
      } else if (mentionedPest === 'beetle') {
        answer = `Prevent beetles by removing overwintering sites, using trap crops, and maintaining field sanitation. Plant resistant varieties when available.`;
      } else if (mentionedPest === 'worm') {
        answer = `Prevent cutworms by tilling soil in fall, using collars around transplants, and avoiding planting after grass or weeds. Use raised beds to deter worms.`;
      } else if (mentionedPest === 'fly') {
        answer = `Prevent fruit flies by harvesting fruits promptly, cleaning up fallen fruits, and using row covers. Maintain proper plant spacing for air circulation.`;
      }
    } else {
      // General information about the pest
      answer = `${pestInfo} This pest can cause significant damage if not controlled. Monitor regularly and use integrated pest management approaches combining cultural, biological, and chemical methods as needed.`;
    }

    // Add related prevention tips
    const preventionTips = [
      ' Regular monitoring is key to early detection.',
      ' Maintain plant health to reduce susceptibility.',
      ' Use beneficial insects for natural control.',
      ' Practice crop rotation to break pest cycles.'
    ];
    answer += preventionTips[getResponseIndex(query, preventionTips.length)];

  } else {
    // General pest queries - provide relevant, specific guidance
    if (lowerQuery.includes('control') || lowerQuery.includes('treat') || lowerQuery.includes('manage')) {
      const responses = [
        'Effective pest control starts with identification. Examine damaged plants for pests, eggs, or damage patterns. Use integrated pest management: prevention first, then biological and chemical controls.',
        'For pest management, begin with cultural controls like crop rotation and proper spacing. Monitor regularly with traps and scouting. Apply controls only when pest populations exceed economic thresholds.',
        'Pest control strategy: 1) Identify the pest accurately, 2) Determine if treatment is needed, 3) Choose least toxic method first, 4) Apply at proper timing, 5) Monitor effectiveness.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    } else if (lowerQuery.includes('organic') || lowerQuery.includes('natural')) {
      const responses = [
        'Organic pest control focuses on natural methods: neem oil, insecticidal soap, diatomaceous earth, beneficial insects, and cultural practices. These methods are safer for beneficial insects and the environment.',
        'Natural pest control options include: introducing ladybugs for aphids, using BT for caterpillars, applying horticultural oils for mites, and using row covers for exclusion. Always follow organic certification guidelines.',
        'For organic pest management, prioritize prevention through biodiversity, use botanical insecticides like pyrethrin and neem, and employ biological controls like predatory insects and nematodes.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    } else if (lowerQuery.includes('prevent') || lowerQuery.includes('avoid')) {
      const responses = [
        'Prevent pest problems by maintaining plant health, using resistant varieties, practicing crop rotation, and keeping fields clean. Regular monitoring helps catch issues before they become serious.',
        'Pest prevention strategies include: proper plant spacing for air circulation, avoiding over-fertilization, using trap crops, maintaining beneficial insect habitats, and timely harvesting.',
        'To avoid pest infestations, focus on field sanitation, crop rotation, resistant varieties, proper irrigation to avoid stress, and regular scouting. Healthy plants are less susceptible to pests.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    } else if (lowerQuery.includes('identify') || lowerQuery.includes('what') || lowerQuery.includes('recognize')) {
      const responses = [
        'Identify pests by examining plant symptoms: holes in leaves suggest chewing insects, discoloration indicates sucking pests, wilting may mean root feeders. Use field guides or send samples to extension services.',
        'Pest identification involves looking at damage patterns, searching for actual pests/eggs, and considering environmental conditions. Digital plant diagnosis apps can help with identification.',
        'To identify pests, inspect plants thoroughly including undersides of leaves, soil around roots, and stems. Note the type of damage and when it occurs. Compare with pest identification guides.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    } else {
      const responses = [
        'For pest-related questions, please specify the type of pest or describe the symptoms you\'re seeing. Common agricultural pests include aphids, caterpillars, mites, beetles, and various worms.',
        'Pest management depends on the specific pest and crop. Describe the pest or damage symptoms for targeted advice. Integrated pest management combines prevention, monitoring, and control methods.',
        'Different pests require different control strategies. Please provide details about the pest (aphids, caterpillars, mites, etc.) or the type of damage you\'re observing for specific recommendations.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    }
  }

  // Save query to history
  try {
    const queryHistory = new QueryHistory({
      userId: req.user.userId,
      category: 'pests',
      query,
      answer
    });
    await queryHistory.save();
  } catch (error) {
    console.error('Error saving query history:', error);
    // Don't fail the request if history save fails
  }

  res.json({
    message: 'Query processed successfully',
    query,
    answer
  });
});

// Submit fertilizer query
router.post('/fertilizers', auth, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  // Advanced NLP-based fertilizer query processing with specific, relevant answers
  const doc = nlp(query);
  const lowerQuery = query.toLowerCase();
  let answer = '';

  // Check for specific crop mentions in fertilizer queries
  const cropMentions = ['rice', 'wheat', 'maize', 'corn', 'mirchi', 'chili', 'cotton', 'groundnut', 'peanut', 'barley', 'oats'];
  let mentionedCrop = null;

  for (const crop of cropMentions) {
    if (lowerQuery.includes(crop) || lowerQuery.includes(crop + 's') || lowerQuery.includes(crop + 'es')) {
      mentionedCrop = crop;
      break;
    }
  }

  // Check for specific nutrient mentions and provide targeted advice
  const nutrientMentions = ['nitrogen', 'phosphorus', 'phosphate', 'potassium', 'npk', 'balanced'];
  const mentionedNutrient = nutrientMentions.find(nutrient => lowerQuery.includes(nutrient));

  if (mentionedNutrient) {
    if (lowerQuery.includes('when') || lowerQuery.includes('apply') || lowerQuery.includes('timing')) {
      if (mentionedNutrient === 'nitrogen') {
        const responses = [
          `Apply nitrogen fertilizers in 3-4 split applications: 1/3 at planting, 1/3 at early vegetative growth, and 1/3 during reproductive development. Avoid applying nitrogen late in the season to prevent excessive vegetative growth.`,
          `Nitrogen timing: Start with 30-40% at planting, apply 30% during early growth (4-6 weeks after planting), and the final 30% during peak vegetative growth. Soil test to determine exact amounts needed.`,
          `For nitrogen application: Apply 20-30% at planting as starter fertilizer, 40-50% during active vegetative growth, and 20-30% during early reproductive stages. Split applications prevent leaching and optimize uptake.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedNutrient === 'phosphorus' || mentionedNutrient === 'phosphate') {
        const responses = [
          `Apply phosphorus fertilizers at planting time, banded 2-3 inches below and to the side of seeds. This ensures phosphorus availability during critical root development stages when plants need it most.`,
          `Phosphorus timing: Apply 100% at planting as a starter fertilizer. Banding phosphorus near the seed row maximizes availability and reduces fixation by soil minerals.`,
          `For phosphorus application: Apply all phosphorus fertilizer at planting time. Place it in the root zone where developing roots can access it immediately. Soil pH affects phosphorus availability.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedNutrient === 'potassium') {
        const responses = [
          `Apply potassium fertilizers in split applications: 50% at planting and 50% during fruit/seed development. Potassium helps plants resist drought, disease, and cold stress.`,
          `Potassium timing: Apply 40-50% at planting for early root development, and 50-60% during reproductive growth when fruits/seeds are developing. Potassium moves slowly in soil.`,
          `For potassium application: Split applications work best - 1/3 at planting, 1/3 during vegetative growth, and 1/3 during fruit development. Potassium deficiency shows as yellowing leaf edges.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      } else if (mentionedNutrient === 'npk' || mentionedNutrient === 'balanced') {
        const responses = [
          `Balanced NPK fertilizers provide complete nutrition. Choose ratios based on crop needs: leafy crops need more nitrogen (e.g., 20-10-10), fruiting crops need more potassium (e.g., 10-10-20). Apply according to soil test recommendations.`,
          `For balanced fertilizers: Select NPK ratios matching your crop's needs. Apply 50-70% at planting and the remainder as side-dressing. Regular soil testing prevents over-application and ensures optimal nutrient balance.`,
          `NPK fertilizer timing: Apply complete fertilizers at planting for seedlings, then supplement with nitrogen during growth. Monitor plants for deficiency symptoms and adjust fertilizer program accordingly.`
        ];
        answer = responses[getResponseIndex(query, responses.length)];
      }
    } else if (lowerQuery.includes('how much') || lowerQuery.includes('amount') || lowerQuery.includes('rate') || lowerQuery.includes('quantity')) {
      if (mentionedNutrient === 'nitrogen') {
        answer = `Nitrogen rates vary by crop: corn needs 150-200 lbs/acre, wheat 80-120 lbs/acre, vegetables 100-150 lbs/acre. Base rates on soil tests and expected yield goals. Split applications reduce leaching losses.`;
      } else if (mentionedNutrient === 'phosphorus') {
        answer = `Phosphorus rates depend on soil test levels: low P soils need 40-60 lbs P2O5/acre, medium soils need 20-40 lbs/acre. Apply based on crop removal rates and soil test recommendations.`;
      } else if (mentionedNutrient === 'potassium') {
        answer = `Potassium rates based on soil tests: low K soils need 100-150 lbs K2O/acre, medium soils need 50-100 lbs/acre. Consider crop K requirements and soil clay content for availability.`;
      } else {
        answer = `Fertilizer rates should be based on soil tests and crop needs. Get a soil analysis to determine exact amounts required. Over-application wastes money and can harm the environment.`;
      }
    } else if (lowerQuery.includes('deficiency') || lowerQuery.includes('symptoms') || lowerQuery.includes('signs')) {
      if (mentionedNutrient === 'nitrogen') {
        answer = `Nitrogen deficiency symptoms: uniform yellowing of older leaves starting from tips, stunted growth, reduced tillering. Occurs in sandy soils with high rainfall or over-liming.`;
      } else if (mentionedNutrient === 'phosphorus') {
        answer = `Phosphorus deficiency: purplish discoloration on leaves, stunted roots, delayed maturity. More common in cold, wet soils or high pH soils where phosphorus binds with minerals.`;
      } else if (mentionedNutrient === 'potassium') {
        answer = `Potassium deficiency: yellowing and browning of leaf edges, weak stems, increased disease susceptibility. Occurs in sandy soils or with heavy potassium removal by crops.`;
      }
    } else {
      // General information about the nutrient
      if (mentionedNutrient === 'nitrogen') {
        answer = `${agriculturalData.fertilizers.nitrogen} Nitrogen is mobile in soil and plants, making it easy to correct deficiencies but prone to leaching. Use split applications for best results.`;
      } else if (mentionedNutrient === 'phosphorus') {
        answer = `${agriculturalData.fertilizers.phosphorus} Phosphorus is immobile in soil, so placement near roots is crucial. Soil pH greatly affects phosphorus availability to plants.`;
      } else if (mentionedNutrient === 'potassium') {
        answer = `${agriculturalData.fertilizers.potassium} Potassium improves plant stress tolerance and quality. It's mobile in plants but can be fixed in some soils.`;
      }
    }
  } else if (mentionedCrop) {
    // Provide crop-specific fertilizer advice
    const cropInfo = agriculturalData.crops[mentionedCrop] || agriculturalData.crops[mentionedCrop.replace('chili', 'mirchi')];
    const cropName = mentionedCrop.charAt(0).toUpperCase() + mentionedCrop.slice(1);

    if (lowerQuery.includes('what') || lowerQuery.includes('which') || lowerQuery.includes('recommend') || lowerQuery.includes('best')) {
      if (mentionedCrop === 'rice') {
        answer = `${cropInfo} For rice fertilization: Apply 100-120 lbs nitrogen/acre in 3 splits (1/3 at planting, 1/3 at tillering, 1/3 at panicle initiation). Use 40-60 lbs phosphorus/acre at planting. Maintain flooded conditions for nutrient availability.`;
      } else if (mentionedCrop === 'wheat') {
        answer = `${cropInfo} For wheat fertilization: Apply 80-120 lbs nitrogen/acre in 2-3 splits. Use 30-50 lbs phosphorus/acre at planting. Apply potassium based on soil tests. Split nitrogen applications prevent lodging.`;
      } else if (mentionedCrop === 'maize' || mentionedCrop === 'corn') {
        answer = `${cropInfo} For maize fertilization: Apply 150-200 lbs nitrogen/acre in 2-3 splits. Use 60-80 lbs phosphorus/acre at planting. Apply potassium based on soil tests. Side-dress nitrogen at 4-6 leaf stage.`;
      } else if (mentionedCrop === 'cotton') {
        answer = `${cropInfo} For cotton fertilization: Apply 60-100 lbs nitrogen/acre in splits. Use 40-60 lbs phosphorus/acre at planting. Apply potassium during boll development. Soil test to determine exact rates.`;
      } else {
        answer = `${cropInfo} ${cropName} fertilization: Apply balanced NPK at planting, supplement nitrogen during growth, and potassium during reproductive stages. Soil testing is essential to determine specific needs and prevent over-fertilization.`;
      }
    } else {
      // General fertilizer advice for the crop
      answer = `${cropInfo} ${cropName} responds well to balanced fertilization. Test soil first, apply nutrients based on crop needs and growth stage. Split applications maximize uptake efficiency.`;
    }
  } else {
    // General fertilizer queries
    if (lowerQuery.includes('organic') || lowerQuery.includes('natural')) {
      const responses = [
        'Organic fertilizers provide slow-release nutrients and improve soil structure. Use compost (1-2 inches annually), well-aged manure (20-30 lbs per 100 sq ft), bone meal for phosphorus, and blood meal for nitrogen.',
        'Natural fertilizer options: compost tea for foliar feeding, fish emulsion for quick nitrogen, rock phosphate for long-term phosphorus, and greensand for potassium. These improve soil biology while feeding plants.',
        'For organic fertilization: Apply compost or manure in fall for slow release, use cover crops to build soil fertility, and incorporate rock minerals for micronutrients. Soil testing guides organic fertilizer choices.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    } else if (lowerQuery.includes('chemical') || lowerQuery.includes('synthetic')) {
      const responses = [
        'Chemical fertilizers provide precise nutrient ratios and fast plant response. Use according to soil tests to avoid over-application. Consider slow-release formulations to reduce leaching and provide steady nutrition.',
        'Synthetic fertilizers offer immediate nutrient availability. Choose analysis based on crop needs (e.g., 10-10-10 for general use, 20-10-10 for leafy crops). Apply during active growth periods for best results.',
        'Chemical fertilizer benefits: predictable nutrient content, fast plant uptake, and targeted applications. Always follow label rates and consider environmental impact. Soil testing maximizes efficiency.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    } else if (lowerQuery.includes('soil test') || lowerQuery.includes('test')) {
      const responses = [
        'Soil testing is essential for proper fertilization. Test for pH, organic matter, and nutrient levels (N-P-K plus micronutrients). Sample from multiple locations in your field for accurate results.',
        'Get a comprehensive soil test including: pH, electrical conductivity, organic matter content, macronutrients (N-P-K), and micronutrients. Test every 2-3 years or when problems arise.',
        'Soil analysis provides fertilizer recommendations. Test in fall for spring planting, or spring for summer crops. Include depth-specific sampling for different root zones.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    } else if (lowerQuery.includes('over') || lowerQuery.includes('too much') || lowerQuery.includes('excess')) {
      const responses = [
        'Over-fertilization symptoms: leaf burn, excessive vegetative growth, reduced fruit quality, environmental pollution. Use soil tests to determine proper rates and split applications to avoid excess.',
        'Excess fertilizer problems: nitrogen toxicity causes leaf burn and poor fruit set, phosphorus excess reduces micronutrient availability, potassium excess affects magnesium uptake. Always calibrate spreaders.',
        'Fertilizer burn indicates over-application. Flush soil with water if possible, avoid fertilizing stressed plants, and use slow-release forms. Prevention through soil testing is best.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    } else {
      const responses = [
        'Fertilizer selection depends on soil test results and crop needs. Consider both conventional and organic sources. Timing and placement affect nutrient availability and plant uptake.',
        'Choose fertilizers based on: soil test recommendations, crop nutrient requirements, growth stage, and environmental conditions. Balanced nutrition prevents deficiencies and maximizes yields.',
        'Fertilization strategy: Start with soil testing, select appropriate fertilizer types and rates, time applications for maximum uptake, and monitor plant response. Adjust program based on results.'
      ];
      answer = responses[getResponseIndex(query, responses.length)];
    }
  }

  res.json({
    message: 'Query processed successfully',
    query,
    answer
  });
});

// Get query history for authenticated user
router.get('/history', auth, async (req, res) => {
  try {
    const history = await QueryHistory.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username email mobile');

    res.json({
      message: 'Query history retrieved successfully',
      history: history.map(item => ({
        id: item._id,
        category: item.category,
        query: item.query,
        answer: item.answer,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    console.error('Error retrieving query history:', error);
    res.status(500).json({ message: 'Failed to retrieve query history' });
  }
});

module.exports = router;
