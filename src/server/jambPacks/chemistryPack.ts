import { SubjectPack } from './types';

export const CHEMISTRY_PACK: SubjectPack = {
  subjectId: 'chemistry',
  subjectName: 'Chemistry',
  iconName: 'science',
  description:
    'JAMB UTME Chemistry syllabus (40 CBT questions · 40 mins): Separation techniques, Gas laws, Stoichiometry, Atomic structure, Electrolysis, Chemical equilibrium, and Organic Chemistry.',
  materialId: 'mat-jamb-chemistry-syllabus',
  materialTitle: 'JAMB UTME Chemistry Syllabus Study Guide',
  materialSummary:
    'Complete JAMB Chemistry revision notes covering Separation Techniques, Gas Laws, Stoichiometry, Electrolysis, Equilibrium, and Organic Chemistry.',
  materialSections: [
    `Section 1: Separation of Mixtures, Kinetic Theory & Gas Laws (JAMB Syllabus)

1. Separation Techniques & Purity Criteria:
• Pure substances exhibit sharp, fixed melting and boiling points; impurities lower melting points and elevate boiling points.
• Fractional Distillation separates miscible liquids with close boiling points (e.g., crude oil fractions, ethanol-water mixture, liquid air).
• Chromatography separates solutes based on differential adsorption and solubility (e.g., leaf pigments, amino acids, ink dyes).
• Sublimation separates solids that vaporize directly on heating: Ammonium chloride (NH4Cl), Iodine (I2), Camphor, and Naphthalene.

2. Gas Laws & Graham's Law of Diffusion:
• Boyle's Law (constant T): P1V1 = P2V2
• Charles' Law (constant P): V1 / T1 = V2 / T2 (Temperature MUST be in Kelvin: K = °C + 273)
• General Gas Equation: (P1V1) / T1 = (P2V2) / T2
• Ideal Gas Equation: PV = nRT; Molar volume at s.t.p. = 22.4 dm³.
• Graham's Law: The rate of diffusion (r) of a gas is inversely proportional to the square root of its vapour density (d) or molar mass (M):
  r1 / r2 = √(M2 / M1) = √(d2 / d1), where Molar Mass M = 2 × Vapour Density.`,

    `Section 2: Atomic Structure, Periodic Table & Chemical Bonding

1. Atomic Orbitals & Quantum Rules:
• Principal shells (K, L, M, N) hold a maximum of 2n² electrons.
• Aufbau Principle: Electrons fill lower-energy subshells first (1s < 2s < 2p < 3s < 3p < 4s < 3d). Note exceptions in Chromium ([Ar] 3d5 4s1) and Copper ([Ar] 3d10 4s1) due to half-filled and fully-filled d-subshell stability.
• Isotopes share the same atomic number (protons) but differ in mass number (neutrons), e.g., Cl-35 (75%) and Cl-37 (25%) → Relative Atomic Mass = (35×0.75) + (37×0.25) = 35.5.

2. Periodicity Trends Across Period & Down Group:
• Across a period (Left → Right): Ionization energy increases, electronegativity increases, atomic radius decreases, metallic character decreases.
• Down a group (Top → Bottom): Atomic radius increases, ionization energy decreases, electropositivity increases.

3. Bonding & Intermolecular Forces:
• Electrovalent (Ionic) Bond: Electron transfer between metals and non-metals (ΔEN large); high melting points, conduct electricity in molten/aqueous states.
• Coordinate (Dative) Bond: Shared electron pair donated by one atom (e.g., NH4+, H3O+).
• Hydrogen Bonding explains the unusually high boiling point of H2O, HF, and NH3.`,

    `Section 3: Acids, Bases, Electrolysis & Chemical Equilibrium

1. Acids, Bases, pH & Salts:
• pH = -log10[H+], pOH = -log10[OH-], and pH + pOH = 14 at 25°C.
• Indicators: Methyl orange (acid-strong base or strong acid-weak base), Phenolphthalein (weak acid-strong base), Litmus (strong acid-strong base).
• Efflorescent salts lose water of crystallization to the atmosphere (Na2CO3·10H2O); Deliquescent compounds absorb moisture to form solutions (NaOH, CaCl2, KOH); Hygroscopic substances absorb moisture without dissolving (conc. H2SO4, CaO, CuO).

2. Faraday's Laws of Electrolysis:
• 1 Faraday (F) = 96,500 Coulombs = 1 mole of electrons.
• Mass deposited: m = (I × t × M) / (n × F), where I = current (A), t = time (s), M = molar mass, n = charge on ion (valency).
• Preferential discharge depends on: Position in Electrochemical Series, Concentration of ions, and Nature of Electrodes.

3. Le Chatelier's Principle & Energetics:
• Endothermic reaction (ΔH > 0): Favoured by increasing temperature.
• Exothermic reaction (ΔH < 0, e.g., Haber Process N2 + 3H2 ⇌ 2NH3): Favoured by lower temperature and high pressure (fewer gas moles on product side).
• Catalysts lower activation energy (Ea) equally for forward and reverse reactions without shifting equilibrium position.`,

    `Section 4: Organic Chemistry & Industrial Processes (JAMB Focus)

1. Homologous Series & Functional Groups:
• Alkanes (CnH2n+2, sp3 tetrahedral, saturated): Undergo substitution (halogenation in UV light) and combustion.
• Alkenes (CnH2n, sp2 planar, C=C): Decolourize bromine water and acidified KMnO4; undergo addition reactions and polymerization.
• Alkynes (CnH2n-2, sp linear, C≡C): Terminal alkynes (e.g., ethyne) react with ammoniacal AgNO3 or ammoniacal CuCl to form precipitates (distinguishes ethyne from ethene).
• Alkanols (-OH): Primary alkanols oxidize first to Alkanals (-CHO) and then to Alkanoic acids (-COOH); Secondary alkanols oxidize to Alkanones (-CO-); Tertiary alkanols resist mild oxidation.

2. Key Organic Reactions:
• Esterification: Alkanol + Alkanoic Acid ⇌ Alkyl Alkanoate (sweet-smelling ester) + H2O (conc. H2SO4 catalyst).
• Saponification: Alkaline hydrolysis of fats/esters using NaOH or KOH to yield Soap (sodium/potassium salt of fatty acid) + Propane-1,2,3-triol (glycerol).`,
  ],
  pastPaperId: 'pq-jamb-chemistry',
  pastPaperTitle: 'JAMB UTME Chemistry Past Questions & Official Answers (40 Questions)',
  pastPaperYear: '2024',
  pastPaperSummary:
    'Complete 40-question JAMB UTME Chemistry paper with verified answer keys and stoichiometric derivations.',
  questions: [
    {
      topic: 'Electrolysis & Faraday Laws',
      question:
        'Calculate the mass of copper deposited when a current of 2.0 A is passed through aqueous copper(II) tetraoxosulphate(VI) solution for 32 minutes 10 seconds. [Cu = 64, 1 F = 96,500 C]',
      options: ['0.64 g', '1.28 g', '2.56 g', '3.20 g'],
      correctOptionIndex: 1,
      explanation:
        'Time t = (32 × 60) + 10 = 1930 s. Quantity of electricity Q = I × t = 2.0 × 1930 = 3860 C. For Cu²⁺ + 2e⁻ → Cu, n = 2. Mass m = (Q × M) / (n × F) = (3860 × 64) / (2 × 96500) = 1.28 g.',
    },
    {
      topic: 'Gas Laws & Diffusion',
      question:
        'If 50 cm³ of hydrogen gas diffuses through a porous plug in 10 seconds, how long will it take 50 cm³ of oxygen gas to diffuse through the same plug under identical conditions? [H = 1, O = 16]',
      options: ['20 seconds', '30 seconds', '40 seconds', '80 seconds'],
      correctOptionIndex: 2,
      explanation:
        'Molar mass of H2 = 2 g/mol; Molar mass of O2 = 32 g/mol. For equal volumes, t(O2) / t(H2) = √(M(O2) / M(H2)) = √(32 / 2) = √16 = 4. Thus t(O2) = 4 × 10 s = 40 seconds.',
    },
    {
      topic: 'Organic Chemistry',
      question:
        'Which of the following reagents can be used to distinguish between ethyne and ethene in the laboratory?',
      options: [
        'Bromine water',
        'Acidified potassium tetraoxomanganate(VII)',
        'Ammoniacal silver trioxonitrate(V) solution',
        'Fehling’s solution',
      ],
      correctOptionIndex: 2,
      explanation:
        'Both ethene and ethyne decolourize bromine water and acidified KMnO4, whereas terminal alkynes like ethyne form a pale yellow/white precipitate of silver dicarbide with ammoniacal AgNO3.',
    },
    {
      topic: 'Chemical Equilibrium',
      question:
        'In the Haber process: N2(g) + 3H2(g) ⇌ 2NH3(g), ΔH = -92 kJ/mol. Which set of conditions maximizes the equilibrium yield of ammonia?',
      options: [
        'High temperature and low pressure',
        'Low temperature and high pressure',
        'High temperature and high pressure',
        'Adding finely divided iron to shift equilibrium right',
      ],
      correctOptionIndex: 1,
      explanation:
        'Forward reaction is exothermic (ΔH < 0) and proceeds with a decrease in gas volume (4 moles → 2 moles). By Le Chatelier’s principle, low temperature and high pressure shift equilibrium to the right.',
    },
    {
      topic: 'Acids, Bases & pH',
      question:
        'What is the pH of a 0.001 mol/dm³ solution of sodium hydroxide (NaOH) at 25°C?',
      options: ['3', '7', '11', '12'],
      correctOptionIndex: 2,
      explanation:
        '[OH⁻] = 0.001 = 10⁻³ mol/dm³. pOH = -log10(10⁻³) = 3. Since pH + pOH = 14, pH = 14 - 3 = 11.',
    },
    {
      topic: 'Atomic Structure & Bonding',
      question:
        'An element X has atomic number 17 and combines with an element Y of atomic number 20. What is the chemical formula and bond type of the compound formed?',
      options: [
        'YX2, electrovalent',
        'Y2X, covalent',
        'YX, electrovalent',
        'YX2, covalent',
      ],
      correctOptionIndex: 0,
      explanation:
        'Y (Z = 20, Calcium: 2,8,8,2) loses 2 electrons to form Y²⁺; X (Z = 17, Chlorine: 2,8,7) gains 1 electron to form X⁻. Formula is YX2 (CaCl2) with electrovalent (ionic) bonding.',
    },
    {
      topic: 'Separation Techniques',
      question:
        'A mixture of ammonium chloride and sodium chloride can best be separated by:',
      options: ['Crystallization', 'Sublimation', 'Filtration', 'Fractional distillation'],
      correctOptionIndex: 1,
      explanation:
        'Ammonium chloride (NH4Cl) sublimes directly from solid to vapour on heating, leaving non-volatile sodium chloride (NaCl) behind.',
    },
    {
      topic: 'Separation & Purity',
      question:
        'Which separation technique is used to isolate the different coloured pigments present in green chlorophyll extract?',
      options: ['Paper chromatography', 'Centrifugation', 'Simple distillation', 'Decantation'],
      correctOptionIndex: 0,
      explanation:
        'Paper chromatography separates complex mixtures of coloured dyes and leaf pigments based on differential rates of migration and solubility.',
    },
    {
      topic: 'Gas Laws',
      question:
        'A fixed mass of gas occupies 300 cm³ at 27°C. At what Celsius temperature will its volume double if the pressure remains constant?',
      options: ['54°C', '300°C', '327°C', '600°C'],
      correctOptionIndex: 2,
      explanation:
        'By Charles’ Law, V1/T1 = V2/T2. T1 = 27 + 273 = 300 K; V2 = 600 cm³. T2 = 300 × (600 / 300) = 600 K. In Celsius: 600 - 273 = 327°C.',
    },
    {
      topic: 'General Gas Equation',
      question:
        'A gas occupies 400 cm³ at 760 mmHg and 27°C. Calculate its volume at s.t.p. [Standard pressure = 760 mmHg, Standard temperature = 273 K]',
      options: ['364 cm³', '400 cm³', '439 cm³', '546 cm³'],
      correctOptionIndex: 0,
      explanation:
        'Since P1 = P2 = 760 mmHg, V2 = V1 × (T2 / T1) = 400 × (273 / 300) = 364 cm³.',
    },
    {
      topic: 'Stoichiometry & Empirical Formula',
      question:
        'An organic hydrocarbon contains 85.7% carbon and 14.3% hydrogen by mass. What is its empirical formula? [C = 12, H = 1]',
      options: ['CH', 'CH2', 'CH3', 'C2H6'],
      correctOptionIndex: 1,
      explanation:
        'Mole ratio: C = 85.7 / 12 = 7.14; H = 14.3 / 1 = 14.3. Dividing by 7.14 gives C : H = 1 : 2, so empirical formula is CH2.',
    },
    {
      topic: 'Stoichiometry & Gas Volumes',
      question:
        'What volume of oxygen at s.t.p. is required for the complete combustion of 2.0 moles of methane (CH4)? [Molar volume at s.t.p. = 22.4 dm³]',
      options: ['22.4 dm³', '44.8 dm³', '67.2 dm³', '89.6 dm³'],
      correctOptionIndex: 3,
      explanation:
        'CH4 + 2O2 → CO2 + 2H2O. 1 mole of CH4 requires 2 moles of O2, so 2.0 moles of CH4 require 4.0 moles of O2. Volume = 4.0 × 22.4 dm³ = 89.6 dm³.',
    },
    {
      topic: 'Isotopy & Atomic Mass',
      question:
        'Naturally occurring chlorine consists of 75% ³⁵Cl and 25% ³⁷Cl. Calculate the relative atomic mass of chlorine.',
      options: ['35.0', '35.5', '36.0', '36.5'],
      correctOptionIndex: 1,
      explanation:
        'RAM = (35 × 0.75) + (37 × 0.25) = 26.25 + 9.25 = 35.5.',
    },
    {
      topic: 'Electronic Configuration',
      question:
        'What is the ground-state electronic configuration of the chromium atom (Z = 24)?',
      options: [
        '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁴ 4s²',
        '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁵ 4s¹',
        '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶',
        '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 4p⁴',
      ],
      correctOptionIndex: 1,
      explanation:
        'Chromium (Z = 24) achieves extra exchange stability with a half-filled 3d⁵ subshell: [Ar] 3d⁵ 4s¹.',
    },
    {
      topic: 'Periodic Table Trends',
      question:
        'Across a period from left to right in the Periodic Table, the first ionization energy generally:',
      options: [
        'Decreases due to increasing atomic radius',
        'Increases due to increasing nuclear charge and decreasing atomic radius',
        'Remains constant across all main-group elements',
        'Decreases because shielding increases rapidly',
      ],
      correctOptionIndex: 1,
      explanation:
        'Moving left to right across a period, protons are added to the same principal shell, increasing effective nuclear charge and pulling valence electrons closer.',
    },
    {
      topic: 'Chemical Bonding',
      question:
        'The type of bond formed when an ammonia molecule (NH3) combines with a hydrogen ion (H⁺) to form the ammonium ion (NH4⁺) is:',
      options: ['Metallic bond', 'Van der Waals force', 'Coordinate (dative) covalent bond', 'Purely ionic bond'],
      correctOptionIndex: 2,
      explanation:
        'Nitrogen in NH3 donates its lone pair of electrons into the empty 1s orbital of H⁺, forming a coordinate (dative) covalent bond.',
    },
    {
      topic: 'Intermolecular Forces',
      question:
        'Water (H2O, molar mass 18) boils at 100°C whereas hydrogen sulphide (H2S, molar mass 34) is a gas at room temperature primarily because of:',
      options: [
        'Covalent bonding in H2S',
        'Intermolecular hydrogen bonding in H2O',
        'Ionic bonding in H2O',
        'Dipole-induced dipole attraction in H2S',
      ],
      correctOptionIndex: 1,
      explanation:
        'Strong intermolecular hydrogen bonds between highly polar O–H groups in water require substantial thermal energy to break.',
    },
    {
      topic: 'Oxidation Numbers',
      question:
        'Determine the oxidation state of manganese in potassium tetraoxomanganate(VII), KMnO4.',
      options: ['+2', '+4', '+6', '+7'],
      correctOptionIndex: 3,
      explanation:
        'Let oxidation state of Mn = x. (+1) + x + 4(-2) = 0 ⇒ 1 + x - 8 = 0 ⇒ x = +7.',
    },
    {
      topic: 'Redox Reactions',
      question:
        'In the reaction H2S + Cl2 → 2HCl + S, which substance acts as the reducing agent?',
      options: ['Cl2', 'H2S', 'HCl', 'S'],
      correctOptionIndex: 1,
      explanation:
        'Sulphur in H2S is oxidized from -2 to 0 in S, while reducing Cl2 from 0 to -1. Therefore H2S is the reducing agent.',
    },
    {
      topic: 'Salts & Water of Crystallization',
      question:
        'Washing soda crystals (Na2CO3·10H2O) lose nine molecules of water of crystallization on exposure to dry air. This property is called:',
      options: ['Deliquescence', 'Efflorescence', 'Hygroscopy', 'Fluorescence'],
      correctOptionIndex: 1,
      explanation:
        'Efflorescence is the spontaneous loss of water of crystallization by a hydrated salt when exposed to the atmosphere.',
    },
    {
      topic: 'Acid-Base Titration',
      question:
        'Which indicator is most suitable for the titration of ethanoic acid (CH3COOH) against sodium hydroxide (NaOH) solution?',
      options: ['Methyl orange', 'Methyl red', 'Phenolphthalein', 'Screened methyl orange'],
      correctOptionIndex: 2,
      explanation:
        'Titrating a weak acid (ethanoic acid) against a strong base (NaOH) has an equivalence point in the alkaline range (pH 8–10), matching phenolphthalein.',
    },
    {
      topic: 'Volumetric Analysis',
      question:
        '25.0 cm³ of 0.10 mol/dm³ Na2CO3 completely neutralized 20.0 cm³ of HCl solution. Calculate the molar concentration of the HCl. [Na2CO3 + 2HCl → 2NaCl + H2O + CO2]',
      options: ['0.125 mol/dm³', '0.200 mol/dm³', '0.250 mol/dm³', '0.500 mol/dm³'],
      correctOptionIndex: 2,
      explanation:
        '(Ca × Va) / (Cb × Vb) = na / nb ⇒ (Ca × 20.0) / (0.10 × 25.0) = 2 / 1 ⇒ 20 Ca = 5.0 ⇒ Ca = 0.250 mol/dm³.',
    },
    {
      topic: 'Solubility',
      question:
        'If 12.0 g of potassium trioxochlorate(V) (KClO3) saturates 40 cm³ of water at 40°C, calculate its solubility in mol/dm³ at 40°C. [K = 39, Cl = 35.5, O = 16]',
      options: ['1.22 mol/dm³', '2.45 mol/dm³', '3.00 mol/dm³', '4.90 mol/dm³'],
      correctOptionIndex: 1,
      explanation:
        'Molar mass of KClO3 = 39 + 35.5 + 48 = 122.5 g/mol. Mass in 1000 cm³ = (12.0 / 40) × 1000 = 300 g/dm³. Solubility = 300 / 122.5 ≈ 2.45 mol/dm³.',
    },
    {
      topic: 'Rates of Chemical Reaction',
      question:
        'Powdered marble (CaCO3) reacts much faster with dilute HCl than marble chips of equal mass because powdering:',
      options: [
        'Lowers the enthalpy change of the reaction',
        'Increases the total surface area for effective collisions',
        'Increases the equilibrium constant Kc',
        'Raises the activation energy barrier',
      ],
      correctOptionIndex: 1,
      explanation:
        'Subdividing a solid reactant exposes far more particles per unit time, increasing collision frequency with H⁺ ions.',
    },
    {
      topic: 'Thermochemistry & Entropy',
      question:
        'A chemical reaction is guaranteed to be spontaneous at ALL temperatures when:',
      options: [
        'ΔH is positive and ΔS is negative',
        'ΔH is negative and ΔS is positive',
        'ΔH is positive and ΔS is positive',
        'ΔH is negative and ΔS is negative',
      ],
      correctOptionIndex: 1,
      explanation:
        'Gibbs free energy ΔG = ΔH - TΔS. When ΔH < 0 and ΔS > 0, ΔG is always negative regardless of temperature T.',
    },
    {
      topic: 'Electrochemistry',
      question:
        'During the electrolysis of concentrated sodium chloride solution (brine) using inert carbon electrodes, the gas liberated at the anode is:',
      options: ['Hydrogen', 'Oxygen', 'Chlorine', 'Sodium vapour'],
      correctOptionIndex: 2,
      explanation:
        'Although OH⁻ is lower in the electrochemical series than Cl⁻, the high concentration of Cl⁻ in brine causes preferential discharge of chlorine gas at the anode.',
    },
    {
      topic: 'Water Hardness',
      question:
        'Permanent hardness of water is caused by the presence of dissolved:',
      options: [
        'Calcium hydrogentrioxocarbonate(IV)',
        'Magnesium hydrogentrioxocarbonate(IV)',
        'Calcium tetraoxosulphate(VI)',
        'Sodium trioxocarbonate(IV)',
      ],
      correctOptionIndex: 2,
      explanation:
        'Soluble CaSO4 and MgSO4 (or chlorides) cause permanent hardness which cannot be removed by boiling, unlike Ca(HCO3)2.',
    },
    {
      topic: 'Air & Non-Metals',
      question:
        'Which noble gas is the most abundant in dry atmospheric air (approximately 0.93% by volume)?',
      options: ['Helium', 'Neon', 'Argon', 'Krypton'],
      correctOptionIndex: 2,
      explanation:
        'Argon makes up about 0.93% of dry air, making it by far the most abundant noble gas in Earth’s atmosphere.',
    },
    {
      topic: 'Allotropes of Carbon',
      question:
        'Graphite conducts electricity whereas diamond does not because graphite possesses:',
      options: [
        'Strong tetrahedral sp³ covalent bonds',
        'Delocalized mobile π-electrons between hexagonal layers',
        'Free interstitial metal cations',
        'A higher density than diamond',
      ],
      correctOptionIndex: 1,
      explanation:
        'Each carbon in graphite is sp² hybridized, leaving one unhybridized p-electron per atom delocalized across hexagonal planes.',
    },
    {
      topic: 'Industrial Chemistry — Contact Process',
      question:
        'Which catalyst is employed in the industrial manufacture of tetraoxosulphate(VI) acid (H2SO4) via the Contact Process?',
      options: [
        'Finely divided iron',
        'Vanadium(V) oxide (V2O5)',
        'Nickel metal',
        'Manganese(IV) oxide (MnO2)',
      ],
      correctOptionIndex: 1,
      explanation:
        'Vanadium(V) oxide (V2O5) catalyzes the reversible oxidation 2SO2 + O2 ⇌ 2SO3 at ~450°C in the Contact Process.',
    },
    {
      topic: 'Nitrogen & Compounds',
      question:
        'Which gas turns moist red litmus paper blue and forms dense white fumes with concentrated hydrochloric acid?',
      options: ['Sulphur(IV) oxide', 'Nitrogen(IV) oxide', 'Ammonia', 'Hydrogen sulphide'],
      correctOptionIndex: 2,
      explanation:
        'Ammonia (NH3) is the only common alkaline gas; it reacts with HCl vapour to form dense white fumes of solid NH4Cl.',
    },
    {
      topic: 'Extraction of Metals',
      question:
        'In the extraction of aluminium from purified bauxite (Al2O3) by electrolysis, molten cryolite (Na3AlF6) is added primarily to:',
      options: [
        'Prevent corrosion of the steel tank',
        'Lower the melting point of Al2O3 and improve conductivity',
        'Oxidize carbon anodes to carbon(IV) oxide',
        'Precipitate iron(III) oxide impurities',
      ],
      correctOptionIndex: 1,
      explanation:
        'Pure alumina melts above 2050°C; dissolving it in molten cryolite reduces the operating temperature to around 950°C.',
    },
    {
      topic: 'Alloys & Transition Metals',
      question:
        'Bronze is an alloy composed primarily of:',
      options: ['Copper and zinc', 'Copper and tin', 'Lead and tin', 'Iron and chromium'],
      correctOptionIndex: 1,
      explanation:
        'Bronze is an alloy of copper and tin (whereas brass is copper and zinc, and solder is lead and tin).',
    },
    {
      topic: 'IUPAC Organic Nomenclature',
      question:
        'What is the correct IUPAC name of the compound CH3–CH(CH3)–CH2–CH3?',
      options: ['Pentane', '2-methylbutane', '3-methylbutane', '2,2-dimethylpropane'],
      correctOptionIndex: 1,
      explanation:
        'Longest continuous carbon chain has 4 carbons (butane); numbering from the end nearer the branch places the methyl group at C-2: 2-methylbutane.',
    },
    {
      topic: 'Isomerism',
      question:
        'But-2-ene exhibits cis-trans (geometric) isomerism because of:',
      options: [
        'Free rotation around its C–C single bonds',
        'Restricted rotation about the carbon–carbon double bond (C=C)',
        'Presence of an asymmetric chiral carbon atom',
        'Presence of a triple bond',
      ],
      correctOptionIndex: 1,
      explanation:
        'Restricted rotation around the π-bond of C=C with two different groups (-H and -CH3) on each sp² carbon produces cis and trans isomers.',
    },
    {
      topic: 'Petroleum Chemistry',
      question:
        'The quality or anti-knock rating of petrol (gasoline) in internal combustion engines is measured by its:',
      options: ['Cetane number', 'Octane number', 'Saponification value', 'Iodine number'],
      correctOptionIndex: 1,
      explanation:
        'Octane number compares the anti-knock performance of petrol against mixtures of heptane (0) and 2,2,4-trimethylpentane / iso-octane (100).',
    },
    {
      topic: 'Alkanols & Oxidation',
      question:
        'Complete oxidation of propan-1-ol using excess acidified potassium heptaoxodichromate(VI) yields:',
      options: ['Propanone', 'Propanal', 'Propanoic acid', 'Propene'],
      correctOptionIndex: 2,
      explanation:
        'Primary alkanols (propan-1-ol) oxidize first to alkanals (propanal) and on refluxing with excess oxidizing agent yield alkanoic acids (propanoic acid).',
    },
    {
      topic: 'Esterification',
      question:
        'The sweet-smelling organic product formed when ethanoic acid is warmed with ethanol in the presence of concentrated H2SO4 is:',
      options: ['Ethoxyethane', 'Ethyl ethanoate', 'Methyl propanoate', 'Butanone'],
      correctOptionIndex: 1,
      explanation:
        'CH3COOH + C2H5OH ⇌ CH3COOC2H5 (ethyl ethanoate) + H2O.',
    },
    {
      topic: 'Fats, Oils & Saponification',
      question:
        'Alkaline hydrolysis of vegetable oil with hot aqueous sodium hydroxide produces soap and:',
      options: ['Ethanol', 'Ethane-1,2-diol', 'Propane-1,2,3-triol (glycerol)', 'Ethanoic acid'],
      correctOptionIndex: 2,
      explanation:
        'Saponification of triglycerides (fats/oils) yields sodium salts of fatty acids (soap) plus propane-1,2,3-triol (glycerol).',
    },
    {
      topic: 'Polymers & Macromolecules',
      question:
        'Which of the following is a synthetic condensation polymer?',
      options: ['Polyethene', 'Polyvinyl chloride (PVC)', 'Nylon-6,6', 'Polystyrene'],
      correctOptionIndex: 2,
      explanation:
        'Nylon-6,6 is formed by condensation polymerization between hexamethylenediamine and hexanedioic acid with elimination of water molecules.',
    },
  ],
};
