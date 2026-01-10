// Core lists for cinematic mode
const CINEMATIC = {
  genre_style: ["cinematic", "gritty", "epic war", "dark fantasy", "sci-fi", "mythic", "docu-drama"],
  shot_type: ["wide shot", "medium shot", "medium close-up", "close-up", "over-the-shoulder", "low-angle", "drone overhead", "tracking shot", "extreme close-up"],
  camera_move: ["slowly zooms in", "pushes in", "orbits", "tracks alongside", "pulls back and rises", "handheld creeps forward", "pulls back reveal"],
  weather: ["stormy sky", "blizzard winds", "ash-filled haze", "heavy fog", "cold rain", "sunset smoke"],
  lighting: ["dim rim light", "firelit flicker", "moonlit glow", "overcast flat light", "harsh backlight"],
  sound: ["distant thunder and whipping wind", "war drums and clashing steel", "muffled explosions and ringing ears", "howling gusts and creaking armor"],
  sig_visuals: ["breath pluming in the cold air", "blood glistening on the blade", "rain beads on armor", "hair whipping across the face", "steam rising from damp earth", "embers reflecting in the eyes"],
  subject_role: ["Viking warrior", "soldier", "knight", "ronin", "scout", "bounty hunter"],
  subject_traits: ["fierce", "scarred", "muscular", "weary", "defiant", "bloodied", "calm and focused"],
  pose_action: ["standing", "marching", "kneeling", "bracing", "charging", "catching breath"],
  wardrobe: ["leather armor", "chainmail", "fur cloak", "mud-streaked fatigues", "tattered cloak"],
  prop_weapon: ["axe", "sword", "shield", "spear", "bow", "rifle"],
  prop_action: ["gripping", "resting on", "raises", "drags", "steadying", "sheaths"],
  hair_face_detail: ["long hair billowing", "blood on cheek", "breath visible", "helm dented", "eyes rimmed red"],
  environment: ["cliffside", "battlefield", "ruined village", "muddy trench", "snowy pass", "burned forest"],
  light_interaction: ["catches on wet armor", "wraps the silhouette in glow", "glints along the blade", "throws long, jagged shadows", "filters through drifting smoke"],
  focus_target: ["the warrior's eyes", "the bloodied weapon", "the clenched jaw", "the battered shield", "a distant enemy", "the horizon"],
  mood: ["foreboding", "heroic", "tense", "somber", "vengeful", "resolute"],
  lens: ["", "telephoto", "anamorphic", "35mm"],
  color_grade: ["", "desaturated", "teal/orange", "warm", "cold"],
  film_details: ["", "grain", "shallow DOF", "bokeh", "motion blur"],
  dialogue_verb: ["says", "roars", "whispers"],
  pronoun: ["He", "She", "They"],
};

const CLASSIC = {
  genre: ["Cinematic", "Thriller", "Horror", "Action", "War film", "Fantasy", "Sci-fi", "Documentary", "Romance", "Surreal"],
  shot: ["ultra wide", "wide", "medium", "medium close-up", "close-up", "over-the-shoulder", "low-angle", "high-angle"],
  camera: ["slow dolly in", "slow dolly out", "steady tracking", "handheld drift", "locked-off static", "orbit", "push in"],
  time: ["pre-dawn", "dawn", "golden hour", "afternoon", "sunset", "dusk", "night"],
  lighting: ["natural sunlight", "soft diffused light", "dramatic shadows", "neon glow", "moonlit", "firelight"],
  atmosphere: ["clear air", "rolling mist", "heavy rain", "light drizzle", "fog", "smoke haze", "volumetric haze"],
  palette: ["muted", "warm tones", "cool tones", "desaturated", "vibrant", "teal and orange"],
  audio: ["forest ambience with birds", "distant city traffic", "quiet room tone", "ocean waves", "battlefield ambience (distant)", "war drums"],
};

// Custom user presets storage
let USER_PRESETS = {
  cinematic: {},
  classic: {},
  nsfw: {}
};

// Custom user options storage
let CUSTOM_OPTIONS = {
  cinematic: {},
  classic: {},
  nsfw: {}
};

// Quick snapshots per mode (last-used forms)
let LAST_MODE_SNAPSHOT = {
  cinematic: null,
  classic: null,
  nsfw: null,
};

// Favorites per field (ordered, unique)
let FIELD_FAVORITES = {};

// Map inputs to option buckets for auto-capturing typed values
const FIELD_OPTION_MAP = {
  // Cinematic
  'cin-genre': { mode: 'cinematic', key: 'genre_style' },
  'cin-shot': { mode: 'cinematic', key: 'shot_type' },
  'cin-traits': { mode: 'cinematic', key: 'subject_traits' },
  'cin-role': { mode: 'cinematic', key: 'subject_role' },
  'cin-pose': { mode: 'cinematic', key: 'pose_action' },
  'cin-wardrobe': { mode: 'cinematic', key: 'wardrobe' },
  'cin-prop-action': { mode: 'cinematic', key: 'prop_action' },
  'cin-prop': { mode: 'cinematic', key: 'prop_weapon' },
  'cin-hair': { mode: 'cinematic', key: 'hair_face_detail' },
  'cin-environment': { mode: 'cinematic', key: 'environment' },
  'cin-weather': { mode: 'cinematic', key: 'weather' },
  'cin-lighting': { mode: 'cinematic', key: 'lighting' },
  'cin-light-interaction': { mode: 'cinematic', key: 'light_interaction' },
  'cin-sound': { mode: 'cinematic', key: 'sound' },
  'cin-dialogue-verb': { mode: 'cinematic', key: 'dialogue_verb' },
  'cin-pronoun': { mode: 'cinematic', key: 'pronoun' },
  'cin-camera': { mode: 'cinematic', key: 'camera_move' },
  'cin-focus': { mode: 'cinematic', key: 'focus_target' },
  'cin-mood': { mode: 'cinematic', key: 'mood' },
  'cin-lens': { mode: 'cinematic', key: 'lens' },
  'cin-grade': { mode: 'cinematic', key: 'color_grade' },
  'cin-film': { mode: 'cinematic', key: 'film_details' },

  // Classic
  'cl-genre': { mode: 'classic', key: 'genre' },
  'cl-shot': { mode: 'classic', key: 'shot' },
  'cl-camera': { mode: 'classic', key: 'camera' },
  'cl-time': { mode: 'classic', key: 'time' },
  'cl-lighting': { mode: 'classic', key: 'lighting' },
  'cl-atmosphere': { mode: 'classic', key: 'atmosphere' },
  'cl-palette': { mode: 'classic', key: 'palette' },
  'cl-audio': { mode: 'classic', key: 'audio' },

  // NSFW
  'nsfw-genre': { mode: 'nsfw', key: 'genre_style' },
  'nsfw-shot': { mode: 'nsfw', key: 'shot_type' },
  'nsfw-role': { mode: 'nsfw', key: 'subject_role' },
  'nsfw-wardrobe': { mode: 'nsfw', key: 'wardrobe' },
  'nsfw-pose': { mode: 'nsfw', key: 'pose_action' },
  'nsfw-hair': { mode: 'nsfw', key: 'hair_face_detail' },
  'nsfw-environment': { mode: 'nsfw', key: 'environment' },
  'nsfw-weather': { mode: 'nsfw', key: 'weather' },
  'nsfw-lighting': { mode: 'nsfw', key: 'lighting' },
  'nsfw-sound': { mode: 'nsfw', key: 'sound' },
  'nsfw-camera': { mode: 'nsfw', key: 'camera_move' },
  'nsfw-mood': { mode: 'nsfw', key: 'mood' },
  'nsfw-explicit-abilities': { mode: 'nsfw', key: 'explicit_abilities' },
  'nsfw-body-description': { mode: 'nsfw', key: 'body_description' },
  'nsfw-sexual-description': { mode: 'nsfw', key: 'sexual_description' },
};

const DEFAULT_APP_SETTINGS = {
  theme: 'github-dark',
  randomizeScope: 'all',
  batchCount: 1,
  compactUI: true,
  rememberNSFW: false,
  nsfwEnabled: false,
  autoCopyBatch: false,
  numberBatchResults: false,
  addBatchTitles: false,
  promptTemplate: 'standard',
};

let APP_SETTINGS = { ...DEFAULT_APP_SETTINGS };

const LOCKED_FIELDS = new Set();
let LAST_SEED = null;

// NSFW data
const NSFW_GENRES = [
  "Erotic", "Adult film", "Fetish", "BDSM", "Striptease", "Hentai", "Roleplay", "Swingers", "Erotic thriller", "Lingerie fashion",
  "Sensual massage", "Tantric sex", "Exhibitionism", "Voyeurism", "Foot fetish", "Latex fetish", "Leather fetish", "Bondage play",
  "Domination", "Submission", "Power exchange", "Sensory play", "Impact play", "Nipple play", "Anal play", "Double penetration",
  "Gangbang", "Orgy", "Threesome", "Cuckolding", "Hotwife", "Swinging lifestyle", "Polyamory", "Open relationship",
  "Casual encounter", "One-night stand", "Friends with benefits", "Booty call", "Hook-up", "NSA sex", "Pure lust",
  "Passionate affair", "Forbidden romance", "Secret rendezvous", "Office romance", "Boss-secretary", "Teacher-student fantasy",
  "Doctor-patient", "Nurse-patient", "Cop-criminal", "Firefighter-rescue", "Pilot-flight attendant", "Chef-waitress",
  "Artist-model", "Writer-muse", "Musician-groupie", "Actor-director", "Dancer-choreographer", "Model-photographer",
  "Scientist-subject", "Explorer-guide", "Warrior-healer", "Knight-damsel", "Pirate-captive", "Vampire-victim",
  "Werewolf-mate", "Alien-human", "Robot-android", "Superhero-sidekick", "Villain-heroine", "Spy-agent",
  "Assassin-target", "Detective-suspect", "Lawyer-client", "Therapist-patient", "Coach-athlete", "Personal trainer",
  "Yoga instructor", "Massage therapist", "Tattoo artist", "Piercer-client", "Barber-client", "Hairdresser-client",
  "Makeup artist", "Fashion designer", "Jewelry designer", "Perfume creator", "Wine sommelier", "Chef-patron",
  "Bartender-patron", "DJ-clubgoer", "Stripper-client", "Escort-client", "Cam girl-viewer", "Porn star-fan",
  "Adult performer", "Sex worker", "Prostitute-john", "Sugar baby-sugar daddy", "Mistress-submissive", "Dominatrix-client",
  "Femdom-male sub", "Cuckold-husband", "Bull-lover", "Stag-wife", "Vixen-husband", "Hotwife-husband",
  "Shared wife", "Wife swapping", "Partner sharing", "Group sex", "Ménage à trois", "Quad play", "Party scene",
  "Club pickup", "Bar hookup", "Concert backstage", "Festival camping", "Beach vacation", "Pool party",
  "Hot tub encounter", "Sauna steam", "Gym locker room", "Yoga class", "Dance class", "Cooking class",
  "Wine tasting", "Art gallery", "Museum tour", "Theater performance", "Concert hall", "Opera house",
  "Broadway show", "Movie theater", "Drive-in movie", "Amusement park", "Carnival ride", "Fairground",
  "Circus tent", "Magic show", "Comedy club", "Jazz club", "Rock concert", "Electronic festival",
  "Country fair", "Rodeo", "Horse ranch", "Sailing yacht", "Private jet", "Luxury hotel", "Boutique inn",
  "Beach resort", "Mountain cabin", "Forest lodge", "Desert oasis", "Island paradise", "Tropical getaway",
  "Ski chalet", "Ice hotel", "Treehouse retreat", "Underground bunker", "Space station", "Submarine voyage",
  "Time travel", "Parallel universe", "Dream world", "Virtual reality", "Augmented reality", "Cyberpunk city",
  "Steampunk era", "Victorian romance", "Medieval fantasy", "Ancient civilization", "Future dystopia",
  "Post-apocalyptic", "Zombie apocalypse", "Alien invasion", "Superhero universe", "Magic realm",
  "Underwater kingdom", "Cloud city", "Floating island", "Crystal cave", "Volcano lair", "Ice palace",
  "Jungle temple", "Desert tomb", "Mountain monastery", "Forest glade", "Meadow clearing", "River bank",
  "Lake shore", "Ocean cliff", "Waterfall pool", "Hot spring", "Geyser field", "Canyon rim", "Plateau vista",
  "Valley floor", "Hilltop view", "Summit peak", "Cave entrance", "Mine shaft", "Abandoned factory",
  "Derelict warehouse", "Ghost town", "Haunted mansion", "Creepy castle", "Spooky forest", "Foggy moor",
  "Stormy sea", "Desert storm", "Tropical storm", "Blizzard night", "Heatwave day", "Monsoon season",
  "Drought land", "Flood plain", "Earthquake zone", "Volcano slope", "Avalanche risk", "Wildfire area",
  "Tsunami coast", "Hurricane path", "Tornado alley", "Lightning storm", "Solar flare", "Meteor shower",
  "Comet tail", "Asteroid field", "Black hole", "Wormhole", "Quantum realm", "Multiverse", "Alternate reality",
  "Custom"
];

const NSFW_CLOTHING_PRESETS = [
  "nude", "lingerie", "stockings", "corset", "bodysuit", "thong", "bra and panties", "fishnet stockings", "leather harness", "latex suit",
  "sheer robe", "teddy", "chemise", "bikini", "micro bikini", "thigh-high boots", "high heels", "platform heels", "collar and cuffs", "bondage gear",
  "fetish wear", "roleplay costume", "negligee", "babydoll", "camisole", "garter belt", "pantyhose", "mesh top", "crop top", "micro skirt",
  "sheer dress", "transparent blouse", "open robe", "robe barely closed", "towel wrapped loosely", "sheet draped", "blanket fort", "bubble bath",
  "swimsuit", "one-piece swimsuit", "thong bikini", "string bikini", "monokini", "tankini", "burkini", "wetsuit", "diving suit", "surf wear",
  "yoga pants", "leggings", "tights", "pantyhose", "fishnets", "nylon stockings", "silk stockings", "lace stockings", "patterned stockings", "seamed stockings",
  "garters", "garter belt", "suspenders", "belt with garters", "corset with garters", "bustier", "basque", "cincher", "waist cincher", "hourglass corset",
  "push-up bra", "balconette bra", "plunge bra", "strapless bra", "backless bra", "front-hook bra", "sports bra", "nursing bra", "maternity bra", "bridal lingerie",
  "thong panties", "g-string", "boyshorts", "hipsters", "bikini panties", "high-cut panties", "low-rise panties", "mid-rise panties", "high-waisted panties", "control panties",
  "boxers", "briefs", "boxer briefs", "jockey shorts", "tighty whities", "speedo", "thong underwear", "jockstrap", "athletic supporter", "compression shorts",
  "nightgown", "nightie", "pajamas", "pajama set", "silk pajamas", "satin pajamas", "flannel pajamas", "teddy bear pajamas", "sexy pajamas", "lingerie pajamas",
  "robe", "bathrobe", "kimono", "housecoat", "dressing gown", "towel robe", "spa robe", "hotel robe", "silk robe", "velvet robe",
  "dress", "mini dress", "maxi dress", "midi dress", "bodycon dress", "wrap dress", "sheath dress", "shift dress", "tunic dress", "shirt dress",
  "skirt", "mini skirt", "maxi skirt", "midi skirt", "pencil skirt", "A-line skirt", "pleated skirt", "wrap skirt", "tulle skirt", "leather skirt",
  "top", "crop top", "halter top", "tube top", "bralette", "camisole", "tank top", "blouse", "button-up shirt", "t-shirt",
  "jacket", "blazer", "leather jacket", "denim jacket", "bomber jacket", "trench coat", "raincoat", "fur coat", "wool coat", "silk coat",
  "pants", "jeans", "skinny jeans", "bootcut jeans", "flare jeans", "leggings", "jeggings", "capri pants", "cargo pants", "parachute pants",
  "shorts", "short shorts", "denim shorts", "cargo shorts", "board shorts", "running shorts", "bike shorts", "hot pants", "Daisy Dukes", "cutoffs",
  "shoes", "high heels", "stiletto heels", "platform heels", "wedge heels", "block heels", "kitten heels", "flats", "ballet flats", "loafers",
  "boots", "thigh-high boots", "knee-high boots", "ankle boots", "combat boots", "cowboy boots", "riding boots", "rain boots", "snow boots", "work boots",
  "sandals", "flip-flops", "gladiator sandals", "wedge sandals", "platform sandals", "espadrilles", "mules", "clogs", "crocs", "slides",
  "sneakers", "running shoes", "tennis shoes", "basketball shoes", "converse", "vans", "nike", "adidas", "puma", "reebok",
  "accessories", "belt", "necklace", "earrings", "bracelet", "ring", "watch", "gloves", "scarf", "hat",
  "jewelry", "diamond necklace", "pearl earrings", "gold bracelet", "silver ring", "watch", "anklet", "toe ring", "nose ring", "belly button piercing",
  "piercings", "ear piercings", "nose piercing", "lip piercing", "tongue piercing", "eyebrow piercing", "nipple piercings", "genital piercings", "navel piercing", "septum piercing",
  "tattoos", "sleeve tattoo", "back tattoo", "chest tattoo", "arm tattoo", "leg tattoo", "ankle tattoo", "wrist tattoo", "finger tattoo", "neck tattoo",
  "makeup", "red lipstick", "black eyeliner", "mascara", "blush", "highlighter", "contour", "eyeshadow", "nail polish", "false eyelashes",
  "hair", "long hair", "short hair", "curly hair", "straight hair", "braids", "ponytail", "bun", "pigtails", "afro",
  "costumes", "nurse costume", "police costume", "firefighter costume", "cheerleader costume", "schoolgirl costume", "french maid costume", "bunny costume", "cat costume", "devil costume",
  "fetish gear", "collar", "leash", "handcuffs", "rope", "chains", "whip", "paddle", "blindfold", "gag",
  "latex", "latex catsuit", "latex dress", "latex skirt", "latex top", "latex pants", "latex gloves", "latex boots", "latex mask", "latex hood",
  "leather", "leather corset", "leather pants", "leather skirt", "leather jacket", "leather boots", "leather gloves", "leather mask", "leather harness", "leather chaps",
  "rubber", "rubber suit", "rubber dress", "rubber gloves", "rubber boots", "rubber mask", "rubber hood", "rubber corset", "rubber skirt", "rubber top",
  "PVC", "PVC dress", "PVC skirt", "PVC top", "PVC pants", "PVC boots", "PVC gloves", "PVC mask", "PVC corset", "PVC catsuit",
  "mesh", "mesh top", "mesh dress", "mesh skirt", "mesh stockings", "mesh gloves", "mesh mask", "mesh bodysuit", "mesh lingerie", "mesh robe",
  "sheer", "sheer blouse", "sheer dress", "sheer robe", "sheer lingerie", "sheer stockings", "sheer gloves", "sheer veil", "sheer scarf", "sheer curtains",
  "transparent", "transparent dress", "transparent top", "transparent skirt", "transparent robe", "transparent lingerie", "transparent stockings", "transparent gloves", "transparent mask", "transparent veil",
  "open", "open blouse", "open dress", "open robe", "open lingerie", "open crotch panties", "open back dress", "open front dress", "open sided dress", "open bottom pajamas",
  "revealing", "low cut top", "high slit skirt", "sheer panel dress", "cut out dress", "keyhole top", "halter neck", "deep V neck", "plunge neckline", "off the shoulder",
  "tight", "skin tight dress", "body hugging top", "clinging skirt", "form fitting pants", "snug leggings", "tight jeans", "compression wear", "spanx", "shapewear",
  "loose", "flowy dress", "loose blouse", "baggy pants", "oversized shirt", "tunic", "kaftan", "muumuu", "tent dress", "maxi dress",
  "layered", "layered skirts", "layered tops", "layered dresses", "tulle layers", "chiffon layers", "silk layers", "lace layers", "mesh layers", "sheer layers",
  "patterned", "polka dots", "stripes", "florals", "animal print", "camouflage", "plaid", "houndstooth", "chevrons", "geometric",
  "colored", "red dress", "black lingerie", "white blouse", "blue jeans", "green skirt", "yellow top", "purple robe", "orange shorts", "pink panties",
  "metallic", "gold dress", "silver top", "bronze skirt", "copper pants", "platinum lingerie", "rose gold robe", "gunmetal boots", "chrome accessories", "mirror finish",
  "neon", "neon pink", "neon green", "neon blue", "neon yellow", "neon orange", "neon purple", "neon red", "neon white", "neon black",
  "glow", "glow in the dark", "UV reactive", "phosphorescent", "luminescent", "fluorescent", "bioluminescent", "LED embedded", "fiber optic", "light up",
  "tech", "smart fabric", "heated clothing", "cooled clothing", "massaging fabric", "vibrating lingerie", "app controlled", "sensor embedded", "AR overlay", "VR compatible",
  "future", "nano fabric", "self cleaning", "self repairing", "shape changing", "color changing", "texture changing", "size adjusting", "temperature regulating", "moisture wicking",
  "fantasy", "enchanted fabric", "magic robe", "dragon scale armor", "elf silk", "mermaid scales", "fairy wings", "unicorn horn", "wizard cloak", "sorceress gown",
  "historical", "victorian corset", "renaissance gown", "medieval tunic", "ancient toga", "roman stola", "egyptian linen", "vikings furs", "samurai robes", "geisha kimono",
  "cultural", "sari", "cheongsam", "dirndl", "hanbok", "ao dai", "dashiki", "kilt", "sarong", "pareo",
  "seasonal", "christmas lingerie", "halloween costume", "summer bikini", "winter fur", "spring floral", "fall plaid", "easter bonnet", "valentines lace", "new years sequins",
  "occasion", "wedding dress", "bridal lingerie", "prom gown", "graduation robe", "funeral black", "party dress", "cocktail attire", "casual wear", "business suit",
  "sports", "tennis skirt", "golf polo", "swimwear", "running shorts", "cycling gear", "ski suit", "surf wetsuit", "gymnastics leotard", "ballet tutu",
  "work", "business suit", "uniform", "lab coat", "chef coat", "mechanic coveralls", "construction vest", "medical scrubs", "police uniform", "military fatigues",
  "casual", "t-shirt and jeans", "sweatshirt", "hoodie", "leggings", "yoga pants", "athletic wear", "loungewear", "pajamas", "robe",
  "formal", "tuxedo", "ball gown", "cocktail dress", "suit and tie", "evening gown", "black tie", "white tie", "military dress", "diplomatic attire",
  "beach", "swimsuit", "cover up", "sarong", "flip flops", "sunglasses", "hat", "beach towel", "bikini", "board shorts",
  "pool", "swimsuit", "pool cover up", "flip flops", "sunglasses", "pool towel", "pool shoes", "rash guard", "pool noodles", "floaties",
  "gym", "workout clothes", "sports bra", "leggings", "sneakers", "headband", "wristbands", "water bottle", "towel", "lock",
  "office", "business suit", "blouse", "skirt", "pants", "heels", "flats", "blazer", "tie", "dress shirt",
  "home", "pajamas", "robe", "slippers", "house shoes", "loungewear", "comfy clothes", "sweats", "t-shirt", "shorts",
  "travel", "travel clothes", "comfortable shoes", "scarf", "hat", "sunglasses", "jacket", "backpack", "suitcase", "passport holder",
  "party", "party dress", "cocktail dress", "heels", "jewelry", "makeup", "hair done", "nails done", "perfume", "clutch",
  "date", "date night dress", "nice blouse", "dress pants", "heels", "jewelry", "makeup", "perfume", "cologne", "flowers",
  "wedding", "wedding dress", "tuxedo", "bridal party dresses", "suits", "flowers", "rings", "veil", "tuxedo", "boutonniere",
  "funeral", "black suit", "black dress", "black tie", "black shoes", "hat", "gloves", "flowers", "condolence card", "tissue",
  "graduation", "cap and gown", "tassel", "diploma", "flowers", "gift", "camera", "family", "friends", "celebration",
  "birthday", "birthday suit", "party hat", "cake", "presents", "balloons", "streamers", "confetti", "party favors", "guests",
  "holiday", "holiday sweater", "ugly christmas sweater", "santa hat", "elf costume", "reindeer antlers", "mistletoe", "eggnog", "cookies", "lights",
  "halloween", "costume", "mask", "cape", "witch hat", "pumpkin", "candy", "trick or treat", "scary makeup", "fake blood",
  "thanksgiving", "turkey", "pilgrim hat", "feathers", "cornucopia", "pumpkin pie", "stuffing", "cranberries", "gravy", "mashed potatoes",
  "easter", "bunny ears", "eggs", "basket", "chocolate", "jelly beans", "pastel colors", "flowers", "bonnet", "dress",
  "valentines", "red dress", "heart necklace", "roses", "chocolate", "wine", "candlelight", "romantic dinner", "love letter", "teddy bear",
  "st patricks", "green dress", "leprechaun hat", "clover", "beer", "irish stew", "potatoes", "corned beef", "cabbage", "parade",
  "fourth of july", "red white blue", "stars and stripes", "fireworks", "barbecue", "hot dogs", "hamburgers", "beer", "patriotic hat", "flag",
  "labor day", "back to school", "new clothes", "school supplies", "lunchbox", "backpack", "pencils", "notebooks", "erasers", "glue",
  "memorial day", "barbecue", "pool party", "beach day", "picnic", "flowers", "flags", "parade", "memorial", "grill",
  "mothers day", "flowers", "card", "breakfast in bed", "gift", "spa day", "massage", "pedicure", "brunch", "mimosa",
  "fathers day", "tie", "grill", "tools", "beer", "card", "gift card", "watch", "wallet", "cologne",
  "anniversary", "flowers", "card", "jewelry", "dinner", "wine", "candlelight", "photobook", "renewal of vows", "trip",
  "engagement", "ring", "proposal", "champagne", "flowers", "photographer", "family", "friends", "celebration", "party",
  "baby shower", "diapers", "onesies", "toys", "blanket", "booties", "pacifier", "bottle", "high chair", "stroller",
  "housewarming", "houseplant", "picture frame", "throw blanket", "candle", "wine opener", "cutting board", "mixing bowl", "towel set", "welcome mat",
  "retirement", "watch", "fishing rod", "golf clubs", "travel voucher", "photo album", "card", "party", "speech", "cake",
  "promotion", "new suit", "briefcase", "coffee mug", "desk accessories", "card", "gift card", "flowers", "champagne", "dinner",
  "new job", "business cards", "portfolio", "resume", "interview outfit", "lunch with boss", "desk setup", "coffee mug", "plant", "card",
  "moving", "boxes", "tape", "bubble wrap", "truck", "friends to help", "pizza", "beer", "new address", "change of address cards",
  "divorce", "lawyer", "therapist", "support group", "new apartment", "self care", "spa day", "new clothes", "friends", "family",
  "breakup", "ice cream", "chocolate", "wine", "friends", "spa day", "new haircut", "new clothes", "travel", "self reflection",
  "loss", "flowers", "card", "food", "memorial", "support", "therapy", "friends", "family", "time",
  "illness", "get well card", "soup", "flowers", "blanket", "pillows", "medicine", "doctor", "rest", "care",
  "accident", "get well card", "flowers", "card", "support", "care", "recovery", "therapy", "patience", "love",
  "surgery", "get well card", "flowers", "soup", "blanket", "pillows", "pain medication", "doctor", "rest", "care",
  "pregnancy", "maternity clothes", "prenatal vitamins", "doctor appointments", "ultrasound", "baby books", "nursery planning", "showers", "cravings", "rest",
  "new baby", "diapers", "onesies", "bottles", "pacifiers", "blankets", "toys", "high chair", "stroller", "car seat",
  "toddler", "toys", "books", "clothes", "shoes", "backpack", "lunchbox", "sippy cup", "training potty", "bedtime routine",
  "child", "clothes", "toys", "books", "school supplies", "backpack", "lunchbox", "water bottle", "hat", "sunglasses",
  "teen", "clothes", "phone", "headphones", "backpack", "school supplies", "sports equipment", "books", "games", "friends",
  "adult", "clothes", "car", "house", "job", "relationships", "hobbies", "travel", "food", "entertainment",
  "senior", "comfortable clothes", "walker", "hearing aid", "glasses", "medication", "doctor appointments", "social activities", "family", "friends",
  "Custom"
];

