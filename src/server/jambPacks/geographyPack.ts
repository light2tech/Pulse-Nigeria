import { SubjectPack } from './types';

export const GEOGRAPHY_PACK: SubjectPack = {
  subjectId: 'geography',
  subjectName: 'Geography',
  iconName: 'menu_book',
  description:
    'JAMB UTME Geography syllabus (40 CBT questions · 40 mins): Map Reading & Scale, Earth Rotation/Time Zones, Rocks & Landforms, Climatology, and Regional Geography of Nigeria & ECOWAS.',
  materialId: 'mat-jamb-geography-syllabus',
  materialTitle: 'JAMB UTME Geography Syllabus Study Guide',
  materialSummary:
    'Comprehensive JAMB Geography revision covering Map Reading, Longitude & Time Calculations, Geomorphology, Climate/Vegetation, and Nigerian Geography.',
  materialSections: [
    `Section 1: Practical Geography — Map Reading, Scales & Contours (JAMB Syllabus)

1. Map Scales & Conversion:
• Representative Fraction (R.F.): e.g., 1:50,000 means 1 cm on the map represents 50,000 cm (0.5 km) on the ground; 2 cm represents 1 km.
• Scale Enlargement & Reduction:
  - When reducing a map by factor n, New Scale denominator = Old denominator × n; Area decreases by n².
  - When enlarging a map by factor n, New Scale denominator = Old denominator ÷ n; Area increases by n².

2. Gradient & Intervisibility:
• Gradient = Vertical Interval (V.I.) / Horizontal Equivalent (H.E.), expressed in identical units (metres) as 1 in X.
• Concave slopes have contours closely spaced at the top and widely spaced at the base (points ARE intervisible). Convex slopes have contours widely spaced at the top and closely spaced at the bottom (obstructs intervisibility).`,

    `Section 2: Physical Geography — Earth's Movements, Longitude & Rocks

1. Rotation, Revolution & Time Calculation:
• Rotation (West to East every 24 hours) causes day & night and deflection of winds/ocean currents (Ferrel's Law: right in Northern Hemisphere, left in Southern Hemisphere).
• Longitude & Local Time: Earth rotates 360° in 24 hours → 15° = 1 hour; 1° = 4 minutes.
  - Places EAST of a reference meridian are AHEAD in time (+); places WEST are BEHIND (-).
• Revolution (365¼ days on a 66½° inclined axis) causes seasons, varying lengths of day/night, Equinoxes (March 21, Sept 23), and Solstices (June 21, Dec 22).

2. Rocks & Landforms:
• Igneous Rocks: Formed from cooling magma/lava; crystalline, non-stratified, no fossils. Plutonic (granite, gabbro) vs Volcanic/Extrusive (basalt, pumice).
• Sedimentary Rocks: Stratified, contain fossils. Mechanically formed (sandstone, shale), Organically formed (limestone, coal), Chemically formed (rock salt, gypsum).
• Metamorphic Rocks: Transformed by heat/pressure: Limestone → Marble; Clay/Shale → Slate; Sandstone → Quartzite; Granite → Gneiss; Coal → Graphite.`,

    `Section 3: Climatology, Instruments & Nigerian Vegetation Belts

1. Weather Elements & Recording Instruments:
• Temperature (Six's Max & Min Thermometer; Diurnal range = Max - Min), Atmospheric Pressure (Mercury/Aneroid Barometer, lines = Isobars), Wind Speed (Cup Anemometer), Wind Direction (Wind Vane), Relative Humidity (Wet & Dry Bulb Hygrometer).
• Rainfall Types: Convectional (equatorial afternoon downpours), Orographic/Relief (windward mountain slopes vs leeward rain shadow), Cyclonic/Frontal.

2. Nigerian Vegetation Zones (South → North):
1. Mangrove / Salt-Water & Fresh-Water Swamp Forest (Niger Delta, coastal creeks — raffia palm, red mangrove).
2. Tropical High Rainforest (Ondo, Cross River, Edo — mahogany, iroko, obeche, oil palm).
3. Guinea Savanna (Largest belt in Nigeria — tall grasses, deciduous trees like locust bean & shea butter).
4. Sudan Savanna (Short grasses, acacia, baobab — intensive grain & cattle zone).
5. Sahel Savanna (Extreme North-East, Lake Chad basin — thorny shrubs, xerophytes).`,

    `Section 4: Human & Regional Geography of Nigeria & ECOWAS

1. Nigerian Relief, Drainage & Minerals:
• Major Highlands: North-Central Plateau (Jos — hydrological centre of radial drainage), Western Uplands, Eastern Highlands (Mandara, Adamawa — Chappal Waddi 2,419 m highest peak), Udi-Nsukka Escarpment (Enugu coal).
• Mineral Resources: Crude Petroleum & Natural Gas (Niger Delta — Tertiary sedimentary rocks), Tin & Columbite (Jos Plateau — alluvial igneous), Limestone (Ewekoro, Sokoto, Nkalagu, Gboko — cement industry), Sub-bituminous Coal (Enugu), Iron Ore (Itakpe, Kogi).

2. Population, Settlement & ECOWAS:
• High population density zones in Nigeria: South-West Yoruba cocoa/urban belt, South-East Igbo heartland, Kano close-settled zone. Low density: Middle Belt (tsetse fly, historical slave raids).
• ECOWAS (founded May 28, 1975 via Treaty of Lagos; Headquarters in Abuja): Promotes free movement, regional trade liberalization, and infrastructural integration across West Africa.`,
  ],
  pastPaperId: 'pq-jamb-geography',
  pastPaperTitle: 'JAMB UTME Geography Past Questions & Official Answers (40 Questions)',
  pastPaperYear: '2024',
  pastPaperSummary:
    'Complete 40-question JAMB UTME Geography paper covering Time/Longitude calculations, Map Scale, Rocks, Climate, and Nigerian Regional Geography.',
  questions: [
    {
      topic: 'Longitude & Time Calculation',
      question:
        'If a football match kicks off at 4:00 p.m. in London (0° Longitude), at what local time will viewers in Town X (45°E) watch the live kick-off?',
      options: ['1:00 p.m.', '6:00 p.m.', '7:00 p.m.', '8:00 p.m.'],
      correctOptionIndex: 2,
      explanation:
        'Longitude difference = 45° - 0° = 45°. Since 15° = 1 hour, time difference = 45 / 15 = 3 hours. Because 45°E is East of 0°, add 3 hours: 4:00 p.m. + 3 hours = 7:00 p.m.',
    },
    {
      topic: 'Map Reading & Scale',
      question:
        'On a topographic map drawn to a scale of 1:50,000, the straight-line distance between two villages is 8.4 cm. What is the actual ground distance in kilometres?',
      options: ['2.1 km', '4.2 km', '8.4 km', '16.8 km'],
      correctOptionIndex: 1,
      explanation:
        '1:50,000 means 1 cm = 0.5 km on the ground. Therefore, 8.4 cm = 8.4 × 0.5 km = 4.2 km.',
    },
    {
      topic: 'Rocks & Geomorphology',
      question:
        'When limestone is subjected to intense heat and pressure during metamorphism, it is transformed into:',
      options: ['Quartzite', 'Slate', 'Gneiss', 'Marble'],
      correctOptionIndex: 3,
      explanation:
        'Thermal/regional metamorphism recrystallizes calcium carbonate in limestone into marble (Sandstone → Quartzite, Clay/Shale → Slate, Granite → Gneiss).',
    },
    {
      topic: 'Geography of Nigeria',
      question:
        'Which vegetation zone occupies the largest land area in Nigeria and is characterized by tall grasses with scattered fire-resistant trees such as shea butter and locust bean?',
      options: [
        'Tropical Rainforest',
        'Guinea Savanna',
        'Sahel Savanna',
        'Mangrove Swamp Forest',
      ],
      correctOptionIndex: 1,
      explanation:
        'The Guinea Savanna covers almost half of Nigeria (stretching across the Middle Belt) and features tall grasses alongside economic trees like Isoberlinia, shea butter, and locust bean.',
    },
    {
      topic: 'Mineral Resources of Nigeria',
      question:
        'Alluvial deposits of cassiterite (tin ore) and columbite in Nigeria are predominantly mined on the:',
      options: ['Udi Escarpment', 'Sokoto Plains', 'Jos Plateau', 'Niger Delta Basin'],
      correctOptionIndex: 2,
      explanation:
        'Younger granites of the Jos Plateau weather to form rich alluvial deposits of tin (cassiterite) and columbite.',
    },
    {
      topic: 'Climatology',
      question:
        'The dry, dusty North-East Trade Wind that blows from the Sahara Desert across West Africa between November and February is associated with:',
      options: [
        'High relative humidity and cyclonic rainfall',
        'Harmattan haze and large diurnal temperature range',
        'Equatorial convectional thunderstorms',
        'Coastal sea breeze inversion',
      ],
      correctOptionIndex: 1,
      explanation:
        'The Tropical Continental (cT) air mass brings the Harmattan: dusty haze, very low relative humidity, hot afternoons, and cold nights (large diurnal temperature range).',
    },
    {
      topic: 'Map Enlargement & Reduction',
      question:
        'If a map drawn to a scale of 1:100,000 is enlarged two times, what is the new Representative Fraction (R.F.) scale?',
      options: ['1:25,000', '1:50,000', '1:200,000', '1:400,000'],
      correctOptionIndex: 1,
      explanation:
        'Enlarging a map by 2 divides the scale denominator by 2: 100,000 ÷ 2 = 50,000 → New scale is 1:50,000.',
    },
    {
      topic: 'Contour & Slope Interpretation',
      question:
        'Two hilltops on a contour map are NOT intervisible when the intervening slope between them is:',
      options: ['Concave', 'Uniformly gentle', 'Convex', 'A wide flat valley'],
      correctOptionIndex: 2,
      explanation:
        'A convex slope bulges outward near the middle/base (contours close at the bottom, wide at the top), blocking the line of sight between the two points.',
    },
    {
      topic: 'Gradient Calculation',
      question:
        'Point A (height 150 m) and Point B (height 350 m) are 4 km apart horizontally. Calculate the gradient between A and B.',
      options: ['1 in 10', '1 in 20', '1 in 40', '1 in 200'],
      correctOptionIndex: 1,
      explanation:
        'Vertical Interval (V.I.) = 350 - 150 = 200 m. Horizontal Equivalent (H.E.) = 4 km = 4000 m. Gradient = 200 / 4000 = 1 in 20.',
    },
    {
      topic: 'Solar System & Earth',
      question:
        'Day and night are equal in length (12 hours each) everywhere on Earth during the equinoxes on:',
      options: [
        'June 21 and December 22',
        'March 21 and September 23',
        'January 1 and July 4',
        'April 15 and October 15',
      ],
      correctOptionIndex: 1,
      explanation:
        'On March 21 (Vernal Equinox) and September 23 (Autumnal Equinox), the overhead sun is directly over the Equator.',
    },
    {
      topic: 'Latitude & Distance',
      question:
        'Calculate the approximate ground distance along a meridian between Town P (4°N) and Town Q (14°N). [1° of latitude ≈ 111 km]',
      options: ['555 km', '1,110 km', '1,554 km', '1,998 km'],
      correctOptionIndex: 1,
      explanation:
        'Difference in latitude (same hemisphere) = 14° - 4° = 10°. Distance = 10 × 111 km = 1,110 km.',
    },
    {
      topic: 'International Date Line',
      question:
        'A traveller crossing the International Date Line (180° meridian) from West (Asia) to East (America):',
      options: [
        'Loses a full calendar day',
        'Gains a full calendar day (repeats a day)',
        'Adjusts the clock by 1 hour only',
        'Experiences no change in calendar date',
      ],
      correctOptionIndex: 1,
      explanation:
        'Moving eastward across 180° moves from ahead-of-GMT (+12h) to behind-GMT (-12h), gaining/repeating a calendar day.',
    },
    {
      topic: 'Earth’s Internal Structure',
      question:
        'The continental crust, composed predominantly of silica and aluminium, is collectively known as:',
      options: ['SIMA', 'SIAL', 'Barysphere', 'Asthenosphere'],
      correctOptionIndex: 1,
      explanation:
        'SIAL (Silica + Aluminium, granitic density ~2.7 g/cm³) forms the continental crust, resting above SIMA (Silica + Magnesium, basaltic oceanic crust).',
    },
    {
      topic: 'Igneous Rocks',
      question:
        'Which of the following is an example of a plutonic (intrusive) igneous rock?',
      options: ['Basalt', 'Granite', 'Shale', 'Limestone'],
      correctOptionIndex: 1,
      explanation:
        'Granite cools slowly at great depth beneath the Earth’s crust, forming coarse crystals (plutonic/intrusive igneous rock).',
    },
    {
      topic: 'Fold & Block Mountains',
      question:
        'A steep-sided trough formed when a crustal block subsides between two parallel normal faults is called a:',
      options: ['Horst', 'Rift valley (Graben)', 'Anticline', 'Caldera'],
      correctOptionIndex: 1,
      explanation:
        'Subsidence between parallel tensional faults produces a Rift Valley (Graben), such as the East African Rift Valley, whereas uplift forms a Horst (block mountain).',
    },
    {
      topic: 'Weathering & Mass Wasting',
      question:
        'Peeling off of concentric outer rock layers in hot deserts due to alternate daytime expansion and nighttime contraction is termed:',
      options: ['Carbonation', 'Exfoliation (onion-peeling)', 'Hydrolysis', 'Solifluction'],
      correctOptionIndex: 1,
      explanation:
        'Extreme diurnal temperature changes cause differential heating/cooling of outer rock layers, resulting in exfoliation domes.',
    },
    {
      topic: 'Fluvial (River) Landforms',
      question:
        'Which of the following features is characteristic of the lower (senile/floodplain) course of a river?',
      options: ['Interlocking spurs', 'Ox-bow lakes and levees', 'Potholes and plunges', 'V-shaped gorges'],
      correctOptionIndex: 1,
      explanation:
        'In the lower plain course, lateral erosion and deposition predominate, forming pronounced meanders, ox-bow lakes, floodplains, levees, and deltas.',
    },
    {
      topic: 'Arid / Desert Landforms',
      question:
        'Crescent-shaped sand dunes with horns pointing downwind, formed by wind deposition in deserts, are called:',
      options: ['Zeugen', 'Yardangs', 'Barchans', 'Inselbergs'],
      correctOptionIndex: 2,
      explanation:
        'Barchans are crescentic mobile sand dunes formed by wind deposition where sand supply is moderate and wind direction is steady.',
    },
    {
      topic: 'Karst (Limestone) Topography',
      question:
        'Slender pillars of calcium carbonate hanging downwards from the roof of an underground limestone cave are:',
      options: ['Stalagmites', 'Stalactites', 'Grikes', 'Dolines'],
      correctOptionIndex: 1,
      explanation:
        'Stalactites hang tightly from the ceiling of limestone caverns, while stalagmites grow upward from the cave floor.',
    },
    {
      topic: 'Coastal Landforms',
      question:
        'Which of the following is a feature of wave deposition rather than wave erosion?',
      options: ['Sea stack', 'Wave-cut platform', 'Sand spit and tombolo', 'Blowhole'],
      correctOptionIndex: 2,
      explanation:
        'Longshore drift deposits sand and shingle along coasts to create beaches, spits, bars, and tombolos.',
    },
    {
      topic: 'Weather Instruments',
      question:
        'Lines drawn on a weather map joining places having equal atmospheric pressure reduced to sea level are:',
      options: ['Isotherms', 'Isohyets', 'Isobars', 'Isohels'],
      correctOptionIndex: 2,
      explanation:
        'Isobars connect points of equal pressure (Isotherms = temperature, Isohyets = rainfall, Isohels = sunshine).',
    },
    {
      topic: 'Atmospheric Layers',
      question:
        'Almost all weather phenomena (clouds, rainfall, storms) occur within the lowest layer of the atmosphere called the:',
      options: ['Stratosphere', 'Troposphere', 'Mesosphere', 'Thermosphere'],
      correctOptionIndex: 1,
      explanation:
        'The troposphere contains ~75–80% of atmospheric mass and virtually all water vapour and dust nuclei.',
    },
    {
      topic: 'Rainfall Types',
      question:
        'Heavy afternoon rain accompanied by thunder and lightning in equatorial regions like Calabar and Port Harcourt is predominantly:',
      options: ['Orographic rainfall', 'Convectional rainfall', 'Cyclonic rainfall', 'Frontal drizzle'],
      correctOptionIndex: 1,
      explanation:
        'Intense solar heating causes warm moist air to rise rapidly by convection, condensing into cumulonimbus clouds that bring heavy afternoon downpours.',
    },
    {
      topic: 'Ocean Currents',
      question:
        'Which cold ocean current flows along the south-western coast of Africa and contributes to the aridity of the Namib Desert?',
      options: ['Guinea Current', 'Agulhas Current', 'Benguela Current', 'Canary Current'],
      correctOptionIndex: 2,
      explanation:
        'The cold Benguela Current cools onshore winds along SW Africa, inhibiting rainfall and sustaining the Namib Desert.',
    },
    {
      topic: 'World Climatic Types',
      question:
        'Which climatic region is uniquely characterized by warm, dry sunny summers and mild, wet winters (ideal for citrus fruits, olives, and viticulture)?',
      options: [
        'Tropical Monsoon climate',
        'Mediterranean climate',
        'Equatorial climate',
        'Cool Temperate Interior climate',
      ],
      correctOptionIndex: 1,
      explanation:
        'Mediterranean regions (30°–45° N/S on western continental margins) experience offshore trade winds in summer (dry) and onshore westerlies in winter (wet).',
    },
    {
      topic: 'Soil Science (Pedology)',
      question:
        'Which soil type possesses the highest water-retaining capacity, finest particle size, and lowest permeability?',
      options: ['Sandy soil', 'Loamy soil', 'Clay soil', 'Gravelly soil'],
      correctOptionIndex: 2,
      explanation:
        'Clay has microscopic pore spaces (<0.002 mm particles), retaining abundant capillary water while draining poorly.',
    },
    {
      topic: 'Environmental Hazards',
      question:
        'Sheet and gully erosion are most severe in South-Eastern Nigeria (e.g., Anambra and Imo States) due to:',
      options: [
        'Frequent Harmattan dust storms',
        'Friable sandy sedimentary soils combined with torrential rainfall and deforestation',
        'Glacial abrasion on steep highlands',
        'Absence of surface rivers',
      ],
      correctOptionIndex: 1,
      explanation:
        'Unconsolidated coastal plain sands/Nanka sands and intense tropical downpours trigger severe gully erosion (e.g., Agulu-Nanka gullies).',
    },
    {
      topic: 'Relief of Nigeria',
      question:
        'What is the highest mountain peak in Nigeria (standing at about 2,419 metres above sea level)?',
      options: ['Shere Hills', 'Idanre Hills', 'Chappal Waddi', 'Zuma Rock'],
      correctOptionIndex: 2,
      explanation:
        'Chappal Waddi (Gangirwal) on the Mambilla/Gotel Mountains in Taraba State along the Cameroon border is Nigeria’s highest peak.',
    },
    {
      topic: 'Drainage of Nigeria',
      question:
        'The Jos Plateau is often described as the hydrological centre of Northern Nigeria because:',
      options: [
        'River Niger originates from it',
        'Major rivers like Kaduna, Gongola, Hadejia, and Yobe radiate outward from it',
        'It contains Lake Kainji',
        'It lies below sea level',
      ],
      correctOptionIndex: 1,
      explanation:
        'The elevated North-Central Jos Plateau exhibits a radial drainage pattern feeding several major northern river basins.',
    },
    {
      topic: 'Dams & Hydroelectric Power in Nigeria',
      question:
        'Kainji Dam, Nigeria’s pioneer hydroelectric power project, is built across:',
      options: ['River Benue', 'River Niger', 'River Kaduna', 'Cross River'],
      correctOptionIndex: 1,
      explanation:
        'Kainji Dam (and Jebba Dam downstream) is constructed on the River Niger, whereas Shiroro Dam is on River Kaduna.',
    },
    {
      topic: 'Cash & Food Crops of Nigeria',
      question:
        'Cocoa cultivation flourishes best in South-Western Nigeria (Ondo, Osun, Ogun) primarily because of:',
      options: [
        'Low annual rainfall below 400 mm',
        'Deep, well-drained loamy forest soils and moderate-to-heavy rainfall',
        'Cold montane frost conditions',
        'Waterlogged saline mangrove soils',
      ],
      correctOptionIndex: 1,
      explanation:
        'Cocoa requires deep, well-drained ferruginous forest soils, high temperatures (~26°C), shade during seedling growth, and 1,150–2,000 mm annual rainfall.',
    },
    {
      topic: 'Pastoral Farming in Nigeria',
      question:
        'Cattle rearing in Nigeria is concentrated predominantly in the Sudan Savanna rather than the Southern Forest belt mainly because the North is relatively free from:',
      options: ['Locust swarms', 'Tsetse flies (vectors of trypanosomiasis)', 'Drought', 'Harmattan winds'],
      correctOptionIndex: 1,
      explanation:
        'Open savanna grasslands and low humidity inhibit the tsetse fly that transmits sleeping sickness (nagana) in humid southern forests.',
    },
    {
      topic: 'Manufacturing Industries in Nigeria',
      question:
        'Cement factories at Ewekoro, Obajana, Ibese, Gboko, and Sokoto are classified as raw-material-oriented industries because:',
      options: [
        'Cement is exported exclusively by air',
        'Limestone is heavy, bulky, and weight-losing during processing',
        'Skilled labour is found only in rural villages',
        'Limestone requires coastal seawater for cooling',
      ],
      correctOptionIndex: 1,
      explanation:
        'Because limestone is bulky and loses weight on calcination, transport costs are minimized by siting cement plants right on limestone deposits.',
    },
    {
      topic: 'Energy & Minerals in Nigeria',
      question:
        'Sub-bituminous coal deposits in Nigeria have historically been mined chiefly around:',
      options: ['Enugu (Udi Escarpment) and Okaba', 'Port Harcourt and Bonny', 'Sokoto and Birnin Kebbi', 'Badagry and Epe'],
      correctOptionIndex: 0,
      explanation:
        'Enugu ("Coal City") along the Udi Escarpment and parts of Kogi/Benue (Okaba, Owukpa) host Nigeria’s major coal seams.',
    },
    {
      topic: 'Population Geography',
      question:
        'The relatively low population density of Nigeria’s Middle Belt compared to the North and South is largely attributed to:',
      options: [
        'Complete absence of arable land',
        'Historical inter-tribal wars/slave raiding and tsetse fly infestation',
        'Sub-zero winter temperatures',
        'Volcanic eruptions',
      ],
      correctOptionIndex: 1,
      explanation:
        'Historical slave raids depopulated large areas of the Middle Belt, compounded by river blindness (onchocerciasis) and tsetse flies.',
    },
    {
      topic: 'Settlement Geography',
      question:
        'When several neighbouring cities and towns expand outward and merge into one continuous built-up urban zone, the resulting settlement is a:',
      options: ['Hamlet', 'Conurbation', 'Nucleated village', 'Dispersed homestead'],
      correctOptionIndex: 1,
      explanation:
        'A conurbation is formed by the coalescence of formerly separate towns/cities through outward urban sprawl.',
    },
    {
      topic: 'Transportation',
      question:
        'Which mode of transport is most economical for moving bulky, non-perishable commodities such as crude oil, iron ore, and machinery across continents?',
      options: ['Air transport', 'Ocean/water transport', 'Rope-way transport', 'Express courier vans'],
      correctOptionIndex: 1,
      explanation:
        'Ocean shipping offers the lowest freight cost per tonne-kilometre for heavy, bulky international cargo.',
    },
    {
      topic: 'International Trade & ECOWAS',
      question:
        'Where is the administrative headquarters (Commission) of the Economic Community of West African States (ECOWAS) located?',
      options: ['Accra, Ghana', 'Lagos, Nigeria', 'Abuja, Nigeria', 'Dakar, Senegal'],
      correctOptionIndex: 2,
      explanation:
        'Although founded via the 1975 Treaty of Lagos, the ECOWAS Commission headquarters relocated to Abuja, Nigeria.',
    },
    {
      topic: 'Africa Regional Geography',
      question:
        'The Aswan High Dam in Egypt was constructed primarily across the River Nile to provide:',
      options: [
        'Tidal wave energy and timber',
        'Perennial irrigation water and hydroelectric power',
        'Navigation to the Atlantic Ocean',
        'Desalination of Red Sea brine',
      ],
      correctOptionIndex: 1,
      explanation:
        'Lake Nasser behind the Aswan High Dam regulates Nile floods, supports year-round perennial irrigation in arid Egypt, and generates hydroelectricity.',
    },
    {
      topic: 'GIS & Remote Sensing',
      question:
        'In Geographic Information Systems (GIS), spatial data represented using discrete points, lines, and polygons is known as:',
      options: ['Raster data', 'Vector data', 'Analogue film', 'Barometric data'],
      correctOptionIndex: 1,
      explanation:
        'Vector GIS models represent wells/towns as points, roads/rivers as lines (arcs), and states/lakes as polygons, whereas Raster uses pixel grids.',
    },
  ],
};
