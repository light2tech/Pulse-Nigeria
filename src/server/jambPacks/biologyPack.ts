import { SubjectPack } from './types';

export const BIOLOGY_PACK: SubjectPack = {
  subjectId: 'biology',
  subjectName: 'Biology',
  iconName: 'biotech',
  description:
    'JAMB UTME Biology syllabus (40 CBT questions · 40 mins): Cell Biology & Osmosis, Plant/Animal Nutrition, Mammalian Physiology, Ecology, Mendelian Genetics, and Evolution.',
  materialId: 'mat-jamb-biology-syllabus',
  materialTitle: 'JAMB UTME Biology Syllabus Study Guide',
  materialSummary:
    'Complete JAMB Biology study notes covering Cell Organelles, Nutrition, Excretion/Homeostasis, Ecological Biomes, Genetics, and Evolution.',
  materialSections: [
    `Section 1: Cell Structure, Organization & Transport Processes (JAMB Syllabus)

1. Cell Organelles & Functions:
• Mitochondrion: Site of aerobic cellular respiration (ATP synthesis — powerhouse of the cell).
• Chloroplast: Contains chlorophyll in grana/thylakoids (light stage) and stroma (Calvin cycle dark stage of photosynthesis).
• Ribosome: Site of protein synthesis; Lysosome: Intracellular digestion / autolysis ("suicide bag"); Golgi Apparatus: Packaging and secretion of glycoproteins.
• Plant vs Animal Cell: Plant cells possess a cellulose cell wall, chloroplasts, and a large central sap vacuole; animal cells possess centrioles and store carbohydrate as glycogen.

2. Biophysical Transport:
• Osmosis: Movement of water molecules from a dilute (hypotonic) solution to a concentrated (hypertonic) solution across a selectively permeable membrane.
• Plant cell in hypertonic solution undergoes Plasmolysis; animal red blood cell in hypotonic solution swells and bursts (Haemolysis).`,

    `Section 2: Nutrition, Transport & Gaseous Exchange

1. Autotrophic & Heterotrophic Nutrition:
• Photosynthesis: 6CO2 + 6H2O → C6H12O6 + 6O2. Light stage splits water (photolysis of H2O releasing O2 and NADPH); Dark stage reduces CO2 to glucose in the stroma.
• Food Tests: Starch + Iodine → Blue-black; Reducing sugar + Benedict's/Fehling's + heat → Brick-red precipitate; Protein + Biuret (NaOH + CuSO4) → Violet/Purple; Protein + Millon's reagent → Brick-red; Lipids + Sudan III → Red ring / translucent grease spot.

2. Vascular & Mammalian Transport:
• Xylem conducts water and dissolved mineral salts upwards (transpiration pull); Phloem translocates manufactured sucrose/amino acids bidirectionally.
• Mammalian Double Circulation: Pulmonary circuit (Right Ventricle → Lungs via Pulmonary Artery, the only artery carrying deoxygenated blood) and Systemic circuit (Left Ventricle → Body via Aorta).`,

    `Section 3: Excretion, Homeostasis, Nervous & Endocrine Systems

1. Excretory Organs across Organisms:
• Amoeba/Protozoa: Contractile vacuole; Platyhelminthes (Tapeworm/Planaria): Flame cells; Earthworm (Annelids): Nephridia; Insects: Malpighian tubules; Crustaceans: Green glands; Mammals: Kidneys, Skin, Lungs, Liver.
• Nephron Mechanism: Ultrafiltration in Bowman's capsule, Selective reabsorption of all glucose, amino acids, and water in the Proximal Convoluted Tubule & Loop of Henle (regulated by ADH/Vasopressin from pituitary gland).

2. Hormones & Plant Tropisms:
• Insulin (Islets of Langerhans in pancreas) lowers blood glucose by converting glucose → glycogen in the liver (deficiency causes Diabetes mellitus); Glucagon raises blood glucose; Adrenaline prepares body for "fight or flight"; Thyroxine regulates basal metabolic rate (iodine deficiency causes Goitre).
• Auxins (IAA) accumulate on the shaded side of shoots causing positive phototropism.`,

    `Section 4: Ecology, Mendelian Genetics & Evolution

1. Ecological Instruments & Associations:
• Anemometer (wind speed), Secchi disc (turbidity/transparency of water), Quadrat (population frequency/density of immobile plants), Baermann funnel (soil organisms).
• Symbiosis/Mutualism: Lichen (Alga manufactures food + Fungus provides moisture/anchorage), Rhizobium nitrogen-fixing bacteria in root nodules of legumes.

2. Genetics & Variation:
• Mendel's Monohybrid F2 phenotypic ratio = 3:1; Dihybrid F2 phenotypic ratio = 9:3:3:1.
• Sex-linked recessive traits (carried on X chromosome, more frequent in males XY): Haemophilia, Red-green colour blindness.
• ABO Blood Group Codominance: Universal donor = Group O (no antigens); Universal recipient = Group AB (no antibodies).

3. Evolution Theories:
• Lamarckism: Inheritance of acquired characteristics via use and disuse (disproved).
• Darwinism: Natural selection and survival of the fittest driven by heritable genetic variation.`,
  ],
  pastPaperId: 'pq-jamb-biology',
  pastPaperTitle: 'JAMB UTME Biology Past Questions & Official Answers (40 Questions)',
  pastPaperYear: '2024',
  pastPaperSummary:
    'Complete 40-question JAMB UTME Biology paper with verified answers covering Excretion, Genetics, Cell Biology, Nutrition, Physiology, and Ecology.',
  questions: [
    {
      topic: 'Excretory Systems',
      question:
        'Which of the following correctly pairs an organism with its specialized excretory structure?',
      options: [
        'Cockroach — Nephridium',
        'Flatworm (Planaria) — Flame cell',
        'Earthworm — Malpighian tubule',
        'Amoeba — Green gland',
      ],
      correctOptionIndex: 1,
      explanation:
        'Platyhelminthes (flatworms like Planaria and Tapeworm) excrete via flame cells. Insects use Malpighian tubules, earthworms use nephridia, and Amoeba uses a contractile vacuole.',
    },
    {
      topic: 'Mendelian Genetics & Blood Groups',
      question:
        'A man with heterozygous blood group A (I^A i) marries a woman with heterozygous blood group B (I^B i). What is the probability that their first child will have blood group O?',
      options: ['0%', '25%', '50%', '75%'],
      correctOptionIndex: 1,
      explanation:
        'Crossing I^A i × I^B i yields four equally likely genotypes: I^A I^B (AB), I^A i (A), I^B i (B), and ii (Group O). Probability of ii = 1/4 = 25%.',
    },
    {
      topic: 'Photosynthesis',
      question:
        'During the light-dependent stage of photosynthesis, the oxygen gas evolved comes directly from the photolysis of:',
      options: [
        'Carbon(IV) oxide',
        'Water molecules',
        'Chlorophyll a',
        'Phosphoglyceric acid',
      ],
      correctOptionIndex: 1,
      explanation:
        'Radiolabelled isotope experiments confirm that light energy splits water (2H2O → 4H⁺ + 4e⁻ + O2) in the grana; CO2 is reduced during the dark stage.',
    },
    {
      topic: 'Homeostasis & Hormones',
      question:
        'Insufficient secretion of Antidiuretic Hormone (ADH) by the posterior pituitary gland results in a condition known as:',
      options: [
        'Diabetes mellitus',
        'Diabetes insipidus',
        'Cretinism',
        'Oedema',
      ],
      correctOptionIndex: 1,
      explanation:
        'ADH increases water permeability of the distal tubules and collecting ducts. Deficiency causes copious excretion of dilute, sugar-free urine (Diabetes insipidus), whereas insulin deficiency causes Diabetes mellitus.',
    },
    {
      topic: 'Ecology',
      question:
        'Which ecological instrument is used to measure the turbidity or depth of light penetration in an aquatic habitat?',
      options: ['Hydrometer', 'Hygrometer', 'Secchi disc', 'Potometer'],
      correctOptionIndex: 2,
      explanation:
        'A Secchi disc (black-and-white weighted circular plate) measures water transparency/turbidity; potometer measures transpiration rate; hygrometer measures relative humidity.',
    },
    {
      topic: 'Cell Biology & Osmosis',
      question:
        'When a red blood cell is placed in distilled water, it swells and bursts. This phenomenon is termed:',
      options: ['Plasmolysis', 'Crenation', 'Haemolysis', 'Turgidity'],
      correctOptionIndex: 2,
      explanation:
        'Distilled water is hypotonic to red blood cell cytoplasm. Water enters by endosmosis and, because animal cells lack a rigid cellulose wall, the membrane ruptures (haemolysis).',
    },
    {
      topic: 'Classification of Living Things',
      question:
        'Which group of organisms lacks a nuclear membrane and membrane-bound organelles (prokaryotes)?',
      options: ['Protozoa', 'Fungi', 'Monera (Bacteria & Blue-green algae)', 'Bryophyta'],
      correctOptionIndex: 2,
      explanation:
        'Kingdom Monera comprises prokaryotic unicellular organisms (bacteria and cyanobacteria) whose genetic material lies naked in the nucleoid.',
    },
    {
      topic: 'Viruses',
      question:
        'Viruses are regarded as being on the borderline between living and non-living things because they:',
      options: [
        'Carry out aerobic respiration outside host cells',
        'Can crystallize outside living cells and reproduce only inside living host cells',
        'Possess both cell wall and chloroplasts',
        'Grow on sterile agar nutrient media',
      ],
      correctOptionIndex: 1,
      explanation:
        'Outside a living cell a virus forms inert crystals, whereas inside a host cell it replicates its nucleic acid (DNA or RNA).',
    },
    {
      topic: 'Cell Organelles',
      question:
        'Which cell organelle is the primary site of protein synthesis?',
      options: ['Mitochondrion', 'Ribosome', 'Lysosome', 'Centriole'],
      correctOptionIndex: 1,
      explanation:
        'Ribosomes translate messenger RNA (mRNA) codons into polypeptide chains during protein synthesis.',
    },
    {
      topic: 'Cell Division',
      question:
        'Reduction division that halves the diploid chromosome number (2n → n) during gamete formation is called:',
      options: ['Mitosis', 'Meiosis', 'Binary fission', 'Budding'],
      correctOptionIndex: 1,
      explanation:
        'Meiosis produces four haploid (n) daughter gametes and introduces genetic variation through crossing over at Prophase I.',
    },
    {
      topic: 'Plant Kingdom',
      question:
        'Mosses and liverworts (Bryophytes) are often described as the amphibians of the plant kingdom because they:',
      options: [
        'Produce large woody cones',
        'Require external water for the swimming of flagellated male gametes during fertilization',
        'Possess well-developed xylem vessels',
        'Bear enclosed seeds inside fruits',
      ],
      correctOptionIndex: 1,
      explanation:
        'Bryophytes live in moist habitats and depend on a film of water for antherozoids to swim to the archegonium.',
    },
    {
      topic: 'Arthropods',
      question:
        'Which class of Arthropoda is characterized by two body divisions (cephalothorax and abdomen), four pairs of walking legs, and NO antennae?',
      options: ['Insecta', 'Crustacea', 'Arachnida', 'Myriapoda'],
      correctOptionIndex: 2,
      explanation:
        'Arachnids (spiders, scorpions, ticks) have 8 walking legs (4 pairs), a cephalothorax + abdomen, simple eyes, and no antennae.',
    },
    {
      topic: 'Food Tests & Biochemistry',
      question:
        'Addition of sodium hydroxide solution followed by a few drops of 1% copper(II) tetraoxosulphate(VI) solution (Biuret test) gives a violet/purple colour in the presence of:',
      options: ['Starch', 'Glucose', 'Proteins', 'Fats and oils'],
      correctOptionIndex: 2,
      explanation:
        'Peptide bonds in proteins form a characteristic violet/purple coordination complex with alkaline Cu²⁺ ions in the Biuret test.',
    },
    {
      topic: 'Vitamins & Deficiency Diseases',
      question:
        'Bleeding gums and poor wound healing (scurvy) result from a dietary deficiency of:',
      options: ['Vitamin A (Retinol)', 'Vitamin B1 (Thiamine)', 'Vitamin C (Ascorbic acid)', 'Vitamin D (Calciferol)'],
      correctOptionIndex: 2,
      explanation:
        'Vitamin C is essential for collagen synthesis; deficiency causes scurvy (Vitamin A → night blindness, B1 → beriberi, D → rickets).',
    },
    {
      topic: 'Mammalian Dentition',
      question:
        'The space lacking canine teeth between the incisors and premolars in herbivorous mammals such as rabbits and sheep is the:',
      options: ['Carnassial gap', 'Diastema', 'Pulp cavity', 'Maxillary cleft'],
      correctOptionIndex: 1,
      explanation:
        'The diastema allows herbivores to manipulate plant material with the tongue during continuous grinding by cheek teeth.',
    },
    {
      topic: 'Digestive Enzymes',
      question:
        'Which enzyme in human gastric juice initiates the digestion of proteins in the acidic medium of the stomach?',
      options: ['Ptyalin', 'Pepsin', 'Trypsin', 'Lipase'],
      correctOptionIndex: 1,
      explanation:
        'Pepsinogen is activated by gastric HCl (pH ~2) into pepsin, which hydrolyses proteins into peptones and polypeptides.',
    },
    {
      topic: 'Plant Vascular Tissues',
      question:
        'Upward conduction of water and dissolved mineral salts from roots to leaves takes place through the:',
      options: ['Phloem sieve tubes', 'Xylem vessels', 'Cambium ring', 'Cortex parenchyma'],
      correctOptionIndex: 1,
      explanation:
        'Lignified dead xylem vessels transport water and minerals upwards via root pressure, capillarity, and transpiration pull.',
    },
    {
      topic: 'Transpiration',
      question:
        'Which instrument is used in the laboratory to measure the rate of transpiration in a leafy shoot?',
      options: ['Auxanometer', 'Potometer', 'Photometer', 'Anemometer'],
      correctOptionIndex: 1,
      explanation:
        'A potometer measures water uptake by a cut leafy shoot per unit time as a direct indicator of transpiration rate.',
    },
    {
      topic: 'Mammalian Circulatory System',
      question:
        'Which blood vessel in mammals carries oxygenated blood directly from the lungs back to the left atrium of the heart?',
      options: ['Pulmonary artery', 'Pulmonary vein', 'Hepatic portal vein', 'Superior vena cava'],
      correctOptionIndex: 1,
      explanation:
        'The pulmonary vein is the unique vein that transports freshly oxygenated blood from the lungs to the left atrium.',
    },
    {
      topic: 'Blood Clotting',
      question:
        'Which component of mammalian blood initiates the blood-clotting cascade when a blood vessel is injured?',
      options: ['Erythrocytes', 'Lymphocytes', 'Thrombocytes (Platelets)', 'Monocytes'],
      correctOptionIndex: 2,
      explanation:
        'Platelets (thrombocytes) release thromboplastin in the presence of Ca²⁺ and Vitamin K, converting prothrombin to thrombin and fibrinogen to fibrin.',
    },
    {
      topic: 'Cellular Respiration',
      question:
        'Anaerobic respiration (fermentation) of glucose by yeast cells produces energy (ATP) along with:',
      options: [
        'Lactic acid only',
        'Ethanol and carbon(IV) oxide',
        'Water and carbon(IV) oxide',
        'Pyruvic acid and oxygen',
      ],
      correctOptionIndex: 1,
      explanation:
        'Alcoholic fermentation in yeast/plants yields C2H5OH + CO2 + 2 ATP (whereas anaerobic respiration in vertebrate muscle produces lactic acid).',
    },
    {
      topic: 'Respiratory Organs',
      question:
        'Gaseous exchange in adult insects such as the grasshopper occurs directly through a branching network of:',
      options: ['Book lungs', 'Gills', 'Tracheae and tracheoles', 'Moist skin'],
      correctOptionIndex: 2,
      explanation:
        'Air enters through spiracles and diffuses through tracheal tubes and fluid-tipped tracheoles directly to insect tissues.',
    },
    {
      topic: 'Mammalian Kidney',
      question:
        'In a healthy human nephron, complete selective reabsorption of glucose and amino acids occurs in the:',
      options: [
        'Glomerulus',
        'Proximal convoluted tubule',
        'Collecting duct',
        'Ureter',
      ],
      correctOptionIndex: 1,
      explanation:
        'Cells of the proximal convoluted tubule possess microvilli and abundant mitochondria to actively reabsorb 100% of filtered glucose and amino acids.',
    },
    {
      topic: 'Liver Functions',
      question:
        'Excess amino acids cannot be stored in the mammalian body and are broken down into urea in the liver by a process called:',
      options: ['Emulsification', 'Deamination', 'Detoxification', 'Transamination'],
      correctOptionIndex: 1,
      explanation:
        'Deamination removes the amino group (-NH2) from excess amino acids and converts toxic ammonia into urea via the ornithine cycle.',
    },
    {
      topic: 'Skeletal System',
      question:
        'Which cervical vertebra possesses a prominent peg-like odontoid process on which the skull pivots to allow shaking the head?',
      options: ['Atlas', 'Axis', 'Thoracic vertebra', 'Lumbar vertebra'],
      correctOptionIndex: 1,
      explanation:
        'The Axis (second cervical vertebra) bears the odontoid process that articulates with the Atlas (first cervical vertebra).',
    },
    {
      topic: 'Nervous System — Brain',
      question:
        'Which part of the mammalian hindbrain coordinates muscular balance, posture, and precision of voluntary movements?',
      options: ['Cerebrum', 'Cerebellum', 'Hypothalamus', 'Olfactory lobe'],
      correctOptionIndex: 1,
      explanation:
        'The cerebellum receives proprioceptive and semicircular canal impulses to maintain posture and muscular coordination.',
    },
    {
      topic: 'Sense Organs — Mammalian Ear',
      question:
        'Which structure in the mammalian ear equalizes air pressure on both sides of the tympanic membrane (eardrum)?',
      options: ['Cochlea', 'Eustachian tube', 'Semicircular canals', 'Oval window'],
      correctOptionIndex: 1,
      explanation:
        'The Eustachian tube connects the middle ear cavity to the pharynx, equalizing atmospheric pressure across the eardrum.',
    },
    {
      topic: 'Plant Growth Hormones',
      question:
        'Unilateral illumination causes plant shoots to bend towards the light (positive phototropism) because auxins:',
      options: [
        'Accumulate on the illuminated side and inhibit elongation',
        'Migrate to the shaded side and stimulate faster cell elongation there',
        'Are completely destroyed throughout the root tip',
        'Cause guard cells to close permanently',
      ],
      correctOptionIndex: 1,
      explanation:
        'Higher auxin (IAA) concentration on the shaded side of a stem promotes rapid cell elongation, bending the shoot towards light.',
    },
    {
      topic: 'Flowering Plant Reproduction',
      question:
        'Double fertilization in angiosperms involves one male nucleus fusing with the egg cell to form the diploid zygote, while the second male nucleus fuses with two polar nuclei to form the:',
      options: ['Testa', 'Pericarp', 'Triploid endosperm nucleus (3n)', 'Pollen tube'],
      correctOptionIndex: 2,
      explanation:
        'Triple fusion (n + 2n) creates the 3n primary endosperm nucleus, which develops into nutritive endosperm tissue.',
    },
    {
      topic: 'Seed Germination',
      question:
        'Germination in which the cotyledons are carried above the soil surface due to rapid elongation of the hypocotyl (as in cowpea/bean) is:',
      options: ['Hypogeal germination', 'Epigeal germination', 'Viviparous germination', 'Parthenocarpy'],
      correctOptionIndex: 1,
      explanation:
        'In epigeal germination (e.g., cowpea, castor oil), hypocotyl elongation lifts cotyledons above ground; in maize (hypogeal), cotyledon remains underground.',
    },
    {
      topic: 'Insect Metamorphosis',
      question:
        'Which of the following insects undergoes incomplete (hemimetabolous) metamorphosis (Egg → Nymph → Adult)?',
      options: ['Housefly', 'Mosquito', 'Butterfly', 'Cockroach'],
      correctOptionIndex: 3,
      explanation:
        'Cockroaches, grasshoppers, and termites lack a pupal stage and develop via Egg → Nymph → Adult.',
    },
    {
      topic: 'Ecological Associations',
      question:
        'A lichen growing on bare rock represents a mutualistic (symbiotic) association between:',
      options: [
        'A bacterium and a virus',
        'An alga and a fungus',
        'A moss and a fern',
        'Two parasitic flowering plants',
      ],
      correctOptionIndex: 1,
      explanation:
        'In lichens, the photosynthetic alga supplies organic carbohydrates while the fungal mycelium provides water, minerals, and protection.',
    },
    {
      topic: 'Nitrogen Cycle',
      question:
        'Which soil bacteria convert ammonium compounds first into nitrites and then into nitrates (nitrification)?',
      options: [
        'Pseudomonas denitrificans',
        'Nitrosomonas and Nitrobacter',
        'Clostridium and Azotobacter',
        'Escherichia coli',
      ],
      correctOptionIndex: 1,
      explanation:
        'Nitrosomonas oxidizes ammonium (NH4⁺) to nitrite (NO2⁻), and Nitrobacter oxidizes nitrite to nitrate (NO3⁻).',
    },
    {
      topic: 'Food Chains & Trophic Levels',
      question:
        'In any terrestrial ecosystem, the organisms with the largest total available energy at the base of the pyramid of energy are the:',
      options: ['Tertiary consumers', 'Secondary consumers', 'Primary consumers (herbivores)', 'Autotrophic producers (green plants)'],
      correctOptionIndex: 3,
      explanation:
        'Producers capture solar energy directly; roughly 90% of energy is lost as heat/respiration at each successive trophic transfer.',
    },
    {
      topic: 'Mendelian Monohybrid Cross',
      question:
        'When two heterozygous tall pea plants (Tt × Tt) are self-crossed, what is the expected genotypic ratio in the F2 generation?',
      options: ['3 : 1', '1 : 2 : 1', '9 : 3 : 3 : 1', '1 : 1'],
      correctOptionIndex: 1,
      explanation:
        'Tt × Tt produces 1 TT : 2 Tt : 1 tt (genotypic ratio 1:2:1; phenotypic ratio 3 tall : 1 dwarf).',
    },
    {
      topic: 'Sex-Linked Inheritance',
      question:
        'Which of the following human hereditary conditions is a sex-linked recessive trait carried on the X-chromosome?',
      options: ['Albinism', 'Sickle-cell anaemia', 'Haemophilia', 'Tongue rolling'],
      correctOptionIndex: 2,
      explanation:
        'Haemophilia and red-green colour blindness are X-linked recessive traits, whereas sickle-cell anaemia and albinism are autosomal recessive.',
    },
    {
      topic: 'Nucleic Acids (DNA & RNA)',
      question:
        'In a double-stranded DNA molecule, Adenine (A) always pairs via two hydrogen bonds with:',
      options: ['Uracil (U)', 'Cytosine (C)', 'Guanine (G)', 'Thymine (T)'],
      correctOptionIndex: 3,
      explanation:
        'Complementary base pairing in DNA links Adenine with Thymine (A=T) and Guanine with Cytosine (G≡C); Uracil replaces Thymine only in RNA.',
    },
    {
      topic: 'Variation',
      question:
        'Which of the following traits in human populations is an example of discontinuous (physiological) variation?',
      options: ['Body height', 'Body weight', 'ABO blood group', 'Skin pigmentation'],
      correctOptionIndex: 2,
      explanation:
        'ABO blood groups (A, B, AB, O), rhesus factor, and tongue-rolling have distinct classes with no intermediates (discontinuous variation).',
    },
    {
      topic: 'Adaptations of Xerophytes',
      question:
        'Desert plants such as Cactus (Opuntia) conserve water primarily by:',
      options: [
        'Possessing broad thin leaves with numerous exposed stomata',
        'Reducing leaves to spines and storing water in succulent photosynthetic stems',
        'Having poorly developed shallow root systems',
        'Lacking a waxy cuticle',
      ],
      correctOptionIndex: 1,
      explanation:
        'Reducing leaves to spines drastically cuts transpirational surface area while thick green succulent stems store water and photosynthesize.',
    },
    {
      topic: 'Organic Evolution',
      question:
        'Structures in different vertebrates—such as the human forelimb, whale flipper, and bat wing—that share a common embryonic and skeletal origin despite performing different functions are:',
      options: ['Analogous structures', 'Homologous structures', 'Vestigial organs', 'Mutant appendages'],
      correctOptionIndex: 1,
      explanation:
        'Pentadactyl vertebrate forelimbs are homologous structures illustrating divergent evolution (adaptive radiation) from a common ancestor.',
    },
  ],
};