const NSFW_ACTION_PRESETS = [
  "poses seductively", "strikes a sexy pose", "arches back seductively",
  "strips slowly", "removes clothing teasingly", "undresses provocatively",
  "dances erotically", "performs a sensual dance", "twists hips seductively",
  "touches themselves intimately", "caresses their body", "runs hands over curves",
  "engages in passionate kissing", "kisses deeply", "makes out intensely",
  "performs oral sex", "goes down on partner", "receives oral pleasure",
  "engages in intercourse", "has sex passionately", "thrusts rhythmically",
  "explores with hands", "touches erogenous zones", "stimulates partner",
  "uses sex toys", "plays with vibrator", "uses dildo",
  "participates in BDSM activities", "gets tied up", "uses restraints",
  "performs lap dance", "grinds on lap", "dances provocatively",
  "masturbates", "pleasures themselves", "touches intimately",
  "engages in group activities", "participates in threesome", "joins group play",
  "experiences orgasm", "climaxes intensely", "reaches climax",
  "poses in bondage", "is restrained", "wears fetish gear",
  "performs striptease", "slowly removes clothes", "teases with clothing",
  "engages in roleplay", "acts out fantasy", "plays character",
  "explores fetishes", "indulges in kink", "tries new things",
  "shows off body", "displays curves", "poses nude",
  "gets massaged", "receives sensual massage", "relaxes under touch",
  "bathes seductively", "showers provocatively", "washes sensually",
  "stands confidently", "poses powerfully", "commands attention",
  "moves gracefully", "dances fluidly", "flows like water",
  "bends flexibly", "stretches sensually", "yoga poses erotically",
  "runs fingers through hair", "tosses hair back", "plays with hair",
  "bites lip suggestively", "licks lips slowly", "smiles mischievously",
  "winks playfully", "blows a kiss", "beckons with finger",
  "leans in close", "whispers seductively", "breathes heavily",
  "moans softly", "gasps in pleasure", "cries out passionately",
  "trembles with anticipation", "shivers with excitement", "quivers with desire",
  "sweats from exertion", "glows with satisfaction", "flushes with arousal",
  "closes eyes in ecstasy", "rolls eyes back", "looks up pleadingly",
  "stares intensely", "gazes deeply", "locks eyes",
  "touches face gently", "traces jawline", "caresses cheek",
  "runs hand down neck", "trails fingers over collarbone", "brushes against chest",
  "explores waist", "grips hips firmly", "squeezes buttocks",
  "strokes thighs", "teases inner thighs", "touches intimately",
  "massages erogenous zones", "stimulates nipples", "pinches gently",
  "licks and sucks", "kisses passionately", "nibbles skin",
  "bites playfully", "leaves marks", "scratches back",
  "pulls hair", "grips tightly", "holds down",
  "pins against wall", "lifts up", "carries passionately",
  "throws onto bed", "rolls over", "changes positions",
  "rides enthusiastically", "grinds rhythmically", "bucks hips",
  "thrusts deeply", "moves slowly", "accelerates pace",
  "builds tension", "edges closer", "reaches peak",
  "climaxes powerfully", "shudders in release", "collapses satisfied",
  "cuddles after", "holds close", "whispers sweet nothings",
  "laughs joyfully", "smiles contentedly", "falls asleep peacefully",
  "wakes refreshed", "starts again", "explores more",
  "tries new positions", "experiments boldly", "pushes boundaries",
  "discovers pleasures", "learns desires", "fulfills fantasies",
  "shares secrets", "opens up emotionally", "connects deeply",
  "builds trust", "communicates needs", "respects limits",
  "explores safely", "uses protection", "prioritizes health",
  "maintains hygiene", "stays hydrated", "takes breaks",
  "communicates throughout", "checks in regularly", "ensures consent",
  "respects boundaries", "listens attentively", "responds to cues",
  "adapts to partner", "learns preferences", "remembers details",
  "surprises delightfully", "plans romantic gestures", "creates memories",
  "shares laughter", "enjoys intimacy", "cherishes moments",
  "builds relationship", "deepens connection", "strengthens bond",
  "explores together", "grows together", "supports each other",
  "encourages exploration", "celebrates differences", "embraces diversity",
  "learns new skills", "tries new things", "expands horizons",
  "challenges assumptions", "breaks stereotypes", "defies expectations",
  "embraces authenticity", "celebrates individuality", "honors uniqueness",
  "shares vulnerabilities", "builds emotional intimacy", "fosters trust",
  "creates safe space", "encourages openness", "promotes honesty",
  "nurtures growth", "supports development", "inspires potential",
  "celebrates achievements", "acknowledges efforts", "appreciates qualities",
  "expresses gratitude", "shows appreciation", "demonstrates care",
  "offers comfort", "provides support", "gives encouragement",
  "shares joy", "spreads happiness", "creates positivity",
  "builds confidence", "boosts self-esteem", "empowers partner",
  "encourages self-expression", "fosters creativity", "stimulates imagination",
  "ignites passion", "fuels desire", "heightens arousal",
  "intensifies pleasure", "amplifies sensation", "deepens experience",
  "extends duration", "prolongs ecstasy", "sustains intensity",
  "varies rhythm", "changes tempo", "alters pressure",
  "explores textures", "discovers sensitivities", "finds sweet spots",
  "stimulates multiple areas", "coordinates movements", "synchronizes actions",
  "builds anticipation", "creates suspense", "delivers payoff",
  "surpasses expectations", "exceeds limits", "reaches new heights",
  "achieves transcendence", "enters altered state", "experiences bliss",
  "feels euphoria", "senses nirvana", "touches divinity",
  "connects spiritually", "merges energies", "becomes one",
  "loses self in pleasure", "dissolves boundaries", "transcends physical",
  "explores consciousness", "expands awareness", "gains insight",
  "learns about self", "discovers desires", "understands needs",
  "accepts preferences", "embraces identity", "celebrates sexuality",
  "explores orientation", "questions assumptions", "challenges norms",
  "defies conventions", "breaks taboos", "pushes envelopes",
  "embraces freedom", "celebrates liberation", "honors authenticity",
  "lives truthfully", "expresses fully", "exists authentically",
  "Custom"
];

