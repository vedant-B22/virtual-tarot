const fs = require('fs');
const path = require('path');

const majorArcanaData = [
  {
    id: "maj_00",
    number: 0,
    roman: "0",
    name: "The Fool",
    arcana: "major",
    element: "Air",
    keywords: ["New Beginnings", "Innocence", "Spontaneity", "Leap of Faith", "Free Spirit"],
    upright: "A fresh journey begins. Trust the unknown, take an open-hearted risk, and embrace the boundless potential of life without fear.",
    reversed: "Recklessness, fear of taking a necessary leap, naive decisions, or hesitating at the threshold of change.",
    description: "The youth standing at the cliff's edge, dog at his heels, ready to step into creation with curiosity and untamed wonder.",
    symbolColor: "#f59e0b"
  },
  {
    id: "maj_01",
    number: 1,
    roman: "I",
    name: "The Magician",
    arcana: "major",
    element: "Air / Mercury",
    keywords: ["Manifestation", "Resourcefulness", "Power", "Inspired Action", "Creation"],
    upright: "You hold all tools required: wand, cup, sword, and coin. As above, so below. Direct your willpower to manifest your deepest vision.",
    reversed: "Illusion, wasted talent, manipulation, trickery, or self-doubt blocking your authentic power.",
    description: "One hand raised to the heavens, one pointing to the earth, channeling divine energy into physical form.",
    symbolColor: "#ef4444"
  },
  {
    id: "maj_02",
    number: 2,
    roman: "II",
    name: "The High Priestess",
    arcana: "major",
    element: "Water / Moon",
    keywords: ["Intuition", "Sacred Knowledge", "Divine Feminine", "Subconscious", "Mystery"],
    upright: "Look beyond the veil. Your intuition and dreams carry ancient wisdom. Still the noise and listen to the silent whisper within.",
    reversed: "Ignoring your gut instincts, hidden agendas, superficial focus, or disconnection from inner knowing.",
    description: "Seated between the pillars of darkness and light, veiled before the tapestry of pomegranates with the crescent moon at her feet.",
    symbolColor: "#3b82f6"
  },
  {
    id: "maj_03",
    number: 3,
    roman: "III",
    name: "The Empress",
    arcana: "major",
    element: "Earth / Venus",
    keywords: ["Abundance", "Fertility", "Nurturing", "Sensuality", "Nature & Growth"],
    upright: "A season of abundant blossoming, creative birth, and sensory delight. Nurture what you are growing with compassion and warmth.",
    reversed: "Creative blockage, overbearing care, feeling drained, neglecting self-love, or disharmony in relationships.",
    description: "Crowned with twelve stars upon a plush throne in a fertile wheat field surrounded by babbling streams.",
    symbolColor: "#10b981"
  },
  {
    id: "maj_04",
    number: 4,
    roman: "IV",
    name: "The Emperor",
    arcana: "major",
    element: "Fire / Aries",
    keywords: ["Authority", "Structure", "Stability", "Leadership", "Protection"],
    upright: "Erect solid foundations. Establish boundaries, exercise focused discipline, and lead your domain with clarity and calm strength.",
    reversed: "Rigidity, tyrant energy, loss of control, stubborn resistance to evolution, or chaotic lack of structure.",
    description: "Seated upon a stone throne carved with rams' heads, holding the golden ankh and orb over his mountainous empire.",
    symbolColor: "#dc2626"
  },
  {
    id: "maj_05",
    number: 5,
    roman: "V",
    name: "The Hierophant",
    arcana: "major",
    element: "Earth / Taurus",
    keywords: ["Spiritual Wisdom", "Tradition", "Mentorship", "Belief Systems", "Alignment"],
    upright: "Seek guidance from higher truth, trusted lineage, or sacred study. Align your daily deeds with your deeper spiritual principles.",
    reversed: "Blind conformity, dogmatism, breaking sacred taboos, establishing your own unconventional path.",
    description: "The spiritual elder seated between two sacred keys, imparting timeless truths to eager seekers.",
    symbolColor: "#8b5cf6"
  },
  {
    id: "maj_06",
    number: 6,
    roman: "VI",
    name: "The Lovers",
    arcana: "major",
    element: "Air / Gemini",
    keywords: ["Sacred Union", "Harmony", "Values Alignment", "Deep Connection", "Choice"],
    upright: "A meeting of souls, profound vulnerability, and mutual resonance. Beyond romance, this signifies a crucial values-based choice.",
    reversed: "Misalignment of core values, relational conflict, codependency, or inner discord pulling in two directions.",
    description: "Two figures beneath the blessing angel Raphael and the flaming tree of life, uniting spirit and desire.",
    symbolColor: "#ec4899"
  },
  {
    id: "maj_07",
    number: 7,
    roman: "VII",
    name: "The Chariot",
    arcana: "major",
    element: "Water / Cancer",
    keywords: ["Determination", "Victory", "Willpower", "Focus", "Overcoming Obstacles"],
    upright: "Harness opposing forces with unwavering focus. Tame the wild black and white steeds of your thoughts and charge forward to victory.",
    reversed: "Loss of direction, aggression, burnout, running roughshod over others, or feeling powerless against currents.",
    description: "A crowned warrior driving forward in a starry canopy chariot pulled by two sphinxes in perfect balance.",
    symbolColor: "#0284c7"
  },
  {
    id: "maj_08",
    number: 8,
    roman: "VIII",
    name: "Strength",
    arcana: "major",
    element: "Fire / Leo",
    keywords: ["Inner Courage", "Gentleness", "Compassion", "Resilience", "Grace under Pressure"],
    upright: "True strength is quiet and tender. Calm the roaring beast within through patience, soft words, and unshakable inner faith.",
    reversed: "Self-doubt, raw impulsiveness, feelings of weakness, emotional volatility, or burning out your reserves.",
    description: "A serene woman adorned with roses gently closing the jaw of a lion with soft loving hands.",
    symbolColor: "#d97706"
  },
  {
    id: "maj_09",
    number: 9,
    roman: "IX",
    name: "The Hermit",
    arcana: "major",
    element: "Earth / Virgo",
    keywords: ["Soul Searching", "Solitude", "Inner Light", "Wisdom", "Introspection"],
    upright: "Withdraw from the crowd. Hold up your internal lantern to illuminate the sacred path. Quiet reflection brings profound revelation.",
    reversed: "Excessive isolation, loneliness, hiding from truth, anti-social withdrawal, or ignoring helpful guides.",
    description: "An ancient sage in a grey cloak atop a snowy mountain, holding a beacon lantern housing a radiant six-pointed star.",
    symbolColor: "#64748b"
  },
  {
    id: "maj_10",
    number: 10,
    roman: "X",
    name: "Wheel of Fortune",
    arcana: "major",
    element: "Fire / Jupiter",
    keywords: ["Destiny", "Cycles", "Turning Point", "Karma", "Inevitable Change"],
    upright: "The cosmic wheel turns. A shift in luck, synchronicity, and divine timing are active. Embrace the natural ebb and flow of life.",
    reversed: "Bad luck, resisting necessary cycles, feeling trapped by fate, a reminder that downs are as temporary as ups.",
    description: "The great golden wheel etched with Hebrew and alchemical glyphs spinning amidst the four living creatures in the clouds.",
    symbolColor: "#eab308"
  },
  {
    id: "maj_11",
    number: 11,
    roman: "XI",
    name: "Justice",
    arcana: "major",
    element: "Air / Libra",
    keywords: ["Truth", "Fairness", "Cause & Effect", "Clarity", "Integrity"],
    upright: "Truth will be revealed. Act with unflinching honesty and balance your scales. Clear karmic equilibrium will be restored.",
    reversed: "Dishonesty, unfair treatment, dodging accountability, prejudice, or harsh self-judgment.",
    description: "Robed in crimson between upright pillars, holding the upright two-edged sword of truth and balanced golden scales.",
    symbolColor: "#38bdf8"
  },
  {
    id: "maj_12",
    number: 12,
    roman: "XII",
    name: "The Hanged Man",
    arcana: "major",
    element: "Water / Neptune",
    keywords: ["Surrender", "New Perspective", "Pause", "Release", "Enlightenment"],
    upright: "Voluntary suspension. Let go of fighting the current. In pausing and viewing reality upside down, newfound wisdom is found.",
    reversed: "Futile struggle, stalling out of fear, martyr complex, spiritual stagnation, resisting surrender.",
    description: "Suspended by one foot from the Living Tree, radiating a halo of serene golden enlightenment.",
    symbolColor: "#06b6d4"
  },
  {
    id: "maj_13",
    number: 13,
    roman: "XIII",
    name: "Death",
    arcana: "major",
    element: "Water / Scorpio",
    keywords: ["Transformation", "Endings", "Transition", "Rebirth", "Shedding Old Skin"],
    upright: "A profound ending that clears space for majestic rebirth. Shed what has outlived its purpose with reverence and anticipation.",
    reversed: "Clinging to the past, fear of change, repeating dead patterns, prolonged painful endings.",
    description: "The mystical skeletal rider holding the banner of the mystic rose while the sun rises between two distant towers.",
    symbolColor: "#475569"
  },
  {
    id: "maj_14",
    number: 14,
    roman: "XIV",
    name: "Temperance",
    arcana: "major",
    element: "Fire / Sagittarius",
    keywords: ["Alchemy", "Balance", "Moderation", "Patience", "Inner Peace"],
    upright: "Harmonizing extremes. Blend opposite energies into a higher elixir of life. Move with measured grace, patience, and moderation.",
    reversed: "Extremes, imbalance, impatience, chaotic mixing of energies, burning bridges through hurried reactions.",
    description: "A winged angel with one foot in water and one on land, pouring the elixir of life between two golden cups without spilling a drop.",
    symbolColor: "#a855f7"
  },
  {
    id: "maj_15",
    number: 15,
    roman: "XV",
    name: "The Devil",
    arcana: "major",
    element: "Earth / Capricorn",
    keywords: ["Shadow Self", "Attachment", "Illusion of Trap", "Temptation", "Awakening"],
    upright: "Notice where you have given your power away to fear, compulsive habits, or material addictions. The chains around your neck are loose.",
    reversed: "Breaking free from toxicity, releasing old dependencies, embracing freedom, confronting shadow illusions.",
    description: "The horned baphomet perched atop a stone altar with two loosely chained figures who can slip free at any moment.",
    symbolColor: "#b91c1c"
  },
  {
    id: "maj_16",
    number: 16,
    roman: "XVI",
    name: "The Tower",
    arcana: "major",
    element: "Fire / Mars",
    keywords: ["Sudden Awakening", "Breakdown to Breakthrough", "Upheaval", "Revelation"],
    upright: "Lightning strikes false illusions. Though disruptive, this sudden clearing collapses brittle structures to make way for authentic truth.",
    reversed: "Disaster avoided, delaying inevitable collapse, fear of facing fundamental shifts, internal crisis.",
    description: "A high fortress blasted by lightning from the heavens, crown dislodged, flames bursting as false pride crumbles.",
    symbolColor: "#ea580c"
  },
  {
    id: "maj_17",
    number: 17,
    roman: "XVII",
    name: "The Star",
    arcana: "major",
    element: "Air / Aquarius",
    keywords: ["Hope", "Inspiration", "Healing", "Serenity", "Divine Blessing"],
    upright: "After the storm, the sky clears. Healing light pours upon your heart. Have complete faith in the radiant future calling you forward.",
    reversed: "Despair, discouragement, feeling disconnected from grace, cynicism, neglecting emotional replenishment.",
    description: "A naked maiden beneath an eight-pointed radiant star pouring water onto land and pool, nourishing the earth.",
    symbolColor: "#0ea5e9"
  },
  {
    id: "maj_18",
    number: 18,
    roman: "XVIII",
    name: "The Moon",
    arcana: "major",
    element: "Water / Pisces",
    keywords: ["Illusion", "Subconscious", "Dreams", "Intuitive Depth", "Unveiling Truth"],
    upright: "Not all is as it seems in the moonlight. Trust your instincts through the fog. Pay close attention to vivid dreams and emotional undercurrents.",
    reversed: "Lifting of confusion, seeing through deception, release of irrational dread, waking from an illusion.",
    description: "A full moon shedding dewdrops between two towers while a dog and wolf howl, and a crayfish emerges from the water.",
    symbolColor: "#6366f1"
  },
  {
    id: "maj_19",
    number: 19,
    roman: "XIX",
    name: "The Sun",
    arcana: "major",
    element: "Fire / Sun",
    keywords: ["Joy", "Vitality", "Success", "Warmth", "Clarity & Celebration"],
    upright: "Radiant joy, clarity, and boundless optimism! Your vitality shines like midday sun. Success, warmth, and pure celebration surround you.",
    reversed: "Temporary clouds over your joy, burnout, struggling to see the bright side, delayed gratification.",
    description: "A golden smiling sun beaming down upon a joyous child riding a gentle white steed amidst vibrant sunflowers.",
    symbolColor: "#facc15"
  },
  {
    id: "maj_20",
    number: 20,
    roman: "XX",
    name: "Judgement",
    arcana: "major",
    element: "Fire / Pluto",
    keywords: ["Awakening", "Reckoning", "Higher Calling", "Forgiveness", "Rebirth"],
    upright: "The horn sounds your sacred wake-up call. Rise out of past regrets, forgive what was, and step boldly into your higher purpose.",
    reversed: "Self-criticism, ignoring the call to grow, lingering guilt, hesitation to step into your power.",
    description: "Archangel Gabriel sounding the gilded horn from the heavens as souls rise from gray sarcophagi with arms wide open.",
    symbolColor: "#9333ea"
  },
  {
    id: "maj_21",
    number: 21,
    roman: "XXI",
    name: "The World",
    arcana: "major",
    element: "Earth / Saturn",
    keywords: ["Completion", "Wholeness", "Integration", "Achievement", "Cosmic Harmony"],
    upright: "The cycle is gloriously fulfilled. You have journeyed far and integrated all lessons. Celebrate your wholeness and step into new mastery.",
    reversed: "Unfinished business, missing closure, rushing ahead before savoring completion, feeling close yet delayed.",
    description: "The dancing maiden encircled by the laurel wreath of victory, flanked by the four guardians of the cosmos.",
    symbolColor: "#14b8a6"
  }
];