const NSFW_SUBJECT_PRESETS = [
  // Professional/Roleplay
  "confident businesswoman", "seductive secretary", "powerful executive",
  "mysterious librarian", "alluring teacher", "tempting nurse",
  "sultry bartender", "enchanting dancer", "captivating performer",
  
  // Fantasy/Supernatural
  "mysterious vampire", "seductive succubus", "alluring mermaid",
  "enchanting sorceress", "tempting goddess", "powerful queen",
  "mystical priestess", "alluring elf", "seductive witch",
  
  // Modern/Contemporary
  "confident athlete", "alluring artist", "seductive musician",
  "tempting chef", "mysterious journalist", "enchanting photographer",
  "sultry model", "captivating actress", "powerful entrepreneur",
  
  // Body Types & Features
  "curvaceous beauty", "athletic physique", "voluptuous figure",
  "toned and fit", "soft and feminine", "strong and muscular",
  "petite and delicate", "tall and elegant", "full-figured goddess",
  
  // Ethnic/Cultural Diversity
  "exotic beauty", "mysterious oriental", "sultry latin lover",
  "passionate mediterranean", "alluring african queen", "enchanting island girl",
  "tempting european beauty", "captivating asian pearl", "seductive middle eastern enchantress",
  
  // Personality Traits
  "shy but curious", "bold and adventurous", "mysterious and alluring",
  "confident and playful", "passionate and intense", "gentle and sensual",
  "wild and free-spirited", "elegant and sophisticated", "fun and flirty",
  
  // Age-appropriate Adult Categories
  "experienced and wise", "mature and confident", "young professional",
  "seasoned beauty", "vibrant and energetic", "poised and graceful",
  "Custom",

  // Additional Professional
  "ambitious lawyer", "brilliant scientist", "creative designer", "dedicated doctor", "efficient administrator", "fierce competitor", "graceful ballerina", "hardworking farmer", "innovative engineer", "jovial chef", "knowledgeable professor", "loyal assistant", "motivated student", "nurturing caregiver", "organized planner", "passionate activist", "quick-witted comedian", "reliable mechanic", "skilled artisan", "talented musician", "understanding therapist", "versatile actor", "wise counselor", "xenophilic explorer", "youthful entrepreneur", "zealous advocate",

  // Fantasy/Supernatural Extended
  "ancient dragon", "bewitching fairy", "cunning shapeshifter", "dark sorcerer", "ethereal spirit", "fierce werewolf", "gentle unicorn", "haunting ghost", "immortal being", "jovial leprechaun", "kryptonite-weakened hero", "luminous angel", "malevolent demon", "noble centaur", "otherworldly alien", "playful pixie", "quicksilver elemental", "radiant phoenix", "sinister shadow", "timeless oracle", "unyielding golem", "vicious harpy", "wise sphinx", "xenomorph hunter", "yearning banshee", "zesty zombie",

  // Modern/Contemporary Extended
  "adventurous backpacker", "bold fashionista", "charismatic politician", "daring stuntperson", "eccentric inventor", "fearless firefighter", "gregarious host", "humble philanthropist", "intrepid journalist", "jovial bartender", "kind-hearted volunteer", "lively performer", "modest scholar", "nervous presenter", "optimistic dreamer", "pragmatic engineer", "quirky artist", "resilient survivor", "stoic guardian", "tenacious athlete", "unassuming genius", "vivacious dancer", "witty commentator", "xenodochial local", "youthful idealist", "zany comedian",

  // Body Types & Features Extended
  "ample-bosomed beauty", "broad-shouldered hunk", "compact powerhouse", "delicate flower", "expansive curves", "firm musculature", "generous proportions", "hourglass figure", "impressive stature", "jutting jawline", "kempt appearance", "lithe form", "majestic presence", "nimble physique", "opulent figure", "pert features", "quivering softness", "robust build", "sleek silhouette", "towering height", "undulating curves", "voluminous hair", "wiry strength", "yielding flesh", "zestful energy",

  // Ethnic/Cultural Diversity Extended
  "aboriginal shaman", "brazilian samba dancer", "chinese dragon dancer", "dutch windmill keeper", "egyptian pyramid builder", "french pastry chef", "german beer brewer", "hawaiian hula performer", "indian spice merchant", "japanese tea master", "kenyan distance runner", "lebanese hookah smoker", "mexican mariachi player", "norwegian fjord explorer", "omani desert nomad", "peruvian mountain climber", "quebec lumberjack", "russian ballet dancer", "scottish highland warrior", "thai kickboxer", "ukrainian wheat farmer", "vietnamese rice paddy worker", "welsh choir singer", "xingu tribal member", "yemeni coffee grower", "zimbabwean safari guide",

  // Personality Traits Extended
  "affectionate companion", "brave hero", "compassionate healer", "determined achiever", "empathetic listener", "fierce protector", "generous giver", "honest truth-teller", "intuitive guide", "joyful celebrant", "kind benefactor", "loyal friend", "merciful forgiver", "nurturing parent", "optimistic visionary", "patient teacher", "quiet observer", "resolute leader", "sincere communicator", "thoughtful analyst", "understanding ally", "valiant defender", "wise advisor", "xenial host", "yielding accommodator", "zealous champion",

  // Age-appropriate Adult Categories Extended
  "adolescent dreamer", "burgeoning talent", "coming-of-age explorer", "developing potential", "emerging artist", "fledgling professional", "growing confidence", "honeymoon phase lover", "incipient entrepreneur", "juvenile prodigy", "kempt young adult", "latent genius", "maturing beauty", "nascent leader", "oblivious youth", "precocious talent", "quiescent observer", "rising star", "sprightly spirit", "tenacious beginner", "unformed potential", "vibrant newcomer", "wholesome innocence", "yearning heart", "zestful beginner",

  // Fetish/Roleplay Specific
  "dominant master", "submissive slave", "playful switch", "strict disciplinarian", "eager learner", "experienced guide", "curious explorer", "bold experimenter", "gentle introducer", "intense practitioner", "knowledgeable expert", "novice enthusiast", "passionate devotee", "respectful participant", "safe player", "trusting partner", "understanding companion", "versatile performer", "willing subject", "zealous adherent",

  // Occupation-Based
  "accountant with secrets", "baker of delights", "carpenter of dreams", "dentist with bite", "electrician of sparks", "farmer of bounty", "gardener of beauty", "hairdresser of transformations", "insurance adjuster of claims", "jeweler of treasures", "kinesiologist of motion", "librarian of knowledge", "mortician of endings", "nutritionist of health", "optician of vision", "pharmacist of cures", "quilter of warmth", "radiologist of images", "surgeon of precision", "tailor of fits", "urologist of flows", "veterinarian of care", "welder of bonds", "x-ray technician of insight", "yoga instructor of balance", "zookeeper of wild things",

  // Hobby-Based
  "amateur astronomer", "birdwatching enthusiast", "chess grandmaster", "diving adventurer", "equestrian rider", "fishing aficionado", "gardening guru", "hiking trailblazer", "ice skating champion", "jogging enthusiast", "kayaking expert", "landscape photographer", "mountain climber", "nature documentarian", "ocean swimmer", "painting prodigy", "quilting artist", "rock climbing ace", "scuba diving pro", "theater director", "ultimate frisbee player", "violin virtuoso", "wine connoisseur", "xylophone player", "yodeling singer", "zen meditator",

  // Relationship Status
  "committed partner", "divorced and dating", "engaged couple member", "fling enthusiast", "girlfriend material", "husband candidate", "independent single", "jealous lover", "kindred spirit", "long-distance partner", "married explorer", "newly single", "open relationship participant", "polyamorous individual", "relationship hopper", "serial monogamist", "throuple member", "unattached adventurer", "virgin explorer", "widowed seeker", "xenophilic dater", "yearning romantic", "zealous monogamist",

  // Mental/Emotional States
  "anxious overthinker", "bipolar balancer", "confident achiever", "depressed dreamer", "euphoric lover", "fearful avoider", "grateful receiver", "hopeful planner", "insecure seeker", "jealous guardian", "kindred spirit finder", "lonely heart", "motivated doer", "nervous nelly", "optimistic visionary", "pessimistic realist", "quiet introvert", "restless wanderer", "stoic survivor", "timid mouse", "unconfident learner", "vulnerable sharer", "worried caretaker", "xenophobic avoider", "yearning connector", "zealous believer",

  // Physical Conditions
  "able-bodied athlete", "chronic pain sufferer", "disabled adventurer", "energetic powerhouse", "frail beauty", "gymnast acrobat", "handicapped hero", "injured warrior", "joint pain endurer", "knee replacement recipient", "limp walker", "mobility challenged", "neurological condition haver", "orthopedic boot wearer", "physical therapy patient", "quadriplegic lover", "rehabilitating patient", "spinal cord injured", "temporarily disabled", "unsteady on feet", "vertigo sufferer", "wheelchair user", "xeroderma pigmentosum patient", "yoga-modified practitioner", "zero mobility individual",

  // Spiritual/Religious
  "atheist philosopher", "buddhist meditator", "christian prayer", "druid nature worshipper", "ecumenical explorer", "fundamentalist believer", "gnostic seeker", "hindu devotee", "islamic faithful", "jewish observant", "kabbalist mystic", "lutheran congregant", "methodist preacher", "new age crystal user", "orthodox practitioner", "pagan ritualist", "quaker silent worshipper", "rastafarian dreadlocked", "shinto shrine visitor", "taoist balance seeker", "unitarian universalist", "vedanta studier", "wiccan spellcaster", "xian spiritualist", "yogic practitioner", "zen koan ponderer",

  // Political/Social Views
  "activist organizer", "conservative traditionalist", "democratic voter", "environmentalist protector", "feminist advocate", "green party supporter", "human rights defender", "independent thinker", "justice seeker", "liberal progressive", "moderate balancer", "nonpartisan observer", "optimistic reformer", "peace activist", "queer rights champion", "republican voter", "social justice warrior", "third party advocate", "undecided voter", "volunteer community helper", "women's rights supporter", "xenophile global citizen", "youth activist", "zapatista sympathizer",

  // Health/Wellness
  "acupuncturist patient", "biohacker experimenter", "clean eating devotee", "detox dieter", "essential oil user", "fitness fanatic", "gym rat", "holistic healer", "intermittent faster", "juice cleanser", "keto dieter", "low-carb eater", "meditation practitioner", "natural remedy user", "organic food buyer", "paleo follower", "qigong exerciser", "raw foodist", "superfood consumer", "tai chi master", "ultra-marathoner", "vegan activist", "whole food eater", "xenobiotic avoider", "yoga nidra sleeper", "zen diet follower",

  // Technology/Science
  "AI researcher", "biotech innovator", "computer programmer", "data scientist", "electrical engineer", "forensic analyst", "geneticist", "hacker ethicist", "information architect", "javascript developer", "knowledge engineer", "linux administrator", "machine learning expert", "neural network designer", "open source contributor", "python programmer", "quantum physicist", "robotics engineer", "software architect", "tech entrepreneur", "ux designer", "virtual reality creator", "web developer", "xml specialist", "youtube content creator", "zero-knowledge proof expert",

  // Arts/Creativity
  "abstract painter", "ballet choreographer", "comic book artist", "digital illustrator", "etching printmaker", "fiction writer", "graphic novelist", "haiku poet", "installation artist", "jazz improviser", "kinetic sculptor", "landscape painter", "murals creator", "novel writer", "oil painter", "performance artist", "quilt maker", "rap lyricist", "sculptor", "theater director", "ukulele player", "visual artist", "watercolor painter", "xylophone composer", "yarn bomber", "zither player",

  // Sports/Recreation
  "archery champion", "basketball player", "cricket enthusiast", "diving instructor", "equestrian rider", "football fan", "golf pro", "hiking guide", "ice hockey player", "judo practitioner", "kayak racer", "lacrosse player", "marathon runner", "nordic skier", "olympic hopeful", "paraglider", "quidditch player", "rock climber", "sailing captain", "tennis coach", "ultimate frisbee thrower", "volleyball setter", "windsurfer", "x-country skier", "yachtsman", "zipline adventurer",

  // Travel/Adventure
  "backpacking nomad", "cruise ship passenger", "desert caravan member", "expedition leader", "flight attendant", "globe trotter", "hostel dweller", "international volunteer", "jungle explorer", "kayak tour guide", "luxury traveler", "mountain trekker", "nomadic shepherd", "ocean liner sailor", "polar expedition member", "quest seeker", "railway adventurer", "safari guide", "transcontinental cyclist", "underground cave explorer", "volcano climber", "world cruise passenger", "xenon gas diver", "yacht charter captain", "zebra migration tracker",

  // Food/Culinary
  "artisan baker", "barbecue pitmaster", "chocolate maker", "dim sum chef", "ethnic cuisine expert", "farm to table advocate", "gourmet cook", "herb gardener", "ice cream scooper", "japanese sushi master", "korean barbecue expert", "local food forager", "molecular gastronomer", "nouvelle cuisine chef", "organic farmer", "pastry chef", "quinoa salad maker", "raw food chef", "slow food advocate", "traditional recipe keeper", "umami flavor expert", "vegan baker", "wine pairing sommelier", "xanthan gum user", "yogurt maker", "zest grater",

  // Music/Performance
  "accordion player", "bass guitarist", "cellist", "drummer", "electric violinist", "flutist", "gospel singer", "harmonica player", "indie rock musician", "jazz trumpeter", "keyboardist", "latin percussionist", "metal guitarist", "opera singer", "piano teacher", "quartet member", "rap artist", "saxophonist", "tango dancer", "ukulele strummer", "violinist", "waltz instructor", "xylophone virtuoso", "yodeling champion", "zither enthusiast",

  // Literature/Writing
  "autobiographer", "biographer", "columnist", "detective novelist", "essayist", "fantasy writer", "ghostwriter", "historian", "journalist", "kindle author", "literary critic", "memoirist", "novelist", "opinion writer", "poet", "quarterly contributor", "romance novelist", "screenwriter", "technical writer", "urban planner", "verse poet", "western novelist", "xeroxed zine maker", "young adult author", "zine publisher",

  // Education/Learning
  "adult education student", "bilingual teacher", "college professor", "distance learner", "elementary teacher", "foreign language tutor", "graduate student", "homeschool parent", "instructional designer", "junior high teacher", "kindergarten teacher", "lifelong learner", "montessori guide", "nursing instructor", "online course creator", "philosophy lecturer", "quantum physics teacher", "reading specialist", "special education teacher", "tutoring center owner", "university researcher", "vocational trainer", "waldorf educator", "xenolinguist", "yoga philosophy teacher", "zoology professor",

  // Business/Finance
  "accountant", "banker", "consultant", "day trader", "entrepreneur", "financial advisor", "grant writer", "hedge fund manager", "investment banker", "job coach", "kiosk owner", "loan officer", "marketing director", "nonprofit director", "operations manager", "portfolio manager", "quality assurance specialist", "real estate agent", "stockbroker", "tax preparer", "underwriter", "venture capitalist", "wealth manager", "xerox technician", "yield farmer", "zoning administrator",

  // Law/Justice
  "attorney", "bailiff", "court reporter", "defense lawyer", "environmental lawyer", "family court judge", "guardian ad litem", "human rights lawyer", "immigration attorney", "jury consultant", "labor lawyer", "magistrate", "notary public", "ombudsman", "paralegal", "quorum court clerk", "retired judge", "social worker", "trial lawyer", "union organizer", "victim advocate", "witness protection officer", "xenophobia prosecutor", "youth court advocate", "zoning board member",

  // Healthcare/Medicine
  "acupuncturist", "biomedical engineer", "cardiac surgeon", "dermatologist", "emergency physician", "forensic pathologist", "geriatrician", "hematologist", "infectious disease specialist", "junior resident", "kidney transplant surgeon", "licensed practical nurse", "medical examiner", "neurosurgeon", "oncologist", "pediatrician", "qualified medical coder", "radiologist", "sports medicine doctor", "toxicologist", "urologist", "vascular surgeon", "wound care specialist", "x-ray technician", "yoga therapist", "zoonotic disease researcher",

  // Construction/Trade
  "architect", "bricklayer", "carpenter", "drywall installer", "electrician", "framer", "glazier", "house painter", "insulation installer", "jackhammer operator", "kitchen remodeler", "landscaper", "mason", "nail gun user", "oil rig worker", "plumber", "quarry worker", "roofing contractor", "steel worker", "tile setter", "utility line installer", "vinyl siding installer", "welding fabricator", "x-ray concrete tester", "yard maintenance worker", "zoning inspector",

  // Transportation/Logistics
  "airline pilot", "bus driver", "cargo ship captain", "delivery driver", "express courier", "forklift operator", "garbage truck driver", "helicopter pilot", "ice road trucker", "jet fueler", "kenworth driver", "logistics coordinator", "metro conductor", "navigation officer", "ocean freighter captain", "pilot instructor", "railroad engineer", "shipping container handler", "tanker truck driver", "uber driver", "vanpool organizer", "warehouse supervisor", "xenon headlight installer", "yard jockey", "zamboni driver",

  // Hospitality/Tourism
  "airbnb host", "bed and breakfast owner", "concierge", "destination wedding planner", "event coordinator", "fine dining sommelier", "guesthouse manager", "hotel front desk clerk", "innkeeper", "jetsetter travel blogger", "karaoke bar owner", "luxury resort manager", "motel chain owner", "national park ranger", "ocean cruise director", "party boat captain", "quaint village tour guide", "resort activities director", "spa manager", "tour bus driver", "urban hotel concierge", "vacation rental manager", "wine country tour operator", "xenial host", "yacht charter broker", "zen retreat facilitator",

  // Retail/Sales
  "antique dealer", "boutique owner", "car salesman", "department store buyer", "ecommerce seller", "fashion boutique manager", "gift shop owner", "home goods retailer", "independent bookstore owner", "jewelry store clerk", "kitchenware specialist", "luxury handbag seller", "mall kiosk operator", "nonprofit thrift store manager", "online marketplace seller", "pet store associate", "quality assurance inspector", "retail buyer", "shoe store owner", "toy store manager", "used car dealer", "vintage clothing seller", "wholesale distributor", "xenophile import shop owner", "yard sale organizer", "zero waste store owner",

  // Agriculture/Farming
  "apple orchard owner", "beef cattle rancher", "corn farmer", "dairy goat keeper", "egg producer", "fruit picker", "grain elevator operator", "hay baler", "irrigation specialist", "john deere mechanic", "kiwi grower", "lettuce harvester", "mushroom farmer", "nectar producer", "olive oil maker", "pea sheller", "quinoa cultivator", "rice paddy worker", "soybean farmer", "tractor driver", "urban farmer", "vegetable grower", "wheat thresher", "xenon greenhouse manager", "yam harvester", "zucchini breeder",

  // Manufacturing/Production
  "assembly line worker", "brewery master", "candle maker", "distillery owner", "electronics assembler", "furniture craftsman", "glass blower", "hat maker", "instrument builder", "jewelry smith", "knife maker", "leather worker", "metal fabricator", "nail factory worker", "oil refinery operator", "paper mill worker", "quality control inspector", "robotics assembler", "shoe factory worker", "textile weaver", "uniform manufacturer", "vaccine producer", "widget maker", "xenon bulb assembler", "yarn spinner", "zipper factory worker",

  // Energy/Utilities
  "alternative energy installer", "battery manufacturer", "coal miner", "drilling rig operator", "electrical grid engineer", "fracking site worker", "geothermal plant operator", "hydroelectric dam keeper", "insulation blower", "jet fuel refinery worker", "kerosene lamp filler", "lithium battery assembler", "natural gas pipeline inspector", "oil platform worker", "power plant engineer", "quarry stone cutter", "renewable energy advocate", "solar panel installer", "turbine technician", "utility pole climber", "voltage regulator maintainer", "wind farm operator", "xenon power cell engineer", "yellowcake processor", "zero emission vehicle charger",

  // Communications/Media
  "advertising copywriter", "broadcast journalist", "cable installer", "documentary filmmaker", "editorial cartoonist", "film critic", "graphic designer", "hollywood screenwriter", "internet service provider", "journalism professor", "korean drama subtitler", "literary agent", "movie theater projectionist", "news anchor", "online content moderator", "podcast producer", "quarterly magazine editor", "radio dj", "social media manager", "tv production assistant", "underground newspaper publisher", "video game journalist", "webcam model", "xerox newspaper printer", "youtube video editor", "zimbabwe news correspondent",

  // Government/Public Service
  "animal control officer", "border patrol agent", "city council member", "diplomatic envoy", "election poll worker", "fire department captain", "government contractor", "highway patrol officer", "immigration officer", "jury duty summoner", "king county sheriff", "library archivist", "mayor", "national guard member", "ombudsman", "park ranger", "quarantine officer", "revenue agent", "state senator", "traffic court judge", "unemployment office worker", "veterans affairs counselor", "welfare case worker", "xenophobia hate crime investigator", "youth probation officer", "zoning enforcement officer",

  // Military/Service
  "air force pilot", "battlefield medic", "coast guard rescuer", "drone operator", "explosive ordnance disposal", "fighter jet mechanic", "green beret", "helicopter gunner", "intelligence analyst", "joint chiefs of staff", "korean war veteran", "logistics officer", "marine corps sniper", "navy seal", "operations specialist", "paratrooper", "quartermaster", "radar technician", "special forces operative", "tank commander", "uniformed services member", "vietnam veteran", "weapons specialist", "xenon night vision technician", "yellow ribbon supporter", "zero dark thirty operative",

  // Religion/Spirituality
  "abbot", "bishop", "cardinal", "deacon", "elder", "friar", "guru", "high priest", "imam", "jesuit priest", "kabbalist", "lama", "monk", "nun", "ordained minister", "pastor", "quaker elder", "rabbi", "saint", "taoist priest", "universalist minister", "vicar", "witch priestess", "xian monk", "yogi", "zen master",

  // Entertainment/Gaming
  "arcade owner", "board game designer", "casino dealer", "dungeon master", "escape room designer", "fantasy football commissioner", "gambling addict", "hollywood agent", "internet streamer", "jazz club owner", "karaoke host", "laser tag referee", "magic show performer", "nightclub dj", "opera house usher", "poker tournament organizer", "quiz show contestant", "reality tv producer", "slot machine technician", "tabletop rpg player", "video game tester", "wrestling promoter", "xbox live gamer", "yugioh card trader", "zombie apocalypse survivor",

  // Environmental/Conservation
  "animal rehabilitator", "beach cleanup volunteer", "climate change activist", "desert restoration worker", "endangered species protector", "forest fire fighter", "green energy advocate", "habitat conservationist", "indigenous land protector", "jungle preservationist", "kelp forest diver", "landfill diverter", "marine biologist", "national park volunteer", "ocean plastic collector", "polar ice researcher", "quaking bog protector", "rainforest defender", "solar farm installer", "turtle nest protector", "urban garden cultivator", "volunteer trail maintainer", "wetland restoration expert", "xeriscape designer", "yellowstone geyser monitor", "zero waste lifestyle advocate",

  // Science/Research
  "anthropologist", "biochemist", "cosmologist", "dendrologist", "entomologist", "forensic scientist", "geologist", "heliophysicist", "ichthyologist", "japanologist", "kinesiologist", "limnologist", "meteorologist", "nanotechnologist", "oceanographer", "paleontologist", "quantum physicist", "radiobiologist", "seismologist", "toxicologist", "ufologist", "virologist", "wildlife biologist", "xenobiologist", "yogurt microbiologist", "zoologist",

  // Space/Astronomy
  "alien life researcher", "black hole observer", "comet chaser", "dark matter detector", "exoplanet discoverer", "fusion reactor engineer", "galaxy mapper", "habitable planet seeker", "interstellar probe designer", "jupiter moon explorer", "kuiper belt surveyor", "lunar base architect", "mars colony planner", "nebula photographer", "orbiting telescope operator", "planetary geologist", "quantum entanglement communicator", "rocket propulsion expert", "satellite launcher", "telescope array maintainer", "universe origin theorist", "venus atmosphere analyzer", "wormhole theorist", "xenon propulsion system engineer", "yellow dwarf star observer", "zero gravity gymnast",

  // Time/History
  "ancient artifact curator", "battlefield historian", "civil rights activist", "dinosaurs paleontologist", "egyptian tomb raider", "fossil hunter", "genealogy researcher", "historical reenactor", "industrial revolution scholar", "jurassic period expert", "kings and queens biographer", "lost civilization seeker", "medieval manuscript translator", "native american history keeper", "old west gunslinger impersonator", "prehistoric cave painter", "queen elizabeth biographer", "roman empire scholar", "stone age tool maker", "time capsule burier", "united nations diplomat", "victorian era dressmaker", "world war ii veteran", "xerox ancient scroll copier", "yesteryear photograph restorer", "zero hour atomic clock keeper",

  // Future/Imaginary
  "android rights activist", "bionic implant surgeon", "cyberpunk hacker", "digital consciousness uploader", "eternal life elixir brewer", "flying car designer", "genetic modification artist", "holographic communicator", "immortality researcher", "jetpack inventor", "kryptonite weakness studier", "laser gun manufacturer", "mind reading device creator", "nanobot swarm controller", "orbital elevator builder", "plasma weapon engineer", "quantum computer programmer", "robot uprising preventer", "space elevator climber", "teleportation scientist", "underwater city architect", "virtual reality world builder", "warp drive engineer", "xenomorph egg incubator", "yoda voice impersonator", "zero point energy harvester",

  // Mythical/Fantasy
  "angelic messenger", "basilisk tamer", "centaur trainer", "dragon rider", "elf archer", "fairy godmother", "goblin king", "harpy feather collector", "ice queen", "jackalope hunter", "kraken fisherman", "leviathan rider", "mermaid singer", "nymph forest dweller", "ogre wrestler", "phoenix rebirth witness", "questing knight", "roc egg protector", "sphinx riddle solver", "troll bridge keeper", "unicorn groomer", "valkyrie warrior", "werewolf pack leader", "xerox magical scroll copier", "yeti tracker", "zombie apocalypse survivor",

  // Superhero/Villain
  "anti-hero", "bank robber", "crime lord", "detective", "evil genius", "flying hero", "government agent", "hero sidekick", "invisible woman", "justice league member", "kryptonian survivor", "laser eye villain", "mind control master", "nuclear powered hero", "omega level mutant", "power ring wearer", "quantum field manipulator", "radioactive spider victim", "super soldier", "telekinetic", "unstoppable force", "vampire hunter", "weather controller", "x-ray vision hero", "yellow sun powered alien", "zero gravity flyer",

  // Horror/Supernatural
  "alien abductee", "bloodthirsty vampire", "cursed artifact collector", "demon summoner", "evil spirit", "flesh-eating zombie", "ghost hunter", "haunted house resident", "immortal cursed one", "jack the ripper descendant", "killer clown", "lich undead wizard", "monster hunter", "necromancer", "occult ritual performer", "possessed victim", "quicksand sinker", "reanimated corpse", "serial killer", "time loop prisoner", "undead army commander", "vampire slayer", "werewolf bite victim", "xenomorph host", "yokai spirit", "zombie horde leader",

  // Romance/Love
  "arranged marriage participant", "blind date survivor", "courtship ritual follower", "divorce recovery coach", "eternal love seeker", "forbidden love pursuer", "girlfriend experience provider", "heartbreak healer", "internet dater", "jealous lover", "kindred spirit finder", "long distance relationship maintainer", "marriage counselor", "newlywed", "online dating profile creator", "polyamorous relationship navigator", "quarantine date coordinator", "romance novelist", "speed dater", "true love believer", "unrequited love sufferer", "valentine's day hater", "wedding planner", "xenodochial matchmaker", "yearning romantic", "zodiac compatibility believer",

  // Family/Relationships
  "adoptive parent", "big family organizer", "childfree by choice", "divorced co-parent", "empty nester", "foster parent", "grandparent babysitter", "helicopter parent", "identical twin", "junior high teacher", "kindergarten dropout", "large family matriarch", "middle child syndrome sufferer", "new parent", "only child", "parent teacher association president", "quintuplet", "retired grandparent", "single parent", "twin sibling", "unwed mother", "volunteer youth mentor", "widowed spouse", "xenophobic family avoider", "youngest child", "zero tolerance disciplinarian",

  // Addiction/Recovery
  "alcoholics anonymous sponsor", "betting addict", "cocaine user", "drug rehabilitation counselor", "eating disorder survivor", "former smoker", "gambling addiction counselor", "heroin addict", "internet addiction sufferer", "junk food addict", "kleptomaniac", "liquor store clerk", "methamphetamine producer", "nicotine patch wearer", "opioid painkiller addict", "pornography addict", "quit smoking coach", "recovery meeting facilitator", "sex addict", "tobacco chewer", "unemployed addict", "video game addict", "workaholic", "xanax prescriber", "yoga addiction replacer", "zero tolerance drug policy enforcer",

  // Mental Health
  "anxiety disorder sufferer", "bipolar disorder manager", "cognitive behavioral therapist", "depression fighter", "eating disorder counselor", "former psychiatric patient", "group therapy facilitator", "hallucination experiencer", "insomnia sufferer", "journaling therapist", "kleptomania counselor", "lithium medication taker", "mental health advocate", "neurodiversity champion", "obsessive compulsive organizer", "panic attack survivor", "quiet borderline personality", "recovery coach", "schizophrenia researcher", "therapy dog trainer", "unmedicated philosopher", "virtual reality exposure therapist", "wellness coach", "xenon light therapy user", "yoga nidra practitioner", "zero suicide prevention advocate",

  // Disability/Accessibility
  "accessibility auditor", "blind person", "cerebral palsy advocate", "deaf community member", "epilepsy awareness raiser", "fibromyalgia sufferer", "guide dog trainer", "hearing aid wearer", "invisible disability haver", "joint hypermobility sufferer", "knee replacement recipient", "learning disability tutor", "mobility scooter user", "neurodiversity educator", "osteoarthritis patient", "paraplegic athlete", "quadriplegic", "retinitis pigmentosa patient", "spinal muscular atrophy survivor", "tinnitus sufferer", "unseen disability advocate", "visual impairment specialist", "wheelchair basketball player", "xeroderma pigmentosum patient", "yoga adaptive instructor", "zero gravity wheelchair user",

  // Aging/Elderly
  "active senior", "aging gracefully advocate", "centenarian", "dementia caregiver", "elderly volunteer", "frail senior", "geriatric nurse", "homebound senior", "independent living advocate", "joint replacement patient", "longevity researcher", "memory care resident", "nursing home resident", "osteoporosis patient", "palliative care nurse", "retirement community resident", "senior center director", "telemedicine user", "unretired senior", "volunteer senior", "widowed senior", "xerostomia sufferer", "yoga for seniors instructor", "zero waste senior",

  // Youth/Teen
  "adolescent psychologist", "baby boomer", "college freshman", "dropout recovery coach", "elementary school teacher", "former teen mom", "generation z member", "high school dropout", "internet safety educator", "junior high counselor", "kindergarten teacher", "learning disability specialist", "middle school teacher", "new graduate", "online school student", "peer counselor", "quarantine homeschooler", "retired teacher", "school counselor", "teenage pregnancy prevention educator", "underage drinking counselor", "virtual school administrator", "welfare to work program graduate", "xenophobic bullying victim", "yearbook photographer", "zero tolerance school policy enforcer",

  // Immigration/Migration
  "asylum seeker", "border crosser", "citizenship test preparer", "deportation defender", "emigration agent", "foreign student", "green card holder", "human trafficking survivor", "immigrant rights activist", "journey to america documenter", "kenyan refugee", "language barrier breaker", "migrant worker advocate", "naturalization ceremony attendee", "overseas adoptee", "political refugee", "quarantine border crosser", "refugee resettlement coordinator", "stateless person", "temporary protected status holder", "undocumented immigrant", "visa overstayer", "war refugee", "xenophobic attack survivor", "yearning homeland returner", "zero tolerance immigration enforcer",

  // Crime/Legal
  "arrested protester", "burglary victim", "court appointed attorney", "domestic violence survivor", "embezzlement perpetrator", "felony offender", "grand theft auto thief", "hate crime victim", "identity theft sufferer", "juvenile detention counselor", "kidnapping survivor", "law enforcement officer", "murder mystery writer", "nonviolent offender", "organized crime informant", "prison reform advocate", "quarantine rioter", "rape survivor", "sex offender registry monitor", "trafficking victim", "undercover agent", "victim impact statement writer", "white collar criminal", "xenophobic hate group infiltrator", "youth gang intervention specialist", "zero tolerance prosecutor",

  // Weather/Nature
  "arctic explorer", "blizzard survivor", "cyclone chaser", "desert nomad", "earthquake victim", "flood survivor", "glacial climber", "hail storm witness", "ice age theorist", "jungle trekker", "kelp forest diver", "lightning strike survivor", "monsoon season resident", "northern lights viewer", "ocean storm sailor", "polar bear watcher", "quicksand sinker", "rainforest inhabitant", "sandstorm survivor", "tornado alley resident", "underground cave dweller", "volcano observatory worker", "wildfire evacuee", "xeriscape gardener", "yellowstone hot spring soaker", "zero visibility fog driver",

  // Technology/Innovation
  "ai ethicist", "blockchain developer", "cryptocurrency miner", "drone pilot", "electric vehicle charger", "flying car test driver", "genetic engineer", "hologram creator", "internet of things installer", "jet pack wearer", "killer robot designer", "laser pointer inventor", "machine learning trainer", "nanotechnology researcher", "orbital debris tracker", "quantum computer builder", "robotics engineer", "smart home installer", "teleportation theorist", "underwater drone operator", "virtual reality designer", "wearable tech developer", "xenon laser cutter", "yottabyte storage designer", "zero knowledge proof cryptographer",

  // Space Exploration
  "alien artifact collector", "black hole photographer", "comet tail sampler", "dark energy detector", "exoplanet colonizer", "fusion reactor maintainer", "galactic empire builder", "habitable zone mapper", "interplanetary traveler", "jupiter storm observer", "kuiper belt miner", "lunar base commander", "mars terraformer", "nebula gas harvester", "orbit decay calculator", "planetary defense coordinator", "quantum entangled communicator", "rocket fuel chemist", "satellite constellation designer", "terraforming engineer", "universe expansion measurer", "venus cloud city architect", "wormhole stabilizer", "xenobiology specimen collector", "yellow star spectroscopist", "zero gravity construction worker",

  // Underwater/Ocean
  "abyssal plain explorer", "coral reef diver", "deep sea fisherman", "eel electric shock survivor", "fish migration tracker", "giant squid hunter", "hydrothermal vent researcher", "iceberg calver", "jellyfish sting victim", "kelp forest ecologist", "lobster trap setter", "marine archaeology diver", "nautical chart maker", "ocean current mapper", "pearl diver", "quicksand bottom dweller", "reef restoration expert", "shipwreck salvager", "tidal pool observer", "underwater photographer", "volcanic eruption survivor", "whale migration follower", "xenon underwater lamp designer", "yellow submarine pilot", "zero visibility cave diver",

  // Aviation/Sky
  "aerobatic pilot", "balloonist", "cloud seeder", "drone racing champion", "experimental aircraft builder", "flight simulator instructor", "glider pilot", "hot air balloonist", "instrument flight examiner", "jet stream rider", "kite surfer", "lightning researcher", "meteorologist", "night flight navigator", "oxygen mask wearer", "parachute jumper", "quantum physics aviation engineer", "radar controller", "skydiving instructor", "turbulence expert", "ultralight aircraft pilot", "vortex generator installer", "weather balloon launcher", "xenon runway light maintainer", "yaw damper technician", "zero gravity parabolic flight participant",

  // Mountains/Climbing
  "alpine guide", "boulderer", "cliff diver", "downhill skier", "everest summiteer", "free climber", "glacier trekker", "high altitude mountaineer", "ice axe user", "jungle gym climber", "karakoram range explorer", "limestone cave spelunker", "mountain rescue volunteer", "north face climber", "oxygen tank carrier", "peak bagger", "quarry wall climber", "rock face scaler", "snow cave builder", "trekking pole user", "ultramarathon mountain runner", "vertical wall climber", "waterfall ice climber", "xenon headlamp wearer", "yosemite big wall climber", "zero degree sleeping bag tester",

  // Desert/Arid
  "arid land farmer", "bedouin tent dweller", "camel caravan leader", "desert storm survivor", "dune buggy racer", "egyptian pyramid explorer", "flash flood victim", "geyser observer", "heat stroke preventer", "irrigation canal digger", "joshua tree climber", "kangaroo rat observer", "libyan desert crosser", "mirage chaser", "nomadic shepherd", "oasis water finder", "prickly pear eater", "quicksand survivor", "rattlesnake avoider", "sand dune surfer", "tumbleweed chaser", "underground water diviner", "volcanic crater explorer", "wadi flash flood watcher", "xeriscape landscape designer", "yucca plant harvester", "zero water usage advocate",

  // Forest/Jungle
  "amazon rainforest guide", "bamboo forest dweller", "canopy walkway builder", "deforestation activist", "elephant grass wader", "fern grotto explorer", "giant sequoia climber", "hiking trail maintainer", "indigenous tribe member", "jungle survival expert", "kapok tree harvester", "lichen covered boulder studier", "monkey bridge crosser", "national park ranger", "old growth forest protector", "poison dart frog handler", "quick mud bog crosser", "rainforest canopy researcher", "snake bite antivenom user", "tropical storm survivor", "undergrowth bushwhacker", "vine swinging adventurer", "waterfall base camper", "xerophytic plant studier", "yellow fever vaccine recipient", "zero impact camper",

  // Urban/City
  "alleyway artist", "bridge jumper", "concrete jungle dweller", "downtown pedestrian", "elevated train rider", "fire escape climber", "graffiti artist", "high rise window washer", "inner city teacher", "junkyard scavenger", "kings cross station sleeper", "laneway bar owner", "metro tunnel explorer", "neon sign repairer", "overpass squatter", "parking garage attendant", "quarantine city lockdown survivor", "rooftop gardener", "skyscraper window cleaner", "traffic jam commuter", "underground bunker dweller", "vertical farm worker", "warehouse district resident", "xenon streetlight maintainer", "yellow cab driver", "zero lot line homeowner",

  // Rural/Country
  "apple orchard picker", "barn raiser", "cornfield maze designer", "dirt road driver", "equestrian farmhand", "fence post setter", "grain silo climber", "hay bale stacker", "irrigation ditch digger", "john deere tractor driver", "knee high by fourth of july farmer", "livestock auctioneer", "milking parlor operator", "no till farmer", "organic vegetable grower", "pig farmer", "quarry stone hauler", "ranch hand", "soybean combine operator", "tractor pull spectator", "underground bunker builder", "vegetable stand owner", "windmill repairer", "xenon tractor light installer", "yellow school bus driver", "zero tillage advocate",

  // Island/Coastal
  "beachcombing artist", "cliffside cottage dweller", "dock worker", "estuary ecologist", "fishing boat captain", "gulf stream surfer", "harbor master", "island castaway", "jetty builder", "kelp harvester", "lighthouse keeper", "marina manager", "nautical chart updater", "ocean liner passenger", "pier fisherman", "quay wall builder", "reef diver", "sailing instructor", "tidal pool explorer", "underwater archaeologist", "volcanic island resident", "whale watching guide", "xenon buoy maintainer", "yacht club member", "zero waste island advocate",

  // Polar/Arctic
  "arctic circle resident", "blizzard photographer", "cold weather survival expert", "dog sled racer", "eskimo culture preserver", "frozen lake fisherman", "glacier calving witness", "husky sled dog trainer", "ice cave explorer", "jellyfish in ice researcher", "krill swarm diver", "lantern fish observer", "midnight sun experiencer", "northern lights chaser", "oil rig icebreaker worker", "penguin colony visitor", "quaking ice sheet crosser", "reindeer herder", "snowmobile racer", "tundra vegetation studier", "underground ice cave dweller", "volcanic eruption in ice witness", "walrus tusk carver", "xenon aurora light studier", "yellow ice algae researcher", "zero degree weather survivor",

  // Volcanic/Geothermal
  "active volcano monitor", "basalt column climber", "crater lake swimmer", "dormant volcano hiker", "erupting lava observer", "fumarole gas sampler", "geyser eruption timer", "hot spring soaker", "igneous rock collector", "jellyfish in hot springs studier", "krakatoa survivor descendant", "lava flow path predictor", "magma chamber mapper", "national park geologist", "obsidian knife maker", "pyroclastic flow evader", "quaking ground survivor", "rhyolite crystal grower", "solfatara gas breather", "tectonic plate movement tracker", "underground magma flow studier", "volcanic ash cloud flyer", "whale in lava tube finder", "xenon geothermal vent explorer", "yellow sulfur crystal harvester", "zero gravity lava floater",

  // Cave/Underground
  "abandoned mine explorer", "bat guano collector", "cave diving instructor", "dripping stalactite counter", "echo location expert", "fossil bearing limestone studier", "glow worm cave guide", "headlamp battery changer", "ice cave photographer", "jewelry in cave formations finder", "karst landscape mapper", "lava tube crawler", "mine cart rider", "natural bridge undercrosser", "ore vein tracer", "pit cave dropper", "quartz crystal miner", "rock climbing in caves expert", "spelunking club president", "trogloxene insect studier", "underground lake swimmer", "volcanic cave explorer", "whale bone in cave finder", "xenon cave light installer", "yellow bat observer", "zero light cave navigator",

  // Historical Sites
  "ancient ruin excavator", "battlefield archaeologist", "castle tower climber", "dungeon explorer", "egyptian tomb raider", "fortress wall walker", "graveyard caretaker", "historical reenactor", "indian burial ground respecter", "jurassic fossil digger", "kings tomb guardian", "lost city seeker", "mayan pyramid climber", "native american mound studier", "old west ghost town visitor", "prehistoric cave painter", "queen elizabeth castle resident", "roman coliseum performer", "stonehenge aligner", "time capsule burier", "united nations diplomat", "victorian mansion owner", "world war trench digger", "xerox ancient manuscript copier", "yesteryear photograph developer", "zero hour atomic bomb test witness",

  // Amusement/Entertainment
  "amusement park ride designer", "boardwalk game operator", "carnival barker", "disneyland imagineer", "escape room creator", "ferris wheel operator", "go kart track owner", "haunted house actor", "ice cream truck driver", "jester court entertainer", "kiddie ride mechanic", "laser tag arena manager", "miniature golf course designer", "nightclub dj", "octopus ride rider", "pinball machine repairer", "quasar game champion", "roller coaster engineer", "slot car racer", "tilt a whirl operator", "universal studios ride actor", "video arcade owner", "water slide park manager", "xenon light show designer", "yodeling alpine slide rider", "zero gravity simulator pilot",

  // Transportation Hubs
  "airport runway sweeper", "bus station cleaner", "cargo port stevedore", "drive thru window worker", "elevated train conductor", "ferry boat captain", "gas station attendant", "highway toll collector", "interstate truck stop owner", "jet fuel truck driver", "kings cross station porter", "light rail operator", "metro tunnel maintainer", "navy ship dock worker", "ocean liner purser", "parking garage attendant", "quay side fisherman", "railroad crossing guard", "subway rat catcher", "taxi dispatcher", "underground parking valet", "vanpool driver", "water taxi operator", "xenon headlight adjuster", "yellow cab medallion holder", "zero emission bus driver",

  // Emergency Services
  "ambulance driver", "bomb squad technician", "coast guard helicopter pilot", "disaster relief coordinator", "emergency room nurse", "fire department arson investigator", "hazardous materials handler", "icu nurse", "jaws of life operator", "k9 search and rescue handler", "life flight pilot", "mountain rescue climber", "natural disaster survivor", "oil spill cleanup worker", "paramedic", "quake rescue team member", "radiation cleanup specialist", "search and rescue diver", "tornado chaser", "underground mine rescuer", "volcano evacuation coordinator", "wildfire hotshot", "xenon radiation detector user", "yellow hazardous material suit wearer", "zero visibility smoke diver",

  // Postal/Delivery
  "amazon delivery driver", "birthday card sender", "courier service owner", "direct mail marketer", "express package handler", "fedex ground driver", "general delivery postmaster", "hand delivered love letter carrier", "international mail sorter", "junk mail recycler", "kings messenger", "letter carrier", "mail order bride matchmaker", "newspaper delivery boy", "overnight express pilot", "package wrapping expert", "quarantine mail sanitizer", "registered mail clerk", "stamp collector", "telegram deliverer", "ups package car driver", "village postman", "western union operator", "xenon envelope sealer", "yellow pages advertiser", "zero gravity mail sorter",

  // Banking/Finance
  "accountant", "bank teller", "credit card processor", "debt collector", "equity trader", "foreclosure specialist", "gold bullion guard", "hedge fund manager", "insurance adjuster", "junk bond trader", "loan officer", "mortgage broker", "note counter", "options trader", "pawn shop owner", "quarterly earnings reporter", "retirement planner", "stockbroker", "teller window clerk", "underwriter", "vault security guard", "wealth manager", "xenon currency detector user", "yield curve analyst", "zero sum game theorist",

  // Real Estate
  "apartment complex manager", "beach house rental agent", "condo association president", "driveway paver", "estate sale organizer", "foreclosure auctioneer", "gated community guard", "house flipper", "interior decorator", "jumbo loan specialist", "kitchen remodeler", "landlord", "mortgage lender", "new construction site supervisor", "open house host", "property appraiser", "quaint cottage seller", "real estate agent", "subdivision developer", "timeshare salesman", "urban renewal planner", "vacant lot caretaker", "warehouse space renter", "xenon radon detector user", "yellow house painter", "zero lot line surveyor",

  // Retail Stores
  "antique shop owner", "bookstore clerk", "clothing store buyer", "department store floor walker", "electronics salesman", "furniture showroom manager", "gift shop wrapper", "hardware store clerk", "ice cream parlor scooper", "jewelry store salesperson", "kitchen appliance demonstrator", "liquor store clerk", "mall directory giver", "newsstand vendor", "optician", "pet store groomer", "quilt shop owner", "record store dj", "shoe store fitter", "toy store stocker", "uniform store tailor", "video rental clerk", "wholesale club member", "xenon price scanner user", "yard sale haggler", "zero waste store cashier",

  // Food Service
  "apple pie baker", "barbecue pitmaster", "cake decorator", "deli slicer", "ethnic restaurant chef", "fast food fry cook", "gourmet chocolatier", "hot dog vendor", "ice cream maker", "japanese sushi chef", "korean barbecue griller", "lobster boil cooker", "mexican taco maker", "noodle soup stirrer", "oyster shucker", "pizza delivery driver", "quiche baker", "roast beef carver", "sandwich artist", "taco truck owner", "udon noodle maker", "vegetarian cook", "waffle maker", "xenon grill lighter", "yogurt parfait assembler", "zero calorie sweetener inventor",

  // Beauty/Personal Care
  "barber", "cosmetologist", "dermatologist", "esthetician", "facialist", "groomer", "hair stylist", "lash technician", "makeup artist", "manicurist", "massage therapist", "nail technician", "optician", "pedicurist", "permanent wave specialist", "quiropractor", "reflexologist", "skin care specialist", "tattoo artist", "uv light technician", "vampire facial provider", "waxing specialist", "xenon light therapist", "yoga instructor", "zero gravity massage therapist",

  // Fitness/Health
  "aerobics instructor", "bodybuilder", "cardio machine repairer", "dance instructor", "elliptical trainer", "fitness trainer", "gymnastics coach", "hiking guide", "interval training expert", "jumping rope champion", "kayak instructor", "lifting coach", "marathon trainer", "nutritionist", "obstacle course designer", "personal trainer", "quickness drill coach", "running coach", "spin class instructor", "treadmill salesman", "ultra marathoner", "volleyball coach", "weightlifting spotter", "xenon performance light user", "yoga teacher", "zero drop shoe designer",

  // Education/Childcare
  "after school program director", "babysitter", "child psychologist", "daycare provider", "elementary teacher", "foster parent", "grade school principal", "homeschool coordinator", "infant care specialist", "junior high teacher", "kindergarten aide", "librarian", "montessori teacher", "nanny", "occupational therapist", "preschool teacher", "quilt story time reader", "reading tutor", "special education teacher", "tutor", "university professor", "vocational trainer", "welfare case worker", "xenon overhead projector user", "youth counselor", "zero tolerance bully prevention coordinator",

  // Animal Care
  "animal control officer", "bird breeder", "cat groomer", "dog trainer", "elephant keeper", "fish tank cleaner", "goat farmer", "horse stable hand", "iguana breeder", "jaguar sanctuary worker", "kangaroo caretaker", "lion tamer", "monkey trainer", "newt keeper", "ostrich rancher", "penguin keeper", "quail farmer", "rabbit breeder", "snake handler", "tiger trainer", "unicorn believer", "veterinarian", "whale trainer", "xenon aquarium light installer", "yak herder", "zebra keeper",

  // Plant Care
  "arborist", "botanical garden curator", "cactus grower", "dendrologist", "evergreen pruner", "floriculturist", "greenhouse manager", "herb gardener", "iris breeder", "jasmine grower", "kelp farmer", "landscape architect", "mycologist", "nursery worker", "orchid specialist", "pineapple grower", "quince tree pruner", "rose breeder", "succulent collector", "tulip bulb planter", "urban farmer", "vegetable gardener", "willow tree weeper", "xenon grow light user", "yam grower", "zinnia seed saver",

  // Music/Instruments
  "accordion repairer", "bagpipe player", "cello maker", "drum set tuner", "electric guitar amplifier", "flute instructor", "guitar string changer", "harmonica player", "instrument appraiser", "jazz saxophonist", "keyboard synthesizer", "lute player", "music store owner", "note reader", "organ repairer", "piano tuner", "quartet arranger", "recorder player", "sitar tuner", "trumpet cleaner", "ukulele maker", "violin bow rehairer", "whistle blower", "xenon strobe light user", "yodeling instructor", "zither string replacer",

  // Art/Crafts
  "acrylic painter", "basket weaver", "ceramic potter", "drawing instructor", "engraver", "felt maker", "glass blower", "handmade jewelry designer", "ink pen artist", "jewelry smith", "knitting circle leader", "leather crafter", "metal sculptor", "needlepoint designer", "oil painter", "pottery wheel thrower", "quilt piecer", "rug weaver", "sculpture caster", "textile dyer", "upholsterer", "vase maker", "watercolor artist", "xenon light box user", "yarn dyer", "zinc plate etcher",

  // Writing/Publishing
  "advertising copywriter", "biographer", "columnist", "dictionary editor", "encyclopedia writer", "fiction novelist", "grammar checker", "haiku poet", "illustrated book designer", "journalist", "kinds book author", "literary agent", "magazine editor", "newspaper reporter", "opinion columnist", "poetry slam host", "quarterly review editor", "romance novelist", "screenwriter", "technical writer", "urban fantasy author", "verse poet", "western novelist", "xenon printing press operator", "young adult book editor", "zero fiction writer",

  // Film/Video
  "action movie stunt coordinator", "behind the scenes documentarian", "cinematographer", "documentary filmmaker", "editing suite operator", "film critic", "green screen keyer", "hollywood agent", "independent filmmaker", "jazz on film scorer", "key grip", "lighting technician", "movie theater usher", "news cameraman", "optical effects creator", "production assistant", "quarantine film shoot coordinator", "reel to reel projector repairer", "sound mixer", "television director", "underwater cameraman", "video editor", "wedding videographer", "xenon arc light operator", "youtube content creator", "zero budget filmmaker",

  // Theater/Performance
  "acrobatic performer", "ballet dancer", "circus clown", "drama teacher", "experimental theater director", "folk dancer", "gymnastics performer", "hula dancer", "improvisational comedian", "jazz dancer", "kabuki actor", "lighting designer", "mime artist", "no theater director", "opera singer", "pantomime actor", "quilt costume designer", "rock musical performer", "stage manager", "tap dancer", "ukulele musical actor", "vaudeville performer", "wig maker", "xenon spotlight operator", "yodeling choir member", "zero gravity dancer",

  // Photography
  "aerial photographer", "baby photographer", "commercial photographer", "documentary photographer", "event photographer", "fashion photographer", "glamour photographer", "headshot photographer", "industrial photographer", "journalistic photographer", "landscape photographer", "macro photographer", "nature photographer", "outdoor adventure photographer", "portrait photographer", "quarantine portrait taker", "real estate photographer", "sports photographer", "travel photographer", "underwater photographer", "vintage camera collector", "wedding photographer", "xenon flash user", "yellow filter photographer", "zero depth of field specialist",

  // Design/Architecture
  "architectural draftsman", "building designer", "city planner", "design software user", "environmental designer", "fashion designer", "graphic designer", "home decorator", "industrial designer", "jewelry designer", "kitchen designer", "landscape architect", "museum exhibit designer", "nautical architect", "office space planner", "product designer", "quilt pattern designer", "residential architect", "set designer", "textile designer", "urban planner", "vehicle designer", "web designer", "xenon light designer", "yard landscaper", "zero energy building designer",

  // Engineering
  "aerospace engineer", "biomedical engineer", "chemical engineer", "data engineer", "electrical engineer", "fire protection engineer", "geotechnical engineer", "highway engineer", "industrial engineer", "jewelry engineer", "kryptonite engineer", "laser engineer", "mechanical engineer", "nuclear engineer", "ocean engineer", "petroleum engineer", "quantum engineer", "robotics engineer", "software engineer", "telecommunications engineer", "underwater engineer", "vehicle engineer", "wastewater engineer", "xenon propulsion engineer", "yield stress engineer", "zero gravity engineer",

  // Science/Research
  "analytical chemist", "biologist", "chemist", "data analyst", "ecologist", "forensic scientist", "geologist", "hydrologist", "immunologist", "jewelry scientist", "kinesiologist", "limnologist", "meteorologist", "neuroscientist", "oceanographer", "pharmacologist", "quantum physicist", "radiologist", "soil scientist", "toxicologist", "ufologist", "virologist", "wildlife biologist", "xenobiologist", "yield scientist", "zoologist",

  // Mathematics
  "actuarial analyst", "biostatistician", "cryptographer", "data scientist", "econometrician", "financial mathematician", "game theorist", "high school math teacher", "insurance mathematician", "jewelry appraiser", "knot theorist", "logistician", "mathematical modeler", "number theorist", "operations researcher", "probability expert", "quantum mathematician", "risk analyst", "statistician", "topology expert", "undergraduate math tutor", "vector analyst", "weather modeler", "xenon probability calculator", "yield curve modeler", "zero knowledge proof mathematician",

  // Language/Linguistics
  "accent coach", "bilingual interpreter", "calligrapher", "dialect coach", "esperanto speaker", "foreign language tutor", "grammar expert", "hieroglyph translator", "interpreter", "japanese language teacher", "klingon speaker", "language pathologist", "mandarin tutor", "native speaker consultant", "oral historian", "phonetics expert", "quipu reader", "rune translator", "sign language interpreter", "tongue twister expert", "universal translator", "voice actor", "written language decoder", "xenoglossy researcher", "yiddish speaker", "zero language barrier breaker",

  // History/Archaeology
  "ancient artifact authenticator", "battlefield archaeologist", "civil war reenactor", "dinosaur bone preparator", "egyptian hieroglyph translator", "fossil preparator", "genealogist", "historical document curator", "indian artifact specialist", "jurassic period expert", "kings tomb excavator", "lost city explorer", "mayan calendar decoder", "native american history keeper", "old west historian", "prehistoric tool maker", "queen elizabeth biographer", "roman coin collector", "stone age researcher", "time capsule designer", "united nations archivist", "victorian photograph curator", "world war ii veteran", "xerox ancient manuscript preserver", "yesteryear newspaper archivist", "zero carbon dating specialist",

  // Philosophy/Religion
  "academic philosopher", "buddhist monk", "christian theologian", "daoist sage", "epistemologist", "faith healer", "gnostic teacher", "hindu priest", "islamic scholar", "jesuit priest", "kabbalist mystic", "logic professor", "metaphysician", "nihilist writer", "ontology expert", "philosophy professor", "quantum mystic", "religious studies scholar", "stoic practitioner", "theologian", "universalist minister", "vedic scholar", "wisdom teacher", "xenon enlightenment seeker", "yoga philosopher", "zen master",

  // Psychology
  "abnormal psychologist", "behavioral therapist", "child psychologist", "developmental psychologist", "educational psychologist", "forensic psychologist", "gestalt therapist", "humanistic psychologist", "industrial psychologist", "jungian analyst", "kinesics expert", "learning psychologist", "memory researcher", "neuropsychologist", "organizational psychologist", "personality theorist", "quantitative psychologist", "research psychologist", "social psychologist", "transpersonal psychologist", "undergraduate psychology major", "victimologist", "women's studies professor", "xenophobic behavior studier", "youth psychologist", "zero tolerance bullying researcher",

  // Sociology/Anthropology
  "anthropologist", "behavioral scientist", "cultural anthropologist", "demographer", "ethnographer", "family sociologist", "gender studies professor", "human geographer", "indigenous rights activist", "juvenile sociologist", "kinship studier", "linguistic anthropologist", "marriage counselor", "native american studies expert", "organizational sociologist", "political sociologist", "queer theorist", "racial justice advocate", "social worker", "transgender studies scholar", "urban sociologist", "victim advocate", "women's rights activist", "xenophobic culture studier", "youth culture researcher", "zero population growth advocate",

  // Political Science
  "campaign manager", "constitutional lawyer", "diplomat", "election analyst", "foreign policy expert", "government relations specialist", "human rights lawyer", "international relations scholar", "judicial clerk", "king maker", "labor organizer", "mayoral candidate", "national security advisor", "ombudsman", "political consultant", "quorum counter", "reform advocate", "senior policy advisor", "think tank fellow", "united nations delegate", "voting rights activist", "washington lobbyist", "xenophobic policy opponent", "youth voter registration drive organizer", "zero tolerance corruption fighter",

  // Economics
  "agricultural economist", "bank economist", "commodities trader", "development economist", "economic forecaster", "financial analyst", "global economist", "hedge fund analyst", "inflation tracker", "job market analyst", "keynesian economist", "labor economist", "macroeconomist", "national income accountant", "oil price analyst", "public finance economist", "quantitative analyst", "real estate economist", "stock market analyst", "trade economist", "unemployment rate tracker", "venture capitalist", "wealth distribution studier", "xenon market predictor", "yield curve strategist", "zero sum game economist",

  // Journalism/Media
  "anchorperson", "broadcast journalist", "columnist", "documentary producer", "editor in chief", "fact checker", "graphic journalist", "headline writer", "investigative reporter", "journalism professor", "king maker", "literary journalist", "media critic", "news aggregator", "opinion writer", "photojournalist", "quarterly magazine writer", "radio host", "sports commentator", "television producer", "underground newspaper editor", "video journalist", "web content manager", "xenon news wire service", "yellow journalism avoider", "zero clickbait writer",

  // Library/Information Science
  "academic librarian", "archivist", "bibliographer", "cataloger", "database administrator", "electronic resources librarian", "folklorist", "genealogical librarian", "historical documents curator", "information architect", "journalism librarian", "knowledge manager", "law librarian", "medical librarian", "music librarian", "newspaper archivist", "oral historian", "preservation specialist", "quilt history documenter", "rare book dealer", "school librarian", "technical services librarian", "university archivist", "visual resources curator", "web librarian", "xenon database indexer", "young adult librarian", "zero knowledge librarian",

  // Museum/Curatorial
  "antiquities curator", "art conservator", "botanical curator", "curator of contemporary art", "dinosaur exhibit designer", "ethnographic curator", "fine arts curator", "geological curator", "historical artifacts curator", "ichthyology curator", "jewelry collection curator", "kunsthalle director", "living history interpreter", "mineralogy curator", "natural history curator", "oceanography exhibit designer", "paleontology curator", "quilt collection curator", "renaissance art specialist", "science museum educator", "textile conservator", "university art museum director", "victorian era curator", "world cultures curator", "xenon exhibit lighting designer", "yarn collection curator", "zoology exhibit designer",

  // Conservation/Environmental
  "air quality monitor", "biodiversity researcher", "climate change activist", "desert restoration expert", "endangered species biologist", "forest conservationist", "green energy advocate", "habitat restoration specialist", "indigenous land protector", "jungle preservationist", "kelp forest ecologist", "land trust director", "marine protected area manager", "national park ecologist", "ocean acidification researcher", "polar ice researcher", "quaking bog protector", "rainforest defender", "solar farm developer", "tropical deforestation monitor", "urban green space planner", "volunteer trail maintainer", "wetland restoration engineer", "xeriscape landscape designer", "yellowstone ecosystem studier", "zero waste advocate",

  // Astronomy/Space
  "amateur astronomer", "black hole researcher", "comet tracker", "dark matter detector", "exoplanet discoverer", "fusion energy researcher", "galactic archaeologist", "habitable planet seeker", "interstellar dust analyzer", "jupiter moon observer", "kuiper belt surveyor", "lunar geologist", "mars soil chemist", "nebula photographer", "orbit mechanics engineer", "planetary scientist", "quantum gravity theorist", "radio telescope operator", "satellite tracker", "telescope mirror grinder", "universe expansion mapper", "venus atmosphere modeler", "wormhole theorist", "xenon propulsion system designer", "yellow star spectroscopist", "zero gravity researcher",

  // Geology/Earth Science
  "atmospheric scientist", "biogeochemist", "crystallographer", "dendrochronologist", "earthquake seismologist", "fossil preparator", "geodesist", "hydrogeologist", "igneous petrologist", "karst geomorphologist", "limnologist", "meteorite collector", "natural disaster forecaster", "ocean sedimentologist", "paleoclimatologist", "quaternary geologist", "rock magnetist", "sedimentologist", "tectonics expert", "uniformitarian geologist", "volcanologist", "weathering specialist", "xenon dating technician", "yield strength geologist", "zircon crystal dater",

  // Chemistry
  "analytical chemist", "biochemist", "computational chemist", "drug discovery chemist", "environmental chemist", "food chemist", "green chemistry advocate", "high throughput screener", "industrial chemist", "jewelry alloy specialist", "knot theory chemist", "laboratory manager", "medicinal chemist", "nanomaterials chemist", "organic chemist", "pharmaceutical chemist", "quantum chemist", "radiochemistry expert", "synthetic chemist", "toxicology expert", "ultraviolet spectroscopy user", "viticulture chemist", "water quality analyst", "xenon compound synthesizer", "yield optimization chemist", "zero waste chemist",

  // Physics
  "accelerator physicist", "biophysics researcher", "computational physicist", "dark energy physicist", "electromagnetic theorist", "fluid dynamics expert", "gravitational wave detector", "high energy physicist", "instrumentation physicist", "knot theory physicist", "laser physicist", "materials physicist", "nuclear physicist", "optics expert", "particle physicist", "quantum field theorist", "relativity expert", "solid state physicist", "theoretical physicist", "ultrasound physicist", "vacuum physics specialist", "wave mechanics expert", "xenon laser physicist", "yield stress physicist", "zero point energy researcher",

  // Biology
  "anatomist", "biochemist", "cell biologist", "developmental biologist", "ecologist", "evolutionary biologist", "forensic biologist", "geneticist", "histologist", "immunologist", "kinesiology expert", "limnologist", "marine biologist", "molecular biologist", "neurobiologist", "ornithologist", "parasitologist", "quantitative biologist", "reproductive biologist", "systematic biologist", "taxonomist", "ultrastructural biologist", "virologist", "wildlife biologist", "xenobiologist", "yeast geneticist", "zoologist",

  // Medicine
  "allergist", "cardiologist", "dermatologist", "endocrinologist", "family physician", "gastroenterologist", "hematologist", "infectious disease specialist", "jewelry embedded surgeon", "kidney specialist", "liver transplant surgeon", "medical geneticist", "neonatologist", "obstetrician", "pediatrician", "quarantine physician", "radiologist", "sports medicine doctor", "toxicologist", "urologist", "vascular surgeon", "wound care specialist", "xenon imaging technician", "yoga therapy doctor", "zero gravity medicine specialist",

  // Nursing
  "acute care nurse", "burn unit nurse", "cardiac care nurse", "dialysis nurse", "emergency room nurse", "flight nurse", "geriatric nurse", "home health nurse", "icu nurse", "jewelry allergy nurse", "kidney transplant coordinator", "labor and delivery nurse", "medical surgical nurse", "neonatal nurse", "oncology nurse", "pediatric nurse", "quarantine nurse", "radiology nurse", "school nurse", "telemetry nurse", "urology nurse", "vascular access nurse", "wound ostomy continence nurse", "xenon radiation nurse", "yoga instructor nurse", "zero harm advocate nurse",

  // Dentistry
  "cosmetic dentist", "dental hygienist", "endodontist", "forensic odontologist", "general dentist", "geriatric dentist", "hospital dentist", "implant specialist", "jewelry tooth embedder", "kidney dialysis patient dentist", "laser dentist", "maxillofacial surgeon", "neuroscience dentist", "oral pathologist", "pediatric dentist", "prosthodontist", "quarantine dental assistant", "radiology dentist", "sports dentist", "teeth whitening specialist", "urology patient dentist", "vascular dentist", "wisdom tooth extractor", "xenon light curing dentist", "yoga relaxation dentist", "zero cavity dentist",

  // Pharmacy
  "clinical pharmacist", "compounding pharmacist", "drug information specialist", "emergency pharmacist", "geriatric pharmacist", "hospital pharmacist", "industrial pharmacist", "jewelry poisoning antidote pharmacist", "kidney transplant pharmacist", "long term care pharmacist", "managed care pharmacist", "nuclear pharmacist", "oncology pharmacist", "pediatric pharmacist", "psychiatric pharmacist", "quarantine vaccine pharmacist", "radiology pharmacist", "retail pharmacist", "specialty pharmacist", "telemedicine pharmacist", "urology pharmacist", "vaccine development pharmacist", "wholesale pharmacist", "xenon radiation protection pharmacist", "yoga stress relief pharmacist", "zero waste pharmacy advocate",

  // Veterinary
  "avian veterinarian", "bovine practitioner", "canine specialist", "dairy cow vet", "equine surgeon", "fish veterinarian", "goat herd vet", "horse racing vet", "iguana specialist", "jaguar sanctuary vet", "kangaroo caretaker vet", "laboratory animal vet", "marine mammal vet", "newt breeder vet", "ostrich farm vet", "pig farm vet", "quail breeder vet", "rabbit show vet", "snake venom expert vet", "tiger trainer vet", "unicorn believer vet", "vulture rehabilitation vet", "whale stranding vet", "xenon imaging vet", "yak caravan vet", "zebra migration vet",

  // Therapy/Rehabilitation
  "art therapist", "chiropractor", "dance therapist", "equine therapist", "family therapist", "group therapist", "hypnotherapist", "interpersonal therapist", "jungian therapist", "kinesiology therapist", "laughter therapist", "marriage counselor", "neurofeedback therapist", "occupational therapist", "physical therapist", "quilt therapy facilitator", "reiki practitioner", "sex therapist", "trauma therapist", "unified therapy provider", "voice therapist", "water therapy specialist", "xenon light therapist", "yoga therapist", "zero gravity therapy provider",

  // Alternative Medicine
  "acupuncturist", "aromatherapist", "ayurvedic practitioner", "biofeedback therapist", "chiropractor", "crystal healer", "energy worker", "feng shui consultant", "guided imagery therapist", "herbalist", "iridologist", "jin shin jyutsu practitioner", "kundalini yoga teacher", "life coach", "meditation instructor", "naturopath", "osteopath", "polarity therapist", "quantum healer", "reflexologist", "shiatsu practitioner", "therapeutic touch provider", "universal energy healer", "visceral manipulation therapist", "watsu practitioner", "xenon crystal healer", "yoga nidra guide", "zero balancing practitioner",

  // Social Work
  "adoption social worker", "case manager", "child welfare worker", "community organizer", "disability advocate", "elder care specialist", "family preservation worker", "group home director", "hospice social worker", "immigrant resettlement coordinator", "juvenile justice worker", "kinship care specialist", "long term care coordinator", "medical social worker", "neighborhood center director", "orphanage director", "prison social worker", "quarantine isolation support worker", "refugee assistance coordinator", "school social worker", "trauma informed care provider", "unemployed worker support specialist", "victim services coordinator", "welfare eligibility worker", "xenophobic hate crime victim advocate", "youth mentoring coordinator", "zero tolerance abuse prevention worker",

  // Counseling
  "addiction counselor", "bereavement counselor", "career counselor", "debt counseling specialist", "eating disorder therapist", "financial counselor", "grief counselor", "hiv counseling specialist", "immigration counselor", "job placement counselor", "kinship counselor", "life transition counselor", "marriage counselor", "nutrition counselor", "occupational counselor", "peer counselor", "quarantine mental health counselor", "relationship counselor", "sexual health educator", "trauma counselor", "unemployment counselor", "victim advocate", "weight management counselor", "xenophobic bias counselor", "youth counselor", "zero suicide prevention counselor",

  // Law Enforcement
  "animal control officer", "bailiff", "campus police officer", "detective", "evidence technician", "forensic investigator", "gang unit officer", "highway patrol officer", "internal affairs investigator", "juvenile officer", "k9 handler", "lieutenant", "missing persons investigator", "narcotics detective", "organized crime investigator", "park ranger", "quarantine enforcement officer", "robbery detective", "school resource officer", "traffic officer", "undercover agent", "vice squad officer", "warrant server", "xenophobic hate crime investigator", "youth diversion officer", "zero tolerance traffic enforcer",

  // Firefighting
  "arson investigator", "brush fire fighter", "chief fire marshal", "dispatch operator", "emergency medical technician", "fire inspector", "grassland firefighter", "hazardous materials responder", "incident commander", "jungle fire fighter", "kettle hole spotter", "ladder truck operator", "mountain rescue specialist", "nozzle operator", "oxygen tank carrier", "paramedic firefighter", "quarantine fire response coordinator", "rapid intervention team member", "smoke jumper", "tank truck driver", "urban search and rescue specialist", "volunteer firefighter", "wildland firefighter", "xenon thermal imaging operator", "yellow fire truck driver", "zero visibility smoke diver",

  // Military
  "air force pilot", "army ranger", "coast guard rescue swimmer", "drone pilot", "explosives expert", "fighter pilot", "green beret", "helicopter pilot", "intelligence officer", "joint special operations commander", "korean war veteran", "logistics officer", "marine sniper", "navy seal", "operations officer", "paratrooper", "quartermaster", "radar operator", "special forces soldier", "tank commander", "uniformed services member", "vietnam veteran", "weapons specialist", "xenon night vision specialist", "yellow ribbon supporter", "zero dark thirty operative",

  // Intelligence/Security
  "bodyguard", "cia analyst", "counterintelligence officer", "diplomatic security agent", "electronic warfare specialist", "fbi profiler", "government contractor", "hacker", "industrial security specialist", "jewelry heist investigator", "kidnap negotiator", "lie detector operator", "military intelligence officer", "national security advisor", "ombudsman", "personal security detail", "quarantine security enforcer", "radar surveillance operator", "security systems installer", "terrorism expert", "undercover operative", "vigilante", "white house secret service agent", "xenon surveillance camera installer", "yacht security specialist", "zero trust security architect",

  // Private Investigation
  "background investigator", "corporate investigator", "divorce investigator", "evidence collector", "forensic accountant", "genealogy investigator", "hidden asset finder", "infidelity investigator", "jewelry theft investigator", "kidnap ransom negotiator", "lie detector administrator", "missing heir locator", "nefarious activity uncoverer", "online stalker tracker", "personal injury investigator", "quarantine violation investigator", "repo man", "surveillance specialist", "theft investigator", "undercover shopper", "victim locator", "witness interviewer", "xenophobic hate group infiltrator", "yellow pages investigator", "zero tolerance fraud investigator",

  // Custom"
];

const BLOCKED_NSFW_TERMS = [
  "child", "kid", "girl", "boy", "teen", "youth", "minor", "juvenile",
  "school", "student", "pupil", "classroom", "playground", 
  "baby", "infant", "toddler", "adolescent", "pubescent", "immature",
  "pre-teen", "tween", "developing",
];

const NSFW_LOOK_PRESETS = [
  // Hair Styles
  "long flowing hair", "short bob cut", "curly locks", "straight sleek hair",
  "wavy beach waves", "ponytail", "braids", "bun", "pixie cut",
  "dreadlocks", "afro", "shaved head", "mohawk", "mullet", "faux hawk",
  "layered cut", "shag cut", "lob cut", "balayage highlights", "ombre hair",
  "platinum blonde", "jet black", "fiery red", "golden blonde", "chestnut brown",
  "auburn waves", "silver gray", "rainbow colored", "neon pink", "electric blue",
  
  // Face Features
  "sharp cheekbones", "full lips", "high forehead", "defined jawline",
  "button nose", "upturned nose", "aquiline nose", "small nose", "large eyes",
  "almond-shaped eyes", "round eyes", "cat-like eyes", "heavy eyelids", "thick eyebrows",
  "thin arched brows", "bushy brows", "pierced brows", "tattooed face", "beauty mark",
  "freckles", "rosy cheeks", "pale complexion", "olive skin", "ebony skin",
  "porcelain skin", "sun-kissed glow", "flawless skin", "scarred face", "tattooed lips",
  
  // Body Features
  "hourglass figure", "athletic build", "curvy hips", "slender waist",
  "broad shoulders", "toned abs", "voluptuous breasts", "pert breasts", "flat chest",
  "muscular arms", "slender legs", "thick thighs", "long neck", "graceful posture",
  "tall stature", "petite frame", "amazonian height", "compact build", "elongated limbs",
  "powerful physique", "delicate frame", "robust build", "lithe form", "stocky build",
  
  // Distinctive Features
  "tattoos covering arms", "pierced nipples", "navel piercing", "tongue piercing",
  "nose ring", "lip piercing", "ear gauges", "facial tattoos", "body jewelry",
  "birthmarks", "scars", "stretch marks", "cellulite", "freckle constellations",
  "beauty spots", "asymmetrical features", "unique eye color", "heterochromia",
  "vitiligo patterns", "albinism", "melanin rich skin", "pale as moonlight",
  
  // Expressions
  "seductive smile", "mischievous grin", "sultry gaze", "intense stare",
  "playful wink", "biting lip", "tongue out", "raised eyebrow", "pouty lips",
  "smirking", "laughing eyes", "teasing expression", "inviting look", "dominant gaze",
  "submissive eyes", "curious expression", "surprised look", "blushing cheeks",
  "bored expression", "excited face", "angry glare", "sad puppy eyes", "confused look",
  
  // Makeup & Accessories
  "smoky eyes", "red lipstick", "nude makeup", "heavy contour", "natural glow",
  "glitter makeup", "gothic makeup", "pin-up makeup", "bridal makeup", "stage makeup",
  "eyelashes", "false lashes", "colored contacts", "sunglasses", "choker necklace",
  "statement earrings", "nose chain", "headband", "hair clips", "hair extensions",
  "wigs", "hair weaves", "hair toppers", "hair accessories", "head jewelry",
  
  // Skin & Texture
  "smooth skin", "rough texture", "oily skin", "dry skin", "combination skin",
  "sensitive skin", "acne scarred", "wrinkled skin", "youthful skin", "aged skin",
  "tanned skin", "burnt skin", "pale skin", "ruddy complexion", "sallow skin",
  "golden skin", "bronzed skin", "ebony skin", "porcelain skin", "translucent skin",
  "glowing skin", "dull skin", "radiant skin", "matte skin", "dewy skin",
  
  // Body Hair
  "shaved smooth", "landing strip", "bikini line", "bush", "trimmed",
  "natural", "waxed", "lasered", "depilatory cream", "threading",
  "eyebrow threading", "upper lip hair", "sideburns", "beard", "mustache",
  "goatee", "soul patch", "five o'clock shadow", "stubble", "clean shaven",
  
  // Nails & Hands
  "long nails", "short nails", "acrylic nails", "gel nails", "natural nails",
  "painted nails", "nail art", "French manicure", "colored nails", "nude nails",
  "black nails", "red nails", "neon nails", "glitter nails", "chrome nails",
  "slender fingers", "thick fingers", "long fingers", "short fingers", "arthritis knuckles",
  "veiny hands", "soft hands", "calloused hands", "manicured hands", "unkempt nails",
  
  // Feet & Legs
  "high arches", "flat feet", "wide feet", "narrow feet", "long toes",
  "short toes", "painted toenails", "bare feet", "stocking feet", "high heels",
  "flat shoes", "barefoot", "socks", "nylons", "fishnets", "leggings",
  "pants", "shorts", "skirts", "dresses", "long legs", "short legs",
  "toned calves", "thick calves", "slender ankles", "thick ankles", "veiny legs",
  
  // Arms & Shoulders
  "toned biceps", "flabby arms", "muscular shoulders", "slender arms",
  "thick arms", "veiny forearms", "soft upper arms", "defined deltoids",
  "broad shoulders", "narrow shoulders", "shoulder pads", "sleeveless",
  "long sleeves", "short sleeves", "tattooed arms", "scarred arms",
  "braceleted wrists", "watch wearing", "bangle wearing", "naked arms",
  
  // Back & Posture
  "straight posture", "slouched", "arched back", "military posture",
  "graceful stance", "awkward posture", "confident stride", "timid walk",
  "back tattoos", "bra strap lines", "thong lines", "tan lines",
  "scarred back", "smooth back", "hairy back", "shaved back",
  "winged shoulder blades", "prominent spine", "muscular back", "soft back",
  
  // Neck & Collar
  "long neck", "short neck", "thick neck", "slender neck", "veiny neck",
  "tattooed neck", "scarred neck", "necklace wearing", "choker wearing",
  "collar wearing", "turtleneck", "v-neck", "crew neck", "off shoulder",
  "halter neck", "sweetheart neckline", "square neck", "scoop neck",
  "boat neck", "high neck", "low neck", "plunging neckline",
  
  // Waist & Hips
  "tiny waist", "thick waist", "defined waist", "soft waist",
  "hourglass waist", "straight waist", "apple shape", "pear shape",
  "inverted triangle", "rectangle shape", "wide hips", "narrow hips",
  "childbearing hips", "athletic hips", "soft hips", "bony hips",
  "hip dips", "no hip dips", "love handles", "muffin top",
  
  // Breasts & Chest
  "large breasts", "small breasts", "medium breasts", "perky breasts",
  "sagging breasts", "enhanced breasts", "natural breasts", "asymmetrical breasts",
  "pale areolas", "dark areolas", "large areolas", "small areolas",
  "pierced nipples", "tattooed breasts", "scarred chest", "smooth chest",
  "muscular chest", "soft chest", "hairy chest", "shaved chest",
  "broad chest", "narrow chest", "barrel chest", "flat chest",
  
  // Buttocks & Rear
  "round buttocks", "flat buttocks", "square buttocks", "heart-shaped buttocks",
  "large buttocks", "small buttocks", "toned glutes", "soft glutes",
  "cellulite dimples", "smooth buttocks", "tattooed buttocks", "scarred buttocks",
  "thong tan lines", "visible panty lines", "no lines", "stretch marks",
  "firm buttocks", "jiggly buttocks", "muscular buttocks", "flabby buttocks",
  
  // Genitalia & Intimate Areas
  "trimmed pubic hair", "shaved pubic hair", "natural pubic hair", "landing strip",
  "bikini wax", "brazilian wax", "hollywood wax", "french wax", "maintenance free",
  "visible labia", "hidden labia", "asymmetrical labia", "symmetrical labia",
  "dark labia", "pale labia", "pierced labia", "tattooed pubic area",
  "enlarged clitoris", "small clitoris", "prominent clitoris", "hidden clitoris",
  "loose vagina", "tight vagina", "stretched vagina", "virgin vagina",
  "circumcised penis", "uncircumcised penis", "large penis", "small penis",
  "thick penis", "thin penis", "curved penis", "straight penis",
  "veiny penis", "smooth penis", "pierced penis", "tattooed penis",
  "large testicles", "small testicles", "hairy scrotum", "shaved scrotum",
  
  // Overall Appearance
  "goth look", "punk look", "hippie look", "preppy look", "business casual",
  "casual wear", "formal wear", "evening wear", "beach wear", "street wear",
  "athleisure", "bohemian", "minimalist", "maximalist", "vintage style",
  "modern style", "retro style", "futuristic style", "tribal style", "urban style",
  "rural style", "aristocratic", "working class", "middle class", "upper class",
  "alternative", "mainstream", "edgy", "soft", "hard", "feminine", "masculine",
  "androgynous", "gender fluid", "non-binary", "transgender", "cisgender",
  
  // Age Appearance
  "youthful appearance", "mature appearance", "aged appearance", "timeless beauty",
  "premature aging", "well-preserved", "weathered look", "fresh faced",
  "baby faced", "hardened features", "soft features", "sharp features",
  "delicate features", "robust features", "feminine features", "masculine features",
  
  // Health & Condition
  "healthy glow", "unhealthy pallor", "sun damaged", "wind burned",
  "weather beaten", "sheltered complexion", "outdoor lifestyle", "indoor lifestyle",
  "athletic conditioning", "sedentary appearance", "fit physique", "unfit physique",
  "toned muscles", "soft muscles", "defined muscles", "undefined muscles",
  "flexible body", "stiff body", "graceful movements", "awkward movements",
  
  // Scars & Markings
  "surgical scars", "accident scars", "self-harm scars", "tribal scars",
  "ritual scars", "battle scars", "childhood scars", "adult scars",
  "faint scars", "prominent scars", "raised scars", "flat scars",
  "pink scars", "white scars", "dark scars", "keloid scars",
  "scar tissue", "healing wounds", "fresh cuts", "old wounds",
  
  // Piercings & Modifications
  "multiple piercings", "single piercing", "gauged ears", "stretched lobes",
  "septum piercing", "bridge piercing", "industrial piercing", "daith piercing",
  "tragus piercing", "conch piercing", "rooks piercing", "snug piercing",
  "vertical labret", "horizontal labret", "monroe piercing", "medusa piercing",
  "philtrum piercing", "dimples piercing", "smiley piercing", "frowny piercing",
  "tongue web piercing", "snake eyes piercing", "angel bites", "devil bites",
  "dermal piercings", "surface piercings", "genital piercings", "nipple piercings",
  "corset piercings", "bridge piercings", "ear projects", "eyebrow piercings",
  
  // Tattoos
  "full sleeve tattoos", "half sleeve tattoos", "quarter sleeve tattoos",
  "full back tattoo", "lower back tattoo", "shoulder tattoo", "chest tattoo",
  "ribcage tattoo", "thigh tattoo", "calf tattoo", "foot tattoo", "hand tattoo",
  "finger tattoos", "neck tattoo", "face tattoo", "scalp tattoo",
  "traditional tattoos", "new school tattoos", "realism tattoos", "watercolor tattoos",
  "blackwork tattoos", "japanese style", "tribal tattoos", "celtic tattoos",
  "mayan tattoos", "egyptian tattoos", "geometric tattoos", "script tattoos",
  "portrait tattoos", "animal tattoos", "flower tattoos", "skull tattoos",
  "religious tattoos", "patriotic tattoos", "memorial tattoos", "cover-up tattoos",
  
  // Jewelry & Adornments
  "gold jewelry", "silver jewelry", "platinum jewelry", "costume jewelry",
  "diamond stud earrings", "hoop earrings", "drop earrings", "chandelier earrings",
  "stud earrings", "nose studs", "nose rings", "septum rings", "lip rings",
  "tongue rings", "eyebrow rings", "nipple rings", "genital rings", "navel rings",
  "wrist bracelets", "ankle bracelets", "toe rings", "finger rings", "thumb rings",
  "necklaces", "chokers", "pendants", "lockets", "chains", "dog tags",
  "body chains", "waist chains", "hip chains", "ankle chains", "toe chains",
  
  // Clothing Integration
  "sheer clothing", "tight clothing", "loose clothing", "form fitting",
  "baggy clothing", "layered clothing", "minimal clothing", "maximal clothing",
  "revealing clothing", "modest clothing", "transparent clothing", "opaque clothing",
  "wet clothing", "dry clothing", "stained clothing", "clean clothing",
  "torn clothing", "intact clothing", "designer clothing", "thrifted clothing",
  "custom clothing", "mass produced clothing", "handmade clothing", "machine made clothing",
  
  // Accessories
  "glasses", "sunglasses", "contacts", "eye patch", "monocle", "loupes",
  "hearing aids", "ear plugs", "headphones", "earbuds", "hair ties", "hair clips",
  "hair bands", "hair nets", "hair covers", "hats", "caps", "beanies",
  "scarves", "bandanas", "neck ties", "bow ties", "ascots", "cravats",
  "belts", "suspenders", "braces", "holsters", "fanny packs", "backpacks",
  "handbags", "purses", "wallets", "phone cases", "watch bands", "bracelets",
  "rings", "earrings", "necklaces", "brooches", "pins", "badges",
  "patches", "stickers", "temporary tattoos", "henna tattoos", "body paint",
  
  // Footwear Integration
  "barefoot", "sandals", "flip flops", "thongs", "slides", "crocs",
  "sneakers", "tennis shoes", "running shoes", "basketball shoes", "soccer cleats",
  "boots", "cowboy boots", "combat boots", "knee high boots", "thigh high boots",
  "ankle boots", "riding boots", "rain boots", "snow boots", "ski boots",
  "heels", "high heels", "stiletto heels", "wedge heels", "block heels",
  "flats", "loafers", "oxfords", "derbies", "slippers", "moccasins",
  "espadrilles", "platform shoes", "clogs", "mules", "slingbacks",
  
  // Headwear
  "baseball caps", "beanie hats", "berets", "bowlers", "bucket hats",
  "cowboy hats", "fedora hats", "flat caps", "hard hats", "helmet",
  "hijabs", "hoodies", "newsboy caps", "panama hats", "pirate hats",
  "pork pie hats", "snapback caps", "sombreros", "sun hats", "top hats",
  "trucker hats", "turbans", "visor caps", "wool hats", "yarmulkes",
  
  // Outerwear
  "coats", "jackets", "blazers", "cardigans", "hoodies", "sweaters",
  "vests", "ponchos", "capes", "shawls", "stoles", "boleros",
  "bomber jackets", "denim jackets", "leather jackets", "trench coats",
  "pea coats", "duffel coats", "fur coats", "rain coats", "windbreakers",
  "field jackets", "military jackets", "safari jackets", "tuxedo jackets",
  
  // Undergarments Visible/Integrated
  "bra straps", "thong lines", "panty lines", "garter straps", "stocking tops",
  "corset lacing", "bustier edges", "chemise hems", "teddy outlines",
  "bodysuit seams", "lingerie straps", "foundation garment lines", "shapewear ridges",
  "control top edges", "open bottom panties", "thong back", "g-string sides",
  "boyleg panty lines", "high cut leg openings", "low rise waistbands",
  
  // Swimwear Integration
  "bikini tops", "bikini bottoms", "one piece swimsuits", "tankinis",
  "burkinis", "board shorts", "speedos", "trunks", "swim trunks",
  "rash guards", "surf shirts", "wet suits", "dry suits", "life jackets",
  "swim caps", "goggles", "flippers", "snorkels", "dive masks",
  
  // Athletic Wear
  "sports bras", "compression shirts", "running shorts", "yoga pants",
  "leggings", "spandex shorts", "bike shorts", "compression leggings",
  "sweatpants", "track pants", "joggers", "athletic shorts", "basketball shorts",
  "football jerseys", "baseball uniforms", "soccer kits", "tennis outfits",
  "golf attire", "ski suits", "snowboard gear", "surf wear", "wakeboard vests",
  
  // Sleepwear
  "nightgowns", "nighties", "babydolls", "chemises", "teddies",
  "negligees", "peignoirs", "robes", "pajamas", "pajama sets",
  "sleep shirts", "boxer shorts", "sleep pants", "loungewear",
  "slippers", "bed socks", "eye masks", "sleep bonnets",
  
  // Costumes & Roleplay
  "nurse uniforms", "police uniforms", "military uniforms", "schoolgirl outfits",
  "cheerleader uniforms", "bunny costumes", "cat costumes", "dog costumes",
  "superhero costumes", "villain costumes", "princess dresses", "fairy costumes",
  "witch costumes", "vampire costumes", "zombie makeup", "alien costumes",
  "robot costumes", "angel costumes", "devil costumes", "pirate costumes",
  
  // Seasonal/Weather
  "winter coats", "summer dresses", "spring outfits", "fall sweaters",
  "rain gear", "snow gear", "beach wear", "pool wear", "casual wear",
  "formal wear", "business wear", "evening wear", "cocktail dresses",
  "black tie attire", "white tie attire", "casual friday", "smart casual",
  
  // Cultural/Traditional
  "saris", "kimonos", "cheongsams", "dirndls", "kilt outfits",
  "dashikis", "caftans", "tunics", "robes", "burqas", "niqabs",
  "hijabs", "turbans", "fezzes", "sombreros", "sarongs", "lungis",
  "dhotis", "shalwar kameez", "hanboks", "yukatas", "ao dais",
  
  // Fantasy/Sci-Fi
  "elven robes", "dwarven armor", "orcish hides", "magical robes",
  "space suits", "alien skin", "cybernetic implants", "magical tattoos",
  "dragon scales", "fairy wings", "mermaid tails", "werewolf fur",
  "vampire fangs", "witch hats", "wizard staffs", "knight armor",
  "princess gowns", "peasant clothes", "noble attire", "court jester outfits",
  
  // Fetish/BDSM
  "leather outfits", "latex suits", "rubber wear", "vinyl clothing",
  "corsets", "bondage gear", "collar and leash", "handcuffs", "chains",
  "whips", "paddles", "restraints", "blindfolds", "gags", "plugs",
  "harnesses", "straps", "buckles", "zippers", "laces", "buttons",
  
  // Medical/Clinical
  "hospital gowns", "doctor coats", "nurse uniforms", "patient gowns",
  "surgical masks", "gloves", "caps", "shoe covers", "lab coats",
  "scrubs", "stethoscopes", "blood pressure cuffs", "thermometers",
  "bandages", "casts", "slings", "crutches", "wheelchairs", "walkers",
  
  // Emergency Services
  "police uniforms", "firefighter gear", "paramedic uniforms", "military fatigues",
  "bulletproof vests", "helmets", "boots", "gloves", "belts", "badges",
  "patches", "insignia", "epaulettes", "chevrons", "stripes", "stars",
  
  // Industrial/Professional
  "hard hats", "safety glasses", "ear protection", "respirators", "gloves",
  "steel toe boots", "coveralls", "tool belts", "harnesses", "ropes",
  "cables", "chains", "hooks", "pulleys", "levers", "gears", "machines",
  
  // Artistic/Performance
  "tutus", "leotards", "unitards", "tights", "ballet slippers", "tap shoes",
  "jazz shoes", "character shoes", "masks", "face paint", "body paint",
  "feathers", "sequins", "glitter", "rhinestones", "beads", "fringes",
  
  // Religious/Spiritual
  "nun habits", "priest collars", "monk robes", "rabbi hats", "turbans",
  "burqas", "niqabs", "hijabs", "yarmulkes", "crosses", "stars of david",
  "crescents", "om symbols", "mandalas", "prayer beads", "rosaries",
  
  // Historical Periods
  "victorian dresses", "renaissance gowns", "medieval tunics", "ancient togas",
  "egyptian linens", "roman tunics", "greek chitons", "viking furs",
  "colonial coats", "flapper dresses", "hippie beads", "punk spikes",
  "grunge flannels", "preppy polos", "yuppie power suits", "millennial athleisure",
  
  // Custom"
];