const suits = [
  {
    key: "wands",
    name: "Wands",
    element: "Fire",
    domain: "Energy, Passion, Ambition, Creativity",
    color: "#f97316"
  },
  {
    key: "cups",
    name: "Cups",
    element: "Water",
    domain: "Emotions, Love, Intuition, Relationships",
    color: "#38bdf8"
  },
  {
    key: "swords",
    name: "Swords",
    element: "Air",
    domain: "Mind, Intellect, Truth, Challenges",
    color: "#a855f7"
  },
  {
    key: "pentacles",
    name: "Pentacles",
    element: "Earth",
    domain: "Material Wealth, Career, Health, Foundation",
    color: "#eab308"
  }
];

const ranks = [
  {
    rank: "ace",
    name: "Ace",
    keywordsUpright: ["Pure Potential", "New Spark", "Opportunity", "Gift of the Element"],
    keywordsReversed: ["Missed Opportunity", "Blocked Energy", "Delays", "Hesitation"],
    uprightDesc: "A raw gift of {element} energy emerges. A powerful seed is planted with infinite upside.",
    reversedDesc: "Creative blockage, hesitating to plant the seed, or misdirected potential."
  },
  {
    rank: "2",
    name: "Two",
    keywordsUpright: ["Duality", "Balance", "Planning", "Partnership"],
    keywordsReversed: ["Imbalance", "Division", "Overwhelmed", "Indecision"],
    uprightDesc: "Finding equilibrium between choices or creating an intentional blueprint for expansion.",
    reversedDesc: "Struggling to balance dual demands or indecisiveness stalling progress."
  },
  {
    rank: "3",
    name: "Three",
    keywordsUpright: ["Growth", "Expansion", "Collaboration", "Initial Results"],
    keywordsReversed: ["Delays", "Creative Friction", "Miscommunication", "Lack of Foresight"],
    uprightDesc: "Early results show promise. Teamwork, creative synergy, and expanding horizons take flight.",
    reversedDesc: "Cooperation breaking down or plans requiring reassessment."
  },
  {
    rank: "4",
    name: "Four",
    keywordsUpright: ["Stability", "Foundation", "Rest", "Structure"],
    keywordsReversed: ["Stagnation", "Restlessness", "Rigidity", "Need to Move"],
    uprightDesc: "A solid container, safe sanctuary, and grounded stability to build upon.",
    reversedDesc: "Security becoming a gilded cage or feeling stagnant."
  },
  {
    rank: "5",
    name: "Five",
    keywordsUpright: ["Conflict", "Challenge", "Test of Character", "Disruption"],
    keywordsReversed: ["Resolution", "Forgiveness", "Moving Beyond Struggle", "Relief"],
    uprightDesc: "A constructive friction or test revealing what is genuine and what must evolve.",
    reversedDesc: "The worst of the conflict has passed; healing and reconciliation begin."
  },
  {
    rank: "6",
    name: "Six",
    keywordsUpright: ["Harmony", "Generosity", "Triumph", "Sweet Balance"],
    keywordsReversed: ["Ego", "One-sided Giving", "Nostalgia Trap", "Short-lived Joy"],
    uprightDesc: "Victory, kind gestures, restoring flow, and sweet reciprocal blessings.",
    reversedDesc: "Unbalanced exchanges or lingering too long in nostalgic reverie."
  },
  {
    rank: "7",
    name: "Seven",
    keywordsUpright: ["Patience", "Strategy", "Perseverance", "Evaluation"],
    keywordsReversed: ["Doubt", "Giving Up Early", "Deception", "Impatience"],
    uprightDesc: "Pause to assess your harvest or defend your sacred position with strategic insight.",
    reversedDesc: "Second-guessing your efforts right before breakthrough."
  },
  {
    rank: "8",
    name: "Eight",
    keywordsUpright: ["Speed", "Mastery", "Dedication", "Flow State"],
    keywordsReversed: ["Burnout", "Slowness", "Perfectionism Trap", "Hasty Moves"],
    uprightDesc: "Focused craftsmanship, rapid movement, and dedicated cultivation of excellence.",
    reversedDesc: "Overworking without joy, or rushed execution causing mistakes."
  },
  {
    rank: "9",
    name: "Nine",
    keywordsUpright: ["Fulfillment", "Resilience", "Self-Sufficiency", "Near Finish"],
    keywordsReversed: ["Fatigue", "Defensiveness", "Overwhelm", "Lingering Dread"],
    uprightDesc: "You stand resilient, sovereign, and poised for fulfillment. Guard what matters most.",
    reversedDesc: "Exhaustion at the finish line; remember to rest and accept support."
  },
  {
    rank: "10",
    name: "Ten",
    keywordsUpright: ["Culmination", "Legacy", "Full Circle", "Wholeness"],
    keywordsReversed: ["Heavy Burden", "Collapse", "Resisting Endings", "Incomplete"],
    uprightDesc: "Full fruition of this suit's journey. A legacy established and cycle fulfilled.",
    reversedDesc: "Carrying unnecessary baggage or struggling under accumulated burdens."
  },
  {
    rank: "page",
    name: "Page",
    keywordsUpright: ["Eager Student", "Curiosity", "Fresh Message", "Exploration"],
    keywordsReversed: ["Immaturity", "Procrastination", "Unreliable News", "Shyness"],
    uprightDesc: "The young explorer bringing messages of curiosity, wonder, and fresh inspiration.",
    reversedDesc: "Scatterbrained curiosity without follow-through, or petty distractions."
  },
  {
    rank: "knight",
    name: "Knight",
    keywordsUpright: ["Action", "Momentum", "Bravery", "Direct Pursuit"],
    keywordsReversed: ["Recklessness", "Impatience", "Combative", "Drifting Off Track"],
    uprightDesc: "Galloping forward with purpose and devotion to their chosen quest.",
    reversedDesc: "Impulsive rush causing collateral damage, or lack of stamina."
  },
  {
    rank: "queen",
    name: "Queen",
    keywordsUpright: ["Mastery of Within", "Compassion", "Grace", "Magnetic Presence"],
    keywordsReversed: ["Insecurity", "Overbearing", "Emotional Drain", "Cold Demeanor"],
    uprightDesc: "A deeply embodied master holding sovereign authority with gentle grace.",
    reversedDesc: "Allowing insecurity to cloud inner warmth and self-worth."
  },
  {
    rank: "king",
    name: "King",
    keywordsUpright: ["Leadership", "Authority", "Wisdom", "Commanding Execution"],
    keywordsReversed: ["Tyranny", "Stubbornness", "Ruthlessness", "Weakness"],
    uprightDesc: "Mature mastery, visionary governance, and commanding influence over their domain.",
    reversedDesc: "Rigid dogmatism or using power to control rather than elevate."
  }
];