const NSFW_ACTOR_MOVEMENT_PRESETS = [
  "",  // Allow empty
  // Seductive/Sensual
  "leans back seductively, crosses legs slowly, smiles invitingly",
  "trails fingers along collarbone, bites lip playfully, gazes intently",
  "arches back gracefully, runs hands through hair, poses alluringly",
  "sits on edge of bed, pats mattress invitingly, whispers softly",
  "stands close, breathes heavily, brushes against partner teasingly",
  "dances provocatively, sways hips rhythmically, locks eyes",
  "lies back slowly, stretches languidly, beckons with finger",
  "turns around slowly, looks over shoulder seductively, winks",
  "crawls forward on all fours, approaches slowly, purrs softly",
  "stands against wall, poses dramatically, runs hands over body",
  
  // Intimate/Physical
  "kisses deeply, presses body close, moans softly",
  "caresses partner's skin, explores with hands, breathes heavily",
  "lies beneath partner, wraps legs around, pulls closer",
  "straddles partner, grinds slowly, throws head back",
  "pins partner down, kisses neck, whispers desires",
  "touches intimately, strokes erogenous zones, gasps in pleasure",
  "performs oral pleasure, takes control, builds intensity",
  "Custom"
];

const NSFW_EXPLICIT_ABILITIES = [
  "",  // Allow empty
  // Physical Abilities
  "enhanced strength and endurance", "flexible and acrobatic", "powerful and dominant",
  "submissive and yielding", "agile and quick", "strong and muscular", "graceful and elegant",
  "wild and untamed", "controlled and precise", "passionate and intense",
  "unlimited stamina", "rapid healing", "superhuman flexibility", "enhanced coordination",
  "perfect balance", "lightning reflexes", "tireless performance", "peak physical condition",
  
  // Sensory Abilities
  "heightened senses", "sensitive touch", "responsive to pleasure", "intense arousal",
  "multiple orgasms", "prolonged stamina", "quick recovery", "enhanced libido",
  "erotic synesthesia", "tactile hypersensitivity", "auditory arousal", "visual stimulation",
  "olfactory sensitivity", "taste enhancement", "pleasure amplification", "sensory overload",
  
  // Special Abilities
  "shape-shifting body", "telekinetic touch", "energy manipulation", "mind reading",
  "illusion creation", "time manipulation", "dimension hopping", "reality warping",
  "elemental control", "healing touch", "immortality", "regeneration",
  "teleportation", "invisibility", "flight", "super speed", "intangibility", "duplication",
  "size manipulation", "density control", "gravity manipulation", "magnetic control",
  
  // Fetish-Specific
  "bondage mastery", "pain tolerance", "sensory deprivation", "roleplay expertise",
  "toy proficiency", "group coordination", "exhibitionist confidence", "voyeuristic insight",
  "domination skills", "submission grace", "switch versatility", "BDSM knowledge",
  "impact play expertise", "edge play mastery", "aftercare specialist", "scene negotiation",
  "power exchange dynamics", "protocol adherence", "ritual performance", "psychological play",
  
  // Sexual Abilities
  "deep throat capability", "anal expertise", "oral mastery", "manual dexterity",
  "position versatility", "endurance athlete", "multiple partner coordination", "orgasm control",
  "ejaculation control", "lubrication control", "muscle control", "breath control",
  "temperature play", "texture manipulation", "rhythm mastery", "intensity modulation",
  
  // Fantasy Abilities
  "succubus powers", "incubus charm", "vampiric seduction", "werewolf transformation",
  "fairy enchantment", "mermaid allure", "nymph fertility", "amazon strength",
  "valkyrie combat", "dryad nature connection", "elf longevity", "dwarf craftsmanship",
  "orc ferocity", "angelic purity", "demonic corruption", "ghostly possession",
  
  // Technological Abilities
  "cybernetic enhancements", "neural implants", "bionic modifications", "AI integration",
  "haptic feedback systems", "virtual reality immersion", "augmented reality overlay",
  "nanobot swarm control", "genetic modification", "hormone optimization", "pheromone production",
  "bio-luminescence", "electro-stimulation", "magnetic field generation", "sonic manipulation",
  
  // Magical Abilities
  "spell casting", "potion brewing", "charm weaving", "enchantment creation",
  "summoning rituals", "binding spells", "transformation magic", "illusion mastery",
  "telepathy", "precognition", "clairvoyance", "psychokinesis", "levitation",
  "invisibility cloak", "shape shifting", "elemental summoning", "healing magic",
  
  // Psychological Abilities
  "mind control", "hypnosis mastery", "suggestion implantation", "memory manipulation",
  "emotion control", "pleasure induction", "pain suppression", "fear generation",
  "confidence boosting", "arousal amplification", "desire manipulation", "fantasy realization",
  "dream walking", "astral projection", "soul binding", "life force absorption",
  
  // Animal Abilities
  "cat-like agility", "dog-like loyalty", "snake-like flexibility", "bird-like grace",
  "wolf-like pack coordination", "lion-like dominance", "eagle-like vision", "dolphin-like playfulness",
  "bear-like strength", "fox-like cunning", "rabbit-like fertility", "horse-like endurance",
  "butterfly-like transformation", "spider-like web weaving", "octopus-like multitasking", "shark-like hunting",
  
  // Elemental Abilities
  "fire manipulation", "water control", "earth shaping", "air mastery",
  "lightning generation", "ice creation", "plant growth", "weather control",
  "metal bending", "crystal formation", "sound waves", "color manipulation",
  "heat generation", "cold production", "electricity conduction", "magnetic fields",
  
  // Spiritual Abilities
  "chakra alignment", "kundalini awakening", "tantric mastery", "meditative trance",
  "energy channeling", "aura reading", "chakra balancing", "spiritual healing",
  "past life recall", "future vision", "dimensional travel", "cosmic consciousness",
  "enlightenment attainment", "nirvana experience", "satori realization", "zen mastery",
  
  // Artistic Abilities
  "dance mastery", "music composition", "poetry creation", "painting with passion",
  "sculpting desire", "performance art", "erotic storytelling", "sensual massage",
  "body painting", "tattoo artistry", "jewelry crafting", "costume design",
  "choreography creation", "musical improvisation", "literary erotica", "visual seduction",
  
  // Professional Abilities
  "massage therapy", "yoga instruction", "personal training", "nutrition expertise",
  "sex education", "relationship counseling", "intimacy coaching", "pleasure consulting",
  "erotic photography", "adult entertainment", "sex toy design", "lingerie modeling",
  "striptease performance", "burlesque artistry", "pole dancing", "exotic dancing",
  
  // Group Abilities
  "threesome coordination", "orgy orchestration", "cuckold dynamics", "hotwife management",
  "polyamory navigation", "group communication", "jealousy management", "compersion cultivation",
  "relationship weaving", "community building", "event planning", "aftercare coordination",
  "boundary setting", "consent culture", "communication mastery", "emotional intelligence",
  
  // Fetish Abilities
  "latex perfection", "leather crafting", "bondage rigging", "suspension mastery",
  "wax play expertise", "needle play skill", "fire play control", "breath play safety",
  "age play dynamics", "pet play training", "medical play knowledge", "food play creativity",
  "water play expertise", "dirt play indulgence", "role reversal", "power shifting",
  
  // Endurance Abilities
  "marathon sessions", "all-night stamina", "quick recovery", "multiple rounds",
  "extended foreplay", "delayed gratification", "orgasm denial", "edging mastery",
  "tantric longevity", "breathwork control", "meditation focus", "mind over matter",
  "physical conditioning", "cardiovascular fitness", "muscle endurance", "flexibility training",
  
  // Sensory Abilities
  "blindfolded navigation", "silk sensation", "feather touch", "ice and fire play",
  "scent arousal", "taste exploration", "sound seduction", "visual stimulation",
  "temperature extremes", "texture variety", "pressure points", "erogenous zones",
  "sensory mapping", "pleasure pathways", "arousal triggers", "response calibration",
  
  // Communication Abilities
  "verbal seduction", "body language reading", "emotional intelligence", "active listening",
  "feedback giving", "desire articulation", "boundary communication", "consent negotiation",
  "aftercare discussion", "scene debriefing", "relationship building", "trust development",
  "vulnerability sharing", "intimacy deepening", "connection fostering", "understanding cultivation",
  
  // Healing Abilities
  "emotional healing", "physical recovery", "trauma processing", "wound care",
  "scar tissue massage", "rehabilitation guidance", "therapeutic touch", "energy healing",
  "chakra balancing", "aura cleansing", "spiritual alignment", "holistic wellness",
  "mind-body connection", "stress reduction", "relaxation techniques", "meditation guidance",
  
  // Creative Abilities
  "erotic writing", "sensual photography", "intimate videography", "pleasure mapping",
  "fantasy creation", "roleplay development", "scene design", "toy invention",
  "costume creation", "environment setup", "mood setting", "atmosphere creation",
  "storytelling", "character development", "plot weaving", "climax building",
  
  // Exploration Abilities
  "curiosity cultivation", "adventure seeking", "boundary pushing", "limit testing",
  "new experience embracing", "learning agility", "adaptation skills", "resilience building",
  "growth mindset", "open-mindedness", "non-judgment", "acceptance practice",
  "exploration encouragement", "discovery facilitation", "learning sharing", "knowledge expansion",
  
  // Connection Abilities
  "deep bonding", "intimacy building", "trust establishment", "vulnerability embracing",
  "emotional availability", "presence cultivation", "mindfulness practice", "authentic connection",
  "soul recognition", "heart opening", "energy merging", "spiritual union",
  "cosmic connection", "universal love", "divine union", "eternal bonding",
  
  "Custom"
];

const NSFW_BODY_DESCRIPTIONS = [
  "",  // Allow empty
  // General Body Types
  "athletic and toned physique", "curvaceous and voluptuous figure", "slender and elegant build",
  "muscular and powerful body", "soft and feminine curves", "petite and delicate frame",
  "tall and statuesque form", "full-figured and alluring", "fit and sculpted body",
  "hourglass figure", "pear-shaped body", "apple-shaped body", "rectangle body type",
  "inverted triangle", "diamond body shape", "ruler body type", "spoon body shape",
  
  // Specific Features
  "perky breasts", "full breasts", "toned abs", "wide hips", "narrow waist",
  "long legs", "thick thighs", "firm buttocks", "smooth skin", "tanned complexion",
  "pale skin", "olive skin tone", "freckled skin", "scarred but beautiful",
  "pert nipples", "large areolas", "small areolas", "dark nipples", "pale nipples",
  "pierced nipples", "tattooed breasts", "asymmetrical breasts", "perfect breasts",
  
  // Detailed Anatomy
  "pert nipples", "sensitive erogenous zones", "smooth shaved areas", "natural body hair",
  "tattooed skin", "pierced body parts", "birthmarked skin", "veined and defined muscles",
  "soft and yielding flesh", "firm and resilient body", "warm and inviting skin",
  "cool to the touch", "warm-blooded", "sensitive skin", "tough skin", "delicate skin",
  "stretch-marked belly", " cesarean scar", "episiotomy scar", "tribal scars",
  
  // Ethnic/Cultural Features
  "exotic and mysterious features", "classic beauty standards", "unique physical traits",
  "traditional body modifications", "natural body diversity", "cultural beauty marks",
  "African features", "Asian features", "European features", "Latin features",
  "Middle Eastern features", "Native American features", "Pacific Islander features",
  "Mediterranean complexion", "Nordic features", "Slavic features", "Celtic heritage",
  
  // Body Hair
  "completely shaved", "landing strip", "Brazilian wax", "bikini line", "Hollywood wax",
  "French wax", "maintenance-free", "natural bush", "trimmed neatly", "designer style",
  "happy trail", "treasure trail", "furry belly", "smooth as silk", "stubbly",
  "lasered smooth", "depilatory cream", "threaded", "sugared", "waxed regularly",
  
  // Skin Texture & Condition
  "flawless skin", "porcelain complexion", "ebony skin", "caramel skin", "golden tan",
  "alabaster pale", "olive tone", "copper skin", "bronze glow", "sun-kissed",
  "wind-burned", "weather-beaten", "sheltered soft", "outdoor rugged", "indoor delicate",
  "oily skin", "dry skin", "combination skin", "sensitive skin", "acne-prone",
  "rosacea cheeks", "eczema patches", "psoriasis scales", "vitiligo patterns",
  
  // Scars & Markings
  "surgical scars", "accident scars", "childhood scars", "battle scars",
  "self-harm scars", "tribal scars", "ritual scars", "beauty marks",
  "freckle constellations", "mole patterns", "birthmarks", "port wine stains",
  "cafe au lait spots", "Mongolian spots", "hemangiomas", "nevus of Ota",
  "scar tissue", "keloid scars", "hypertrophic scars", "atrophic scars",
  
  // Piercings & Modifications
  "navel piercing", "nipple piercings", "genital piercings", "septum piercing",
  "nose piercing", "lip piercing", "tongue piercing", "ear gauges",
  "dermal piercings", "surface piercings", "microdermals", "industrial piercing",
  "bridge piercing", "daith piercing", "tragus piercing", "conch piercing",
  "rooks piercing", "snug piercing", "vertical labret", "horizontal labret",
  
  // Tattoos
  "full sleeve tattoos", "half sleeve", "quarter sleeve", "full back piece",
  "lower back tattoo", "shoulder tattoo", "chest tattoo", "ribcage tattoo",
  "thigh tattoo", "calf tattoo", "foot tattoo", "hand tattoo", "finger tattoos",
  "neck tattoo", "face tattoo", "scalp tattoo", "traditional style", "new school",
  "realism", "watercolor", "blackwork", "Japanese style", "tribal", "geometric",
  "script", "portrait", "animal", "flower", "skull", "religious", "memorial",
  
  // Musculature
  "toned biceps", "bulging biceps", "slender arms", "thick arms", "veiny forearms",
  "defined deltoids", "broad shoulders", "narrow shoulders", "muscular back",
  "winged shoulder blades", "prominent spine", "soft back", "hairy back",
  "shaved back", "scarred back", "tattooed back", "straight posture", "slouched",
  "military bearing", "graceful stance", "athletic build", "sedentary softness",
  
  // Legs & Feet
  "long legs", "short legs", "toned calves", "thick calves", "slender ankles",
  "thick ankles", "veiny legs", "smooth legs", "hairy legs", "shaved legs",
  "high arches", "flat feet", "wide feet", "narrow feet", "long toes",
  "short toes", "painted toenails", "bare feet", "calloused soles", "soft soles",
  "bunions", "hammer toes", "plantar fasciitis", "athlete's foot", "smooth heels",
  
  // Hips & Buttocks
  "wide hips", "narrow hips", "childbearing hips", "athletic hips", "soft hips",
  "bony hips", "hip dips", "no hip dips", "love handles", "muffin top",
  "round buttocks", "flat buttocks", "square buttocks", "heart-shaped buttocks",
  "large buttocks", "small buttocks", "toned glutes", "soft glutes",
  "cellulite dimples", "smooth buttocks", "tattooed buttocks", "scarred buttocks",
  "thong tan lines", "visible panty lines", "no tan lines", "stretch marks",
  
  // Waist & Abdomen
  "tiny waist", "thick waist", "defined waist", "soft waist", "hourglass waist",
  "straight waist", "apple shape", "pear shape", "inverted triangle", "rectangle",
  "six-pack abs", "soft belly", "pregnancy stretch marks", "C-section scar",
  "belly button piercing", "navel ring", "outie belly button", "innie belly button",
  "furry belly", "smooth belly", "tattooed abdomen", "scarred abdomen",
  
  // Breasts & Chest
  "large breasts", "small breasts", "medium breasts", "perky breasts",
  "sagging breasts", "enhanced breasts", "natural breasts", "asymmetrical breasts",
  "pale areolas", "dark areolas", "large areolas", "small areolas",
  "pierced nipples", "tattooed breasts", "scarred chest", "smooth chest",
  "muscular chest", "soft chest", "hairy chest", "shaved chest",
  "broad chest", "narrow chest", "barrel chest", "flat chest",
  
  // Genitalia & Intimate Areas
  "trimmed pubic hair", "shaved pubic hair", "natural pubic hair", "landing strip",
  "bikini wax", "Brazilian wax", "Hollywood wax", "French wax", "maintenance free",
  "visible labia", "hidden labia", "asymmetrical labia", "symmetrical labia",
  "dark labia", "pale labia", "pierced labia", "tattooed pubic area",
  "enlarged clitoris", "small clitoris", "prominent clitoris", "hidden clitoris",
  "loose vagina", "tight vagina", "stretched vagina", "virgin vagina",
  "circumcised penis", "uncircumcised penis", "large penis", "small penis",
  "thick penis", "thin penis", "curved penis", "straight penis",
  "veiny penis", "smooth penis", "pierced penis", "tattooed penis",
  "large testicles", "small testicles", "hairy scrotum", "shaved scrotum",
  
  // Neck & Collar
  "long neck", "short neck", "thick neck", "slender neck", "veiny neck",
  "tattooed neck", "scarred neck", "necklace wearing", "choker wearing",
  "collar wearing", "turtleneck", "v-neck", "crew neck", "off shoulder",
  "halter neck", "sweetheart neckline", "square neck", "scoop neck",
  "boat neck", "high neck", "low neck", "plunging neckline",
  
  // Arms & Hands
  "toned biceps", "flabby arms", "muscular shoulders", "slender arms",
  "thick arms", "veiny forearms", "soft upper arms", "defined deltoids",
  "broad shoulders", "narrow shoulders", "shoulder pads", "sleeveless",
  "long sleeves", "short sleeves", "tattooed arms", "scarred arms",
  "braceleted wrists", "watch wearing", "bangle wearing", "naked arms",
  "slender fingers", "thick fingers", "long fingers", "short fingers",
  "arthritis knuckles", "veiny hands", "soft hands", "calloused hands",
  "manicured hands", "unkempt nails", "painted nails", "natural nails",
  
  // Face Integration
  "sharp cheekbones", "full lips", "high forehead", "defined jawline",
  "button nose", "upturned nose", "aquiline nose", "small nose", "large eyes",
  "almond-shaped eyes", "round eyes", "cat-like eyes", "heavy eyelids", "thick eyebrows",
  "thin arched brows", "bushy brows", "pierced brows", "tattooed face", "beauty mark",
  "freckles", "rosy cheeks", "pale complexion", "olive skin", "ebony skin",
  "porcelain skin", "sun-kissed glow", "flawless skin", "scarred face", "tattooed lips",
  
  // Back & Posture
  "straight posture", "slouched", "arched back", "military posture",
  "graceful stance", "awkward posture", "confident stride", "timid walk",
  "back tattoos", "bra strap lines", "thong lines", "tan lines",
  "scarred back", "smooth back", "hairy back", "shaved back",
  "winged shoulder blades", "prominent spine", "muscular back", "soft back",
  
  // Overall Build
  "petite and delicate", "tall and statuesque", "amazonian build", "compact frame",
  "elongated limbs", "powerful physique", "delicate frame", "robust build",
  "lithe form", "stocky build", "athletic conditioning", "sedentary appearance",
  "fit physique", "unfit physique", "toned muscles", "soft muscles",
  "defined muscles", "undefined muscles", "flexible body", "stiff body",
  "graceful movements", "awkward movements", "coordinated", "clumsy",
  
  // Age-Related Features
  "youthful skin", "aged skin", "wrinkled", "smooth", "premature aging",
  "well-preserved", "weathered look", "fresh-faced", "baby-faced",
  "hardened features", "soft features", "sharp features", "delicate features",
  "robust features", "feminine features", "masculine features",
  
  // Health Indicators
  "healthy glow", "unhealthy pallor", "sun-damaged", "wind-burned",
  "weather-beaten", "sheltered complexion", "outdoor lifestyle", "indoor lifestyle",
  "athletic conditioning", "sedentary appearance", "fit physique", "unfit physique",
  "toned muscles", "soft muscles", "defined muscles", "undefined muscles",
  "flexible body", "stiff body", "graceful movements", "awkward movements",
  
  // Unique Features
  "heterochromia", "vitiligo", "albinism", "melanin-rich skin", "pale as moonlight",
  "unique eye color", "asymmetrical features", "distinctive markings", "striking appearance",
  "exotic beauty", "classic beauty", "alternative beauty", "mainstream beauty",
  "androgynous features", "hyper-feminine", "hyper-masculine", "gender-fluid appearance",
  
  // Clothing Integration
  "sheer clothing visible", "tight clothing accentuating", "loose clothing hiding",
  "form-fitting outfits", "baggy clothes", "layered clothing", "minimal clothing",
  "maximal clothing", "revealing outfits", "modest attire", "transparent fabrics",
  "opaque coverings", "wet clothing clinging", "dry clothing", "stained garments",
  "torn clothing", "intact outfits", "designer labels", "thrifted finds",
  
  // Jewelry & Accessories
  "gold jewelry", "silver jewelry", "platinum pieces", "costume jewelry",
  "diamond studs", "hoop earrings", "drop earrings", "chandelier earrings",
  "stud earrings", "nose studs", "nose rings", "septum rings", "lip rings",
  "tongue rings", "eyebrow rings", "nipple rings", "genital rings", "navel rings",
  "wrist bracelets", "ankle bracelets", "toe rings", "finger rings", "thumb rings",
  "necklaces", "chokers", "pendants", "lockets", "chains", "dog tags",
  
  // Footwear Integration
  "barefoot", "sandals", "flip-flops", "thongs", "slides", "crocs",
  "sneakers", "tennis shoes", "running shoes", "basketball shoes", "soccer cleats",
  "boots", "cowboy boots", "combat boots", "knee-high boots", "thigh-high boots",
  "ankle boots", "riding boots", "rain boots", "snow boots", "ski boots",
  "heels", "high heels", "stiletto heels", "wedge heels", "block heels",
  "flats", "loafers", "oxfords", "derbies", "slippers", "moccasins",
  
  // Headwear Integration
  "baseball caps", "beanie hats", "berets", "bowlers", "bucket hats",
  "cowboy hats", "fedora hats", "flat caps", "hard hats", "helmets",
  "hijabs", "hoodies", "newsboy caps", "panama hats", "pirate hats",
  "pork pie hats", "snapback caps", "sombreros", "sun hats", "top hats",
  "trucker hats", "turbans", "visor caps", "wool hats", "yarmulkes",
  
  // Outerwear Integration
  "coats", "jackets", "blazers", "cardigans", "hoodies", "sweaters",
  "vests", "ponchos", "capes", "shawls", "stoles", "boleros",
  "bomber jackets", "denim jackets", "leather jackets", "trench coats",
  "pea coats", "duffel coats", "fur coats", "rain coats", "windbreakers",
  "field jackets", "military jackets", "safari jackets", "tuxedo jackets",
  
  // Undergarments Visible
  "bra straps", "thong lines", "panty lines", "garter straps", "stocking tops",
  "corset lacing", "bustier edges", "chemise hems", "teddy outlines",
  "bodysuit seams", "lingerie straps", "foundation garment lines", "shapewear ridges",
  "control top edges", "open bottom panties", "thong back", "g-string sides",
  "boyleg panty lines", "high-cut leg openings", "low-rise waistbands",
  
  // Swimwear Integration
  "bikini tops", "bikini bottoms", "one-piece swimsuits", "tankinis",
  "burkinis", "board shorts", "speedos", "trunks", "swim trunks",
  "rash guards", "surf shirts", "wet suits", "dry suits", "life jackets",
  "swim caps", "goggles", "flippers", "snorkels", "dive masks",
  
  // Athletic Wear Integration
  "sports bras", "compression shirts", "running shorts", "yoga pants",
  "leggings", "spandex shorts", "bike shorts", "compression leggings",
  "sweatpants", "track pants", "joggers", "athletic shorts", "basketball shorts",
  "football jerseys", "baseball uniforms", "soccer kits", "tennis outfits",
  "golf attire", "ski suits", "snowboard gear", "surf wear", "wakeboard vests",
  
  // Sleepwear Integration
  "nightgowns", "nighties", "babydolls", "chemises", "teddies",
  "negligees", "peignoirs", "robes", "pajamas", "pajama sets",
  "sleep shirts", "boxer shorts", "sleep pants", "loungewear",
  "slippers", "bed socks", "eye masks", "sleep bonnets",
  
  // Costumes & Roleplay Integration
  "nurse uniforms", "police uniforms", "military uniforms", "schoolgirl outfits",
  "cheerleader uniforms", "bunny costumes", "cat costumes", "dog costumes",
  "superhero costumes", "villain costumes", "princess dresses", "fairy costumes",
  "witch costumes", "vampire costumes", "zombie makeup", "alien costumes",
  "robot costumes", "angel costumes", "devil costumes", "pirate costumes",
  
  // Seasonal/Weather Integration
  "winter coats", "summer dresses", "spring outfits", "fall sweaters",
  "rain gear", "snow gear", "beach wear", "pool wear", "casual wear",
  "formal wear", "business wear", "evening wear", "cocktail dresses",
  "black tie attire", "white tie attire", "casual Friday", "smart casual",
  
  // Cultural/Traditional Integration
  "saris", "kimonos", "cheongsams", "dirndls", "kilt outfits",
  "dashikis", "caftans", "tunics", "robes", "burqas", "niqabs",
  "hijabs", "turbans", "fezzes", "sombreros", "sarongs", "lungis",
  "dhotis", "shalwar kameez", "hanboks", "yukatas", "ao dais",
  
  // Fantasy/Sci-Fi Integration
  "elven robes", "dwarven armor", "orcish hides", "magical robes",
  "space suits", "alien skin", "cybernetic implants", "magical tattoos",
  "dragon scales", "fairy wings", "mermaid tails", "werewolf fur",
  "vampire fangs", "witch hats", "wizard staffs", "knight armor",
  "princess gowns", "peasant clothes", "noble attire", "court jester outfits",
  
  // Fetish/BDSM Integration
  "leather outfits", "latex suits", "rubber wear", "vinyl clothing",
  "corsets", "bondage gear", "collar and leash", "handcuffs", "chains",
  "whips", "paddles", "restraints", "blindfolds", "gags", "plugs",
  "harnesses", "straps", "buckles", "zippers", "laces", "buttons",
  
  // Medical/Clinical Integration
  "hospital gowns", "doctor coats", "nurse uniforms", "patient gowns",
  "surgical masks", "gloves", "caps", "shoe covers", "lab coats",
  "scrubs", "stethoscopes", "blood pressure cuffs", "thermometers",
  "bandages", "casts", "slings", "crutches", "wheelchairs", "walkers",
  
  // Emergency Services Integration
  "police uniforms", "firefighter gear", "paramedic uniforms", "military fatigues",
  "bulletproof vests", "helmets", "boots", "gloves", "belts", "badges",
  "patches", "insignia", "epaulettes", "chevrons", "stripes", "stars",
  
  // Industrial/Professional Integration
  "hard hats", "safety glasses", "ear protection", "respirators", "gloves",
  "steel-toe boots", "coveralls", "tool belts", "harnesses", "ropes",
  "cables", "chains", "hooks", "pulleys", "levers", "gears", "machines",
  
  // Artistic/Performance Integration
  "tutus", "leotards", "unitards", "tights", "ballet slippers", "tap shoes",
  "jazz shoes", "character shoes", "masks", "face paint", "body paint",
  "feathers", "sequins", "glitter", "rhinestones", "beads", "fringes",
  
  // Religious/Spiritual Integration
  "nun habits", "priest collars", "monk robes", "rabbi hats", "turbans",
  "burqas", "niqabs", "hijabs", "yarmulkes", "crosses", "stars of David",
  "crescents", "om symbols", "mandalas", "prayer beads", "rosaries",
  
  // Historical Periods Integration
  "Victorian dresses", "Renaissance gowns", "medieval tunics", "ancient togas",
  "Egyptian linens", "Roman tunics", "Greek chitons", "Viking furs",
  "colonial coats", "flapper dresses", "hippie beads", "punk spikes",
  "grunge flannels", "preppy polos", "yuppie power suits", "millennial athleisure",
  
  "Custom"
];

const NSFW_SEXUAL_DESCRIPTIONS = [
  "",  // Allow empty
  // Sexual Characteristics
  "highly responsive to touch", "multi-orgasmic capability", "prolonged arousal",
  "intense sexual energy", "passionate and uninhibited", "exploratory and curious",
  "dominant sexual presence", "submissive sexual nature", "versatile sexual preferences",
  
  // Physical Responses
  "moans loudly during pleasure", "whispers dirty talk", "bites lip in ecstasy",
  "arches back in climax", "trembles with orgasm", "gasps for breath", "cries out in pleasure",
  "sweats profusely", "flushes with arousal", "quivers with anticipation",
  
  // Sexual Behaviors
  "takes control in bed", "yields to partner's desires", "explores every inch",
  "uses hands expertly", "moves with rhythm", "adapts to partner's needs",
  "communicates desires clearly", "reads partner's body language", "builds tension slowly",
  
  // Fetish Elements
  "enjoys light bondage", "prefers rough play", "loves sensual massage",
  "explores roleplay fantasies", "uses toys creatively", "enjoys group activities",
  "practices tantric sex", "prefers quick encounters", "savors prolonged sessions",
  
  // Advanced/Supernatural
  "channels sexual energy", "manipulates pleasure fields", "creates pleasure illusions",
  "transcends physical limits", "merges consciousness during sex", "achieves cosmic orgasms",
  "manipulates time during intimacy", "creates pleasure dimensions", "heals through touch",
  
  "Custom"
];

const NSFW_PRESET_PACKS = {
  "— Select NSFW preset pack —": null,
  "Erotic Boudoir (soft lighting)": {
    "genre": "Erotic",
    "shot_scale": "medium close-up",
    "color_palette": "warm tones",
    "time_of_day": "golden hour",
    "lighting": "soft diffused light",
    "atmosphere": "clear air",
    "camera_move": "slow dolly in",
    "markers_on": ["shallow depth of field", "soft bokeh"],
    "ambient": "quiet room tone",
    "music": "soft cinematic pads",
    "sfx": "subtle cloth movement",
  },
  "Adult Film (dramatic lighting)": {
    "genre": "Adult film",
    "shot_scale": "close-up",
    "color_palette": "high contrast",
    "time_of_day": "night",
    "lighting": "dramatic shadows",
    "atmosphere": "clear air",
    "camera_move": "steadicam glide",
    "markers_on": ["film grain", "vignette"],
    "ambient": "quiet room tone",
    "music": "tense low strings",
    "sfx": "none",
  },
  "Fetish Scene (neon + smoke)": {
    "genre": "Fetish",
    "shot_scale": "medium",
    "color_palette": "deep blacks and neon accents",
    "time_of_day": "night",
    "lighting": "neon glow",
    "atmosphere": "smoke haze",
    "camera_move": "orbit around the subject",
    "markers_on": ["vignette", "chromatic aberration (subtle)"],
    "ambient": "city night ambience",
    "music": "dark industrial pulse",
    "sfx": "metallic creaks",
  },
  "BDSM Dungeon (harsh lighting)": {
    "genre": "BDSM",
    "shot_scale": "medium close-up",
    "color_palette": "high contrast",
    "time_of_day": "night",
    "lighting": "harsh top light",
    "atmosphere": "volumetric haze",
    "camera_move": "slow pan left",
    "markers_on": ["vignette", "film grain"],
    "ambient": "warehouse hum",
    "music": "dark industrial pulse",
    "sfx": "metallic creaks",
  },
  "Sensual Massage (candlelight)": {
    "genre": "Erotic",
    "shot_scale": "close-up",
    "color_palette": "warm tones",
    "time_of_day": "night",
    "lighting": "candlelight flicker",
    "atmosphere": "clear air",
    "camera_move": "slow dolly in",
    "markers_on": ["soft bokeh", "halation glow"],
    "ambient": "quiet room tone",
    "music": "minimal piano motif",
    "sfx": "subtle cloth movement",
  },
  "Striptease Performance (stage lights)": {
    "genre": "Striptease",
    "shot_scale": "full body",
    "color_palette": "vibrant",
    "time_of_day": "night",
    "lighting": "rim light / backlighting",
    "atmosphere": "smoke haze",
    "camera_move": "orbit around the subject",
    "markers_on": ["lens flares", "vignette"],
    "ambient": "crowd murmur (soft)",
    "music": "retro synth pulse",
    "sfx": "none",
  },
  "Beach Encounter (natural light)": {
    "genre": "Erotic",
    "shot_scale": "wide",
    "color_palette": "vibrant",
    "time_of_day": "golden hour",
    "lighting": "natural sunlight",
    "atmosphere": "sea spray",
    "camera_move": "gentle pan left",
    "markers_on": ["soft bokeh"],
    "ambient": "ocean waves",
    "music": "bright acoustic guitar shimmer",
    "sfx": "wind gusts (soft)",
  },
  "Office Affair (subtle)": {
    "genre": "Erotic thriller",
    "shot_scale": "medium close-up",
    "color_palette": "cool tones",
    "time_of_day": "late afternoon",
    "lighting": "soft diffused light",
    "atmosphere": "clear air",
    "camera_move": "locked-off static",
    "markers_on": ["shallow depth of field"],
    "ambient": "quiet room tone",
    "music": "ambient drone bed",
    "sfx": "subtle cloth movement",
  },
  "Lingerie Fashion (studio)": {
    "genre": "Lingerie fashion",
    "shot_scale": "medium",
    "color_palette": "pastel",
    "time_of_day": "afternoon",
    "lighting": "studio key light",
    "atmosphere": "clear air",
    "camera_move": "slow dolly in",
    "markers_on": ["soft bokeh", "shallow depth of field"],
    "ambient": "quiet room tone",
    "music": "soft cinematic pads",
    "sfx": "none",
  },
  "Hentai Anime (stylized)": {
    "genre": "Hentai",
    "shot_scale": "close-up",
    "color_palette": "vibrant",
    "time_of_day": "night",
    "lighting": "neon glow",
    "atmosphere": "volumetric haze",
    "camera_move": "fast dolly in",
    "markers_on": ["chromatic aberration (subtle)", "anamorphic flares"],
    "ambient": "city night ambience",
    "music": "retro synth pulse",
    "sfx": "none",
  },
  "Roleplay Fantasy (medieval)": {
    "genre": "Roleplay",
    "shot_scale": "medium wide",
    "color_palette": "warm tones",
    "time_of_day": "golden hour",
    "lighting": "soft diffused light",
    "atmosphere": "smoke haze",
    "camera_move": "gentle pan right",
    "markers_on": ["film grain", "vignette"],
    "ambient": "wind through tall grass",
    "music": "ethereal choir wash",
    "sfx": "distant thunder",
  },
  "Swingers Party (dim lighting)": {
    "genre": "Swingers",
    "shot_scale": "wide",
    "color_palette": "warm tones",
    "time_of_day": "night",
    "lighting": "candlelight flicker",
    "atmosphere": "smoke haze",
    "camera_move": "360-degree pan",
    "markers_on": ["vignette", "halation glow"],
    "ambient": "crowd murmur (soft)",
    "music": "lo-fi chill beat (very subtle)",
    "sfx": "subtle cloth movement",
  },
};

function clamp(v) { return (v || "").trim(); }

function snapshotLockedValues() {
  const map = {};
  LOCKED_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) map[id] = el.value;
  });
  return map;
}

function restoreLockedValues(map) {
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
}

// Helper function to merge default options with custom ones
function getMergedOptions(mode, key) {
  const defaults = mode === 'cinematic' ? CINEMATIC[key] :
                   mode === 'classic' ? CLASSIC[key] :
                   mode === 'nsfw' ? (key === 'genre_style' ? NSFW_GENRES :
                                     key === 'shot_type' ? CINEMATIC.shot_type :
                                     key === 'subject_role' ? NSFW_SUBJECT_PRESETS :
                                     key === 'wardrobe' ? NSFW_CLOTHING_PRESETS :
                                     key === 'pose_action' ? NSFW_ACTION_PRESETS :
                                     key === 'hair_face_detail' ? NSFW_LOOK_PRESETS :
                                     key === 'explicit_abilities' ? NSFW_EXPLICIT_ABILITIES :
                                     key === 'body_description' ? NSFW_BODY_DESCRIPTIONS :
                                     key === 'sexual_description' ? NSFW_SEXUAL_DESCRIPTIONS :
                                     CINEMATIC[key]) : [];

  const custom = CUSTOM_OPTIONS[mode]?.[key] || [];
  return [...defaults, ...custom];
}

// Deterministic PRNG (mulberry32)
function makeRng(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function seededChoice(rng, list) {
  if (!list || !list.length) return "";
  const idx = Math.floor(rng() * list.length);
  return list[idx];
}

function randomizeFields(map, lists, rng, scope = 'all', coreKeys = []) {
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (scope === 'core' && coreKeys.length && !coreKeys.includes(key)) return;

    const current = (el.value || "").trim();
    if (scope === 'empties' && current) return;

    const src = lists[key];
    el.value = seededChoice(rng, src);
  });
}

function guardrailsCinematic(data) {
  const weatherLow = data.weather.toLowerCase();
  const lightLow = data.lighting.toLowerCase();
  if ((weatherLow.includes("storm") || weatherLow.includes("night") || weatherLow.includes("blizzard") || weatherLow.includes("fog")) && (lightLow.includes("sun") || lightLow.includes("bright"))) {
    data.lighting = "overcast flat light";
  }
  if (data.shot_type.toLowerCase().includes("extreme close-up") && data.environment.toLowerCase().includes("landscape")) {
    data.environment = "tight setting";
  }
  const pullReveal = data.camera_move.toLowerCase().includes("pull") && data.camera_move.toLowerCase().includes("reveal");
  if (pullReveal && data.environment && !data.environment.toLowerCase().includes("vast")) {
    data.environment = `vast ${data.environment}`;
  }
  return data;
}

function buildCinematicParagraph(data) {
  const template = APP_SETTINGS.promptTemplate || 'standard';
  const clean = guardrailsCinematic({ ...data });

  if (template === 'short') {
    return (
      `${clean.genre_style}; ${clean.shot_type} on ${clean.subject_role} (${clean.subject_traits}); ` +
      `${clean.environment}, ${clean.weather}; ${clean.camera_move}; ${clean.mood || 'steady mood'}.`
    ).replace(/\s+/g, " ").trim();
  }

  const base = (
    `${clean.genre_style} shows a ${clean.shot_type} shot of ${clean.subject_traits} ${clean.subject_role} ${clean.pose_action}, ` +
    `clad in ${clean.wardrobe} and ${clean.prop_action} ${clean.prop_weapon}, ${clean.hair_face_detail}; ${clean.sig1}, ${clean.sig2}.`
  );

  const scene = `The scene is set in ${clean.environment} under ${clean.weather}, casting ${clean.lighting} that ${clean.light_interaction}.`;
  const sound = `Ambient sounds: ${clean.sound}.`;

  let dialogue = "";
  if (clean.dialogue) {
    dialogue = `${clean.pronoun} ${clean.dialogue_verb}: "${clean.dialogue}"`;
  } else {
    dialogue = `${clean.pronoun} holds silence; ${clean.sound} and a hard stare carry the beat.`;
  }

  const mood = clean.mood ? `Mood: ${clean.mood}.` : "";
  const qualityBits = [];
  if (clean.lens) qualityBits.push(`Lens ${clean.lens}`);
  if (clean.color_grade) qualityBits.push(`grade ${clean.color_grade}`);
  if (clean.film_details) qualityBits.push(`film feel ${clean.film_details}`);
  const quality = qualityBits.length ? `${qualityBits.join("; ")}.` : "";

  const camera = `The camera ${clean.camera_move} on ${clean.focus_target}.`;

  // Add NSFW-specific elements
  const nsfwElements = [];
  if (clean.explicit_abilities && clean.explicit_abilities.trim()) {
    nsfwElements.push(`with ${clean.explicit_abilities}`);
  }
  if (clean.body_description && clean.body_description.trim()) {
    nsfwElements.push(`featuring ${clean.body_description}`);
  }
  if (clean.sexual_description && clean.sexual_description.trim()) {
    nsfwElements.push(clean.sexual_description);
  }
  const nsfwText = nsfwElements.length ? ` ${nsfwElements.join(", ")}.` : "";

  const core = [base, scene, sound, dialogue, quality, mood, camera, nsfwText]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (template === 'detailed') {
    return `${core} Notes: texture-rich, grounded physics, micro-expressions, natural falloff lighting.`;
  }
  return core;
}

function buildClassicParagraph(data) {
  const template = APP_SETTINGS.promptTemplate || 'standard';
  if (template === 'short') {
    return [`${data.genre} / ${data.shot}`, data.subject || data.wardrobe, data.environment || '', data.camera]
      .filter(Boolean)
      .join(" | ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const bits = [];
  bits.push(`A ${data.shot} shot in a ${data.genre} tone`);
  if (data.subject) bits.push(`featuring ${data.subject}`);
  if (data.wardrobe) bits.push(`in ${data.wardrobe}`);
  bits.push(`set in ${data.environment || "the scene"} at ${data.time} with ${data.lighting}`);
  if (data.atmosphere && data.atmosphere !== "clear air") bits.push(`amid ${data.atmosphere}`);
  bits.push(`camera ${data.camera}`);
  if (data.palette) bits.push(`palette ${data.palette}`);
  if (data.action) bits.push(`action: ${data.action}`);
  if (data.audio) bits.push(`ambient: ${data.audio}`);
  if (data.dialogue) bits.push(`Dialogue: "${data.dialogue}"`);
  if (data.avoid) bits.push(`Avoid: ${data.avoid}`);
  const base = bits.join(". ").replace(/\s+/g, " ").trim() + ".";
  if (template === 'detailed') {
    return `${base} Style: grounded, texture-forward, cinematic contrast, subtle vignetting.`;
  }
  return base;
}

function fillSelect(id, options) {
  const el = document.getElementById(id);
  if (!el) return;

  const previous = (el.value || "").trim();

  // Prepend favorites if any
  const favs = FIELD_FAVORITES[id] || [];
  const merged = favs.length ? [...new Set([...favs, ...options])] : options;

  // Support both legacy selects and new input+datalist combo
  if (el.tagName === 'SELECT') {
    el.innerHTML = "";
    merged.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt || "(none)";
      el.appendChild(o);
    });
    if (previous) {
      el.value = previous;
    } else if (options.length) {
      el.value = options[0];
    }
    return;
  }

  const listId = el.getAttribute('list') || `${id}-list`;
  el.setAttribute('list', listId);

  let datalist = document.getElementById(listId);
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = listId;
    el.parentNode.appendChild(datalist);
  }

  datalist.innerHTML = "";
  merged.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    datalist.appendChild(o);
  });

  if (previous) {
    el.value = previous;
  } else if (options.length) {
    el.value = options[0];
  }
}

function persistTypedOption(fieldId, value) {
  const meta = FIELD_OPTION_MAP[fieldId];
  if (!meta) return;

  const val = clamp(value);
  if (!val) return;

  // Also record as favorite for quick surfacing
  if (!FIELD_FAVORITES[fieldId]) FIELD_FAVORITES[fieldId] = [];
  if (!FIELD_FAVORITES[fieldId].some(v => v.toLowerCase() === val.toLowerCase())) {
    FIELD_FAVORITES[fieldId].unshift(val);
    FIELD_FAVORITES[fieldId] = FIELD_FAVORITES[fieldId].slice(0, 8);
    saveFavorites();
  }

  const existing = getMergedOptions(meta.mode, meta.key).map(v => v.toLowerCase());
  if (existing.includes(val.toLowerCase())) return;

  if (!CUSTOM_OPTIONS[meta.mode]) CUSTOM_OPTIONS[meta.mode] = {};
  if (!Array.isArray(CUSTOM_OPTIONS[meta.mode][meta.key])) CUSTOM_OPTIONS[meta.mode][meta.key] = [];

  CUSTOM_OPTIONS[meta.mode][meta.key].push(val);
  CUSTOM_OPTIONS = normalizeCustomOptions(CUSTOM_OPTIONS);
  saveCustomOptions();

  // Refresh suggestions with the new entry included
  fillSelect(fieldId, getMergedOptions(meta.mode, meta.key));
}

function mapKeyToFieldId(mode, key) {
  const entry = Object.entries(FIELD_OPTION_MAP).find(([, meta]) => meta.mode === mode && meta.key === key);
  return entry ? entry[0] : null;
}

function setupOptions() {
  // Cinematic
  fillSelect("cin-genre", getMergedOptions('cinematic', 'genre_style'));
  fillSelect("cin-shot", getMergedOptions('cinematic', 'shot_type'));
  fillSelect("cin-traits", getMergedOptions('cinematic', 'subject_traits'));
  fillSelect("cin-role", getMergedOptions('cinematic', 'subject_role'));
  fillSelect("cin-pose", getMergedOptions('cinematic', 'pose_action'));
  fillSelect("cin-wardrobe", getMergedOptions('cinematic', 'wardrobe'));
  fillSelect("cin-prop-action", getMergedOptions('cinematic', 'prop_action'));
  fillSelect("cin-prop", getMergedOptions('cinematic', 'prop_weapon'));
  fillSelect("cin-hair", getMergedOptions('cinematic', 'hair_face_detail'));
  fillSelect("cin-environment", getMergedOptions('cinematic', 'environment'));
  fillSelect("cin-weather", getMergedOptions('cinematic', 'weather'));
  fillSelect("cin-lighting", getMergedOptions('cinematic', 'lighting'));
  fillSelect("cin-light-interaction", getMergedOptions('cinematic', 'light_interaction'));
  fillSelect("cin-sound", getMergedOptions('cinematic', 'sound'));
  fillSelect("cin-dialogue-verb", getMergedOptions('cinematic', 'dialogue_verb'));
  fillSelect("cin-pronoun", getMergedOptions('cinematic', 'pronoun'));
  fillSelect("cin-camera", getMergedOptions('cinematic', 'camera_move'));
  fillSelect("cin-focus", getMergedOptions('cinematic', 'focus_target'));
  fillSelect("cin-mood", getMergedOptions('cinematic', 'mood'));
  fillSelect("cin-lens", getMergedOptions('cinematic', 'lens'));
  fillSelect("cin-grade", getMergedOptions('cinematic', 'color_grade'));
  fillSelect("cin-film", getMergedOptions('cinematic', 'film_details'));

  // Classic
  fillSelect("cl-genre", getMergedOptions('classic', 'genre'));
  fillSelect("cl-shot", getMergedOptions('classic', 'shot'));
  fillSelect("cl-camera", getMergedOptions('classic', 'camera'));
  fillSelect("cl-time", getMergedOptions('classic', 'time'));
  fillSelect("cl-lighting", getMergedOptions('classic', 'lighting'));
  fillSelect("cl-atmosphere", getMergedOptions('classic', 'atmosphere'));
  fillSelect("cl-palette", getMergedOptions('classic', 'palette'));
  fillSelect("cl-audio", getMergedOptions('classic', 'audio'));

  // NSFW panel (NSFW-only options)
  fillSelect("nsfw-genre", getMergedOptions('nsfw', 'genre_style'));
  fillSelect("nsfw-shot", getMergedOptions('nsfw', 'shot_type'));
  fillSelect("nsfw-role", getMergedOptions('nsfw', 'subject_role'));
  fillSelect("nsfw-wardrobe", getMergedOptions('nsfw', 'wardrobe'));
  fillSelect("nsfw-pose", getMergedOptions('nsfw', 'pose_action'));
  fillSelect("nsfw-hair", getMergedOptions('nsfw', 'hair_face_detail'));
  fillSelect("nsfw-environment", getMergedOptions('nsfw', 'environment'));
  fillSelect("nsfw-weather", getMergedOptions('nsfw', 'weather'));
  fillSelect("nsfw-lighting", getMergedOptions('nsfw', 'lighting'));
  fillSelect("nsfw-sound", getMergedOptions('nsfw', 'sound'));
  fillSelect("nsfw-camera", getMergedOptions('nsfw', 'camera_move'));
  fillSelect("nsfw-mood", getMergedOptions('nsfw', 'mood'));
  fillSelect("nsfw-explicit-abilities", getMergedOptions('nsfw', 'explicit_abilities'));
  fillSelect("nsfw-body-description", getMergedOptions('nsfw', 'body_description'));
  fillSelect("nsfw-sexual-description", getMergedOptions('nsfw', 'sexual_description'));

  // Preset packs
  const presetSelect = document.getElementById("nsfw-preset-pack");
  presetSelect.innerHTML = "";
  Object.keys(NSFW_PRESET_PACKS).forEach(pack => {
    const option = document.createElement("option");
    option.value = pack;
    option.textContent = pack;
    presetSelect.appendChild(option);
  });

  // Apply NSFW if enabled
  updateNSFWOptions();
}
// Settings modal helpers
function openSettingsModal() {
  populateSettingsModal();
  const modal = document.getElementById('settings-modal');
  if (modal) modal.style.display = 'block';
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) modal.style.display = 'none';
}

function populateSettingsModal() {
  const themeSelect = document.getElementById('settings-theme');
  if (themeSelect) themeSelect.value = APP_SETTINGS.theme || 'github-dark';

  const scopeSelect = document.getElementById('settings-randomize-scope');
  if (scopeSelect) scopeSelect.value = APP_SETTINGS.randomizeScope || 'all';

  const batchInput = document.getElementById('settings-batch-count');
  if (batchInput) batchInput.value = Math.max(1, Math.min(5, APP_SETTINGS.batchCount || 1));

  const compact = document.getElementById('settings-compact-ui');
  if (compact) compact.checked = !!APP_SETTINGS.compactUI;

  const remember = document.getElementById('settings-remember-nsfw');
  if (remember) remember.checked = !!APP_SETTINGS.rememberNSFW;

  const templateModal = document.getElementById('settings-template-modal');
  if (templateModal) templateModal.value = APP_SETTINGS.promptTemplate || 'standard';

  const numberModal = document.getElementById('settings-number-batch-modal');
  if (numberModal) numberModal.checked = !!APP_SETTINGS.numberBatchResults;

  const titleModal = document.getElementById('settings-title-batch-modal');
  if (titleModal) titleModal.checked = !!APP_SETTINGS.addBatchTitles;

  const autoCopyModal = document.getElementById('settings-auto-copy-batch-modal');
  if (autoCopyModal) autoCopyModal.checked = !!APP_SETTINGS.autoCopyBatch;
}

let WIZARD_STEP = 0;
const WIZARD_TOTAL_STEPS = 3;

function setWizardStep(step) {
  WIZARD_STEP = Math.max(0, Math.min(WIZARD_TOTAL_STEPS - 1, step));
  document.querySelectorAll('.wizard-section').forEach((sec, idx) => {
    sec.classList.toggle('hidden', idx !== WIZARD_STEP);
  });
  document.querySelectorAll('.wizard-step').forEach(el => {
    const s = parseInt(el.dataset.step, 10) || 0;
    el.classList.toggle('active', s === WIZARD_STEP);
  });
  const progress = ((WIZARD_STEP + 1) / WIZARD_TOTAL_STEPS) * 100;
  const bar = document.querySelector('.wizard-progress');
  if (bar) bar.style.setProperty('--wizard-progress', `${progress}%`);
  const prev = document.getElementById('wizard-prev');
  if (prev) prev.disabled = WIZARD_STEP === 0;
  const next = document.getElementById('wizard-next');
  if (next) {
    next.disabled = WIZARD_STEP >= WIZARD_TOTAL_STEPS - 1;
    next.textContent = WIZARD_STEP >= WIZARD_TOTAL_STEPS - 1 ? 'Review' : 'Next';
  }
}

function openWizardModal() {
  const modal = document.getElementById('wizard-modal');
  if (!modal) return;
  const active = document.querySelector('.mode-tab.active')?.dataset.mode || 'cinematic';
  const modeSelect = document.getElementById('wizard-mode');
  if (modeSelect) modeSelect.value = active;
  populateWizardFromForms(active);
  setWizardMode(active);
  setWizardStep(0);
  buildWizardPreview();
  modal.style.display = 'block';
}

function closeWizardModal() {
  const modal = document.getElementById('wizard-modal');
  if (modal) modal.style.display = 'none';
}

function setWizardMode(mode) {
  const nsfwNotes = document.getElementById('wiz-nsfw-notes');
  if (nsfwNotes) {
    nsfwNotes.placeholder = mode === 'nsfw'
      ? 'body / sexual notes (NSFW modes)'
      : 'Optional; only used when in NSFW mode';
  }
}

function defaultFromOptions(mode, key, fallback = '') {
  const opts = getMergedOptions(mode, key);
  return opts && opts.length ? opts[0] : fallback;
}

function splitCommaList(str, limit = 2) {
  const parts = clamp(str).split(',').map(s => s.trim()).filter(Boolean);
  return typeof limit === 'number' ? parts.slice(0, limit) : parts;
}

function parseLensGrade(input) {
  const [lens, grade] = splitCommaList(input || '', 2);
  return { lens: lens || '', color_grade: grade || '' };
}

function parseDialogueMeta(input, mode = 'cinematic') {
  const parts = input.split(/[\/|–-]/).map(s => clamp(s)).filter(Boolean);
  const pronoun = parts[0] || defaultFromOptions('cinematic', 'pronoun');
  const dialogue_verb = parts[1] || defaultFromOptions(mode === 'classic' ? 'cinematic' : mode, 'dialogue_verb');
  return { pronoun, dialogue_verb };
}

function readWizardInputs() {
  return {
    genre: clamp(document.getElementById('wiz-core-genre').value),
    subject: clamp(document.getElementById('wiz-core-subject').value),
    role: clamp(document.getElementById('wiz-core-role').value),
    traits: clamp(document.getElementById('wiz-core-traits').value),
    action: clamp(document.getElementById('wiz-core-action').value),
    wardrobe: clamp(document.getElementById('wiz-core-wardrobe').value),
    environment: clamp(document.getElementById('wiz-style-environment').value),
    weather: clamp(document.getElementById('wiz-style-weather').value),
    lighting: clamp(document.getElementById('wiz-style-lighting').value),
    mood: clamp(document.getElementById('wiz-style-mood').value),
    camera: clamp(document.getElementById('wiz-style-camera').value),
    audio: clamp(document.getElementById('wiz-style-audio').value),
    grade: clamp(document.getElementById('wiz-style-grade').value),
    signature: clamp(document.getElementById('wiz-style-signature').value),
    dialogue: clamp(document.getElementById('wiz-dialogue').value),
    dialogueMeta: clamp(document.getElementById('wiz-dialogue-meta').value),
    nsfwNotes: clamp(document.getElementById('wiz-nsfw-notes').value),
    avoid: clamp(document.getElementById('wiz-avoid').value),
  };
}

function mapWizardToMode(mode, raw) {
  const lensGrade = parseLensGrade(raw.grade);
  const sigs = splitCommaList(raw.signature, 2);
  const { pronoun, dialogue_verb } = parseDialogueMeta(raw.dialogueMeta, mode);
  const subjectRole = raw.subject && raw.role ? `${raw.subject} (${raw.role})` : (raw.subject || raw.role);
  const sigOptions = getMergedOptions('cinematic', 'sig_visuals');
  const sigDefault1 = Array.isArray(sigOptions) && sigOptions.length ? sigOptions[0] : '';
  const sigDefault2 = Array.isArray(sigOptions) && sigOptions.length > 1 ? sigOptions[1] : sigDefault1;

  if (mode === 'classic') {
    return {
      genre: raw.genre || defaultFromOptions('classic', 'genre'),
      shot: defaultFromOptions('classic', 'shot'),
      time: defaultFromOptions('classic', 'time'),
      lighting: raw.lighting || defaultFromOptions('classic', 'lighting'),
      subject: subjectRole || defaultFromOptions('cinematic', 'subject_role'),
      environment: raw.environment || defaultFromOptions('cinematic', 'environment'),
      atmosphere: defaultFromOptions('classic', 'atmosphere'),
      palette: lensGrade.color_grade || defaultFromOptions('classic', 'palette'),
      wardrobe: raw.wardrobe,
      action: raw.action,
      camera: raw.camera || defaultFromOptions('classic', 'camera'),
      audio: raw.audio || defaultFromOptions('classic', 'audio'),
      dialogue: raw.dialogue,
      avoid: raw.avoid,
    };
  }

  if (mode === 'nsfw') {
    return {
      genre_style: raw.genre || defaultFromOptions('nsfw', 'genre_style'),
      shot_type: defaultFromOptions('nsfw', 'shot_type'),
      subject_role: subjectRole || defaultFromOptions('nsfw', 'subject_role'),
      environment: raw.environment || defaultFromOptions('nsfw', 'environment'),
      weather: raw.weather || defaultFromOptions('nsfw', 'weather'),
      lighting: raw.lighting || defaultFromOptions('nsfw', 'lighting'),
      mood: raw.mood || defaultFromOptions('nsfw', 'mood'),
      camera_move: raw.camera || defaultFromOptions('nsfw', 'camera_move'),
      dialogue: raw.dialogue,
      wardrobe: raw.wardrobe || defaultFromOptions('nsfw', 'wardrobe'),
      pose_action: raw.action || defaultFromOptions('nsfw', 'pose_action'),
      hair_face_detail: defaultFromOptions('nsfw', 'hair_face_detail'),
      sound: raw.audio || defaultFromOptions('nsfw', 'sound'),
      explicit_abilities: defaultFromOptions('nsfw', 'explicit_abilities'),
      body_description: defaultFromOptions('nsfw', 'body_description'),
      sexual_description: raw.nsfwNotes || defaultFromOptions('nsfw', 'sexual_description'),
      dialogue_verb,
      pronoun,
      focus_target: defaultFromOptions('cinematic', 'focus_target'),
      light_interaction: defaultFromOptions('cinematic', 'light_interaction'),
      lens: lensGrade.lens || defaultFromOptions('cinematic', 'lens'),
      color_grade: lensGrade.color_grade || defaultFromOptions('cinematic', 'color_grade'),
      film_details: defaultFromOptions('cinematic', 'film_details'),
      sig1: sigs[0] || sigDefault1,
      sig2: sigs[1] || sigDefault2,
      subject_traits: raw.traits || defaultFromOptions('cinematic', 'subject_traits'),
      prop_action: defaultFromOptions('cinematic', 'prop_action'),
      prop_weapon: defaultFromOptions('cinematic', 'prop_weapon'),
    };
  }

  return {
    genre_style: raw.genre || defaultFromOptions('cinematic', 'genre_style'),
    shot_type: defaultFromOptions('cinematic', 'shot_type'),
    subject_role: subjectRole || defaultFromOptions('cinematic', 'subject_role'),
    subject_traits: raw.traits || defaultFromOptions('cinematic', 'subject_traits'),
    pose_action: raw.action || defaultFromOptions('cinematic', 'pose_action'),
    wardrobe: raw.wardrobe || defaultFromOptions('cinematic', 'wardrobe'),
    prop_action: defaultFromOptions('cinematic', 'prop_action'),
    prop_weapon: defaultFromOptions('cinematic', 'prop_weapon'),
    hair_face_detail: defaultFromOptions('cinematic', 'hair_face_detail'),
    environment: raw.environment || defaultFromOptions('cinematic', 'environment'),
    weather: raw.weather || defaultFromOptions('cinematic', 'weather'),
    lighting: raw.lighting || defaultFromOptions('cinematic', 'lighting'),
    light_interaction: defaultFromOptions('cinematic', 'light_interaction'),
    sound: raw.audio || defaultFromOptions('cinematic', 'sound'),
    dialogue: raw.dialogue,
    dialogue_verb,
    pronoun,
    focus_target: defaultFromOptions('cinematic', 'focus_target'),
    mood: raw.mood || defaultFromOptions('cinematic', 'mood'),
    camera_move: raw.camera || defaultFromOptions('cinematic', 'camera_move'),
    lens: lensGrade.lens || defaultFromOptions('cinematic', 'lens'),
    color_grade: lensGrade.color_grade || defaultFromOptions('cinematic', 'color_grade'),
    film_details: defaultFromOptions('cinematic', 'film_details'),
    sig1: sigs[0] || sigDefault1,
    sig2: sigs[1] || sigDefault2,
    explicit_abilities: '',
    body_description: '',
    sexual_description: '',
  };
}