const allCards = [...majorArcanaData];

suits.forEach(suit => {
  ranks.forEach(rank => {
    const cardName = `${rank.name} of ${suit.name}`;
    const cardId = `${suit.key}_${rank.rank}`;
    allCards.push({
      id: cardId,
      name: cardName,
      arcana: "minor",
      suit: suit.name,
      suitKey: suit.key,
      rank: rank.name,
      element: suit.element,
      keywords: rank.keywordsUpright,
      upright: rank.uprightDesc.replace("{element}", suit.domain),
      reversed: rank.reversedDesc,
      description: `${cardName} embodies the essence of ${suit.domain.toLowerCase()} with the archetype of the ${rank.name}.`,
      symbolColor: suit.color
    });
  });
});

console.log(`Generated ${allCards.length} tarot cards.`);

const outputDir = path.join(__dirname);
fs.writeFileSync(path.join(outputDir, 'tarotDeck.json'), JSON.stringify(allCards, null, 2));

// Also write a copy directly to client for zero-latency instant bundling and offline fallback
const clientDataDir = path.join(__dirname, '../../../client/src/data');
if (!fs.existsSync(clientDataDir)) {
  fs.mkdirSync(clientDataDir, { recursive: true });
}
fs.writeFileSync(path.join(clientDataDir, 'tarotDeck.json'), JSON.stringify(allCards, null, 2));

console.log("Successfully wrote tarotDeck.json to server and client!");