function buildWizardPreview() {
  const mode = document.getElementById('wizard-mode')?.value || 'cinematic';
  const raw = readWizardInputs();
  const data = mapWizardToMode(mode, raw);
  const text = mode === 'classic' ? buildClassicParagraph(data) : buildCinematicParagraph(data);
  const out = document.getElementById('wizard-output');
  if (out) out.textContent = text;
  return { mode, data, text };
}

function setWizardInput(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function populateWizardFromForms(mode) {
  if (mode === 'cinematic') {
    const src = readCinematicForm();
    setWizardInput('wiz-core-genre', src.genre_style);
    setWizardInput('wiz-core-subject', src.subject_role);
    setWizardInput('wiz-core-role', src.subject_role);
    setWizardInput('wiz-core-traits', src.subject_traits);
    setWizardInput('wiz-core-action', src.pose_action);
    setWizardInput('wiz-core-wardrobe', src.wardrobe);
    setWizardInput('wiz-style-environment', src.environment);
    setWizardInput('wiz-style-weather', src.weather);
    setWizardInput('wiz-style-lighting', src.lighting);
    setWizardInput('wiz-style-mood', src.mood);
    setWizardInput('wiz-style-camera', src.camera_move);
    setWizardInput('wiz-style-audio', src.sound);
    setWizardInput('wiz-style-grade', [src.lens, src.color_grade].filter(Boolean).join(', '));
    setWizardInput('wiz-style-signature', [src.sig1 || src.light_interaction, src.sig2 || src.hair_face_detail].filter(Boolean).join(', '));
    setWizardInput('wiz-dialogue', src.dialogue);
    setWizardInput('wiz-dialogue-meta', [src.pronoun, src.dialogue_verb].filter(Boolean).join(' / '));
    setWizardInput('wiz-avoid', '');
    setWizardInput('wiz-nsfw-notes', '');
    return;
  }

  if (mode === 'classic') {
    const src = readClassicForm();
    setWizardInput('wiz-core-genre', src.genre);
    setWizardInput('wiz-core-subject', src.subject);
    setWizardInput('wiz-core-role', src.genre);
    setWizardInput('wiz-core-traits', '');
    setWizardInput('wiz-core-action', src.action);
    setWizardInput('wiz-core-wardrobe', src.wardrobe);
    setWizardInput('wiz-style-environment', src.environment);
    setWizardInput('wiz-style-weather', src.atmosphere);
    setWizardInput('wiz-style-lighting', src.lighting);
    setWizardInput('wiz-style-mood', '');
    setWizardInput('wiz-style-camera', src.camera);
    setWizardInput('wiz-style-audio', src.audio);
    setWizardInput('wiz-style-grade', src.palette);
    setWizardInput('wiz-style-signature', '');
    setWizardInput('wiz-dialogue', src.dialogue);
    setWizardInput('wiz-dialogue-meta', '');
    setWizardInput('wiz-avoid', src.avoid);
    setWizardInput('wiz-nsfw-notes', '');
    return;
  }

  const src = readNSFWForm();
  setWizardInput('wiz-core-genre', src.genre_style);
  setWizardInput('wiz-core-subject', src.subject_role);
  setWizardInput('wiz-core-role', src.subject_role);
  setWizardInput('wiz-core-traits', src.hair_face_detail);
  setWizardInput('wiz-core-action', src.pose_action);
  setWizardInput('wiz-core-wardrobe', src.wardrobe);
  setWizardInput('wiz-style-environment', src.environment);
  setWizardInput('wiz-style-weather', src.weather);
  setWizardInput('wiz-style-lighting', src.lighting);
  setWizardInput('wiz-style-mood', src.mood);
  setWizardInput('wiz-style-camera', src.camera_move);
  setWizardInput('wiz-style-audio', src.sound);
  setWizardInput('wiz-style-grade', '');
  setWizardInput('wiz-style-signature', [src.sig1, src.sig2].filter(Boolean).join(', '));
  setWizardInput('wiz-dialogue', src.dialogue);
  setWizardInput('wiz-dialogue-meta', '');
  setWizardInput('wiz-avoid', '');
  setWizardInput('wiz-nsfw-notes', src.sexual_description || src.body_description || src.explicit_abilities);
}

function surpriseWizard() {
  const mode = document.getElementById('wizard-mode')?.value || 'cinematic';
  const rng = makeRng(Date.now());
  const pick = (m, key, fallback = '') => {
    const options = getMergedOptions(m, key);
    return options && options.length ? seededChoice(rng, options) : fallback;
  };

  setWizardInput('wiz-core-genre', mode === 'classic' ? pick('classic', 'genre') : pick(mode, 'genre_style'));
  setWizardInput('wiz-core-subject', pick(mode === 'classic' ? 'cinematic' : mode, 'subject_role', 'subject'));
  setWizardInput('wiz-core-role', pick(mode === 'classic' ? 'cinematic' : mode, 'subject_role'));
  setWizardInput('wiz-core-traits', pick('cinematic', 'subject_traits'));
  setWizardInput('wiz-core-action', pick(mode === 'nsfw' ? 'nsfw' : 'cinematic', 'pose_action'));
  setWizardInput('wiz-core-wardrobe', pick(mode === 'nsfw' ? 'nsfw' : 'cinematic', 'wardrobe'));

  const envSource = mode === 'classic' ? 'cinematic' : mode;
  setWizardInput('wiz-style-environment', pick(envSource, 'environment'));
  setWizardInput('wiz-style-weather', pick(envSource, 'weather'));
  setWizardInput('wiz-style-lighting', pick(envSource, 'lighting'));
  setWizardInput('wiz-style-mood', pick(envSource, 'mood'));
  setWizardInput('wiz-style-camera', pick(envSource === 'classic' ? 'classic' : envSource, envSource === 'classic' ? 'camera' : 'camera_move'));
  setWizardInput('wiz-style-audio', pick(envSource === 'classic' ? 'classic' : envSource, envSource === 'classic' ? 'audio' : 'sound'));
  setWizardInput('wiz-style-grade', [pick('cinematic', 'lens'), pick('cinematic', 'color_grade')].filter(Boolean).join(', '));
  setWizardInput('wiz-style-signature', [pick('cinematic', 'sig_visuals'), pick('cinematic', 'sig_visuals')].filter(Boolean).join(', '));
  setWizardInput('wiz-dialogue', '');
  setWizardInput('wiz-dialogue-meta', [pick('cinematic', 'pronoun'), pick('cinematic', 'dialogue_verb')].join(' / '));
  setWizardInput('wiz-avoid', '');
  setWizardInput('wiz-nsfw-notes', mode === 'nsfw' ? pick('nsfw', 'sexual_description') : '');
  setWizardStep(0);
  buildWizardPreview();
}

function applyWizardToMain(lockFields = true) {
  const { mode, data, text } = buildWizardPreview();
  const map = mode === 'cinematic' ? {
    genre_style: 'cin-genre', shot_type: 'cin-shot', subject_role: 'cin-role', subject_traits: 'cin-traits', pose_action: 'cin-pose', wardrobe: 'cin-wardrobe', prop_action: 'cin-prop-action', prop_weapon: 'cin-prop', hair_face_detail: 'cin-hair', environment: 'cin-environment', weather: 'cin-weather', lighting: 'cin-lighting', light_interaction: 'cin-light-interaction', sound: 'cin-sound', dialogue: 'cin-dialogue', dialogue_verb: 'cin-dialogue-verb', pronoun: 'cin-pronoun', camera_move: 'cin-camera', focus_target: 'cin-focus', mood: 'cin-mood', lens: 'cin-lens', color_grade: 'cin-grade', film_details: 'cin-film', sig1: 'cin-sig1', sig2: 'cin-sig2'
  } : mode === 'classic' ? {
    genre: 'cl-genre', shot: 'cl-shot', time: 'cl-time', lighting: 'cl-lighting', subject: 'cl-subject', environment: 'cl-environment', action: 'cl-action', dialogue: 'cl-dialogue', wardrobe: 'cl-wardrobe', atmosphere: 'cl-atmosphere', palette: 'cl-palette', camera: 'cl-camera', audio: 'cl-audio', avoid: 'cl-avoid'
  } : {
    genre_style: 'nsfw-genre', shot_type: 'nsfw-shot', subject_role: 'nsfw-role', wardrobe: 'nsfw-wardrobe', pose_action: 'nsfw-pose', hair_face_detail: 'nsfw-hair', environment: 'nsfw-environment', weather: 'nsfw-weather', lighting: 'nsfw-lighting', sound: 'nsfw-sound', camera_move: 'nsfw-camera', mood: 'nsfw-mood', explicit_abilities: 'nsfw-explicit-abilities', body_description: 'nsfw-body-description', sexual_description: 'nsfw-sexual-description', dialogue: 'nsfw-dialogue', sig1: 'nsfw-sig1', sig2: 'nsfw-sig2'
  };

  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = data[key] || '';
    if (lockFields) setFieldLocked(id, true);
  });

  if (mode === 'cinematic') renderCinematic();
  else if (mode === 'classic') renderClassic();
  else renderNSFW();

  copyText(text);
  closeWizardModal();
}

function saveSettingsModal() {
  const themeSelect = document.getElementById('settings-theme');
  APP_SETTINGS.theme = themeSelect ? themeSelect.value : 'github-dark';

  const scopeSelect = document.getElementById('settings-randomize-scope');
  APP_SETTINGS.randomizeScope = scopeSelect ? scopeSelect.value : 'all';

  const batchInput = document.getElementById('settings-batch-count');
  APP_SETTINGS.batchCount = batchInput ? Math.max(1, Math.min(5, parseInt(batchInput.value) || 1)) : 1;

  const compact = document.getElementById('settings-compact-ui');
  APP_SETTINGS.compactUI = compact ? compact.checked : true;

  const remember = document.getElementById('settings-remember-nsfw');
  APP_SETTINGS.rememberNSFW = remember ? remember.checked : false;

  const templateModal = document.getElementById('settings-template-modal');
  APP_SETTINGS.promptTemplate = templateModal ? templateModal.value : (APP_SETTINGS.promptTemplate || 'standard');

  const numberModal = document.getElementById('settings-number-batch-modal');
  APP_SETTINGS.numberBatchResults = numberModal ? numberModal.checked : APP_SETTINGS.numberBatchResults;

  const titleModal = document.getElementById('settings-title-batch-modal');
  APP_SETTINGS.addBatchTitles = titleModal ? titleModal.checked : APP_SETTINGS.addBatchTitles;

  const autoCopyModal = document.getElementById('settings-auto-copy-batch-modal');
  APP_SETTINGS.autoCopyBatch = autoCopyModal ? autoCopyModal.checked : APP_SETTINGS.autoCopyBatch;

  saveAppSettings();
  applyAppSettings();
  closeSettingsModal();
}

function updateNSFWOptions() {
  const nsfwEnabled = document.getElementById("nsfw-mode").checked;

  // Update cinematic genre
  const baseGenres = [...CINEMATIC.genre_style];
  if (nsfwEnabled) {
    baseGenres.push(...NSFW_GENRES);
  }
  fillSelect("cin-genre", baseGenres);

  // Update cinematic subject role
  const baseRoles = [...CINEMATIC.subject_role];
  if (nsfwEnabled) {
    baseRoles.push(...NSFW_SUBJECT_PRESETS);
  }
  fillSelect("cin-role", baseRoles);

  // Update cinematic wardrobe
  const baseWardrobe = [...CINEMATIC.wardrobe];
  if (nsfwEnabled) {
    baseWardrobe.push(...NSFW_CLOTHING_PRESETS);
  }
  fillSelect("cin-wardrobe", baseWardrobe);

  // Update cinematic pose/action
  const basePoses = [...CINEMATIC.pose_action];
  if (nsfwEnabled) {
    basePoses.push(...NSFW_ACTION_PRESETS);
  }
  fillSelect("cin-pose", basePoses);

  // Update cinematic hair/face detail
  const cinHairSelect = document.getElementById("cin-hair");
  const baseHair = [...CINEMATIC.hair_face_detail];
  if (nsfwEnabled) {
    baseHair.push(...NSFW_LOOK_PRESETS);
  }
  fillSelect("cin-hair", baseHair);

  // Update classic genre
  const clGenreSelect = document.getElementById("cl-genre");
  const baseClGenres = [...CLASSIC.genre];
  if (nsfwEnabled) {
    baseClGenres.push(...NSFW_GENRES);
  }
  fillSelect("cl-genre", baseClGenres);
}

function readCinematicForm() {
  return {
    genre_style: clamp(document.getElementById("cin-genre").value),
    shot_type: clamp(document.getElementById("cin-shot").value),
    subject_traits: clamp(document.getElementById("cin-traits").value),
    subject_role: clamp(document.getElementById("cin-role").value),
    pose_action: clamp(document.getElementById("cin-pose").value),
    wardrobe: clamp(document.getElementById("cin-wardrobe").value),
    prop_action: clamp(document.getElementById("cin-prop-action").value),
    prop_weapon: clamp(document.getElementById("cin-prop").value),
    hair_face_detail: clamp(document.getElementById("cin-hair").value),
    environment: clamp(document.getElementById("cin-environment").value),
    weather: clamp(document.getElementById("cin-weather").value),
    lighting: clamp(document.getElementById("cin-lighting").value),
    light_interaction: clamp(document.getElementById("cin-light-interaction").value),
    sound: clamp(document.getElementById("cin-sound").value),
    dialogue: clamp(document.getElementById("cin-dialogue").value),
    dialogue_verb: clamp(document.getElementById("cin-dialogue-verb").value),
    pronoun: clamp(document.getElementById("cin-pronoun").value),
    camera_move: clamp(document.getElementById("cin-camera").value),
    focus_target: clamp(document.getElementById("cin-focus").value),
    mood: clamp(document.getElementById("cin-mood").value),
    lens: clamp(document.getElementById("cin-lens").value),
    color_grade: clamp(document.getElementById("cin-grade").value),
    film_details: clamp(document.getElementById("cin-film").value),
    sig1: clamp(document.getElementById("cin-sig1")?.value || ""),
    sig2: clamp(document.getElementById("cin-sig2")?.value || ""),
  };
}

function readClassicForm() {
  return {
    genre: clamp(document.getElementById("cl-genre").value),
    shot: clamp(document.getElementById("cl-shot").value),
    camera: clamp(document.getElementById("cl-camera").value),
    time: clamp(document.getElementById("cl-time").value),
    lighting: clamp(document.getElementById("cl-lighting").value),
    environment: clamp(document.getElementById("cl-environment").value),
    atmosphere: clamp(document.getElementById("cl-atmosphere").value),
    palette: clamp(document.getElementById("cl-palette").value),
    subject: clamp(document.getElementById("cl-subject").value),
    wardrobe: clamp(document.getElementById("cl-wardrobe").value),
    action: clamp(document.getElementById("cl-action").value),
    audio: clamp(document.getElementById("cl-audio").value),
    dialogue: clamp(document.getElementById("cl-dialogue").value),
    avoid: clamp(document.getElementById("cl-avoid").value),
  };
}

function readNSFWForm() {
  return {
    genre_style: clamp(document.getElementById("nsfw-genre").value),
    shot_type: clamp(document.getElementById("nsfw-shot").value),
    subject_role: clamp(document.getElementById("nsfw-role").value),
    wardrobe: clamp(document.getElementById("nsfw-wardrobe").value),
    pose_action: clamp(document.getElementById("nsfw-pose").value),
    hair_face_detail: clamp(document.getElementById("nsfw-hair").value),
    environment: clamp(document.getElementById("nsfw-environment").value),
    weather: clamp(document.getElementById("nsfw-weather").value),
    lighting: clamp(document.getElementById("nsfw-lighting").value),
    sound: clamp(document.getElementById("nsfw-sound").value),
    camera_move: clamp(document.getElementById("nsfw-camera").value),
    mood: clamp(document.getElementById("nsfw-mood").value),
    explicit_abilities: clamp(document.getElementById("nsfw-explicit-abilities").value),
    body_description: clamp(document.getElementById("nsfw-body-description").value),
    sexual_description: clamp(document.getElementById("nsfw-sexual-description").value),
    dialogue: clamp(document.getElementById("nsfw-dialogue").value),
    sig1: clamp(document.getElementById("nsfw-sig1").value),
    sig2: clamp(document.getElementById("nsfw-sig2").value),
  };
}

function saveSnapshot(mode) {
  let payload = null;
  if (mode === 'cinematic') payload = readCinematicForm();
  if (mode === 'classic') payload = readClassicForm();
  if (mode === 'nsfw') payload = readNSFWForm();
  if (!payload) return;
  LAST_MODE_SNAPSHOT[mode] = payload;
  saveSnapshots();
}

function applySnapshot(mode) {
  const snap = LAST_MODE_SNAPSHOT[mode];
  if (!snap) return;
  Object.entries(snap).forEach(([key, val]) => {
    const id = mapKeyToFieldId(mode, key);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  if (mode === 'cinematic') renderCinematic();
  if (mode === 'classic') renderClassic();
  if (mode === 'nsfw') renderNSFW();
}

function validateNSFWInput(text) {
  if (!document.getElementById("nsfw-mode").checked) return true;
  const lowerText = text.toLowerCase();
  return !BLOCKED_NSFW_TERMS.some(term => lowerText.includes(term));
}

function markInputSafety(id, isSafe) {
  const el = document.getElementById(id);
  if (!el) return;
  if (isSafe) {
    el.classList.remove('input-warn');
    el.removeAttribute('title');
  } else {
    el.classList.add('input-warn');
    el.title = 'Blocked term detected; adjust wording';
  }
}

function renderCinematic() {
  const data = readCinematicForm();
  if (!data.sig1) data.sig1 = CINEMATIC.sig_visuals[1];
  if (!data.sig2) data.sig2 = CINEMATIC.sig_visuals[2];
  // Validate NSFW inputs
  const checks = [
    { id: 'cin-role', val: data.subject_role },
    { id: 'cin-wardrobe', val: data.wardrobe },
    { id: 'cin-pose', val: data.pose_action },
    { id: 'cin-hair', val: data.hair_face_detail },
    { id: 'cin-dialogue', val: data.dialogue },
  ];
  for (const c of checks) {
    const safe = !c.val || validateNSFWInput(c.val);
    markInputSafety(c.id, safe);
    if (!safe) {
      document.getElementById("cinematic-output").textContent = "⚠️ Blocked content detected. Please modify your input to comply.";
      return;
    }
  }
  const text = buildCinematicParagraph(data);
  document.getElementById("cinematic-output").textContent = text;
}

function renderClassic() {
  const data = readClassicForm();
  // Validate NSFW inputs if needed
  if (data.subject && !validateNSFWInput(data.subject)) {
    document.getElementById("classic-output").textContent = "⚠️ Blocked content detected. Please modify your input to comply with NSFW guidelines.";
    return;
  }
  const text = buildClassicParagraph(data);
  document.getElementById("classic-output").textContent = text;
}

function renderNSFW() {
  const data = readNSFWForm();
  if (!data.sig1) data.sig1 = CINEMATIC.sig_visuals[1];
  if (!data.sig2) data.sig2 = CINEMATIC.sig_visuals[2];
  // Validate NSFW inputs
  const checks = [
    { id: 'nsfw-role', val: data.subject_role },
    { id: 'nsfw-wardrobe', val: data.wardrobe },
    { id: 'nsfw-pose', val: data.pose_action },
    { id: 'nsfw-hair', val: data.hair_face_detail },
    { id: 'nsfw-dialogue', val: data.dialogue },
  ];
  for (const c of checks) {
    const safe = !c.val || validateNSFWInput(c.val);
    markInputSafety(c.id, safe);
    if (!safe) {
      document.getElementById("nsfw-output").textContent = "⚠️ Blocked content detected. Please modify your input to comply.";
      return;
    }
  }
  const text = buildCinematicParagraph(data);
  document.getElementById("nsfw-output").textContent = text;
}

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  });
}

function attachEvents() {
  const inputs = document.querySelectorAll("#cinematic-panel input, #cinematic-panel select");
  inputs.forEach(el => el.addEventListener("input", renderCinematic));
  const classicInputs = document.querySelectorAll("#classic-panel input, #classic-panel select");
  classicInputs.forEach(el => el.addEventListener("input", renderClassic));
  const nsfwInputs = document.querySelectorAll("#nsfw-panel input, #nsfw-panel select");
  nsfwInputs.forEach(el => el.addEventListener("input", renderNSFW));

  // Capture typed custom options for future sessions
  registerCustomOptionCapture();

  // NSFW toggle
  document.getElementById("nsfw-mode").addEventListener("change", () => {
    APP_SETTINGS.nsfwEnabled = document.getElementById("nsfw-mode").checked;
    saveAppSettings();
    updateNSFWOptions();
    renderCinematic();
    renderClassic();
    renderNSFW();
  });

  // NSFW preset pack
  document.getElementById("nsfw-preset-pack").addEventListener("change", applyNSFWPresetPack);

  document.getElementById("cinematic-copy").onclick = () => copyText(document.getElementById("cinematic-output").textContent);
  document.getElementById("cinematic-copy-top").onclick = () => copyText(document.getElementById("cinematic-output").textContent);
  document.getElementById("classic-copy").onclick = () => copyText(document.getElementById("classic-output").textContent);
  document.getElementById("classic-copy-top").onclick = () => copyText(document.getElementById("classic-output").textContent);
  document.getElementById("nsfw-copy").onclick = () => copyText(document.getElementById("nsfw-output").textContent);
  document.getElementById("nsfw-copy-top").onclick = () => copyText(document.getElementById("nsfw-output").textContent);

  document.getElementById("cinematic-random").onclick = () => randomizeCinematic();
  document.getElementById("classic-random").onclick = () => randomizeClassic();
  document.getElementById("nsfw-random").onclick = () => randomizeNSFW();

  document.getElementById("batch-generate").onclick = () => batchGenerate();
  document.getElementById("export-settings").onclick = () => exportSettings();
  document.getElementById("import-settings").onclick = () => importSettings();
  document.getElementById("export-custom-options").onclick = () => exportCustomOptions();
  document.getElementById("import-custom-options").onclick = () => importCustomOptions();
  document.getElementById("open-settings").onclick = () => openSettingsModal();
  const openWizard = document.getElementById('open-wizard');
  if (openWizard) openWizard.onclick = () => openWizardModal();

  const scopeSelect = document.getElementById("randomize-scope");
  if (scopeSelect) {
    scopeSelect.addEventListener("change", (e) => {
      APP_SETTINGS.randomizeScope = e.target.value;
      saveAppSettings();
    });
  }

  const batchInput = document.getElementById("batch-count");
  if (batchInput) {
    batchInput.addEventListener("change", (e) => {
      const val = Math.max(1, Math.min(5, parseInt(e.target.value) || 1));
      e.target.value = val;
      APP_SETTINGS.batchCount = val;
      saveAppSettings();
    });
  }

  const numBatch = document.getElementById('settings-number-batch');
  if (numBatch) numBatch.addEventListener('change', (e) => {
    APP_SETTINGS.numberBatchResults = e.target.checked;
    saveAppSettings();
  });

  const titleBatch = document.getElementById('settings-title-batch');
  if (titleBatch) titleBatch.addEventListener('change', (e) => {
    APP_SETTINGS.addBatchTitles = e.target.checked;
    saveAppSettings();
  });

  const autoCopy = document.getElementById('settings-auto-copy-batch');
  if (autoCopy) autoCopy.addEventListener('change', (e) => {
    APP_SETTINGS.autoCopyBatch = e.target.checked;
    saveAppSettings();
  });

  const templateSelect = document.getElementById('settings-template');
  if (templateSelect) templateSelect.addEventListener('change', (e) => {
    APP_SETTINGS.promptTemplate = e.target.value;
    saveAppSettings();
    renderCinematic();
    renderClassic();
    renderNSFW();
  });

  // Custom presets
  document.getElementById("custom-mode-select").addEventListener("change", updateSavedPresetsList);
  document.getElementById("save-preset").onclick = saveCurrentPreset;
  document.getElementById("load-preset").onclick = loadSelectedPreset;
  document.getElementById("delete-preset").onclick = deleteSelectedPreset;
  document.getElementById("saved-presets").addEventListener("change", showPresetDetails);
  document.getElementById("global-randomize").onclick = () => {
    const active = document.querySelector(".mode-tab.active").dataset.mode;
    if (active === "cinematic") randomizeCinematic();
    else if (active === "classic") randomizeClassic();
    else if (active === "nsfw") randomizeNSFW();
  };

  document.querySelectorAll(".mode-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".mode-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const mode = tab.dataset.mode;
      document.getElementById("cinematic-panel").classList.toggle("hidden", mode !== "cinematic");
      document.getElementById("classic-panel").classList.toggle("hidden", mode !== "classic");
      document.getElementById("nsfw-panel").classList.toggle("hidden", mode !== "nsfw");
      document.getElementById("custom-panel").classList.toggle("hidden", mode !== "custom");
      // Update options when switching to NSFW mode
      if (mode === "nsfw") {
        updateNSFWOptions();
      }
    });
  });

  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettingsModal();
    });
  }

  const settingsSave = document.getElementById('settings-save');
  if (settingsSave) settingsSave.addEventListener('click', saveSettingsModal);

  const settingsCancel = document.getElementById('settings-cancel');
  if (settingsCancel) settingsCancel.addEventListener('click', closeSettingsModal);

  const wizardModal = document.getElementById('wizard-modal');
  if (wizardModal) {
    wizardModal.addEventListener('click', (e) => {
      if (e.target === wizardModal) closeWizardModal();
    });
  }

  const wizardMode = document.getElementById('wizard-mode');
  if (wizardMode) wizardMode.addEventListener('change', (e) => {
    const mode = e.target.value || 'cinematic';
    setWizardMode(mode);
    populateWizardFromForms(mode);
    setWizardStep(0);
    buildWizardPreview();
  });

  const wizardCopy = document.getElementById('wizard-copy');
  if (wizardCopy) wizardCopy.addEventListener('click', () => {
    const { text } = buildWizardPreview();
    copyText(text);
  });

  const wizardApply = document.getElementById('wizard-apply');
  if (wizardApply) wizardApply.addEventListener('click', () => applyWizardToMain(true));

  const wizardCancel = document.getElementById('wizard-cancel');
  if (wizardCancel) wizardCancel.addEventListener('click', closeWizardModal);

  const wizardPrev = document.getElementById('wizard-prev');
  if (wizardPrev) wizardPrev.addEventListener('click', () => setWizardStep(WIZARD_STEP - 1));

  const wizardNext = document.getElementById('wizard-next');
  if (wizardNext) wizardNext.addEventListener('click', () => setWizardStep(WIZARD_STEP + 1));

  const wizardFill = document.getElementById('wizard-fill-current');
  if (wizardFill) wizardFill.addEventListener('click', () => {
    const activeMode = document.querySelector('.mode-tab.active')?.dataset.mode || 'cinematic';
    const modeSelect = document.getElementById('wizard-mode');
    if (modeSelect) modeSelect.value = activeMode;
    populateWizardFromForms(activeMode);
    setWizardMode(activeMode);
    setWizardStep(0);
    buildWizardPreview();
  });

  const wizardSurprise = document.getElementById('wizard-surprise');
  if (wizardSurprise) wizardSurprise.addEventListener('click', surpriseWizard);

  document.querySelectorAll('.wizard-step').forEach(step => {
    step.addEventListener('click', () => {
      const idx = parseInt(step.dataset.step, 10) || 0;
      setWizardStep(idx);
    });
  });

  document.querySelectorAll('#wizard-modal input').forEach(el => {
    el.addEventListener('input', buildWizardPreview);
  });

  const cinematicSaveSnap = document.getElementById('cinematic-save-snap');
  if (cinematicSaveSnap) cinematicSaveSnap.addEventListener('click', () => saveSnapshot('cinematic'));
  const cinematicApplySnap = document.getElementById('cinematic-apply-snap');
  if (cinematicApplySnap) cinematicApplySnap.addEventListener('click', () => applySnapshot('cinematic'));
  const cinematicLock = document.getElementById('cinematic-lock');
  if (cinematicLock) cinematicLock.addEventListener('click', lockActiveModeFields);

  const classicSaveSnap = document.getElementById('classic-save-snap');
  if (classicSaveSnap) classicSaveSnap.addEventListener('click', () => saveSnapshot('classic'));
  const classicApplySnap = document.getElementById('classic-apply-snap');
  if (classicApplySnap) classicApplySnap.addEventListener('click', () => applySnapshot('classic'));
  const classicLock = document.getElementById('classic-lock');
  if (classicLock) classicLock.addEventListener('click', lockActiveModeFields);

  const nsfwSaveSnap = document.getElementById('nsfw-save-snap');
  if (nsfwSaveSnap) nsfwSaveSnap.addEventListener('click', () => saveSnapshot('nsfw'));
  const nsfwApplySnap = document.getElementById('nsfw-apply-snap');
  if (nsfwApplySnap) nsfwApplySnap.addEventListener('click', () => applySnapshot('nsfw'));
  const nsfwLock = document.getElementById('nsfw-lock');
  if (nsfwLock) nsfwLock.addEventListener('click', lockActiveModeFields);

  const unlockBtn = document.getElementById('unlock-all');
  if (unlockBtn) unlockBtn.addEventListener('click', unlockAllFields);
  const rerollBtn = document.getElementById('reroll-seed');
  if (rerollBtn) rerollBtn.addEventListener('click', rerollLastSeed);

  document.addEventListener('keydown', (e) => {
    const activeMode = document.querySelector('.mode-tab.active')?.dataset.mode;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      if (activeMode === 'cinematic') randomizeCinematic();
      if (activeMode === 'classic') randomizeClassic();
      if (activeMode === 'nsfw') randomizeNSFW();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      if (activeMode === 'cinematic') copyText(document.getElementById('cinematic-output').textContent);
      if (activeMode === 'classic') copyText(document.getElementById('classic-output').textContent);
      if (activeMode === 'nsfw') copyText(document.getElementById('nsfw-output').textContent);
    }
    if ((e.ctrlKey || e.metaKey) && ['1','2','3','4'].includes(e.key)) {
      e.preventDefault();
      const idx = parseInt(e.key, 10) - 1;
      const tabs = Array.from(document.querySelectorAll('.mode-tab'));
      if (tabs[idx]) tabs[idx].click();
    }
    if (e.shiftKey && e.key === 'Enter') {
      const panel = document.querySelector(`#${activeMode}-panel`);
      const empty = panel?.querySelector('input[value=""], input:not([value])');
      if (empty) empty.focus();
    }
  });
}

function registerCustomOptionCapture() {
  Object.keys(FIELD_OPTION_MAP).forEach((fieldId) => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    ['change', 'blur'].forEach(evt => {
      el.addEventListener(evt, () => persistTypedOption(fieldId, el.value));
    });
  });
}

function setFieldLocked(id, locked) {
  const el = document.getElementById(id);
  if (!el) return;
  const chip = el.parentElement?.querySelector('.lock-chip');
  if (locked) {
    LOCKED_FIELDS.add(id);
    el.classList.add('locked-field');
    if (chip) {
      chip.textContent = '🔒';
      chip.setAttribute('aria-pressed', 'true');
      chip.title = 'Locked from randomize';
    }
  } else {
    LOCKED_FIELDS.delete(id);
    el.classList.remove('locked-field');
    if (chip) {
      chip.textContent = '🔓';
      chip.setAttribute('aria-pressed', 'false');
      chip.title = 'Click to lock from randomize';
    }
  }
}

function toggleFieldLock(id) {
  setFieldLocked(id, !LOCKED_FIELDS.has(id));
}

function enhanceLockableFields() {
  const selectors = [
    '#cinematic-panel input:not([type="checkbox"])', '#cinematic-panel select',
    '#classic-panel input:not([type="checkbox"])', '#classic-panel select',
    '#nsfw-panel input:not([type="checkbox"])', '#nsfw-panel select'
  ];
  const targets = document.querySelectorAll(selectors.join(','));
  targets.forEach(el => {
    if (el.dataset.lockWrapped) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'input-lock-row';
    el.dataset.lockWrapped = 'true';

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'lock-chip ghost';
    chip.textContent = '🔓';
    chip.title = 'Click to lock from randomize';
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFieldLock(el.id);
    });

    const parent = el.parentNode;
    parent.replaceChild(wrapper, el);
    wrapper.appendChild(el);
    wrapper.appendChild(chip);
  });
}

function tryOpenDatalist(el) {
  if (!el) return;
  // Prefer native picker if available
  if (typeof el.showPicker === 'function') {
    try { el.showPicker(); return; } catch (e) { /* no-op */ }
  }
  // Fallback: send ArrowDown to surface suggestions on focus/click
  el.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    code: 'ArrowDown',
    keyCode: 40,
    which: 40,
    bubbles: true,
  }));
}

function showAllOptions(el) {
  if (!el) return;
  const existing = el.value;
  if (existing) {
    el.dataset.prevValue = existing;
    el.value = '';
  }
  tryOpenDatalist(el);
  const handleRestore = () => {
    if (el.value === '' && el.dataset.prevValue !== undefined) {
      el.value = el.dataset.prevValue;
    }
    delete el.dataset.prevValue;
  };
  el.addEventListener('blur', handleRestore, { once: true });
}

function registerDatalistOpeners() {
  Object.keys(FIELD_OPTION_MAP).forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    ['focus', 'click'].forEach(evt => {
      el.addEventListener(evt, () => showAllOptions(el));
    });
  });
}

function lockActiveModeFields() {
  const active = document.querySelector('.mode-tab.active')?.dataset.mode;
  if (!active) return;
  const panel = document.getElementById(`${active}-panel`);
  if (!panel) return;
  panel.querySelectorAll('input, select').forEach(el => {
    if (clamp(el.value)) setFieldLocked(el.id, true);
  });
}

function unlockAllFields() {
  Array.from(LOCKED_FIELDS).forEach(id => setFieldLocked(id, false));
}

function rerollLastSeed() {
  if (LAST_SEED === null) return;
  document.getElementById('global-seed').value = LAST_SEED;
  const active = document.querySelector('.mode-tab.active')?.dataset.mode;
  if (active === 'cinematic') randomizeCinematic();
  if (active === 'classic') randomizeClassic();
  if (active === 'nsfw') randomizeNSFW();
}

function getSeed() {
  const seedStr = clamp(document.getElementById("global-seed").value);
  const seed = seedStr ? parseInt(seedStr, 10) : Math.floor(Math.random() * 2 ** 31);
  return isNaN(seed) ? Math.floor(Math.random() * 2 ** 31) : seed;
}

function getRandomizeScope() {
  const el = document.getElementById("randomize-scope");
  if (!el) return APP_SETTINGS.randomizeScope || 'all';
  const val = (el.value || APP_SETTINGS.randomizeScope || 'all').trim();
  return val === 'core' || val === 'empties' ? val : 'all';
}

function randomizeCinematic() {
  const locked = snapshotLockedValues();
  const seed = getSeed();
  LAST_SEED = seed;
  const rng = makeRng(seed);
  const scope = getRandomizeScope();
  const coreKeys = ['genre_style', 'shot_type', 'subject_traits', 'subject_role', 'pose_action', 'wardrobe', 'environment', 'lighting', 'mood', 'camera_move'];
  const lists = {
    genre_style: getMergedOptions('cinematic', 'genre_style'),
    shot_type: getMergedOptions('cinematic', 'shot_type'),
    subject_traits: getMergedOptions('cinematic', 'subject_traits'),
    subject_role: getMergedOptions('cinematic', 'subject_role'),
    pose_action: getMergedOptions('cinematic', 'pose_action'),
    wardrobe: getMergedOptions('cinematic', 'wardrobe'),
    prop_action: getMergedOptions('cinematic', 'prop_action'),
    prop_weapon: getMergedOptions('cinematic', 'prop_weapon'),
    hair_face_detail: getMergedOptions('cinematic', 'hair_face_detail'),
    environment: getMergedOptions('cinematic', 'environment'),
    weather: getMergedOptions('cinematic', 'weather'),
    lighting: getMergedOptions('cinematic', 'lighting'),
    light_interaction: getMergedOptions('cinematic', 'light_interaction'),
    sound: getMergedOptions('cinematic', 'sound'),
    dialogue_verb: getMergedOptions('cinematic', 'dialogue_verb'),
    pronoun: getMergedOptions('cinematic', 'pronoun'),
    camera_move: getMergedOptions('cinematic', 'camera_move'),
    focus_target: getMergedOptions('cinematic', 'focus_target'),
    mood: getMergedOptions('cinematic', 'mood'),
    lens: getMergedOptions('cinematic', 'lens'),
    color_grade: getMergedOptions('cinematic', 'color_grade'),
    film_details: getMergedOptions('cinematic', 'film_details'),
  };
  randomizeFields({
    "cin-genre": "genre_style",
    "cin-shot": "shot_type",
    "cin-traits": "subject_traits",
    "cin-role": "subject_role",
    "cin-pose": "pose_action",
    "cin-wardrobe": "wardrobe",
    "cin-prop-action": "prop_action",
    "cin-prop": "prop_weapon",
    "cin-hair": "hair_face_detail",
    "cin-environment": "environment",
    "cin-weather": "weather",
    "cin-lighting": "lighting",
    "cin-light-interaction": "light_interaction",
    "cin-sound": "sound",
    "cin-dialogue-verb": "dialogue_verb",
    "cin-pronoun": "pronoun",
    "cin-camera": "camera_move",
    "cin-focus": "focus_target",
    "cin-mood": "mood",
    "cin-lens": "lens",
    "cin-grade": "color_grade",
    "cin-film": "film_details",
  }, lists, rng, scope, coreKeys);

  const dialogueEl = document.getElementById("cin-dialogue");
  if (dialogueEl && (scope !== 'empties' || !dialogueEl.value.trim())) dialogueEl.value = "";

  const sig1El = document.getElementById("cin-sig1");
  if (sig1El && (scope !== 'empties' || !sig1El.value.trim())) sig1El.value = seededChoice(rng, CINEMATIC.sig_visuals);
  const sig2El = document.getElementById("cin-sig2");
  if (sig2El && (scope !== 'empties' || !sig2El.value.trim())) sig2El.value = seededChoice(rng, CINEMATIC.sig_visuals);
  renderCinematic();
  restoreLockedValues(locked);
}

function randomizeClassic() {
  const locked = snapshotLockedValues();
  const seed = getSeed();
  LAST_SEED = seed;
  const rng = makeRng(seed);
  const scope = getRandomizeScope();
  const coreKeys = ['genre', 'shot', 'camera', 'time', 'lighting', 'atmosphere', 'palette', 'audio'];
  const lists = {
    genre: getMergedOptions('classic', 'genre'),
    shot: getMergedOptions('classic', 'shot'),
    camera: getMergedOptions('classic', 'camera'),
    time: getMergedOptions('classic', 'time'),
    lighting: getMergedOptions('classic', 'lighting'),
    atmosphere: getMergedOptions('classic', 'atmosphere'),
    palette: getMergedOptions('classic', 'palette'),
    audio: getMergedOptions('classic', 'audio'),
  };
  randomizeFields({
    "cl-genre": "genre",
    "cl-shot": "shot",
    "cl-camera": "camera",
    "cl-time": "time",
    "cl-lighting": "lighting",
    "cl-atmosphere": "atmosphere",
    "cl-palette": "palette",
    "cl-audio": "audio",
  }, lists, rng, scope, coreKeys);

  const envEl = document.getElementById("cl-environment");
  if (envEl && (scope !== 'empties' || !envEl.value.trim())) envEl.value = seededChoice(rng, ["city alley", "forest clearing", "mountain ridge", "abandoned factory", "beachfront"]);
  const subjEl = document.getElementById("cl-subject");
  if (subjEl && (scope !== 'empties' || !subjEl.value.trim())) subjEl.value = seededChoice(rng, ["lone scout", "small squad", "mystic", "runner", "drifter"]);
  const wardEl = document.getElementById("cl-wardrobe");
  if (wardEl && (scope !== 'empties' || !wardEl.value.trim())) wardEl.value = seededChoice(rng, ["hooded jacket", "tactical vest", "robes", "casual streetwear", "rugged coat"]);
  const actEl = document.getElementById("cl-action");
  if (actEl && (scope !== 'empties' || !actEl.value.trim())) actEl.value = seededChoice(rng, ["moves cautiously", "sprints through puddles", "waits in ambush", "studies the skyline", "readies to leap"]);
  const dlgEl = document.getElementById("cl-dialogue");
  if (dlgEl && (scope !== 'empties' || !dlgEl.value.trim())) dlgEl.value = "";
  const avoidEl = document.getElementById("cl-avoid");
  if (avoidEl && (scope !== 'empties' || !avoidEl.value.trim())) avoidEl.value = "flicker, warped faces";
  renderClassic();
  restoreLockedValues(locked);
}

function randomizeNSFW() {
  const locked = snapshotLockedValues();
  const seed = getSeed();
  LAST_SEED = seed;
  const rng = makeRng(seed);
  const scope = getRandomizeScope();
  const coreKeys = ['genre_style', 'shot_type', 'subject_role', 'wardrobe', 'pose_action', 'hair_face_detail', 'environment', 'lighting', 'mood', 'camera_move', 'explicit_abilities', 'body_description', 'sexual_description'];
  const lists = {
    genre_style: getMergedOptions('nsfw', 'genre_style'),
    shot_type: getMergedOptions('nsfw', 'shot_type'),
    subject_role: getMergedOptions('nsfw', 'subject_role'),
    wardrobe: getMergedOptions('nsfw', 'wardrobe'),
    pose_action: getMergedOptions('nsfw', 'pose_action'),
    hair_face_detail: getMergedOptions('nsfw', 'hair_face_detail'),
    environment: getMergedOptions('nsfw', 'environment'),
    weather: getMergedOptions('nsfw', 'weather'),
    lighting: getMergedOptions('nsfw', 'lighting'),
    sound: getMergedOptions('nsfw', 'sound'),
    camera_move: getMergedOptions('nsfw', 'camera_move'),
    mood: getMergedOptions('nsfw', 'mood'),
    explicit_abilities: getMergedOptions('nsfw', 'explicit_abilities'),
    body_description: getMergedOptions('nsfw', 'body_description'),
    sexual_description: getMergedOptions('nsfw', 'sexual_description'),
  };
  randomizeFields({
    "nsfw-genre": "genre_style",
    "nsfw-shot": "shot_type",
    "nsfw-role": "subject_role",
    "nsfw-wardrobe": "wardrobe",
    "nsfw-pose": "pose_action",
    "nsfw-hair": "hair_face_detail",
    "nsfw-environment": "environment",
    "nsfw-weather": "weather",
    "nsfw-lighting": "lighting",
    "nsfw-sound": "sound",
    "nsfw-camera": "camera_move",
    "nsfw-mood": "mood",
    "nsfw-explicit-abilities": "explicit_abilities",
    "nsfw-body-description": "body_description",
    "nsfw-sexual-description": "sexual_description",
  }, lists, rng, scope, coreKeys);

  const dlgEl = document.getElementById("nsfw-dialogue");
  if (dlgEl && (scope !== 'empties' || !dlgEl.value.trim())) dlgEl.value = "";
  const sig1El = document.getElementById("nsfw-sig1");
  if (sig1El && (scope !== 'empties' || !sig1El.value.trim())) sig1El.value = seededChoice(rng, CINEMATIC.sig_visuals);
  const sig2El = document.getElementById("nsfw-sig2");
  if (sig2El && (scope !== 'empties' || !sig2El.value.trim())) sig2El.value = seededChoice(rng, CINEMATIC.sig_visuals);
  renderNSFW();
  restoreLockedValues(locked);
}

function applyNSFWPresetPack() {
  const packName = document.getElementById("nsfw-preset-pack").value;
  if (!packName || packName === "— Select NSFW preset pack —") return;

  const pack = NSFW_PRESET_PACKS[packName];
  if (!pack) return;

  // Apply preset values
  Object.entries(pack).forEach(([key, value]) => {
    const elementId = `nsfw-${key.replace(/_/g, '-')}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.value = value;
    }
  });

  renderNSFW();
}

function renderBatchResults(mode, results) {
  const container = document.getElementById(`${mode}-batch-results`);
  if (!container) return;
  container.innerHTML = "";

  results.forEach((result, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "batch-item";

    const label = document.createElement("div");
    label.className = "batch-item__label";
    let text = `Batch ${index + 1}`;
    if (APP_SETTINGS.numberBatchResults) text = `#${index + 1}`;
    if (APP_SETTINGS.addBatchTitles) {
      const title = result.split(/\.|\n/)[0].split(' ').slice(0, 8).join(' ');
      text += title ? ` — ${title}` : '';
    }
    label.textContent = text;

    const textarea = document.createElement("textarea");
    textarea.readOnly = true;
    textarea.rows = 4;
    textarea.value = result;

    wrapper.appendChild(label);
    wrapper.appendChild(textarea);
    container.appendChild(wrapper);
  });

  if (APP_SETTINGS.autoCopyBatch) {
    copyText(results.join("\n\n"));
  }
}

function injectSignatureInputs() {
  const sigContainer = document.createElement("div");
  sigContainer.className = "field split";
  sigContainer.innerHTML = `
    <div>
      <label for="cin-sig1">Signature visual #1</label>
      <input id="cin-sig1" list="cin-sig1-list" placeholder="Select or type...">
      <datalist id="cin-sig1-list"></datalist>
    </div>
    <div>
      <label for="cin-sig2">Signature visual #2</label>
      <input id="cin-sig2" list="cin-sig2-list" placeholder="Select or type...">
      <datalist id="cin-sig2-list"></datalist>
    </div>`;
  const target = document.querySelector("#cin-film").parentElement;
  target.after(sigContainer);
  fillSelect("cin-sig1", CINEMATIC.sig_visuals);
  fillSelect("cin-sig2", CINEMATIC.sig_visuals);
}

function init() {
  // Load saved presets from localStorage
  const saved = localStorage.getItem('ltx-prompter-presets');
  if (saved) {
    try {
      USER_PRESETS = JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved presets');
    }
  }

  // Load custom options from localStorage
  loadCustomOptions();
  loadAppSettings();
  loadFavorites();
  loadSnapshots();

  setupOptions();
  injectSignatureInputs();
  enhanceLockableFields();
  registerDatalistOpeners();
  attachEvents();
  applyAppSettings();
  // Defaults
  document.getElementById("cin-dialogue").value = "We hear him roar: 'Hold the line.'";
  renderCinematic();
  renderClassic();
  renderNSFW();
  updateSavedPresetsList();
}

function loadCustomOptions() {
  const saved = localStorage.getItem('ltx-prompter-custom-options');
  if (saved) {
    try {
      CUSTOM_OPTIONS = normalizeCustomOptions(JSON.parse(saved));
      // Save back normalized shape (deduped, arrays only)
      saveCustomOptions();
    } catch (e) {
      console.warn('Failed to load saved custom options');
      CUSTOM_OPTIONS = {cinematic: {}, classic: {}, nsfw: {}};
    }
  }
}

function saveCustomOptions() {
  localStorage.setItem('ltx-prompter-custom-options', JSON.stringify(CUSTOM_OPTIONS));
}

function loadFavorites() {
  const saved = localStorage.getItem('ltx-prompter-favorites');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') FIELD_FAVORITES = parsed;
    } catch (e) {
      console.warn('Failed to load favorites');
      FIELD_FAVORITES = {};
    }
  }
}

function saveFavorites() {
  localStorage.setItem('ltx-prompter-favorites', JSON.stringify(FIELD_FAVORITES));
}

function loadSnapshots() {
  const saved = localStorage.getItem('ltx-prompter-snapshots');
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object') {
      LAST_MODE_SNAPSHOT = { ...LAST_MODE_SNAPSHOT, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load snapshots');
  }
}

function saveSnapshots() {
  localStorage.setItem('ltx-prompter-snapshots', JSON.stringify(LAST_MODE_SNAPSHOT));
}

function normalizeCustomOptions(raw) {
  const normalized = { cinematic: {}, classic: {}, nsfw: {} };
  const modes = ['cinematic', 'classic', 'nsfw'];
  modes.forEach(mode => {
    const bucket = raw && typeof raw === 'object' ? raw[mode] : undefined;
    if (!bucket || typeof bucket !== 'object') {
      normalized[mode] = {};
      return;
    }
    normalized[mode] = {};
    Object.keys(bucket).forEach(key => {
      const arr = Array.isArray(bucket[key]) ? bucket[key] : [];
      normalized[mode][key] = Array.from(new Set(arr.map(v => typeof v === 'string' ? v : String(v || '')))).filter(Boolean);
    });
  });
  return normalized;
}

function summarizeCustomOptions(options) {
  const summary = { fields: 0, entries: 0 };
  ['cinematic', 'classic', 'nsfw'].forEach(mode => {
    const bucket = options && typeof options === 'object' ? options[mode] : null;
    if (!bucket || typeof bucket !== 'object') return;
    Object.keys(bucket).forEach(key => {
      const list = Array.isArray(bucket[key]) ? bucket[key] : [];
      summary.fields += 1;
      summary.entries += list.length;
    });
  });
  return summary;
}

function mergeCustomOptions(base, incoming) {
  const next = normalizeCustomOptions(base || {});
  const modes = ['cinematic', 'classic', 'nsfw'];
  modes.forEach(mode => {
    const incomingBucket = incoming && incoming[mode];
    if (!incomingBucket || typeof incomingBucket !== 'object') return;
    if (!next[mode]) next[mode] = {};
    Object.keys(incomingBucket).forEach(key => {
      if (!Array.isArray(next[mode][key])) next[mode][key] = [];
      const target = next[mode][key];
      const lowerSet = new Set(target.map(v => (v || "").toString().toLowerCase()));
      (incomingBucket[key] || []).forEach(val => {
        const normalizedVal = (val || "").toString();
        if (!normalizedVal) return;
        if (!lowerSet.has(normalizedVal.toLowerCase())) {
          target.push(normalizedVal);
          lowerSet.add(normalizedVal.toLowerCase());
        }
      });
    });
  });
  return normalizeCustomOptions(next);
}

function loadAppSettings() {
  const saved = localStorage.getItem('ltx-prompter-app-settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      APP_SETTINGS = { ...DEFAULT_APP_SETTINGS, ...parsed };
    } catch (e) {
      console.warn('Failed to load app settings');
      APP_SETTINGS = { ...DEFAULT_APP_SETTINGS };
    }
  } else {
    APP_SETTINGS = { ...DEFAULT_APP_SETTINGS };
  }
}

function saveAppSettings() {
  localStorage.setItem('ltx-prompter-app-settings', JSON.stringify(APP_SETTINGS));
}

function applyAppSettings() {
  // Theme hook (single theme for now)
  document.body.classList.toggle('compact-ui', !!APP_SETTINGS.compactUI);

  // Randomize scope
  const scopeSelect = document.getElementById('randomize-scope');
  if (scopeSelect) scopeSelect.value = APP_SETTINGS.randomizeScope || 'all';

  // Batch count
  const batchInput = document.getElementById('batch-count');
  if (batchInput) batchInput.value = Math.max(1, Math.min(5, APP_SETTINGS.batchCount || 1));

  const numBatch = document.getElementById('settings-number-batch');
  if (numBatch) numBatch.checked = !!APP_SETTINGS.numberBatchResults;
  const titleBatch = document.getElementById('settings-title-batch');
  if (titleBatch) titleBatch.checked = !!APP_SETTINGS.addBatchTitles;
  const autoCopy = document.getElementById('settings-auto-copy-batch');
  if (autoCopy) autoCopy.checked = !!APP_SETTINGS.autoCopyBatch;

  const templateSelect = document.getElementById('settings-template');
  if (templateSelect) templateSelect.value = APP_SETTINGS.promptTemplate || 'standard';

  const templateModal = document.getElementById('settings-template-modal');
  if (templateModal) templateModal.value = APP_SETTINGS.promptTemplate || 'standard';

  const numBatchModal = document.getElementById('settings-number-batch-modal');
  if (numBatchModal) numBatchModal.checked = !!APP_SETTINGS.numberBatchResults;

  const titleBatchModal = document.getElementById('settings-title-batch-modal');
  if (titleBatchModal) titleBatchModal.checked = !!APP_SETTINGS.addBatchTitles;

  const autoCopyModal = document.getElementById('settings-auto-copy-batch-modal');
  if (autoCopyModal) autoCopyModal.checked = !!APP_SETTINGS.autoCopyBatch;

  // NSFW toggle (optional)
  const nsfwToggle = document.getElementById('nsfw-mode');
  if (nsfwToggle && APP_SETTINGS.rememberNSFW) nsfwToggle.checked = !!APP_SETTINGS.nsfwEnabled;
}

function batchGenerate() {
  const rawCount = parseInt(document.getElementById("batch-count").value) || 1;
  const count = Math.max(1, Math.min(5, rawCount));
  document.getElementById("batch-count").value = count;
  APP_SETTINGS.batchCount = count;
  saveAppSettings();
  const active = document.querySelector(".mode-tab.active").dataset.mode;
  const results = [];

  for (let i = 0; i < count; i++) {
    // Generate with different seeds
    const seed = Math.floor(Math.random() * 2 ** 31);
    document.getElementById("global-seed").value = seed;
    LAST_SEED = seed;

    if (active === "cinematic") {
      randomizeCinematic();
      results.push(document.getElementById("cinematic-output").textContent);
    } else if (active === "classic") {
      randomizeClassic();
      results.push(document.getElementById("classic-output").textContent);
    } else if (active === "nsfw") {
      randomizeNSFW();
      results.push(document.getElementById("nsfw-output").textContent);
    }
  }

  renderBatchResults(active, results);
}

function exportSettings() {
  const active = document.querySelector(".mode-tab.active").dataset.mode;
  let settings = {};

  if (active === "cinematic") {
    settings = readCinematicForm();
  } else if (active === "classic") {
    settings = readClassicForm();
  } else if (active === "nsfw") {
    settings = readNSFWForm();
  }

  settings.mode = active;
  settings.nsfwEnabled = document.getElementById("nsfw-mode").checked;

  const dataStr = JSON.stringify(settings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `ltx-prompter-${active}-settings.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);

        // Switch to the correct mode
        if (settings.mode) {
          document.querySelectorAll(".mode-tab").forEach(tab => {
            if (tab.dataset.mode === settings.mode) {
              tab.click();
            }
          });
        }

        // Set NSFW mode
        if (settings.nsfwEnabled !== undefined) {
          document.getElementById("nsfw-mode").checked = settings.nsfwEnabled;
          updateNSFWOptions();
        }

        // Apply settings to form
        Object.entries(settings).forEach(([key, value]) => {
          if (key === 'mode' || key === 'nsfwEnabled') return;
          const elementId = `${settings.mode === 'nsfw' ? 'nsfw' : settings.mode === 'cinematic' ? 'cin' : 'cl'}-${key.replace(/_/g, '-')}`;
          const element = document.getElementById(elementId);
          if (element) {
            element.value = value;
          }
        });

        // Render the result
        if (settings.mode === "cinematic") renderCinematic();
        else if (settings.mode === "classic") renderClassic();
        else if (settings.mode === "nsfw") renderNSFW();

      } catch (error) {
        alert('Error importing settings: Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportCustomOptions() {
  const dataStr = JSON.stringify(CUSTOM_OPTIONS, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'ltx-prompter-custom-options.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importCustomOptions() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedOptions = JSON.parse(e.target.result);

        // Validate structure
        if (typeof importedOptions !== 'object' || !importedOptions) {
          throw new Error('Invalid custom options format');
        }

        const normalizedImport = normalizeCustomOptions(importedOptions);
        const incomingSummary = summarizeCustomOptions(normalizedImport);
        const existingSummary = summarizeCustomOptions(CUSTOM_OPTIONS);

        const merge = window.confirm(
          `Import custom options?\nIncoming: ${incomingSummary.entries} entries across ${incomingSummary.fields} fields.\nExisting: ${existingSummary.entries} entries.\nOK = Merge (dedupe), Cancel = Replace`
        );

        const beforeSummary = summarizeCustomOptions(CUSTOM_OPTIONS);
        CUSTOM_OPTIONS = merge ? mergeCustomOptions(CUSTOM_OPTIONS, normalizedImport) : normalizedImport;

        const afterSummary = summarizeCustomOptions(CUSTOM_OPTIONS);

        // Normalize and save
        CUSTOM_OPTIONS = normalizeCustomOptions(CUSTOM_OPTIONS);
        saveCustomOptions();

        // Refresh all dropdowns
        setupOptions();

        const added = afterSummary.entries - beforeSummary.entries;
        alert(merge
          ? `Merged custom options. Added ${Math.max(0, added)} new entries across ${afterSummary.fields} fields.`
          : `Replaced custom options. Now tracking ${afterSummary.entries} entries across ${afterSummary.fields} fields.`);

      } catch (error) {
        alert('Error importing custom options: Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function updateSavedPresetsList() {
  const mode = document.getElementById("custom-mode-select").value;
  const select = document.getElementById("saved-presets");
  select.innerHTML = "";

  const presets = USER_PRESETS[mode] || {};
  Object.keys(presets).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

function saveCurrentPreset() {
  const mode = document.getElementById("custom-mode-select").value;
  const name = document.getElementById("custom-preset-name").value.trim();
  const desc = document.getElementById("custom-preset-desc").value.trim();

  if (!name) {
    alert("Please enter a preset name");
    return;
  }

  let settings = {};
  if (mode === "cinematic") {
    settings = readCinematicForm();
  } else if (mode === "classic") {
    settings = readClassicForm();
  } else if (mode === "nsfw") {
    settings = readNSFWForm();
  }

  settings.description = desc;
  settings.created = new Date().toISOString();

  USER_PRESETS[mode][name] = settings;
  updateSavedPresetsList();

  // Save to localStorage
  localStorage.setItem('ltx-prompter-presets', JSON.stringify(USER_PRESETS));

  alert(`Preset "${name}" saved successfully!`);
}

function loadSelectedPreset() {
  const mode = document.getElementById("custom-mode-select").value;
  const name = document.getElementById("saved-presets").value;

  if (!name) return;

  const preset = USER_PRESETS[mode][name];
  if (!preset) return;

  // Switch to the correct mode
  document.querySelectorAll(".mode-tab").forEach(tab => {
    if (tab.dataset.mode === mode) {
      tab.click();
    }
  });

  // Apply settings
  Object.entries(preset).forEach(([key, value]) => {
    if (key === 'description' || key === 'created') return;
    const elementId = `${mode === 'nsfw' ? 'nsfw' : mode === 'cinematic' ? 'cin' : 'cl'}-${key.replace(/_/g, '-')}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.value = value;
    }
  });

  // Render
  if (mode === "cinematic") renderCinematic();
  else if (mode === "classic") renderClassic();
  else if (mode === "nsfw") renderNSFW();
}

function deleteSelectedPreset() {
  const mode = document.getElementById("custom-mode-select").value;
  const name = document.getElementById("saved-presets").value;

  if (!name) return;

  if (!confirm(`Are you sure you want to delete the preset "${name}"?`)) return;

  delete USER_PRESETS[mode][name];
  localStorage.setItem('ltx-prompter-presets', JSON.stringify(USER_PRESETS));
  updateSavedPresetsList();
  document.getElementById("preset-details").value = "";
}

function showPresetDetails() {
  const mode = document.getElementById("custom-mode-select").value;
  const name = document.getElementById("saved-presets").value;

  if (!name) {
    document.getElementById("preset-details").value = "";
    return;
  }

  const preset = USER_PRESETS[mode][name];
  if (!preset) return;

  const details = `Name: ${name}
Description: ${preset.description || 'No description'}
Created: ${new Date(preset.created).toLocaleString()}

Settings:
${Object.entries(preset)
  .filter(([key]) => key !== 'description' && key !== 'created')
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}`;

  document.getElementById("preset-details").value = details;
}

document.addEventListener("DOMContentLoaded", init);
