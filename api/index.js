// src/server/apiApp.ts
import "dotenv/config";
import express from "express";
import { createClient } from "@supabase/supabase-js";

// src/server/jambPacks/chemistryPack.ts
var CHEMISTRY_PACK = {
  subjectId: "chemistry",
  subjectName: "Chemistry",
  iconName: "science",
  description: "JAMB UTME Chemistry syllabus (40 CBT questions \xB7 40 mins): Separation techniques, Gas laws, Stoichiometry, Atomic structure, Electrolysis, Chemical equilibrium, and Organic Chemistry.",
  materialId: "mat-jamb-chemistry-syllabus",
  materialTitle: "JAMB UTME Chemistry Syllabus Study Guide",
  materialSummary: "Complete JAMB Chemistry revision notes covering Separation Techniques, Gas Laws, Stoichiometry, Electrolysis, Equilibrium, and Organic Chemistry.",
  materialSections: [
    `Section 1: Separation of Mixtures, Kinetic Theory & Gas Laws (JAMB Syllabus)

1. Separation Techniques & Purity Criteria:
\u2022 Pure substances exhibit sharp, fixed melting and boiling points; impurities lower melting points and elevate boiling points.
\u2022 Fractional Distillation separates miscible liquids with close boiling points (e.g., crude oil fractions, ethanol-water mixture, liquid air).
\u2022 Chromatography separates solutes based on differential adsorption and solubility (e.g., leaf pigments, amino acids, ink dyes).
\u2022 Sublimation separates solids that vaporize directly on heating: Ammonium chloride (NH4Cl), Iodine (I2), Camphor, and Naphthalene.

2. Gas Laws & Graham's Law of Diffusion:
\u2022 Boyle's Law (constant T): P1V1 = P2V2
\u2022 Charles' Law (constant P): V1 / T1 = V2 / T2 (Temperature MUST be in Kelvin: K = \xB0C + 273)
\u2022 General Gas Equation: (P1V1) / T1 = (P2V2) / T2
\u2022 Ideal Gas Equation: PV = nRT; Molar volume at s.t.p. = 22.4 dm\xB3.
\u2022 Graham's Law: The rate of diffusion (r) of a gas is inversely proportional to the square root of its vapour density (d) or molar mass (M):
  r1 / r2 = \u221A(M2 / M1) = \u221A(d2 / d1), where Molar Mass M = 2 \xD7 Vapour Density.`,
    `Section 2: Atomic Structure, Periodic Table & Chemical Bonding

1. Atomic Orbitals & Quantum Rules:
\u2022 Principal shells (K, L, M, N) hold a maximum of 2n\xB2 electrons.
\u2022 Aufbau Principle: Electrons fill lower-energy subshells first (1s < 2s < 2p < 3s < 3p < 4s < 3d). Note exceptions in Chromium ([Ar] 3d5 4s1) and Copper ([Ar] 3d10 4s1) due to half-filled and fully-filled d-subshell stability.
\u2022 Isotopes share the same atomic number (protons) but differ in mass number (neutrons), e.g., Cl-35 (75%) and Cl-37 (25%) \u2192 Relative Atomic Mass = (35\xD70.75) + (37\xD70.25) = 35.5.

2. Periodicity Trends Across Period & Down Group:
\u2022 Across a period (Left \u2192 Right): Ionization energy increases, electronegativity increases, atomic radius decreases, metallic character decreases.
\u2022 Down a group (Top \u2192 Bottom): Atomic radius increases, ionization energy decreases, electropositivity increases.

3. Bonding & Intermolecular Forces:
\u2022 Electrovalent (Ionic) Bond: Electron transfer between metals and non-metals (\u0394EN large); high melting points, conduct electricity in molten/aqueous states.
\u2022 Coordinate (Dative) Bond: Shared electron pair donated by one atom (e.g., NH4+, H3O+).
\u2022 Hydrogen Bonding explains the unusually high boiling point of H2O, HF, and NH3.`,
    `Section 3: Acids, Bases, Electrolysis & Chemical Equilibrium

1. Acids, Bases, pH & Salts:
\u2022 pH = -log10[H+], pOH = -log10[OH-], and pH + pOH = 14 at 25\xB0C.
\u2022 Indicators: Methyl orange (acid-strong base or strong acid-weak base), Phenolphthalein (weak acid-strong base), Litmus (strong acid-strong base).
\u2022 Efflorescent salts lose water of crystallization to the atmosphere (Na2CO3\xB710H2O); Deliquescent compounds absorb moisture to form solutions (NaOH, CaCl2, KOH); Hygroscopic substances absorb moisture without dissolving (conc. H2SO4, CaO, CuO).

2. Faraday's Laws of Electrolysis:
\u2022 1 Faraday (F) = 96,500 Coulombs = 1 mole of electrons.
\u2022 Mass deposited: m = (I \xD7 t \xD7 M) / (n \xD7 F), where I = current (A), t = time (s), M = molar mass, n = charge on ion (valency).
\u2022 Preferential discharge depends on: Position in Electrochemical Series, Concentration of ions, and Nature of Electrodes.

3. Le Chatelier's Principle & Energetics:
\u2022 Endothermic reaction (\u0394H > 0): Favoured by increasing temperature.
\u2022 Exothermic reaction (\u0394H < 0, e.g., Haber Process N2 + 3H2 \u21CC 2NH3): Favoured by lower temperature and high pressure (fewer gas moles on product side).
\u2022 Catalysts lower activation energy (Ea) equally for forward and reverse reactions without shifting equilibrium position.`,
    `Section 4: Organic Chemistry & Industrial Processes (JAMB Focus)

1. Homologous Series & Functional Groups:
\u2022 Alkanes (CnH2n+2, sp3 tetrahedral, saturated): Undergo substitution (halogenation in UV light) and combustion.
\u2022 Alkenes (CnH2n, sp2 planar, C=C): Decolourize bromine water and acidified KMnO4; undergo addition reactions and polymerization.
\u2022 Alkynes (CnH2n-2, sp linear, C\u2261C): Terminal alkynes (e.g., ethyne) react with ammoniacal AgNO3 or ammoniacal CuCl to form precipitates (distinguishes ethyne from ethene).
\u2022 Alkanols (-OH): Primary alkanols oxidize first to Alkanals (-CHO) and then to Alkanoic acids (-COOH); Secondary alkanols oxidize to Alkanones (-CO-); Tertiary alkanols resist mild oxidation.

2. Key Organic Reactions:
\u2022 Esterification: Alkanol + Alkanoic Acid \u21CC Alkyl Alkanoate (sweet-smelling ester) + H2O (conc. H2SO4 catalyst).
\u2022 Saponification: Alkaline hydrolysis of fats/esters using NaOH or KOH to yield Soap (sodium/potassium salt of fatty acid) + Propane-1,2,3-triol (glycerol).`
  ],
  pastPaperId: "pq-jamb-chemistry",
  pastPaperTitle: "JAMB UTME Chemistry Past Questions & Official Answers (40 Questions)",
  pastPaperYear: "2024",
  pastPaperSummary: "Complete 40-question JAMB UTME Chemistry paper with verified answer keys and stoichiometric derivations.",
  questions: [
    {
      topic: "Electrolysis & Faraday Laws",
      question: "Calculate the mass of copper deposited when a current of 2.0 A is passed through aqueous copper(II) tetraoxosulphate(VI) solution for 32 minutes 10 seconds. [Cu = 64, 1 F = 96,500 C]",
      options: ["0.64 g", "1.28 g", "2.56 g", "3.20 g"],
      correctOptionIndex: 1,
      explanation: "Time t = (32 \xD7 60) + 10 = 1930 s. Quantity of electricity Q = I \xD7 t = 2.0 \xD7 1930 = 3860 C. For Cu\xB2\u207A + 2e\u207B \u2192 Cu, n = 2. Mass m = (Q \xD7 M) / (n \xD7 F) = (3860 \xD7 64) / (2 \xD7 96500) = 1.28 g."
    },
    {
      topic: "Gas Laws & Diffusion",
      question: "If 50 cm\xB3 of hydrogen gas diffuses through a porous plug in 10 seconds, how long will it take 50 cm\xB3 of oxygen gas to diffuse through the same plug under identical conditions? [H = 1, O = 16]",
      options: ["20 seconds", "30 seconds", "40 seconds", "80 seconds"],
      correctOptionIndex: 2,
      explanation: "Molar mass of H2 = 2 g/mol; Molar mass of O2 = 32 g/mol. For equal volumes, t(O2) / t(H2) = \u221A(M(O2) / M(H2)) = \u221A(32 / 2) = \u221A16 = 4. Thus t(O2) = 4 \xD7 10 s = 40 seconds."
    },
    {
      topic: "Organic Chemistry",
      question: "Which of the following reagents can be used to distinguish between ethyne and ethene in the laboratory?",
      options: [
        "Bromine water",
        "Acidified potassium tetraoxomanganate(VII)",
        "Ammoniacal silver trioxonitrate(V) solution",
        "Fehling\u2019s solution"
      ],
      correctOptionIndex: 2,
      explanation: "Both ethene and ethyne decolourize bromine water and acidified KMnO4, whereas terminal alkynes like ethyne form a pale yellow/white precipitate of silver dicarbide with ammoniacal AgNO3."
    },
    {
      topic: "Chemical Equilibrium",
      question: "In the Haber process: N2(g) + 3H2(g) \u21CC 2NH3(g), \u0394H = -92 kJ/mol. Which set of conditions maximizes the equilibrium yield of ammonia?",
      options: [
        "High temperature and low pressure",
        "Low temperature and high pressure",
        "High temperature and high pressure",
        "Adding finely divided iron to shift equilibrium right"
      ],
      correctOptionIndex: 1,
      explanation: "Forward reaction is exothermic (\u0394H < 0) and proceeds with a decrease in gas volume (4 moles \u2192 2 moles). By Le Chatelier\u2019s principle, low temperature and high pressure shift equilibrium to the right."
    },
    {
      topic: "Acids, Bases & pH",
      question: "What is the pH of a 0.001 mol/dm\xB3 solution of sodium hydroxide (NaOH) at 25\xB0C?",
      options: ["3", "7", "11", "12"],
      correctOptionIndex: 2,
      explanation: "[OH\u207B] = 0.001 = 10\u207B\xB3 mol/dm\xB3. pOH = -log10(10\u207B\xB3) = 3. Since pH + pOH = 14, pH = 14 - 3 = 11."
    },
    {
      topic: "Atomic Structure & Bonding",
      question: "An element X has atomic number 17 and combines with an element Y of atomic number 20. What is the chemical formula and bond type of the compound formed?",
      options: [
        "YX2, electrovalent",
        "Y2X, covalent",
        "YX, electrovalent",
        "YX2, covalent"
      ],
      correctOptionIndex: 0,
      explanation: "Y (Z = 20, Calcium: 2,8,8,2) loses 2 electrons to form Y\xB2\u207A; X (Z = 17, Chlorine: 2,8,7) gains 1 electron to form X\u207B. Formula is YX2 (CaCl2) with electrovalent (ionic) bonding."
    },
    {
      topic: "Separation Techniques",
      question: "A mixture of ammonium chloride and sodium chloride can best be separated by:",
      options: ["Crystallization", "Sublimation", "Filtration", "Fractional distillation"],
      correctOptionIndex: 1,
      explanation: "Ammonium chloride (NH4Cl) sublimes directly from solid to vapour on heating, leaving non-volatile sodium chloride (NaCl) behind."
    },
    {
      topic: "Separation & Purity",
      question: "Which separation technique is used to isolate the different coloured pigments present in green chlorophyll extract?",
      options: ["Paper chromatography", "Centrifugation", "Simple distillation", "Decantation"],
      correctOptionIndex: 0,
      explanation: "Paper chromatography separates complex mixtures of coloured dyes and leaf pigments based on differential rates of migration and solubility."
    },
    {
      topic: "Gas Laws",
      question: "A fixed mass of gas occupies 300 cm\xB3 at 27\xB0C. At what Celsius temperature will its volume double if the pressure remains constant?",
      options: ["54\xB0C", "300\xB0C", "327\xB0C", "600\xB0C"],
      correctOptionIndex: 2,
      explanation: "By Charles\u2019 Law, V1/T1 = V2/T2. T1 = 27 + 273 = 300 K; V2 = 600 cm\xB3. T2 = 300 \xD7 (600 / 300) = 600 K. In Celsius: 600 - 273 = 327\xB0C."
    },
    {
      topic: "General Gas Equation",
      question: "A gas occupies 400 cm\xB3 at 760 mmHg and 27\xB0C. Calculate its volume at s.t.p. [Standard pressure = 760 mmHg, Standard temperature = 273 K]",
      options: ["364 cm\xB3", "400 cm\xB3", "439 cm\xB3", "546 cm\xB3"],
      correctOptionIndex: 0,
      explanation: "Since P1 = P2 = 760 mmHg, V2 = V1 \xD7 (T2 / T1) = 400 \xD7 (273 / 300) = 364 cm\xB3."
    },
    {
      topic: "Stoichiometry & Empirical Formula",
      question: "An organic hydrocarbon contains 85.7% carbon and 14.3% hydrogen by mass. What is its empirical formula? [C = 12, H = 1]",
      options: ["CH", "CH2", "CH3", "C2H6"],
      correctOptionIndex: 1,
      explanation: "Mole ratio: C = 85.7 / 12 = 7.14; H = 14.3 / 1 = 14.3. Dividing by 7.14 gives C : H = 1 : 2, so empirical formula is CH2."
    },
    {
      topic: "Stoichiometry & Gas Volumes",
      question: "What volume of oxygen at s.t.p. is required for the complete combustion of 2.0 moles of methane (CH4)? [Molar volume at s.t.p. = 22.4 dm\xB3]",
      options: ["22.4 dm\xB3", "44.8 dm\xB3", "67.2 dm\xB3", "89.6 dm\xB3"],
      correctOptionIndex: 3,
      explanation: "CH4 + 2O2 \u2192 CO2 + 2H2O. 1 mole of CH4 requires 2 moles of O2, so 2.0 moles of CH4 require 4.0 moles of O2. Volume = 4.0 \xD7 22.4 dm\xB3 = 89.6 dm\xB3."
    },
    {
      topic: "Isotopy & Atomic Mass",
      question: "Naturally occurring chlorine consists of 75% \xB3\u2075Cl and 25% \xB3\u2077Cl. Calculate the relative atomic mass of chlorine.",
      options: ["35.0", "35.5", "36.0", "36.5"],
      correctOptionIndex: 1,
      explanation: "RAM = (35 \xD7 0.75) + (37 \xD7 0.25) = 26.25 + 9.25 = 35.5."
    },
    {
      topic: "Electronic Configuration",
      question: "What is the ground-state electronic configuration of the chromium atom (Z = 24)?",
      options: [
        "1s\xB2 2s\xB2 2p\u2076 3s\xB2 3p\u2076 3d\u2074 4s\xB2",
        "1s\xB2 2s\xB2 2p\u2076 3s\xB2 3p\u2076 3d\u2075 4s\xB9",
        "1s\xB2 2s\xB2 2p\u2076 3s\xB2 3p\u2076 3d\u2076",
        "1s\xB2 2s\xB2 2p\u2076 3s\xB2 3p\u2076 4s\xB2 4p\u2074"
      ],
      correctOptionIndex: 1,
      explanation: "Chromium (Z = 24) achieves extra exchange stability with a half-filled 3d\u2075 subshell: [Ar] 3d\u2075 4s\xB9."
    },
    {
      topic: "Periodic Table Trends",
      question: "Across a period from left to right in the Periodic Table, the first ionization energy generally:",
      options: [
        "Decreases due to increasing atomic radius",
        "Increases due to increasing nuclear charge and decreasing atomic radius",
        "Remains constant across all main-group elements",
        "Decreases because shielding increases rapidly"
      ],
      correctOptionIndex: 1,
      explanation: "Moving left to right across a period, protons are added to the same principal shell, increasing effective nuclear charge and pulling valence electrons closer."
    },
    {
      topic: "Chemical Bonding",
      question: "The type of bond formed when an ammonia molecule (NH3) combines with a hydrogen ion (H\u207A) to form the ammonium ion (NH4\u207A) is:",
      options: ["Metallic bond", "Van der Waals force", "Coordinate (dative) covalent bond", "Purely ionic bond"],
      correctOptionIndex: 2,
      explanation: "Nitrogen in NH3 donates its lone pair of electrons into the empty 1s orbital of H\u207A, forming a coordinate (dative) covalent bond."
    },
    {
      topic: "Intermolecular Forces",
      question: "Water (H2O, molar mass 18) boils at 100\xB0C whereas hydrogen sulphide (H2S, molar mass 34) is a gas at room temperature primarily because of:",
      options: [
        "Covalent bonding in H2S",
        "Intermolecular hydrogen bonding in H2O",
        "Ionic bonding in H2O",
        "Dipole-induced dipole attraction in H2S"
      ],
      correctOptionIndex: 1,
      explanation: "Strong intermolecular hydrogen bonds between highly polar O\u2013H groups in water require substantial thermal energy to break."
    },
    {
      topic: "Oxidation Numbers",
      question: "Determine the oxidation state of manganese in potassium tetraoxomanganate(VII), KMnO4.",
      options: ["+2", "+4", "+6", "+7"],
      correctOptionIndex: 3,
      explanation: "Let oxidation state of Mn = x. (+1) + x + 4(-2) = 0 \u21D2 1 + x - 8 = 0 \u21D2 x = +7."
    },
    {
      topic: "Redox Reactions",
      question: "In the reaction H2S + Cl2 \u2192 2HCl + S, which substance acts as the reducing agent?",
      options: ["Cl2", "H2S", "HCl", "S"],
      correctOptionIndex: 1,
      explanation: "Sulphur in H2S is oxidized from -2 to 0 in S, while reducing Cl2 from 0 to -1. Therefore H2S is the reducing agent."
    },
    {
      topic: "Salts & Water of Crystallization",
      question: "Washing soda crystals (Na2CO3\xB710H2O) lose nine molecules of water of crystallization on exposure to dry air. This property is called:",
      options: ["Deliquescence", "Efflorescence", "Hygroscopy", "Fluorescence"],
      correctOptionIndex: 1,
      explanation: "Efflorescence is the spontaneous loss of water of crystallization by a hydrated salt when exposed to the atmosphere."
    },
    {
      topic: "Acid-Base Titration",
      question: "Which indicator is most suitable for the titration of ethanoic acid (CH3COOH) against sodium hydroxide (NaOH) solution?",
      options: ["Methyl orange", "Methyl red", "Phenolphthalein", "Screened methyl orange"],
      correctOptionIndex: 2,
      explanation: "Titrating a weak acid (ethanoic acid) against a strong base (NaOH) has an equivalence point in the alkaline range (pH 8\u201310), matching phenolphthalein."
    },
    {
      topic: "Volumetric Analysis",
      question: "25.0 cm\xB3 of 0.10 mol/dm\xB3 Na2CO3 completely neutralized 20.0 cm\xB3 of HCl solution. Calculate the molar concentration of the HCl. [Na2CO3 + 2HCl \u2192 2NaCl + H2O + CO2]",
      options: ["0.125 mol/dm\xB3", "0.200 mol/dm\xB3", "0.250 mol/dm\xB3", "0.500 mol/dm\xB3"],
      correctOptionIndex: 2,
      explanation: "(Ca \xD7 Va) / (Cb \xD7 Vb) = na / nb \u21D2 (Ca \xD7 20.0) / (0.10 \xD7 25.0) = 2 / 1 \u21D2 20 Ca = 5.0 \u21D2 Ca = 0.250 mol/dm\xB3."
    },
    {
      topic: "Solubility",
      question: "If 12.0 g of potassium trioxochlorate(V) (KClO3) saturates 40 cm\xB3 of water at 40\xB0C, calculate its solubility in mol/dm\xB3 at 40\xB0C. [K = 39, Cl = 35.5, O = 16]",
      options: ["1.22 mol/dm\xB3", "2.45 mol/dm\xB3", "3.00 mol/dm\xB3", "4.90 mol/dm\xB3"],
      correctOptionIndex: 1,
      explanation: "Molar mass of KClO3 = 39 + 35.5 + 48 = 122.5 g/mol. Mass in 1000 cm\xB3 = (12.0 / 40) \xD7 1000 = 300 g/dm\xB3. Solubility = 300 / 122.5 \u2248 2.45 mol/dm\xB3."
    },
    {
      topic: "Rates of Chemical Reaction",
      question: "Powdered marble (CaCO3) reacts much faster with dilute HCl than marble chips of equal mass because powdering:",
      options: [
        "Lowers the enthalpy change of the reaction",
        "Increases the total surface area for effective collisions",
        "Increases the equilibrium constant Kc",
        "Raises the activation energy barrier"
      ],
      correctOptionIndex: 1,
      explanation: "Subdividing a solid reactant exposes far more particles per unit time, increasing collision frequency with H\u207A ions."
    },
    {
      topic: "Thermochemistry & Entropy",
      question: "A chemical reaction is guaranteed to be spontaneous at ALL temperatures when:",
      options: [
        "\u0394H is positive and \u0394S is negative",
        "\u0394H is negative and \u0394S is positive",
        "\u0394H is positive and \u0394S is positive",
        "\u0394H is negative and \u0394S is negative"
      ],
      correctOptionIndex: 1,
      explanation: "Gibbs free energy \u0394G = \u0394H - T\u0394S. When \u0394H < 0 and \u0394S > 0, \u0394G is always negative regardless of temperature T."
    },
    {
      topic: "Electrochemistry",
      question: "During the electrolysis of concentrated sodium chloride solution (brine) using inert carbon electrodes, the gas liberated at the anode is:",
      options: ["Hydrogen", "Oxygen", "Chlorine", "Sodium vapour"],
      correctOptionIndex: 2,
      explanation: "Although OH\u207B is lower in the electrochemical series than Cl\u207B, the high concentration of Cl\u207B in brine causes preferential discharge of chlorine gas at the anode."
    },
    {
      topic: "Water Hardness",
      question: "Permanent hardness of water is caused by the presence of dissolved:",
      options: [
        "Calcium hydrogentrioxocarbonate(IV)",
        "Magnesium hydrogentrioxocarbonate(IV)",
        "Calcium tetraoxosulphate(VI)",
        "Sodium trioxocarbonate(IV)"
      ],
      correctOptionIndex: 2,
      explanation: "Soluble CaSO4 and MgSO4 (or chlorides) cause permanent hardness which cannot be removed by boiling, unlike Ca(HCO3)2."
    },
    {
      topic: "Air & Non-Metals",
      question: "Which noble gas is the most abundant in dry atmospheric air (approximately 0.93% by volume)?",
      options: ["Helium", "Neon", "Argon", "Krypton"],
      correctOptionIndex: 2,
      explanation: "Argon makes up about 0.93% of dry air, making it by far the most abundant noble gas in Earth\u2019s atmosphere."
    },
    {
      topic: "Allotropes of Carbon",
      question: "Graphite conducts electricity whereas diamond does not because graphite possesses:",
      options: [
        "Strong tetrahedral sp\xB3 covalent bonds",
        "Delocalized mobile \u03C0-electrons between hexagonal layers",
        "Free interstitial metal cations",
        "A higher density than diamond"
      ],
      correctOptionIndex: 1,
      explanation: "Each carbon in graphite is sp\xB2 hybridized, leaving one unhybridized p-electron per atom delocalized across hexagonal planes."
    },
    {
      topic: "Industrial Chemistry \u2014 Contact Process",
      question: "Which catalyst is employed in the industrial manufacture of tetraoxosulphate(VI) acid (H2SO4) via the Contact Process?",
      options: [
        "Finely divided iron",
        "Vanadium(V) oxide (V2O5)",
        "Nickel metal",
        "Manganese(IV) oxide (MnO2)"
      ],
      correctOptionIndex: 1,
      explanation: "Vanadium(V) oxide (V2O5) catalyzes the reversible oxidation 2SO2 + O2 \u21CC 2SO3 at ~450\xB0C in the Contact Process."
    },
    {
      topic: "Nitrogen & Compounds",
      question: "Which gas turns moist red litmus paper blue and forms dense white fumes with concentrated hydrochloric acid?",
      options: ["Sulphur(IV) oxide", "Nitrogen(IV) oxide", "Ammonia", "Hydrogen sulphide"],
      correctOptionIndex: 2,
      explanation: "Ammonia (NH3) is the only common alkaline gas; it reacts with HCl vapour to form dense white fumes of solid NH4Cl."
    },
    {
      topic: "Extraction of Metals",
      question: "In the extraction of aluminium from purified bauxite (Al2O3) by electrolysis, molten cryolite (Na3AlF6) is added primarily to:",
      options: [
        "Prevent corrosion of the steel tank",
        "Lower the melting point of Al2O3 and improve conductivity",
        "Oxidize carbon anodes to carbon(IV) oxide",
        "Precipitate iron(III) oxide impurities"
      ],
      correctOptionIndex: 1,
      explanation: "Pure alumina melts above 2050\xB0C; dissolving it in molten cryolite reduces the operating temperature to around 950\xB0C."
    },
    {
      topic: "Alloys & Transition Metals",
      question: "Bronze is an alloy composed primarily of:",
      options: ["Copper and zinc", "Copper and tin", "Lead and tin", "Iron and chromium"],
      correctOptionIndex: 1,
      explanation: "Bronze is an alloy of copper and tin (whereas brass is copper and zinc, and solder is lead and tin)."
    },
    {
      topic: "IUPAC Organic Nomenclature",
      question: "What is the correct IUPAC name of the compound CH3\u2013CH(CH3)\u2013CH2\u2013CH3?",
      options: ["Pentane", "2-methylbutane", "3-methylbutane", "2,2-dimethylpropane"],
      correctOptionIndex: 1,
      explanation: "Longest continuous carbon chain has 4 carbons (butane); numbering from the end nearer the branch places the methyl group at C-2: 2-methylbutane."
    },
    {
      topic: "Isomerism",
      question: "But-2-ene exhibits cis-trans (geometric) isomerism because of:",
      options: [
        "Free rotation around its C\u2013C single bonds",
        "Restricted rotation about the carbon\u2013carbon double bond (C=C)",
        "Presence of an asymmetric chiral carbon atom",
        "Presence of a triple bond"
      ],
      correctOptionIndex: 1,
      explanation: "Restricted rotation around the \u03C0-bond of C=C with two different groups (-H and -CH3) on each sp\xB2 carbon produces cis and trans isomers."
    },
    {
      topic: "Petroleum Chemistry",
      question: "The quality or anti-knock rating of petrol (gasoline) in internal combustion engines is measured by its:",
      options: ["Cetane number", "Octane number", "Saponification value", "Iodine number"],
      correctOptionIndex: 1,
      explanation: "Octane number compares the anti-knock performance of petrol against mixtures of heptane (0) and 2,2,4-trimethylpentane / iso-octane (100)."
    },
    {
      topic: "Alkanols & Oxidation",
      question: "Complete oxidation of propan-1-ol using excess acidified potassium heptaoxodichromate(VI) yields:",
      options: ["Propanone", "Propanal", "Propanoic acid", "Propene"],
      correctOptionIndex: 2,
      explanation: "Primary alkanols (propan-1-ol) oxidize first to alkanals (propanal) and on refluxing with excess oxidizing agent yield alkanoic acids (propanoic acid)."
    },
    {
      topic: "Esterification",
      question: "The sweet-smelling organic product formed when ethanoic acid is warmed with ethanol in the presence of concentrated H2SO4 is:",
      options: ["Ethoxyethane", "Ethyl ethanoate", "Methyl propanoate", "Butanone"],
      correctOptionIndex: 1,
      explanation: "CH3COOH + C2H5OH \u21CC CH3COOC2H5 (ethyl ethanoate) + H2O."
    },
    {
      topic: "Fats, Oils & Saponification",
      question: "Alkaline hydrolysis of vegetable oil with hot aqueous sodium hydroxide produces soap and:",
      options: ["Ethanol", "Ethane-1,2-diol", "Propane-1,2,3-triol (glycerol)", "Ethanoic acid"],
      correctOptionIndex: 2,
      explanation: "Saponification of triglycerides (fats/oils) yields sodium salts of fatty acids (soap) plus propane-1,2,3-triol (glycerol)."
    },
    {
      topic: "Polymers & Macromolecules",
      question: "Which of the following is a synthetic condensation polymer?",
      options: ["Polyethene", "Polyvinyl chloride (PVC)", "Nylon-6,6", "Polystyrene"],
      correctOptionIndex: 2,
      explanation: "Nylon-6,6 is formed by condensation polymerization between hexamethylenediamine and hexanedioic acid with elimination of water molecules."
    }
  ]
};

// src/server/jambPacks/physicsPack.ts
var PHYSICS_PACK = {
  subjectId: "physics",
  subjectName: "Physics",
  iconName: "science",
  description: "JAMB UTME Physics syllabus (40 CBT questions \xB7 40 mins): Mechanics, Projectiles, Simple Machines, Heat, Waves & Optics, Current Electricity, Capacitance, and Modern Physics.",
  materialId: "mat-jamb-physics-syllabus",
  materialTitle: "JAMB UTME Physics Syllabus Study Guide",
  materialSummary: "High-yield JAMB Physics notes covering Kinematics, Projectiles, Work/Energy, Optics, Waves, Electricity, and Nuclear Physics.",
  materialSections: [
    `Section 1: Mechanics, Scalars/Vectors & Projectile Motion (JAMB Syllabus)

1. Fundamental vs Derived Quantities:
\u2022 Fundamental units: Mass (kg), Length (m), Time (s), Electric Current (A), Thermodynamic Temperature (K), Amount of Substance (mol), Luminous Intensity (cd).
\u2022 Dimensions: Force [MLT\u207B\xB2], Pressure/Stress/Young's Modulus [ML\u207B\xB9T\u207B\xB2], Work/Energy/Torque [ML\xB2T\u207B\xB2], Power [ML\xB2T\u207B\xB3], Momentum/Impulse [MLT\u207B\xB9].

2. Equations of Uniformly Accelerated Motion & Projectiles:
\u2022 v = u + at;  s = ut + \xBDat\xB2;  v\xB2 = u\xB2 + 2as.
\u2022 For a projectile launched at speed u and angle \u03B8 to the horizontal:
  - Time of Flight: T = (2u sin \u03B8) / g
  - Maximum Height: H = (u\xB2 sin\xB2 \u03B8) / (2g)
  - Horizontal Range: R = (u\xB2 sin 2\u03B8) / g  (Maximum range occurs at \u03B8 = 45\xB0 where R_max = u\xB2 / g).

3. Equilibrium of Forces & Moments:
\u2022 Principle of Moments: Sum of clockwise moments about any pivot equals sum of anticlockwise moments.
\u2022 Newton's 2nd Law & Impulse: F = m(v - u)/t  \u21D2  Ft = mv - mu.`,
    `Section 2: Work, Energy, Simple Machines, Elasticity & Pressure

1. Mechanical Energy & Simple Machines:
\u2022 Kinetic Energy KE = \xBDmv\xB2; Gravitational Potential Energy PE = mgh.
\u2022 Mechanical Advantage (MA) = Load / Effort; Velocity Ratio (VR) = Distance moved by Effort / Distance moved by Load.
\u2022 Efficiency \u03B7 = (MA / VR) \xD7 100%.
  - Inclined plane of angle \u03B8: VR = 1 / sin \u03B8
  - Block & tackle pulley system with n pulleys: VR = n
  - Screw jack of pitch p and handle radius r: VR = (2\u03C0r) / p

2. Hooke's Law & Elastic Potential Energy:
\u2022 F = ke (provided elastic limit is not exceeded).
\u2022 Energy stored in a stretched spring/wire: W = \xBDFe = \xBDke\xB2.

3. Hydrostatics & Upthrust:
\u2022 Liquid Pressure P = \u03C1gh.
\u2022 Archimedes' Principle: Upthrust equals the weight of fluid displaced. Relative Density = Weight in air / Upthrust in water.`,
    `Section 3: Heat, Waves, Sound & Geometrical Optics

1. Thermal Physics:
\u2022 Heat capacity: Q = mc\u0394\u03B8; Latent heat: Q = mL.
\u2022 Linear expansivity \u03B1 = \u0394L / (L\u2080\u0394\u03B8); Area expansivity \u03B2 = 2\u03B1; Cubic expansivity \u03B3 = 3\u03B1.

2. Wave Motion & Sound:
\u2022 Wave speed v = f\u03BB.
\u2022 Echo depth/distance formula: d = (v \xD7 t) / 2.
\u2022 Fundamental frequency of a stretched string: f\u2080 = (1 / 2L) \u221A(T / \u03BC). Closed pipe produces only odd harmonics (f\u2080, 3f\u2080, 5f\u2080); open pipe produces all harmonics (f\u2080, 2f\u2080, 3f\u2080).

3. Mirror & Lens Formulae + Refraction:
\u2022 1/f = 1/u + 1/v; Linear Magnification M = v / u = h_i / h_o.
\u2022 Snell's Law: n = sin i / sin r = Real Depth / Apparent Depth = c / v.
\u2022 Critical angle C: sin C = 1 / n (Total internal reflection occurs when light travels from optically denser to less dense medium at i > C, e.g., optical fibres and mirages).`,
    `Section 4: Electricity, Magnetism & Modern Physics

1. Direct Current Circuits & Capacitors:
\u2022 Ohm's Law: V = IR; Terminal p.d. of a cell with internal resistance r: V = E - Ir, I = E / (R + r).
\u2022 Resistors in Series: R_eq = R1 + R2; Parallel: 1/R_eq = 1/R1 + 1/R2.
\u2022 Capacitors (OPPOSITE to resistors!): Parallel: C_eq = C1 + C2; Series: 1/C_eq = 1/C1 + 1/C2. Energy stored E = \xBDCV\xB2.
\u2022 Electrical Power & Cost: P = IV = I\xB2R = V\xB2/R; 1 kWh = 3.6 \xD7 10\u2076 J.

2. Transformers & Modern Physics:
\u2022 Ideal Transformer: V_s / V_p = N_s / N_p = I_p / I_s. Eddy current losses are minimized by laminating the soft-iron core.
\u2022 Photoelectric Effect: hf = hf\u2080 + \xBDmv\xB2_max (Work function W\u2080 = hf\u2080).
\u2022 Radioactive Half-Life: N(t) = N\u2080 (\xBD)^(t / T_\xBD).`
  ],
  pastPaperId: "pq-jamb-physics",
  pastPaperTitle: "JAMB UTME Physics Past Questions & Official Answers (40 Questions)",
  pastPaperYear: "2024",
  pastPaperSummary: "Complete 40-question JAMB UTME Physics paper covering Projectiles, Mechanics, Optics, Waves, Electricity, and Nuclear Physics.",
  questions: [
    {
      topic: "Projectile Motion",
      question: "A projectile is fired with an initial velocity of 40 m/s at an angle of 30\xB0 to the horizontal. Calculate the maximum height attained. [g = 10 m/s\xB2]",
      options: ["10 m", "20 m", "40 m", "80 m"],
      correctOptionIndex: 1,
      explanation: "Maximum height H = (u\xB2 sin\xB2 \u03B8) / (2g) = (40\xB2 \xD7 (sin 30\xB0)\xB2) / (2 \xD7 10) = (1600 \xD7 0.25) / 20 = 400 / 20 = 20 m."
    },
    {
      topic: "Current Electricity",
      question: "A cell of e.m.f. 1.5 V and internal resistance 0.5 \u03A9 is connected across an external resistor of 2.5 \u03A9. Find the terminal potential difference across the cell.",
      options: ["0.25 V", "1.00 V", "1.25 V", "1.50 V"],
      correctOptionIndex: 2,
      explanation: "Current I = E / (R + r) = 1.5 / (2.5 + 0.5) = 1.5 / 3.0 = 0.5 A. Terminal p.d. V = I \xD7 R = 0.5 \xD7 2.5 = 1.25 V."
    },
    {
      topic: "Capacitance",
      question: "Two capacitors of capacitances 3 \u03BCF and 6 \u03BCF are connected in series across a 100 V DC supply. Calculate the energy stored in the combination.",
      options: ["0.01 J", "0.02 J", "0.045 J", "0.09 J"],
      correctOptionIndex: 0,
      explanation: "For series capacitors: C_eq = (3 \xD7 6) / (3 + 6) = 18 / 9 = 2 \u03BCF = 2 \xD7 10\u207B\u2076 F. Energy E = \xBD C_eq V\xB2 = 0.5 \xD7 (2 \xD7 10\u207B\u2076) \xD7 (100)\xB2 = 10\u207B\u2076 \xD7 10\u2074 = 0.01 J."
    },
    {
      topic: "Refraction & Optics",
      question: "A coin lies at the bottom of a swimming pool of real depth 2.4 m. If the refractive index of water is 4/3, what is the apparent vertical displacement of the coin?",
      options: ["0.6 m", "1.2 m", "1.8 m", "3.2 m"],
      correctOptionIndex: 0,
      explanation: "Apparent depth = Real depth / n = 2.4 / (4/3) = 1.8 m. Vertical displacement d = Real depth - Apparent depth = 2.4 - 1.8 = 0.6 m."
    },
    {
      topic: "Simple Machines",
      question: "A block and tackle system of 5 pulleys has an efficiency of 80%. What effort is required to lift a load of 400 N?",
      options: ["80 N", "100 N", "125 N", "160 N"],
      correctOptionIndex: 1,
      explanation: "VR = number of pulleys = 5. Efficiency = (MA / VR) \xD7 100% \u21D2 0.80 = MA / 5 \u21D2 MA = 4. Since MA = Load / Effort, Effort = 400 / 4 = 100 N."
    },
    {
      topic: "Radioactivity & Half-Life",
      question: "A radioactive isotope of mass 64 g has a half-life of 6 days. What mass of the isotope remains undecayed after 24 days?",
      options: ["2 g", "4 g", "8 g", "16 g"],
      correctOptionIndex: 1,
      explanation: "Number of half-lives n = 24 / 6 = 4. Remaining mass N = 64 \xD7 (1/2)\u2074 = 64 / 16 = 4 g."
    },
    {
      topic: "Units & Dimensions",
      question: "What is the correct dimensional formula for Young\u2019s Modulus of elasticity?",
      options: ["MLT\u207B\xB2", "ML\u207B\xB9T\u207B\xB2", "ML\xB2T\u207B\xB2", "ML\u207B\xB9T\u207B\xB9"],
      correctOptionIndex: 1,
      explanation: "Young\u2019s Modulus = Stress / Strain. Since Strain is dimensionless, Young\u2019s Modulus has the dimensions of Stress (Force / Area) = MLT\u207B\xB2 / L\xB2 = ML\u207B\xB9T\u207B\xB2."
    },
    {
      topic: "Scalars & Vectors",
      question: "Two perpendicular forces of magnitudes 6 N and 8 N act simultaneously at a point. What is the magnitude of their resultant force?",
      options: ["2 N", "10 N", "14 N", "48 N"],
      correctOptionIndex: 1,
      explanation: "For perpendicular vectors: R = \u221A(6\xB2 + 8\xB2) = \u221A(36 + 64) = \u221A100 = 10 N."
    },
    {
      topic: "Kinematics",
      question: "A car accelerates uniformly from rest at 3 m/s\xB2 for 8 seconds. Calculate the distance covered during this time.",
      options: ["24 m", "48 m", "96 m", "192 m"],
      correctOptionIndex: 2,
      explanation: "s = ut + \xBDat\xB2 = 0 + 0.5 \xD7 3 \xD7 8\xB2 = 0.5 \xD7 3 \xD7 64 = 96 m."
    },
    {
      topic: "Free Fall & Gravity",
      question: "A stone is projected vertically upwards with an initial speed of 30 m/s. How long does it take to return to the point of projection? [g = 10 m/s\xB2]",
      options: ["3.0 s", "4.5 s", "6.0 s", "9.0 s"],
      correctOptionIndex: 2,
      explanation: "Time to maximum height t = u / g = 30 / 10 = 3.0 s. Total time of flight back to launch level = 2t = 6.0 s."
    },
    {
      topic: "Momentum & Impulse",
      question: "A ball of mass 0.5 kg moving at 12 m/s hits a vertical wall and rebounds in the opposite direction at 8 m/s. Calculate the magnitude of the impulse exerted by the wall.",
      options: ["2.0 Ns", "4.0 Ns", "6.0 Ns", "10.0 Ns"],
      correctOptionIndex: 3,
      explanation: "Impulse = m(v - u) = 0.5 \xD7 [8 - (-12)] = 0.5 \xD7 20 = 10.0 Ns."
    },
    {
      topic: "Equilibrium & Moments",
      question: "A uniform metre rule is pivoted at the 40 cm mark and balanced horizontally when a mass of 60 g is hung at the 20 cm mark. Calculate the mass of the metre rule.",
      options: ["60 g", "80 g", "120 g", "240 g"],
      correctOptionIndex: 2,
      explanation: "Weight of uniform metre rule acts at 50 cm mark (distance 10 cm from pivot). Anticlockwise moment = Clockwise moment: 60 \xD7 (40 - 20) = M \xD7 (50 - 40) \u21D2 1200 = 10M \u21D2 M = 120 g."
    },
    {
      topic: "Friction",
      question: "A wooden block of mass 5 kg rests on a rough horizontal table. If a horizontal force of 20 N just sets it in motion, find the coefficient of static friction. [g = 10 m/s\xB2]",
      options: ["0.20", "0.25", "0.40", "0.50"],
      correctOptionIndex: 2,
      explanation: "Normal reaction R = mg = 5 \xD7 10 = 50 N. \u03BC = F_max / R = 20 / 50 = 0.40."
    },
    {
      topic: "Work, Energy & Power",
      question: "An electric water pump lifts 300 kg of water through a vertical height of 12 m in 20 seconds. What is the useful power output of the pump? [g = 10 m/s\xB2]",
      options: ["180 W", "1,800 W", "3,600 W", "7,200 W"],
      correctOptionIndex: 1,
      explanation: "Power P = mgh / t = (300 \xD7 10 \xD7 12) / 20 = 36,000 / 20 = 1,800 W."
    },
    {
      topic: "Circular Motion",
      question: "A body of mass 2 kg moves in a horizontal circle of radius 4 m at a constant speed of 6 m/s. Calculate the centripetal force acting on it.",
      options: ["3 N", "9 N", "18 N", "36 N"],
      correctOptionIndex: 2,
      explanation: "Centripetal force F = mv\xB2 / r = (2 \xD7 6\xB2) / 4 = 72 / 4 = 18 N."
    },
    {
      topic: "Simple Harmonic Motion",
      question: "If the length of a simple pendulum is quadrupled (increased fourfold), its period of oscillation is:",
      options: ["Halved", "Doubled", "Quadrupled", "Unchanged"],
      correctOptionIndex: 1,
      explanation: "Period T = 2\u03C0\u221A(L/g). Since T \u221D \u221AL, multiplying L by 4 multiplies T by \u221A4 = 2 (doubled)."
    },
    {
      topic: "Hooke\u2019s Law & Elasticity",
      question: "A spiral spring of force constant 200 N/m is stretched by 0.05 m. Calculate the elastic potential energy stored in the spring.",
      options: ["0.25 J", "0.50 J", "5.00 J", "10.0 J"],
      correctOptionIndex: 0,
      explanation: "Elastic PE = \xBDke\xB2 = 0.5 \xD7 200 \xD7 (0.05)\xB2 = 100 \xD7 0.0025 = 0.25 J."
    },
    {
      topic: "Hydrostatic Pressure",
      question: "Calculate the pressure due to water alone at a depth of 15 m below the surface of a freshwater lake. [Density of water = 1000 kg/m\xB3, g = 10 m/s\xB2]",
      options: ["1.5 \xD7 10\u2074 Pa", "1.5 \xD7 10\u2075 Pa", "1.5 \xD7 10\u2076 Pa", "1.0 \xD7 10\u2075 Pa"],
      correctOptionIndex: 1,
      explanation: "Liquid pressure P = \u03C1gh = 1000 \xD7 10 \xD7 15 = 150,000 Pa = 1.5 \xD7 10\u2075 Pa."
    },
    {
      topic: "Archimedes\u2019 Principle",
      question: "A solid weighs 45 N in air and 30 N when completely immersed in water. Calculate the relative density of the solid.",
      options: ["1.5", "2.0", "3.0", "4.5"],
      correctOptionIndex: 2,
      explanation: "Upthrust in water = 45 - 30 = 15 N. Relative density = Weight in air / Upthrust in water = 45 / 15 = 3.0."
    },
    {
      topic: "Thermal Expansion",
      question: "A brass rod of length 2.0 m at 20\xB0C is heated to 120\xB0C. If the linear expansivity of brass is 1.9 \xD7 10\u207B\u2075 K\u207B\xB9, find the increase in length.",
      options: ["0.38 mm", "1.90 mm", "3.80 mm", "7.60 mm"],
      correctOptionIndex: 2,
      explanation: "\u0394L = \u03B1L\u2080\u0394\u03B8 = (1.9 \xD7 10\u207B\u2075) \xD7 2.0 \xD7 (120 - 20) = 3.8 \xD7 10\u207B\xB3 m = 3.80 mm."
    },
    {
      topic: "Specific Heat Capacity",
      question: "How much heat energy is required to raise the temperature of 0.5 kg of water from 20\xB0C to 60\xB0C? [Specific heat capacity of water = 4200 J kg\u207B\xB9 K\u207B\xB9]",
      options: ["42 kJ", "84 kJ", "126 kJ", "168 kJ"],
      correctOptionIndex: 1,
      explanation: "Q = mc\u0394\u03B8 = 0.5 \xD7 4200 \xD7 (60 - 20) = 2100 \xD7 40 = 84,000 J = 84 kJ."
    },
    {
      topic: "Latent Heat",
      question: "Calculate the quantity of heat needed to melt 0.2 kg of ice completely at 0\xB0C into water at 0\xB0C. [Specific latent heat of fusion of ice = 3.36 \xD7 10\u2075 J/kg]",
      options: ["33.6 kJ", "67.2 kJ", "168.0 kJ", "336.0 kJ"],
      correctOptionIndex: 1,
      explanation: "Q = mL_f = 0.2 \xD7 3.36 \xD7 10\u2075 = 67,200 J = 67.2 kJ."
    },
    {
      topic: "Heat Transfer",
      question: "In a vacuum (thermos) flask, heat loss by radiation is minimized primarily by:",
      options: [
        "The cork stopper at the neck",
        "The vacuum between the double walls",
        "Silvering the glass surfaces",
        "The plastic outer casing"
      ],
      correctOptionIndex: 2,
      explanation: "Silvered shiny surfaces are poor emitters and strong reflectors of infrared thermal radiation; the vacuum prevents conduction and convection."
    },
    {
      topic: "Wave Properties",
      question: "A progressive wave has a frequency of 250 Hz and travels at a speed of 350 m/s. What is its wavelength?",
      options: ["0.71 m", "1.40 m", "2.50 m", "8.75 m"],
      correctOptionIndex: 1,
      explanation: "\u03BB = v / f = 350 / 250 = 1.40 m."
    },
    {
      topic: "Sound Waves & Echoes",
      question: "A ship sends an ultrasonic pulse vertically downwards to the seabed and receives the echo 1.2 seconds later. If the speed of sound in seawater is 1500 m/s, find the depth of the sea.",
      options: ["600 m", "900 m", "1,250 m", "1,800 m"],
      correctOptionIndex: 1,
      explanation: "Echo depth d = (v \xD7 t) / 2 = (1500 \xD7 1.2) / 2 = 900 m."
    },
    {
      topic: "Vibrations in Pipes",
      question: "Which harmonics can be produced by an air column in a pipe closed at one end?",
      options: [
        "Even harmonics only (2f\u2080, 4f\u2080, 6f\u2080...)",
        "All integer harmonics (f\u2080, 2f\u2080, 3f\u2080...)",
        "Odd harmonics only (f\u2080, 3f\u2080, 5f\u2080...)",
        "Fundamental frequency only"
      ],
      correctOptionIndex: 2,
      explanation: "A closed pipe must have a node at the closed end and an antinode at the open end, supporting only odd multiples of the fundamental frequency."
    },
    {
      topic: "Plane Mirrors",
      question: "Two plane mirrors are inclined at an angle of 60\xB0 to each other. How many images of an object placed symmetrically between them are formed?",
      options: ["4", "5", "6", "7"],
      correctOptionIndex: 1,
      explanation: "Number of images n = (360\xB0 / \u03B8) - 1 = (360 / 60) - 1 = 6 - 1 = 5."
    },
    {
      topic: "Curved Mirrors & Lenses",
      question: "An object is placed 30 cm in front of a converging lens of focal length 10 cm. Find the image distance from the lens.",
      options: ["7.5 cm", "15.0 cm", "20.0 cm", "60.0 cm"],
      correctOptionIndex: 1,
      explanation: "1/f = 1/u + 1/v \u21D2 1/10 = 1/30 + 1/v \u21D2 1/v = 1/10 - 1/30 = 2/30 = 1/15 \u21D2 v = 15.0 cm."
    },
    {
      topic: "Total Internal Reflection",
      question: "If the refractive index of a glass prism is 2.0, what is its critical angle in air?",
      options: ["30\xB0", "42\xB0", "45\xB0", "60\xB0"],
      correctOptionIndex: 0,
      explanation: "sin C = 1 / n = 1 / 2.0 = 0.5 \u21D2 C = 30\xB0."
    },
    {
      topic: "Optical Instruments & Eye Defects",
      question: "Short-sightedness (myopia), in which distant objects focus in front of the retina, is corrected using a:",
      options: ["Converging (convex) lens", "Diverging (concave) lens", "Cylindrical lens", "Bifocal plane mirror"],
      correctOptionIndex: 1,
      explanation: "A diverging (concave) lens diverges incoming parallel rays slightly before they enter the eye so they focus accurately on the retina."
    },
    {
      topic: "Electromagnetic Spectrum",
      question: "Which of the following electromagnetic waves has the shortest wavelength and highest penetrating power?",
      options: ["Ultraviolet rays", "X-rays", "Gamma rays", "Microwaves"],
      correctOptionIndex: 2,
      explanation: "Gamma rays have the highest frequency, highest photon energy, and shortest wavelength in the electromagnetic spectrum."
    },
    {
      topic: "Electrostatics & Coulomb\u2019s Law",
      question: "If the distance between two point electric charges is doubled while their magnitudes remain constant, the electrostatic force between them becomes:",
      options: ["Twice as great", "Half as great", "One-quarter as great", "Four times as great"],
      correctOptionIndex: 2,
      explanation: "By Coulomb\u2019s inverse-square law, F \u221D 1 / r\xB2. Doubling r reduces F to 1 / 2\xB2 = 1/4 of its original value."
    },
    {
      topic: "Resistors in Parallel",
      question: "Three resistors of resistances 2 \u03A9, 3 \u03A9, and 6 \u03A9 are connected in parallel. What is their combined effective resistance?",
      options: ["0.5 \u03A9", "1.0 \u03A9", "2.0 \u03A9", "11.0 \u03A9"],
      correctOptionIndex: 1,
      explanation: "1/R = 1/2 + 1/3 + 1/6 = (3 + 2 + 1) / 6 = 6 / 6 = 1 \u21D2 R = 1.0 \u03A9."
    },
    {
      topic: "Electrical Energy & Power",
      question: "An electric kettle rated 2000 W, 240 V is operated for 3 hours daily for 10 days. Calculate the total electrical energy consumed in kilowatt-hours (kWh).",
      options: ["6 kWh", "20 kWh", "60 kWh", "600 kWh"],
      correctOptionIndex: 2,
      explanation: "Power = 2000 W = 2 kW. Total time = 3 \xD7 10 = 30 hours. Energy = 2 kW \xD7 30 h = 60 kWh."
    },
    {
      topic: "Galvanometer Conversion",
      question: "To convert a sensitive moving-coil galvanometer into an ammeter capable of reading large currents, one connects a:",
      options: [
        "High resistance multiplier in series",
        "Low resistance shunt in parallel",
        "Low resistance shunt in series",
        "High resistance multiplier in parallel"
      ],
      correctOptionIndex: 1,
      explanation: "A low-resistance shunt in parallel diverts the bulk of the main current while allowing full-scale deflection safely."
    },
    {
      topic: "Transformers",
      question: "A step-down transformer has 1200 turns in its primary coil and 60 turns in its secondary coil. If the primary is connected to a 240 V AC mains, find the secondary output voltage.",
      options: ["6 V", "12 V", "20 V", "48 V"],
      correctOptionIndex: 1,
      explanation: "Vs / Vp = Ns / Np \u21D2 Vs = 240 \xD7 (60 / 1200) = 240 / 20 = 12 V."
    },
    {
      topic: "Electromagnetic Induction",
      question: "Lenz\u2019s law of electromagnetic induction is a direct consequence of the law of conservation of:",
      options: ["Electric charge", "Linear momentum", "Energy", "Mass"],
      correctOptionIndex: 2,
      explanation: "Mechanical work must be done against the opposing magnetic force to induce electrical energy, upholding conservation of energy."
    },
    {
      topic: "Alternating Current (AC)",
      question: "If the peak voltage of an alternating current supply is 340 V, calculate its root-mean-square (r.m.s.) voltage. [\u221A2 \u2248 1.414]",
      options: ["170 V", "240 V", "340 V", "481 V"],
      correctOptionIndex: 1,
      explanation: "V_rms = V_0 / \u221A2 = 340 / 1.414 \u2248 240 V."
    },
    {
      topic: "Photoelectric Effect",
      question: "In photoelectric emission, the maximum kinetic energy of emitted photoelectrons depends solely on the:",
      options: [
        "Intensity of the incident light",
        "Time of exposure to light",
        "Frequency of the incident radiation and work function of the metal",
        "Surface area of the cathode"
      ],
      correctOptionIndex: 2,
      explanation: "By Einstein\u2019s equation KE_max = hf - W\u2080, kinetic energy increases with photon frequency f, whereas light intensity only alters the number of electrons emitted."
    },
    {
      topic: "Nuclear Physics",
      question: "When a radioactive nucleus \xB2\xB3\u2078\u2089\u2082U emits one alpha (\u03B1) particle, the mass number and atomic number of the daughter nucleus are respectively:",
      options: ["234 and 90", "234 and 92", "238 and 93", "236 and 91"],
      correctOptionIndex: 0,
      explanation: "An alpha particle is a \u2074\u2082He nucleus, reducing the mass number by 4 (238 \u2192 234) and the atomic number by 2 (92 \u2192 90)."
    }
  ]
};

// src/server/jambPacks/geographyPack.ts
var GEOGRAPHY_PACK = {
  subjectId: "geography",
  subjectName: "Geography",
  iconName: "menu_book",
  description: "JAMB UTME Geography syllabus (40 CBT questions \xB7 40 mins): Map Reading & Scale, Earth Rotation/Time Zones, Rocks & Landforms, Climatology, and Regional Geography of Nigeria & ECOWAS.",
  materialId: "mat-jamb-geography-syllabus",
  materialTitle: "JAMB UTME Geography Syllabus Study Guide",
  materialSummary: "Comprehensive JAMB Geography revision covering Map Reading, Longitude & Time Calculations, Geomorphology, Climate/Vegetation, and Nigerian Geography.",
  materialSections: [
    `Section 1: Practical Geography \u2014 Map Reading, Scales & Contours (JAMB Syllabus)

1. Map Scales & Conversion:
\u2022 Representative Fraction (R.F.): e.g., 1:50,000 means 1 cm on the map represents 50,000 cm (0.5 km) on the ground; 2 cm represents 1 km.
\u2022 Scale Enlargement & Reduction:
  - When reducing a map by factor n, New Scale denominator = Old denominator \xD7 n; Area decreases by n\xB2.
  - When enlarging a map by factor n, New Scale denominator = Old denominator \xF7 n; Area increases by n\xB2.

2. Gradient & Intervisibility:
\u2022 Gradient = Vertical Interval (V.I.) / Horizontal Equivalent (H.E.), expressed in identical units (metres) as 1 in X.
\u2022 Concave slopes have contours closely spaced at the top and widely spaced at the base (points ARE intervisible). Convex slopes have contours widely spaced at the top and closely spaced at the bottom (obstructs intervisibility).`,
    `Section 2: Physical Geography \u2014 Earth's Movements, Longitude & Rocks

1. Rotation, Revolution & Time Calculation:
\u2022 Rotation (West to East every 24 hours) causes day & night and deflection of winds/ocean currents (Ferrel's Law: right in Northern Hemisphere, left in Southern Hemisphere).
\u2022 Longitude & Local Time: Earth rotates 360\xB0 in 24 hours \u2192 15\xB0 = 1 hour; 1\xB0 = 4 minutes.
  - Places EAST of a reference meridian are AHEAD in time (+); places WEST are BEHIND (-).
\u2022 Revolution (365\xBC days on a 66\xBD\xB0 inclined axis) causes seasons, varying lengths of day/night, Equinoxes (March 21, Sept 23), and Solstices (June 21, Dec 22).

2. Rocks & Landforms:
\u2022 Igneous Rocks: Formed from cooling magma/lava; crystalline, non-stratified, no fossils. Plutonic (granite, gabbro) vs Volcanic/Extrusive (basalt, pumice).
\u2022 Sedimentary Rocks: Stratified, contain fossils. Mechanically formed (sandstone, shale), Organically formed (limestone, coal), Chemically formed (rock salt, gypsum).
\u2022 Metamorphic Rocks: Transformed by heat/pressure: Limestone \u2192 Marble; Clay/Shale \u2192 Slate; Sandstone \u2192 Quartzite; Granite \u2192 Gneiss; Coal \u2192 Graphite.`,
    `Section 3: Climatology, Instruments & Nigerian Vegetation Belts

1. Weather Elements & Recording Instruments:
\u2022 Temperature (Six's Max & Min Thermometer; Diurnal range = Max - Min), Atmospheric Pressure (Mercury/Aneroid Barometer, lines = Isobars), Wind Speed (Cup Anemometer), Wind Direction (Wind Vane), Relative Humidity (Wet & Dry Bulb Hygrometer).
\u2022 Rainfall Types: Convectional (equatorial afternoon downpours), Orographic/Relief (windward mountain slopes vs leeward rain shadow), Cyclonic/Frontal.

2. Nigerian Vegetation Zones (South \u2192 North):
1. Mangrove / Salt-Water & Fresh-Water Swamp Forest (Niger Delta, coastal creeks \u2014 raffia palm, red mangrove).
2. Tropical High Rainforest (Ondo, Cross River, Edo \u2014 mahogany, iroko, obeche, oil palm).
3. Guinea Savanna (Largest belt in Nigeria \u2014 tall grasses, deciduous trees like locust bean & shea butter).
4. Sudan Savanna (Short grasses, acacia, baobab \u2014 intensive grain & cattle zone).
5. Sahel Savanna (Extreme North-East, Lake Chad basin \u2014 thorny shrubs, xerophytes).`,
    `Section 4: Human & Regional Geography of Nigeria & ECOWAS

1. Nigerian Relief, Drainage & Minerals:
\u2022 Major Highlands: North-Central Plateau (Jos \u2014 hydrological centre of radial drainage), Western Uplands, Eastern Highlands (Mandara, Adamawa \u2014 Chappal Waddi 2,419 m highest peak), Udi-Nsukka Escarpment (Enugu coal).
\u2022 Mineral Resources: Crude Petroleum & Natural Gas (Niger Delta \u2014 Tertiary sedimentary rocks), Tin & Columbite (Jos Plateau \u2014 alluvial igneous), Limestone (Ewekoro, Sokoto, Nkalagu, Gboko \u2014 cement industry), Sub-bituminous Coal (Enugu), Iron Ore (Itakpe, Kogi).

2. Population, Settlement & ECOWAS:
\u2022 High population density zones in Nigeria: South-West Yoruba cocoa/urban belt, South-East Igbo heartland, Kano close-settled zone. Low density: Middle Belt (tsetse fly, historical slave raids).
\u2022 ECOWAS (founded May 28, 1975 via Treaty of Lagos; Headquarters in Abuja): Promotes free movement, regional trade liberalization, and infrastructural integration across West Africa.`
  ],
  pastPaperId: "pq-jamb-geography",
  pastPaperTitle: "JAMB UTME Geography Past Questions & Official Answers (40 Questions)",
  pastPaperYear: "2024",
  pastPaperSummary: "Complete 40-question JAMB UTME Geography paper covering Time/Longitude calculations, Map Scale, Rocks, Climate, and Nigerian Regional Geography.",
  questions: [
    {
      topic: "Longitude & Time Calculation",
      question: "If a football match kicks off at 4:00 p.m. in London (0\xB0 Longitude), at what local time will viewers in Town X (45\xB0E) watch the live kick-off?",
      options: ["1:00 p.m.", "6:00 p.m.", "7:00 p.m.", "8:00 p.m."],
      correctOptionIndex: 2,
      explanation: "Longitude difference = 45\xB0 - 0\xB0 = 45\xB0. Since 15\xB0 = 1 hour, time difference = 45 / 15 = 3 hours. Because 45\xB0E is East of 0\xB0, add 3 hours: 4:00 p.m. + 3 hours = 7:00 p.m."
    },
    {
      topic: "Map Reading & Scale",
      question: "On a topographic map drawn to a scale of 1:50,000, the straight-line distance between two villages is 8.4 cm. What is the actual ground distance in kilometres?",
      options: ["2.1 km", "4.2 km", "8.4 km", "16.8 km"],
      correctOptionIndex: 1,
      explanation: "1:50,000 means 1 cm = 0.5 km on the ground. Therefore, 8.4 cm = 8.4 \xD7 0.5 km = 4.2 km."
    },
    {
      topic: "Rocks & Geomorphology",
      question: "When limestone is subjected to intense heat and pressure during metamorphism, it is transformed into:",
      options: ["Quartzite", "Slate", "Gneiss", "Marble"],
      correctOptionIndex: 3,
      explanation: "Thermal/regional metamorphism recrystallizes calcium carbonate in limestone into marble (Sandstone \u2192 Quartzite, Clay/Shale \u2192 Slate, Granite \u2192 Gneiss)."
    },
    {
      topic: "Geography of Nigeria",
      question: "Which vegetation zone occupies the largest land area in Nigeria and is characterized by tall grasses with scattered fire-resistant trees such as shea butter and locust bean?",
      options: [
        "Tropical Rainforest",
        "Guinea Savanna",
        "Sahel Savanna",
        "Mangrove Swamp Forest"
      ],
      correctOptionIndex: 1,
      explanation: "The Guinea Savanna covers almost half of Nigeria (stretching across the Middle Belt) and features tall grasses alongside economic trees like Isoberlinia, shea butter, and locust bean."
    },
    {
      topic: "Mineral Resources of Nigeria",
      question: "Alluvial deposits of cassiterite (tin ore) and columbite in Nigeria are predominantly mined on the:",
      options: ["Udi Escarpment", "Sokoto Plains", "Jos Plateau", "Niger Delta Basin"],
      correctOptionIndex: 2,
      explanation: "Younger granites of the Jos Plateau weather to form rich alluvial deposits of tin (cassiterite) and columbite."
    },
    {
      topic: "Climatology",
      question: "The dry, dusty North-East Trade Wind that blows from the Sahara Desert across West Africa between November and February is associated with:",
      options: [
        "High relative humidity and cyclonic rainfall",
        "Harmattan haze and large diurnal temperature range",
        "Equatorial convectional thunderstorms",
        "Coastal sea breeze inversion"
      ],
      correctOptionIndex: 1,
      explanation: "The Tropical Continental (cT) air mass brings the Harmattan: dusty haze, very low relative humidity, hot afternoons, and cold nights (large diurnal temperature range)."
    },
    {
      topic: "Map Enlargement & Reduction",
      question: "If a map drawn to a scale of 1:100,000 is enlarged two times, what is the new Representative Fraction (R.F.) scale?",
      options: ["1:25,000", "1:50,000", "1:200,000", "1:400,000"],
      correctOptionIndex: 1,
      explanation: "Enlarging a map by 2 divides the scale denominator by 2: 100,000 \xF7 2 = 50,000 \u2192 New scale is 1:50,000."
    },
    {
      topic: "Contour & Slope Interpretation",
      question: "Two hilltops on a contour map are NOT intervisible when the intervening slope between them is:",
      options: ["Concave", "Uniformly gentle", "Convex", "A wide flat valley"],
      correctOptionIndex: 2,
      explanation: "A convex slope bulges outward near the middle/base (contours close at the bottom, wide at the top), blocking the line of sight between the two points."
    },
    {
      topic: "Gradient Calculation",
      question: "Point A (height 150 m) and Point B (height 350 m) are 4 km apart horizontally. Calculate the gradient between A and B.",
      options: ["1 in 10", "1 in 20", "1 in 40", "1 in 200"],
      correctOptionIndex: 1,
      explanation: "Vertical Interval (V.I.) = 350 - 150 = 200 m. Horizontal Equivalent (H.E.) = 4 km = 4000 m. Gradient = 200 / 4000 = 1 in 20."
    },
    {
      topic: "Solar System & Earth",
      question: "Day and night are equal in length (12 hours each) everywhere on Earth during the equinoxes on:",
      options: [
        "June 21 and December 22",
        "March 21 and September 23",
        "January 1 and July 4",
        "April 15 and October 15"
      ],
      correctOptionIndex: 1,
      explanation: "On March 21 (Vernal Equinox) and September 23 (Autumnal Equinox), the overhead sun is directly over the Equator."
    },
    {
      topic: "Latitude & Distance",
      question: "Calculate the approximate ground distance along a meridian between Town P (4\xB0N) and Town Q (14\xB0N). [1\xB0 of latitude \u2248 111 km]",
      options: ["555 km", "1,110 km", "1,554 km", "1,998 km"],
      correctOptionIndex: 1,
      explanation: "Difference in latitude (same hemisphere) = 14\xB0 - 4\xB0 = 10\xB0. Distance = 10 \xD7 111 km = 1,110 km."
    },
    {
      topic: "International Date Line",
      question: "A traveller crossing the International Date Line (180\xB0 meridian) from West (Asia) to East (America):",
      options: [
        "Loses a full calendar day",
        "Gains a full calendar day (repeats a day)",
        "Adjusts the clock by 1 hour only",
        "Experiences no change in calendar date"
      ],
      correctOptionIndex: 1,
      explanation: "Moving eastward across 180\xB0 moves from ahead-of-GMT (+12h) to behind-GMT (-12h), gaining/repeating a calendar day."
    },
    {
      topic: "Earth\u2019s Internal Structure",
      question: "The continental crust, composed predominantly of silica and aluminium, is collectively known as:",
      options: ["SIMA", "SIAL", "Barysphere", "Asthenosphere"],
      correctOptionIndex: 1,
      explanation: "SIAL (Silica + Aluminium, granitic density ~2.7 g/cm\xB3) forms the continental crust, resting above SIMA (Silica + Magnesium, basaltic oceanic crust)."
    },
    {
      topic: "Igneous Rocks",
      question: "Which of the following is an example of a plutonic (intrusive) igneous rock?",
      options: ["Basalt", "Granite", "Shale", "Limestone"],
      correctOptionIndex: 1,
      explanation: "Granite cools slowly at great depth beneath the Earth\u2019s crust, forming coarse crystals (plutonic/intrusive igneous rock)."
    },
    {
      topic: "Fold & Block Mountains",
      question: "A steep-sided trough formed when a crustal block subsides between two parallel normal faults is called a:",
      options: ["Horst", "Rift valley (Graben)", "Anticline", "Caldera"],
      correctOptionIndex: 1,
      explanation: "Subsidence between parallel tensional faults produces a Rift Valley (Graben), such as the East African Rift Valley, whereas uplift forms a Horst (block mountain)."
    },
    {
      topic: "Weathering & Mass Wasting",
      question: "Peeling off of concentric outer rock layers in hot deserts due to alternate daytime expansion and nighttime contraction is termed:",
      options: ["Carbonation", "Exfoliation (onion-peeling)", "Hydrolysis", "Solifluction"],
      correctOptionIndex: 1,
      explanation: "Extreme diurnal temperature changes cause differential heating/cooling of outer rock layers, resulting in exfoliation domes."
    },
    {
      topic: "Fluvial (River) Landforms",
      question: "Which of the following features is characteristic of the lower (senile/floodplain) course of a river?",
      options: ["Interlocking spurs", "Ox-bow lakes and levees", "Potholes and plunges", "V-shaped gorges"],
      correctOptionIndex: 1,
      explanation: "In the lower plain course, lateral erosion and deposition predominate, forming pronounced meanders, ox-bow lakes, floodplains, levees, and deltas."
    },
    {
      topic: "Arid / Desert Landforms",
      question: "Crescent-shaped sand dunes with horns pointing downwind, formed by wind deposition in deserts, are called:",
      options: ["Zeugen", "Yardangs", "Barchans", "Inselbergs"],
      correctOptionIndex: 2,
      explanation: "Barchans are crescentic mobile sand dunes formed by wind deposition where sand supply is moderate and wind direction is steady."
    },
    {
      topic: "Karst (Limestone) Topography",
      question: "Slender pillars of calcium carbonate hanging downwards from the roof of an underground limestone cave are:",
      options: ["Stalagmites", "Stalactites", "Grikes", "Dolines"],
      correctOptionIndex: 1,
      explanation: "Stalactites hang tightly from the ceiling of limestone caverns, while stalagmites grow upward from the cave floor."
    },
    {
      topic: "Coastal Landforms",
      question: "Which of the following is a feature of wave deposition rather than wave erosion?",
      options: ["Sea stack", "Wave-cut platform", "Sand spit and tombolo", "Blowhole"],
      correctOptionIndex: 2,
      explanation: "Longshore drift deposits sand and shingle along coasts to create beaches, spits, bars, and tombolos."
    },
    {
      topic: "Weather Instruments",
      question: "Lines drawn on a weather map joining places having equal atmospheric pressure reduced to sea level are:",
      options: ["Isotherms", "Isohyets", "Isobars", "Isohels"],
      correctOptionIndex: 2,
      explanation: "Isobars connect points of equal pressure (Isotherms = temperature, Isohyets = rainfall, Isohels = sunshine)."
    },
    {
      topic: "Atmospheric Layers",
      question: "Almost all weather phenomena (clouds, rainfall, storms) occur within the lowest layer of the atmosphere called the:",
      options: ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"],
      correctOptionIndex: 1,
      explanation: "The troposphere contains ~75\u201380% of atmospheric mass and virtually all water vapour and dust nuclei."
    },
    {
      topic: "Rainfall Types",
      question: "Heavy afternoon rain accompanied by thunder and lightning in equatorial regions like Calabar and Port Harcourt is predominantly:",
      options: ["Orographic rainfall", "Convectional rainfall", "Cyclonic rainfall", "Frontal drizzle"],
      correctOptionIndex: 1,
      explanation: "Intense solar heating causes warm moist air to rise rapidly by convection, condensing into cumulonimbus clouds that bring heavy afternoon downpours."
    },
    {
      topic: "Ocean Currents",
      question: "Which cold ocean current flows along the south-western coast of Africa and contributes to the aridity of the Namib Desert?",
      options: ["Guinea Current", "Agulhas Current", "Benguela Current", "Canary Current"],
      correctOptionIndex: 2,
      explanation: "The cold Benguela Current cools onshore winds along SW Africa, inhibiting rainfall and sustaining the Namib Desert."
    },
    {
      topic: "World Climatic Types",
      question: "Which climatic region is uniquely characterized by warm, dry sunny summers and mild, wet winters (ideal for citrus fruits, olives, and viticulture)?",
      options: [
        "Tropical Monsoon climate",
        "Mediterranean climate",
        "Equatorial climate",
        "Cool Temperate Interior climate"
      ],
      correctOptionIndex: 1,
      explanation: "Mediterranean regions (30\xB0\u201345\xB0 N/S on western continental margins) experience offshore trade winds in summer (dry) and onshore westerlies in winter (wet)."
    },
    {
      topic: "Soil Science (Pedology)",
      question: "Which soil type possesses the highest water-retaining capacity, finest particle size, and lowest permeability?",
      options: ["Sandy soil", "Loamy soil", "Clay soil", "Gravelly soil"],
      correctOptionIndex: 2,
      explanation: "Clay has microscopic pore spaces (<0.002 mm particles), retaining abundant capillary water while draining poorly."
    },
    {
      topic: "Environmental Hazards",
      question: "Sheet and gully erosion are most severe in South-Eastern Nigeria (e.g., Anambra and Imo States) due to:",
      options: [
        "Frequent Harmattan dust storms",
        "Friable sandy sedimentary soils combined with torrential rainfall and deforestation",
        "Glacial abrasion on steep highlands",
        "Absence of surface rivers"
      ],
      correctOptionIndex: 1,
      explanation: "Unconsolidated coastal plain sands/Nanka sands and intense tropical downpours trigger severe gully erosion (e.g., Agulu-Nanka gullies)."
    },
    {
      topic: "Relief of Nigeria",
      question: "What is the highest mountain peak in Nigeria (standing at about 2,419 metres above sea level)?",
      options: ["Shere Hills", "Idanre Hills", "Chappal Waddi", "Zuma Rock"],
      correctOptionIndex: 2,
      explanation: "Chappal Waddi (Gangirwal) on the Mambilla/Gotel Mountains in Taraba State along the Cameroon border is Nigeria\u2019s highest peak."
    },
    {
      topic: "Drainage of Nigeria",
      question: "The Jos Plateau is often described as the hydrological centre of Northern Nigeria because:",
      options: [
        "River Niger originates from it",
        "Major rivers like Kaduna, Gongola, Hadejia, and Yobe radiate outward from it",
        "It contains Lake Kainji",
        "It lies below sea level"
      ],
      correctOptionIndex: 1,
      explanation: "The elevated North-Central Jos Plateau exhibits a radial drainage pattern feeding several major northern river basins."
    },
    {
      topic: "Dams & Hydroelectric Power in Nigeria",
      question: "Kainji Dam, Nigeria\u2019s pioneer hydroelectric power project, is built across:",
      options: ["River Benue", "River Niger", "River Kaduna", "Cross River"],
      correctOptionIndex: 1,
      explanation: "Kainji Dam (and Jebba Dam downstream) is constructed on the River Niger, whereas Shiroro Dam is on River Kaduna."
    },
    {
      topic: "Cash & Food Crops of Nigeria",
      question: "Cocoa cultivation flourishes best in South-Western Nigeria (Ondo, Osun, Ogun) primarily because of:",
      options: [
        "Low annual rainfall below 400 mm",
        "Deep, well-drained loamy forest soils and moderate-to-heavy rainfall",
        "Cold montane frost conditions",
        "Waterlogged saline mangrove soils"
      ],
      correctOptionIndex: 1,
      explanation: "Cocoa requires deep, well-drained ferruginous forest soils, high temperatures (~26\xB0C), shade during seedling growth, and 1,150\u20132,000 mm annual rainfall."
    },
    {
      topic: "Pastoral Farming in Nigeria",
      question: "Cattle rearing in Nigeria is concentrated predominantly in the Sudan Savanna rather than the Southern Forest belt mainly because the North is relatively free from:",
      options: ["Locust swarms", "Tsetse flies (vectors of trypanosomiasis)", "Drought", "Harmattan winds"],
      correctOptionIndex: 1,
      explanation: "Open savanna grasslands and low humidity inhibit the tsetse fly that transmits sleeping sickness (nagana) in humid southern forests."
    },
    {
      topic: "Manufacturing Industries in Nigeria",
      question: "Cement factories at Ewekoro, Obajana, Ibese, Gboko, and Sokoto are classified as raw-material-oriented industries because:",
      options: [
        "Cement is exported exclusively by air",
        "Limestone is heavy, bulky, and weight-losing during processing",
        "Skilled labour is found only in rural villages",
        "Limestone requires coastal seawater for cooling"
      ],
      correctOptionIndex: 1,
      explanation: "Because limestone is bulky and loses weight on calcination, transport costs are minimized by siting cement plants right on limestone deposits."
    },
    {
      topic: "Energy & Minerals in Nigeria",
      question: "Sub-bituminous coal deposits in Nigeria have historically been mined chiefly around:",
      options: ["Enugu (Udi Escarpment) and Okaba", "Port Harcourt and Bonny", "Sokoto and Birnin Kebbi", "Badagry and Epe"],
      correctOptionIndex: 0,
      explanation: 'Enugu ("Coal City") along the Udi Escarpment and parts of Kogi/Benue (Okaba, Owukpa) host Nigeria\u2019s major coal seams.'
    },
    {
      topic: "Population Geography",
      question: "The relatively low population density of Nigeria\u2019s Middle Belt compared to the North and South is largely attributed to:",
      options: [
        "Complete absence of arable land",
        "Historical inter-tribal wars/slave raiding and tsetse fly infestation",
        "Sub-zero winter temperatures",
        "Volcanic eruptions"
      ],
      correctOptionIndex: 1,
      explanation: "Historical slave raids depopulated large areas of the Middle Belt, compounded by river blindness (onchocerciasis) and tsetse flies."
    },
    {
      topic: "Settlement Geography",
      question: "When several neighbouring cities and towns expand outward and merge into one continuous built-up urban zone, the resulting settlement is a:",
      options: ["Hamlet", "Conurbation", "Nucleated village", "Dispersed homestead"],
      correctOptionIndex: 1,
      explanation: "A conurbation is formed by the coalescence of formerly separate towns/cities through outward urban sprawl."
    },
    {
      topic: "Transportation",
      question: "Which mode of transport is most economical for moving bulky, non-perishable commodities such as crude oil, iron ore, and machinery across continents?",
      options: ["Air transport", "Ocean/water transport", "Rope-way transport", "Express courier vans"],
      correctOptionIndex: 1,
      explanation: "Ocean shipping offers the lowest freight cost per tonne-kilometre for heavy, bulky international cargo."
    },
    {
      topic: "International Trade & ECOWAS",
      question: "Where is the administrative headquarters (Commission) of the Economic Community of West African States (ECOWAS) located?",
      options: ["Accra, Ghana", "Lagos, Nigeria", "Abuja, Nigeria", "Dakar, Senegal"],
      correctOptionIndex: 2,
      explanation: "Although founded via the 1975 Treaty of Lagos, the ECOWAS Commission headquarters relocated to Abuja, Nigeria."
    },
    {
      topic: "Africa Regional Geography",
      question: "The Aswan High Dam in Egypt was constructed primarily across the River Nile to provide:",
      options: [
        "Tidal wave energy and timber",
        "Perennial irrigation water and hydroelectric power",
        "Navigation to the Atlantic Ocean",
        "Desalination of Red Sea brine"
      ],
      correctOptionIndex: 1,
      explanation: "Lake Nasser behind the Aswan High Dam regulates Nile floods, supports year-round perennial irrigation in arid Egypt, and generates hydroelectricity."
    },
    {
      topic: "GIS & Remote Sensing",
      question: "In Geographic Information Systems (GIS), spatial data represented using discrete points, lines, and polygons is known as:",
      options: ["Raster data", "Vector data", "Analogue film", "Barometric data"],
      correctOptionIndex: 1,
      explanation: "Vector GIS models represent wells/towns as points, roads/rivers as lines (arcs), and states/lakes as polygons, whereas Raster uses pixel grids."
    }
  ]
};

// src/server/jambPacks/mathematicsPack.ts
var MATHEMATICS_PACK = {
  subjectId: "mathematics",
  subjectName: "Mathematics",
  iconName: "functions",
  description: "JAMB UTME Mathematics syllabus (40 CBT questions \xB7 40 mins): Number Bases, Indices/Logarithms, Surds, Matrices, Progressions, Calculus (Differentiation & Integration), and Probability.",
  materialId: "mat-jamb-mathematics-syllabus",
  materialTitle: "JAMB UTME Mathematics Syllabus Study Guide",
  materialSummary: "Complete JAMB Mathematics formula & method guide covering Number Bases, Surds, Matrices, AP/GP, Coordinate Geometry, Calculus, and Statistics.",
  materialSections: [
    `Section 1: Number Bases, Indices, Logarithms, Surds & Sets (JAMB Syllabus)

1. Number Base Conversions:
\u2022 Convert base b to base 10 by expanding in powers of b: e.g., 231\u2084 = 2(4\xB2) + 3(4\xB9) + 1(4\u2070) = 32 + 12 + 1 = 45\u2081\u2080.
\u2022 Convert base 10 to base b by repeated division by b and reading remainders upwards.

2. Laws of Indices & Logarithms:
\u2022 a^m \xD7 a^n = a^(m+n);  a^(-n) = 1 / a^n;  a^(p/q) = (q\u221Aa)^p.
\u2022 log_a(XY) = log_a X + log_a Y;  log_a(X/Y) = log_a X - log_a Y;  log_a(X^k) = k log_a X;  log_b X = (log_a X)/(log_a b).

3. Surds & Two-Set / Three-Set Venn Formulas:
\u2022 Rationalize a / (\u221Ab - \u221Ac) by multiplying numerator and denominator by the conjugate (\u221Ab + \u221Ac), using (\u221Ab)\xB2 - (\u221Ac)\xB2 = b - c.
\u2022 Two sets: n(A \u222A B) = n(A) + n(B) - n(A \u2229 B).`,
    `Section 2: Polynomials, Progressions (AP/GP) & Matrices

1. Arithmetic & Geometric Progressions:
\u2022 AP: nth term T_n = a + (n - 1)d; Sum S_n = (n/2)[2a + (n - 1)d] = (n/2)(a + l).
\u2022 GP: nth term T_n = ar^(n - 1); Sum S_n = a(1 - r^n)/(1 - r); Sum to infinity (|r| < 1): S_\u221E = a / (1 - r).

2. Quadratic Roots & Remainder Theorem:
\u2022 For ax\xB2 + bx + c = 0 with roots \u03B1 and \u03B2: Sum \u03B1 + \u03B2 = -b/a; Product \u03B1\u03B2 = c/a; \u03B1\xB2 + \u03B2\xB2 = (\u03B1 + \u03B2)\xB2 - 2\u03B1\u03B2.
\u2022 Remainder Theorem: When polynomial f(x) is divided by (x - a), the remainder is f(a).

3. 2\xD72 Matrices & Determinants:
\u2022 For A = [[a, b], [c, d]], det(A) = |A| = ad - bc.
\u2022 A is singular (no inverse) when ad - bc = 0.
\u2022 Inverse A\u207B\xB9 = (1 / (ad - bc)) \xD7 [[d, -b], [-c, a]].`,
    `Section 3: Coordinate Geometry, Trigonometry & Mensuration

1. Straight Lines:
\u2022 Gradient m = (y2 - y1) / (x2 - x1); Midpoint = ((x1+x2)/2, (y1+y2)/2); Distance d = \u221A[(x2-x1)\xB2 + (y2-y1)\xB2].
\u2022 Parallel lines have equal gradients (m1 = m2); Perpendicular lines satisfy m1 \xD7 m2 = -1.

2. Mensuration & Circle Theorems:
\u2022 Sector of radius r and angle \u03B8\xB0: Arc length L = (\u03B8/360) \xD7 2\u03C0r; Sector Area = (\u03B8/360) \xD7 \u03C0r\xB2.
\u2022 Angle at the centre of a circle is twice the angle at the circumference; opposite angles of a cyclic quadrilateral sum to 180\xB0; angle in a semicircle is 90\xB0.`,
    `Section 4: Calculus, Permutations/Combinations & Probability

1. Differentiation & Integration:
\u2022 If y = ax^n, dy/dx = n\xB7ax^(n-1). Stationary/turning points occur where dy/dx = 0 (minimum if d\xB2y/dx\xB2 > 0; maximum if d\xB2y/dx\xB2 < 0).
\u2022 Indefinite Integral: \u222B x^n dx = x^(n+1)/(n+1) + C (for n \u2260 -1).
\u2022 Kinematics link: v = ds/dt and a = dv/dt.

2. Combinatorics & Probability:
\u2022 Permutations: ^nP_r = n! / (n - r)!; Arrangements of word with repeated letters = n! / (p! q! ...).
\u2022 Combinations: ^nC_r = n! / [(n - r)! r!].
\u2022 Mutually exclusive events (OR): P(A \u222A B) = P(A) + P(B). Independent events (AND): P(A \u2229 B) = P(A) \xD7 P(B).`
  ],
  pastPaperId: "pq-jamb-mathematics",
  pastPaperTitle: "JAMB UTME Mathematics Past Questions & Official Answers (40 Questions)",
  pastPaperYear: "2024",
  pastPaperSummary: "Complete 40-question JAMB UTME Mathematics paper covering Number Bases, Matrices, Progressions, Differentiation, Integration, Geometry, and Probability.",
  questions: [
    {
      topic: "Calculus \u2014 Differentiation",
      question: "Find the value of x at which the curve y = x\xB3 - 6x\xB2 + 9x + 2 attains its local maximum.",
      options: ["x = 1", "x = 2", "x = 3", "x = -1"],
      correctOptionIndex: 0,
      explanation: "dy/dx = 3x\xB2 - 12x + 9 = 3(x - 1)(x - 3) = 0 \u21D2 x = 1 or x = 3. Second derivative d\xB2y/dx\xB2 = 6x - 12. At x = 1, d\xB2y/dx\xB2 = 6(1) - 12 = -6 < 0, confirming a local maximum at x = 1."
    },
    {
      topic: "Matrices & Determinants",
      question: "Find the positive value of x if the matrix P = [[2x, 4], [9, x]] is singular.",
      options: ["2", "3", "3\u221A2", "6"],
      correctOptionIndex: 2,
      explanation: "A matrix is singular when its determinant is zero: (2x)(x) - (4)(9) = 0 \u21D2 2x\xB2 = 36 \u21D2 x\xB2 = 18 \u21D2 x = \u221A18 = 3\u221A2."
    },
    {
      topic: "Geometric Progression",
      question: "The first term of an infinite geometric progression is 18 and its sum to infinity is 27. Find the common ratio r.",
      options: ["1/3", "2/3", "1/2", "3/4"],
      correctOptionIndex: 0,
      explanation: "S_\u221E = a / (1 - r) \u21D2 27 = 18 / (1 - r) \u21D2 1 - r = 18 / 27 = 2/3 \u21D2 r = 1 - 2/3 = 1/3."
    },
    {
      topic: "Number Bases",
      question: "If 23_x + 101_2 = 18_10, find the base x.",
      options: ["4", "5", "6", "7"],
      correctOptionIndex: 1,
      explanation: "Convert each term to base 10: (2x + 3) + (1\xD72\xB2 + 0\xD72\xB9 + 1\xD72\u2070) = 18 \u21D2 2x + 3 + 5 = 18 \u21D2 2x = 10 \u21D2 x = 5."
    },
    {
      topic: "Coordinate Geometry",
      question: "Find the equation of the line passing through (2, -1) and perpendicular to the line 3x - 2y + 7 = 0.",
      options: [
        "2x + 3y - 1 = 0",
        "3x + 2y - 4 = 0",
        "2x - 3y - 7 = 0",
        "2x + 3y + 1 = 0"
      ],
      correctOptionIndex: 0,
      explanation: "Rewrite 3x - 2y + 7 = 0 as y = (3/2)x + 7/2, so m1 = 3/2. Perpendicular gradient m2 = -1/m1 = -2/3. Line through (2, -1): y - (-1) = (-2/3)(x - 2) \u21D2 3y + 3 = -2x + 4 \u21D2 2x + 3y - 1 = 0."
    },
    {
      topic: "Permutations & Arrangements",
      question: "In how many distinct ways can the letters of the word COMMITTEE be arranged?",
      options: ["45,360", "90,720", "181,440", "362,880"],
      correctOptionIndex: 0,
      explanation: "COMMITTEE has 9 letters with M repeated 2 times, T repeated 2 times, and E repeated 2 times. Distinct arrangements = 9! / (2! \xD7 2! \xD7 2!) = 362,880 / 8 = 45,360."
    },
    {
      topic: "Binary Arithmetic",
      question: "Convert 37\u2081\u2080 to a binary (base 2) number.",
      options: ["100101\u2082", "101001\u2082", "100011\u2082", "110001\u2082"],
      correctOptionIndex: 0,
      explanation: "37 = 32 + 4 + 1 = 1(2\u2075) + 0(2\u2074) + 0(2\xB3) + 1(2\xB2) + 0(2\xB9) + 1(2\u2070) = 100101\u2082."
    },
    {
      topic: "Indices",
      question: "Solve for x in the exponential equation 9^(x + 1) = 27^(x - 1).",
      options: ["3", "4", "5", "6"],
      correctOptionIndex: 2,
      explanation: "(3\xB2)^(x + 1) = (3\xB3)^(x - 1) \u21D2 3^(2x + 2) = 3^(3x - 3) \u21D2 2x + 2 = 3x - 3 \u21D2 x = 5."
    },
    {
      topic: "Logarithms",
      question: "Evaluate log\u2081\u2080 25 + log\u2081\u2080 40 - log\u2081\u2080 10.",
      options: ["1", "2", "3", "10"],
      correctOptionIndex: 1,
      explanation: "log\u2081\u2080[(25 \xD7 40) / 10] = log\u2081\u2080(1000 / 10) = log\u2081\u2080 100 = 2."
    },
    {
      topic: "Surds",
      question: "Simplify and rationalize: 6 / (\u221A5 - \u221A2).",
      options: ["2(\u221A5 + \u221A2)", "2(\u221A5 - \u221A2)", "3(\u221A5 + \u221A2)", "\u221A5 + \u221A2"],
      correctOptionIndex: 0,
      explanation: "Multiply numerator and denominator by (\u221A5 + \u221A2): 6(\u221A5 + \u221A2) / (5 - 2) = 6(\u221A5 + \u221A2) / 3 = 2(\u221A5 + \u221A2)."
    },
    {
      topic: "Sets & Venn Diagrams",
      question: "In a class of 50 students, 32 offer Physics, 28 offer Chemistry, and 5 offer neither subject. How many students offer BOTH Physics and Chemistry?",
      options: ["10", "15", "18", "20"],
      correctOptionIndex: 1,
      explanation: "n(P \u222A C) = 50 - 5 = 45. Since n(P \u222A C) = n(P) + n(C) - n(P \u2229 C), 45 = 32 + 28 - x \u21D2 x = 60 - 45 = 15."
    },
    {
      topic: "Commercial Arithmetic",
      question: "Find the simple interest on \u20A645,000 for 4 years at 8% per annum.",
      options: ["\u20A612,600", "\u20A614,400", "\u20A616,200", "\u20A618,000"],
      correctOptionIndex: 1,
      explanation: "I = (P \xD7 R \xD7 T) / 100 = (45,000 \xD7 8 \xD7 4) / 100 = 450 \xD7 32 = \u20A614,400."
    },
    {
      topic: "Variation",
      question: "If y varies inversely as the square of x, and y = 4 when x = 3, find y when x = 6.",
      options: ["1", "2", "8", "16"],
      correctOptionIndex: 0,
      explanation: "y = k / x\xB2 \u21D2 k = yx\xB2 = 4 \xD7 3\xB2 = 36. When x = 6, y = 36 / 6\xB2 = 36 / 36 = 1."
    },
    {
      topic: "Quadratic Roots",
      question: "If \u03B1 and \u03B2 are the roots of 2x\xB2 - 7x + 3 = 0, find the value of \u03B1 + \u03B2 + \u03B1\u03B2.",
      options: ["2", "5", "7/2", "10"],
      correctOptionIndex: 1,
      explanation: "\u03B1 + \u03B2 = -(-7)/2 = 7/2 and \u03B1\u03B2 = 3/2. Therefore \u03B1 + \u03B2 + \u03B1\u03B2 = 7/2 + 3/2 = 10/2 = 5."
    },
    {
      topic: "Remainder Theorem",
      question: "Find the remainder when f(x) = 2x\xB3 - 3x\xB2 + 4x - 5 is divided by (x - 2).",
      options: ["3", "5", "7", "11"],
      correctOptionIndex: 2,
      explanation: "By Remainder Theorem, R = f(2) = 2(2\xB3) - 3(2\xB2) + 4(2) - 5 = 16 - 12 + 8 - 5 = 7."
    },
    {
      topic: "Simultaneous Linear Equations",
      question: "Solve simultaneously: 3x + 2y = 13 and 2x - y = 4. Find (x + y).",
      options: ["4", "5", "6", "7"],
      correctOptionIndex: 1,
      explanation: "From 2x - y = 4, y = 2x - 4. Substitute into 3x + 2(2x - 4) = 13 \u21D2 7x - 8 = 13 \u21D2 7x = 21 \u21D2 x = 3. Then y = 2(3) - 4 = 2. Hence x + y = 5."
    },
    {
      topic: "Linear Inequalities",
      question: "Find the range of values of x satisfying 3 - 2x < 11.",
      options: ["x < -4", "x > -4", "x < 4", "x > 4"],
      correctOptionIndex: 1,
      explanation: "-2x < 11 - 3 \u21D2 -2x < 8. Dividing by -2 reverses the inequality sign: x > -4."
    },
    {
      topic: "Arithmetic Progression (AP)",
      question: "The 4th term of an Arithmetic Progression is 15 and the 9th term is 35. Find the first term a.",
      options: ["2", "3", "4", "5"],
      correctOptionIndex: 1,
      explanation: "a + 3d = 15 and a + 8d = 35. Subtracting gives 5d = 20 \u21D2 d = 4. Substituting d = 4: a + 3(4) = 15 \u21D2 a = 3."
    },
    {
      topic: "Sum of Arithmetic Progression",
      question: "Find the sum of the first 20 terms of the Arithmetic Progression: 3, 7, 11, 15, ...",
      options: ["780", "820", "840", "860"],
      correctOptionIndex: 1,
      explanation: "Here a = 3, d = 4, n = 20. S\u2082\u2080 = (20/2)[2(3) + (19)(4)] = 10 \xD7 [6 + 76] = 10 \xD7 82 = 820."
    },
    {
      topic: "Binary Operations",
      question: "An operation * is defined on real numbers by p * q = p + q - pq. Find the identity element e under *.",
      options: ["-1", "0", "1", "2"],
      correctOptionIndex: 1,
      explanation: "Require p * e = p \u21D2 p + e - pe = p \u21D2 e(1 - p) = 0 for all p \u21D2 e = 0."
    },
    {
      topic: "Inverse of a 2\xD72 Matrix",
      question: "Find the determinant of the matrix M = [[5, -2], [3, 4]].",
      options: ["14", "20", "26", "-26"],
      correctOptionIndex: 2,
      explanation: "det(M) = (5)(4) - (-2)(3) = 20 - (-6) = 26."
    },
    {
      topic: "Polygons",
      question: "Each interior angle of a regular polygon is 150\xB0. How many sides does the polygon have?",
      options: ["8", "10", "12", "15"],
      correctOptionIndex: 2,
      explanation: "Each exterior angle = 180\xB0 - 150\xB0 = 30\xB0. Number of sides n = 360\xB0 / 30\xB0 = 12."
    },
    {
      topic: "Circle Theorems",
      question: "PQRS is a cyclic quadrilateral inscribed in a circle. If \u2220PQR = 112\xB0, find \u2220PSR.",
      options: ["56\xB0", "68\xB0", "78\xB0", "112\xB0"],
      correctOptionIndex: 1,
      explanation: "Opposite interior angles of a cyclic quadrilateral are supplementary: \u2220PSR = 180\xB0 - 112\xB0 = 68\xB0."
    },
    {
      topic: "Mensuration \u2014 Sector of Circle",
      question: "Calculate the area of a sector of a circle of radius 14 cm which subtends an angle of 90\xB0 at the centre. [Take \u03C0 = 22/7]",
      options: ["77 cm\xB2", "154 cm\xB2", "308 cm\xB2", "616 cm\xB2"],
      correctOptionIndex: 1,
      explanation: "Area = (90 / 360) \xD7 (22/7) \xD7 14 \xD7 14 = (1/4) \xD7 616 = 154 cm\xB2."
    },
    {
      topic: "Mensuration \u2014 Solid Shapes",
      question: "Find the volume of a right circular cone of base radius 7 cm and perpendicular height 12 cm. [Take \u03C0 = 22/7]",
      options: ["154 cm\xB3", "616 cm\xB3", "924 cm\xB3", "1,848 cm\xB3"],
      correctOptionIndex: 1,
      explanation: "Volume of cone = (1/3)\u03C0r\xB2h = (1/3) \xD7 (22/7) \xD7 7 \xD7 7 \xD7 12 = 22 \xD7 7 \xD7 4 = 616 cm\xB3."
    },
    {
      topic: "Coordinate Geometry \u2014 Midpoint & Distance",
      question: "Calculate the straight-line distance between points A(-1, 2) and B(4, 14).",
      options: ["12 units", "13 units", "15 units", "17 units"],
      correctOptionIndex: 1,
      explanation: "d = \u221A[(4 - (-1))\xB2 + (14 - 2)\xB2] = \u221A(5\xB2 + 12\xB2) = \u221A(25 + 144) = \u221A169 = 13 units."
    },
    {
      topic: "Trigonometric Ratios",
      question: "If sin \u03B8 = 5/13 and \u03B8 is an acute angle, evaluate tan \u03B8.",
      options: ["5/12", "12/13", "12/5", "13/12"],
      correctOptionIndex: 0,
      explanation: "Adjacent side = \u221A(13\xB2 - 5\xB2) = \u221A(169 - 25) = 12. Thus tan \u03B8 = Opposite / Adjacent = 5/12."
    },
    {
      topic: "Angles of Elevation",
      question: "From a point on level ground 30 m away from the foot of a vertical mast, the angle of elevation of the top of the mast is 60\xB0. Find the height of the mast.",
      options: ["10\u221A3 m", "15\u221A3 m", "30 m", "30\u221A3 m"],
      correctOptionIndex: 3,
      explanation: "tan 60\xB0 = h / 30 \u21D2 h = 30 tan 60\xB0 = 30\u221A3 m."
    },
    {
      topic: "Differentiation \u2014 Chain/Power Rule",
      question: "Find dy/dx if y = (2x + 3)\u2074.",
      options: ["4(2x + 3)\xB3", "8(2x + 3)\xB3", "2(2x + 3)\xB3", "8(2x + 3)\u2074"],
      correctOptionIndex: 1,
      explanation: "By the chain rule, dy/dx = 4(2x + 3)\xB3 \xD7 d/dx(2x + 3) = 4(2x + 3)\xB3 \xD7 2 = 8(2x + 3)\xB3."
    },
    {
      topic: "Differentiation \u2014 Trigonometric Functions",
      question: "Differentiate y = sin(3x) with respect to x.",
      options: ["cos(3x)", "3 cos(3x)", "-3 cos(3x)", "(1/3) cos(3x)"],
      correctOptionIndex: 1,
      explanation: "d/dx[sin(kx)] = k cos(kx), so d/dx[sin(3x)] = 3 cos(3x)."
    },
    {
      topic: "Calculus in Kinematics",
      question: "The displacement s metres of a particle after t seconds is given by s = t\xB3 - 4t\xB2 + 5t. Find its velocity when t = 3 seconds.",
      options: ["6 m/s", "8 m/s", "10 m/s", "14 m/s"],
      correctOptionIndex: 1,
      explanation: "Velocity v = ds/dt = 3t\xB2 - 8t + 5. At t = 3: v = 3(9) - 8(3) + 5 = 27 - 24 + 5 = 8 m/s."
    },
    {
      topic: "Definite Integration",
      question: "Evaluate the definite integral \u222B\u2080\xB2 (3x\xB2 + 2x) dx.",
      options: ["8", "10", "12", "16"],
      correctOptionIndex: 2,
      explanation: "\u222B(3x\xB2 + 2x) dx = [x\xB3 + x\xB2]\u2080\xB2 = (2\xB3 + 2\xB2) - (0 + 0) = 8 + 4 = 12."
    },
    {
      topic: "Indefinite Integration",
      question: "Find \u222B (6x\xB2 - 4x + 5) dx.",
      options: [
        "2x\xB3 - 2x\xB2 + 5x + C",
        "6x\xB3 - 4x\xB2 + 5x + C",
        "3x\xB3 - 2x\xB2 + 5 + C",
        "12x - 4 + C"
      ],
      correctOptionIndex: 0,
      explanation: "Integrating term-by-term: 6(x\xB3/3) - 4(x\xB2/2) + 5x + C = 2x\xB3 - 2x\xB2 + 5x + C."
    },
    {
      topic: "Descriptive Statistics \u2014 Mean",
      question: "The mean of the five numbers 4, 7, x, 11, and 13 is 9. Find the value of x.",
      options: ["8", "9", "10", "12"],
      correctOptionIndex: 2,
      explanation: "(4 + 7 + x + 11 + 13) / 5 = 9 \u21D2 35 + x = 45 \u21D2 x = 10."
    },
    {
      topic: "Statistics \u2014 Median",
      question: "Find the median of the dataset: 14, 8, 21, 11, 19, 9, 15.",
      options: ["11", "14", "15", "19"],
      correctOptionIndex: 1,
      explanation: "Arrange in ascending order: 8, 9, 11, 14, 15, 19, 21. The middle (4th) value is 14."
    },
    {
      topic: "Statistics \u2014 Pie Chart",
      question: "A family spends \u20A636,000 on food out of a monthly income of \u20A6120,000. What sector angle represents food on a pie chart?",
      options: ["72\xB0", "90\xB0", "108\xB0", "120\xB0"],
      correctOptionIndex: 2,
      explanation: "Sector angle = (36,000 / 120,000) \xD7 360\xB0 = 0.3 \xD7 360\xB0 = 108\xB0."
    },
    {
      topic: "Measures of Dispersion \u2014 Variance",
      question: "Calculate the variance of the numbers 2, 4, 6, 8.",
      options: ["\u221A5", "4", "5", "20"],
      correctOptionIndex: 2,
      explanation: "Mean x\u0304 = (2 + 4 + 6 + 8)/4 = 5. Deviations squared: (2-5)\xB2 + (4-5)\xB2 + (6-5)\xB2 + (8-5)\xB2 = 9 + 1 + 1 + 9 = 20. Variance = 20 / 4 = 5."
    },
    {
      topic: "Combinations",
      question: "A committee of 3 students is to be chosen from 6 boys and 4 girls. In how many ways can the committee consist of 2 boys and 1 girl?",
      options: ["24", "60", "120", "144"],
      correctOptionIndex: 1,
      explanation: "Number of ways = \u2076C\u2082 \xD7 \u2074C\u2081 = [6\xD75 / 2] \xD7 4 = 15 \xD7 4 = 60."
    },
    {
      topic: "Probability \u2014 Without Replacement",
      question: "A bag contains 5 red balls and 3 blue balls. If one ball is drawn at random, what is the probability that it is blue?",
      options: ["3/8", "5/8", "3/5", "1/3"],
      correctOptionIndex: 0,
      explanation: "Total balls = 5 + 3 = 8. P(Blue) = 3/8."
    },
    {
      topic: "Probability \u2014 Independent Events",
      question: "Two fair six-sided dice are tossed simultaneously once. What is the probability of obtaining a total sum of 9?",
      options: ["1/12", "1/9", "1/6", "5/36"],
      correctOptionIndex: 1,
      explanation: "Favourable outcomes for sum 9: (3,6), (4,5), (5,4), (6,3) = 4 outcomes out of 36. Probability = 4/36 = 1/9."
    }
  ]
};

// src/server/jambPacks/biologyPack.ts
var BIOLOGY_PACK = {
  subjectId: "biology",
  subjectName: "Biology",
  iconName: "biotech",
  description: "JAMB UTME Biology syllabus (40 CBT questions \xB7 40 mins): Cell Biology & Osmosis, Plant/Animal Nutrition, Mammalian Physiology, Ecology, Mendelian Genetics, and Evolution.",
  materialId: "mat-jamb-biology-syllabus",
  materialTitle: "JAMB UTME Biology Syllabus Study Guide",
  materialSummary: "Complete JAMB Biology study notes covering Cell Organelles, Nutrition, Excretion/Homeostasis, Ecological Biomes, Genetics, and Evolution.",
  materialSections: [
    `Section 1: Cell Structure, Organization & Transport Processes (JAMB Syllabus)

1. Cell Organelles & Functions:
\u2022 Mitochondrion: Site of aerobic cellular respiration (ATP synthesis \u2014 powerhouse of the cell).
\u2022 Chloroplast: Contains chlorophyll in grana/thylakoids (light stage) and stroma (Calvin cycle dark stage of photosynthesis).
\u2022 Ribosome: Site of protein synthesis; Lysosome: Intracellular digestion / autolysis ("suicide bag"); Golgi Apparatus: Packaging and secretion of glycoproteins.
\u2022 Plant vs Animal Cell: Plant cells possess a cellulose cell wall, chloroplasts, and a large central sap vacuole; animal cells possess centrioles and store carbohydrate as glycogen.

2. Biophysical Transport:
\u2022 Osmosis: Movement of water molecules from a dilute (hypotonic) solution to a concentrated (hypertonic) solution across a selectively permeable membrane.
\u2022 Plant cell in hypertonic solution undergoes Plasmolysis; animal red blood cell in hypotonic solution swells and bursts (Haemolysis).`,
    `Section 2: Nutrition, Transport & Gaseous Exchange

1. Autotrophic & Heterotrophic Nutrition:
\u2022 Photosynthesis: 6CO2 + 6H2O \u2192 C6H12O6 + 6O2. Light stage splits water (photolysis of H2O releasing O2 and NADPH); Dark stage reduces CO2 to glucose in the stroma.
\u2022 Food Tests: Starch + Iodine \u2192 Blue-black; Reducing sugar + Benedict's/Fehling's + heat \u2192 Brick-red precipitate; Protein + Biuret (NaOH + CuSO4) \u2192 Violet/Purple; Protein + Millon's reagent \u2192 Brick-red; Lipids + Sudan III \u2192 Red ring / translucent grease spot.

2. Vascular & Mammalian Transport:
\u2022 Xylem conducts water and dissolved mineral salts upwards (transpiration pull); Phloem translocates manufactured sucrose/amino acids bidirectionally.
\u2022 Mammalian Double Circulation: Pulmonary circuit (Right Ventricle \u2192 Lungs via Pulmonary Artery, the only artery carrying deoxygenated blood) and Systemic circuit (Left Ventricle \u2192 Body via Aorta).`,
    `Section 3: Excretion, Homeostasis, Nervous & Endocrine Systems

1. Excretory Organs across Organisms:
\u2022 Amoeba/Protozoa: Contractile vacuole; Platyhelminthes (Tapeworm/Planaria): Flame cells; Earthworm (Annelids): Nephridia; Insects: Malpighian tubules; Crustaceans: Green glands; Mammals: Kidneys, Skin, Lungs, Liver.
\u2022 Nephron Mechanism: Ultrafiltration in Bowman's capsule, Selective reabsorption of all glucose, amino acids, and water in the Proximal Convoluted Tubule & Loop of Henle (regulated by ADH/Vasopressin from pituitary gland).

2. Hormones & Plant Tropisms:
\u2022 Insulin (Islets of Langerhans in pancreas) lowers blood glucose by converting glucose \u2192 glycogen in the liver (deficiency causes Diabetes mellitus); Glucagon raises blood glucose; Adrenaline prepares body for "fight or flight"; Thyroxine regulates basal metabolic rate (iodine deficiency causes Goitre).
\u2022 Auxins (IAA) accumulate on the shaded side of shoots causing positive phototropism.`,
    `Section 4: Ecology, Mendelian Genetics & Evolution

1. Ecological Instruments & Associations:
\u2022 Anemometer (wind speed), Secchi disc (turbidity/transparency of water), Quadrat (population frequency/density of immobile plants), Baermann funnel (soil organisms).
\u2022 Symbiosis/Mutualism: Lichen (Alga manufactures food + Fungus provides moisture/anchorage), Rhizobium nitrogen-fixing bacteria in root nodules of legumes.

2. Genetics & Variation:
\u2022 Mendel's Monohybrid F2 phenotypic ratio = 3:1; Dihybrid F2 phenotypic ratio = 9:3:3:1.
\u2022 Sex-linked recessive traits (carried on X chromosome, more frequent in males XY): Haemophilia, Red-green colour blindness.
\u2022 ABO Blood Group Codominance: Universal donor = Group O (no antigens); Universal recipient = Group AB (no antibodies).

3. Evolution Theories:
\u2022 Lamarckism: Inheritance of acquired characteristics via use and disuse (disproved).
\u2022 Darwinism: Natural selection and survival of the fittest driven by heritable genetic variation.`
  ],
  pastPaperId: "pq-jamb-biology",
  pastPaperTitle: "JAMB UTME Biology Past Questions & Official Answers (40 Questions)",
  pastPaperYear: "2024",
  pastPaperSummary: "Complete 40-question JAMB UTME Biology paper with verified answers covering Excretion, Genetics, Cell Biology, Nutrition, Physiology, and Ecology.",
  questions: [
    {
      topic: "Excretory Systems",
      question: "Which of the following correctly pairs an organism with its specialized excretory structure?",
      options: [
        "Cockroach \u2014 Nephridium",
        "Flatworm (Planaria) \u2014 Flame cell",
        "Earthworm \u2014 Malpighian tubule",
        "Amoeba \u2014 Green gland"
      ],
      correctOptionIndex: 1,
      explanation: "Platyhelminthes (flatworms like Planaria and Tapeworm) excrete via flame cells. Insects use Malpighian tubules, earthworms use nephridia, and Amoeba uses a contractile vacuole."
    },
    {
      topic: "Mendelian Genetics & Blood Groups",
      question: "A man with heterozygous blood group A (I^A i) marries a woman with heterozygous blood group B (I^B i). What is the probability that their first child will have blood group O?",
      options: ["0%", "25%", "50%", "75%"],
      correctOptionIndex: 1,
      explanation: "Crossing I^A i \xD7 I^B i yields four equally likely genotypes: I^A I^B (AB), I^A i (A), I^B i (B), and ii (Group O). Probability of ii = 1/4 = 25%."
    },
    {
      topic: "Photosynthesis",
      question: "During the light-dependent stage of photosynthesis, the oxygen gas evolved comes directly from the photolysis of:",
      options: [
        "Carbon(IV) oxide",
        "Water molecules",
        "Chlorophyll a",
        "Phosphoglyceric acid"
      ],
      correctOptionIndex: 1,
      explanation: "Radiolabelled isotope experiments confirm that light energy splits water (2H2O \u2192 4H\u207A + 4e\u207B + O2) in the grana; CO2 is reduced during the dark stage."
    },
    {
      topic: "Homeostasis & Hormones",
      question: "Insufficient secretion of Antidiuretic Hormone (ADH) by the posterior pituitary gland results in a condition known as:",
      options: [
        "Diabetes mellitus",
        "Diabetes insipidus",
        "Cretinism",
        "Oedema"
      ],
      correctOptionIndex: 1,
      explanation: "ADH increases water permeability of the distal tubules and collecting ducts. Deficiency causes copious excretion of dilute, sugar-free urine (Diabetes insipidus), whereas insulin deficiency causes Diabetes mellitus."
    },
    {
      topic: "Ecology",
      question: "Which ecological instrument is used to measure the turbidity or depth of light penetration in an aquatic habitat?",
      options: ["Hydrometer", "Hygrometer", "Secchi disc", "Potometer"],
      correctOptionIndex: 2,
      explanation: "A Secchi disc (black-and-white weighted circular plate) measures water transparency/turbidity; potometer measures transpiration rate; hygrometer measures relative humidity."
    },
    {
      topic: "Cell Biology & Osmosis",
      question: "When a red blood cell is placed in distilled water, it swells and bursts. This phenomenon is termed:",
      options: ["Plasmolysis", "Crenation", "Haemolysis", "Turgidity"],
      correctOptionIndex: 2,
      explanation: "Distilled water is hypotonic to red blood cell cytoplasm. Water enters by endosmosis and, because animal cells lack a rigid cellulose wall, the membrane ruptures (haemolysis)."
    },
    {
      topic: "Classification of Living Things",
      question: "Which group of organisms lacks a nuclear membrane and membrane-bound organelles (prokaryotes)?",
      options: ["Protozoa", "Fungi", "Monera (Bacteria & Blue-green algae)", "Bryophyta"],
      correctOptionIndex: 2,
      explanation: "Kingdom Monera comprises prokaryotic unicellular organisms (bacteria and cyanobacteria) whose genetic material lies naked in the nucleoid."
    },
    {
      topic: "Viruses",
      question: "Viruses are regarded as being on the borderline between living and non-living things because they:",
      options: [
        "Carry out aerobic respiration outside host cells",
        "Can crystallize outside living cells and reproduce only inside living host cells",
        "Possess both cell wall and chloroplasts",
        "Grow on sterile agar nutrient media"
      ],
      correctOptionIndex: 1,
      explanation: "Outside a living cell a virus forms inert crystals, whereas inside a host cell it replicates its nucleic acid (DNA or RNA)."
    },
    {
      topic: "Cell Organelles",
      question: "Which cell organelle is the primary site of protein synthesis?",
      options: ["Mitochondrion", "Ribosome", "Lysosome", "Centriole"],
      correctOptionIndex: 1,
      explanation: "Ribosomes translate messenger RNA (mRNA) codons into polypeptide chains during protein synthesis."
    },
    {
      topic: "Cell Division",
      question: "Reduction division that halves the diploid chromosome number (2n \u2192 n) during gamete formation is called:",
      options: ["Mitosis", "Meiosis", "Binary fission", "Budding"],
      correctOptionIndex: 1,
      explanation: "Meiosis produces four haploid (n) daughter gametes and introduces genetic variation through crossing over at Prophase I."
    },
    {
      topic: "Plant Kingdom",
      question: "Mosses and liverworts (Bryophytes) are often described as the amphibians of the plant kingdom because they:",
      options: [
        "Produce large woody cones",
        "Require external water for the swimming of flagellated male gametes during fertilization",
        "Possess well-developed xylem vessels",
        "Bear enclosed seeds inside fruits"
      ],
      correctOptionIndex: 1,
      explanation: "Bryophytes live in moist habitats and depend on a film of water for antherozoids to swim to the archegonium."
    },
    {
      topic: "Arthropods",
      question: "Which class of Arthropoda is characterized by two body divisions (cephalothorax and abdomen), four pairs of walking legs, and NO antennae?",
      options: ["Insecta", "Crustacea", "Arachnida", "Myriapoda"],
      correctOptionIndex: 2,
      explanation: "Arachnids (spiders, scorpions, ticks) have 8 walking legs (4 pairs), a cephalothorax + abdomen, simple eyes, and no antennae."
    },
    {
      topic: "Food Tests & Biochemistry",
      question: "Addition of sodium hydroxide solution followed by a few drops of 1% copper(II) tetraoxosulphate(VI) solution (Biuret test) gives a violet/purple colour in the presence of:",
      options: ["Starch", "Glucose", "Proteins", "Fats and oils"],
      correctOptionIndex: 2,
      explanation: "Peptide bonds in proteins form a characteristic violet/purple coordination complex with alkaline Cu\xB2\u207A ions in the Biuret test."
    },
    {
      topic: "Vitamins & Deficiency Diseases",
      question: "Bleeding gums and poor wound healing (scurvy) result from a dietary deficiency of:",
      options: ["Vitamin A (Retinol)", "Vitamin B1 (Thiamine)", "Vitamin C (Ascorbic acid)", "Vitamin D (Calciferol)"],
      correctOptionIndex: 2,
      explanation: "Vitamin C is essential for collagen synthesis; deficiency causes scurvy (Vitamin A \u2192 night blindness, B1 \u2192 beriberi, D \u2192 rickets)."
    },
    {
      topic: "Mammalian Dentition",
      question: "The space lacking canine teeth between the incisors and premolars in herbivorous mammals such as rabbits and sheep is the:",
      options: ["Carnassial gap", "Diastema", "Pulp cavity", "Maxillary cleft"],
      correctOptionIndex: 1,
      explanation: "The diastema allows herbivores to manipulate plant material with the tongue during continuous grinding by cheek teeth."
    },
    {
      topic: "Digestive Enzymes",
      question: "Which enzyme in human gastric juice initiates the digestion of proteins in the acidic medium of the stomach?",
      options: ["Ptyalin", "Pepsin", "Trypsin", "Lipase"],
      correctOptionIndex: 1,
      explanation: "Pepsinogen is activated by gastric HCl (pH ~2) into pepsin, which hydrolyses proteins into peptones and polypeptides."
    },
    {
      topic: "Plant Vascular Tissues",
      question: "Upward conduction of water and dissolved mineral salts from roots to leaves takes place through the:",
      options: ["Phloem sieve tubes", "Xylem vessels", "Cambium ring", "Cortex parenchyma"],
      correctOptionIndex: 1,
      explanation: "Lignified dead xylem vessels transport water and minerals upwards via root pressure, capillarity, and transpiration pull."
    },
    {
      topic: "Transpiration",
      question: "Which instrument is used in the laboratory to measure the rate of transpiration in a leafy shoot?",
      options: ["Auxanometer", "Potometer", "Photometer", "Anemometer"],
      correctOptionIndex: 1,
      explanation: "A potometer measures water uptake by a cut leafy shoot per unit time as a direct indicator of transpiration rate."
    },
    {
      topic: "Mammalian Circulatory System",
      question: "Which blood vessel in mammals carries oxygenated blood directly from the lungs back to the left atrium of the heart?",
      options: ["Pulmonary artery", "Pulmonary vein", "Hepatic portal vein", "Superior vena cava"],
      correctOptionIndex: 1,
      explanation: "The pulmonary vein is the unique vein that transports freshly oxygenated blood from the lungs to the left atrium."
    },
    {
      topic: "Blood Clotting",
      question: "Which component of mammalian blood initiates the blood-clotting cascade when a blood vessel is injured?",
      options: ["Erythrocytes", "Lymphocytes", "Thrombocytes (Platelets)", "Monocytes"],
      correctOptionIndex: 2,
      explanation: "Platelets (thrombocytes) release thromboplastin in the presence of Ca\xB2\u207A and Vitamin K, converting prothrombin to thrombin and fibrinogen to fibrin."
    },
    {
      topic: "Cellular Respiration",
      question: "Anaerobic respiration (fermentation) of glucose by yeast cells produces energy (ATP) along with:",
      options: [
        "Lactic acid only",
        "Ethanol and carbon(IV) oxide",
        "Water and carbon(IV) oxide",
        "Pyruvic acid and oxygen"
      ],
      correctOptionIndex: 1,
      explanation: "Alcoholic fermentation in yeast/plants yields C2H5OH + CO2 + 2 ATP (whereas anaerobic respiration in vertebrate muscle produces lactic acid)."
    },
    {
      topic: "Respiratory Organs",
      question: "Gaseous exchange in adult insects such as the grasshopper occurs directly through a branching network of:",
      options: ["Book lungs", "Gills", "Tracheae and tracheoles", "Moist skin"],
      correctOptionIndex: 2,
      explanation: "Air enters through spiracles and diffuses through tracheal tubes and fluid-tipped tracheoles directly to insect tissues."
    },
    {
      topic: "Mammalian Kidney",
      question: "In a healthy human nephron, complete selective reabsorption of glucose and amino acids occurs in the:",
      options: [
        "Glomerulus",
        "Proximal convoluted tubule",
        "Collecting duct",
        "Ureter"
      ],
      correctOptionIndex: 1,
      explanation: "Cells of the proximal convoluted tubule possess microvilli and abundant mitochondria to actively reabsorb 100% of filtered glucose and amino acids."
    },
    {
      topic: "Liver Functions",
      question: "Excess amino acids cannot be stored in the mammalian body and are broken down into urea in the liver by a process called:",
      options: ["Emulsification", "Deamination", "Detoxification", "Transamination"],
      correctOptionIndex: 1,
      explanation: "Deamination removes the amino group (-NH2) from excess amino acids and converts toxic ammonia into urea via the ornithine cycle."
    },
    {
      topic: "Skeletal System",
      question: "Which cervical vertebra possesses a prominent peg-like odontoid process on which the skull pivots to allow shaking the head?",
      options: ["Atlas", "Axis", "Thoracic vertebra", "Lumbar vertebra"],
      correctOptionIndex: 1,
      explanation: "The Axis (second cervical vertebra) bears the odontoid process that articulates with the Atlas (first cervical vertebra)."
    },
    {
      topic: "Nervous System \u2014 Brain",
      question: "Which part of the mammalian hindbrain coordinates muscular balance, posture, and precision of voluntary movements?",
      options: ["Cerebrum", "Cerebellum", "Hypothalamus", "Olfactory lobe"],
      correctOptionIndex: 1,
      explanation: "The cerebellum receives proprioceptive and semicircular canal impulses to maintain posture and muscular coordination."
    },
    {
      topic: "Sense Organs \u2014 Mammalian Ear",
      question: "Which structure in the mammalian ear equalizes air pressure on both sides of the tympanic membrane (eardrum)?",
      options: ["Cochlea", "Eustachian tube", "Semicircular canals", "Oval window"],
      correctOptionIndex: 1,
      explanation: "The Eustachian tube connects the middle ear cavity to the pharynx, equalizing atmospheric pressure across the eardrum."
    },
    {
      topic: "Plant Growth Hormones",
      question: "Unilateral illumination causes plant shoots to bend towards the light (positive phototropism) because auxins:",
      options: [
        "Accumulate on the illuminated side and inhibit elongation",
        "Migrate to the shaded side and stimulate faster cell elongation there",
        "Are completely destroyed throughout the root tip",
        "Cause guard cells to close permanently"
      ],
      correctOptionIndex: 1,
      explanation: "Higher auxin (IAA) concentration on the shaded side of a stem promotes rapid cell elongation, bending the shoot towards light."
    },
    {
      topic: "Flowering Plant Reproduction",
      question: "Double fertilization in angiosperms involves one male nucleus fusing with the egg cell to form the diploid zygote, while the second male nucleus fuses with two polar nuclei to form the:",
      options: ["Testa", "Pericarp", "Triploid endosperm nucleus (3n)", "Pollen tube"],
      correctOptionIndex: 2,
      explanation: "Triple fusion (n + 2n) creates the 3n primary endosperm nucleus, which develops into nutritive endosperm tissue."
    },
    {
      topic: "Seed Germination",
      question: "Germination in which the cotyledons are carried above the soil surface due to rapid elongation of the hypocotyl (as in cowpea/bean) is:",
      options: ["Hypogeal germination", "Epigeal germination", "Viviparous germination", "Parthenocarpy"],
      correctOptionIndex: 1,
      explanation: "In epigeal germination (e.g., cowpea, castor oil), hypocotyl elongation lifts cotyledons above ground; in maize (hypogeal), cotyledon remains underground."
    },
    {
      topic: "Insect Metamorphosis",
      question: "Which of the following insects undergoes incomplete (hemimetabolous) metamorphosis (Egg \u2192 Nymph \u2192 Adult)?",
      options: ["Housefly", "Mosquito", "Butterfly", "Cockroach"],
      correctOptionIndex: 3,
      explanation: "Cockroaches, grasshoppers, and termites lack a pupal stage and develop via Egg \u2192 Nymph \u2192 Adult."
    },
    {
      topic: "Ecological Associations",
      question: "A lichen growing on bare rock represents a mutualistic (symbiotic) association between:",
      options: [
        "A bacterium and a virus",
        "An alga and a fungus",
        "A moss and a fern",
        "Two parasitic flowering plants"
      ],
      correctOptionIndex: 1,
      explanation: "In lichens, the photosynthetic alga supplies organic carbohydrates while the fungal mycelium provides water, minerals, and protection."
    },
    {
      topic: "Nitrogen Cycle",
      question: "Which soil bacteria convert ammonium compounds first into nitrites and then into nitrates (nitrification)?",
      options: [
        "Pseudomonas denitrificans",
        "Nitrosomonas and Nitrobacter",
        "Clostridium and Azotobacter",
        "Escherichia coli"
      ],
      correctOptionIndex: 1,
      explanation: "Nitrosomonas oxidizes ammonium (NH4\u207A) to nitrite (NO2\u207B), and Nitrobacter oxidizes nitrite to nitrate (NO3\u207B)."
    },
    {
      topic: "Food Chains & Trophic Levels",
      question: "In any terrestrial ecosystem, the organisms with the largest total available energy at the base of the pyramid of energy are the:",
      options: ["Tertiary consumers", "Secondary consumers", "Primary consumers (herbivores)", "Autotrophic producers (green plants)"],
      correctOptionIndex: 3,
      explanation: "Producers capture solar energy directly; roughly 90% of energy is lost as heat/respiration at each successive trophic transfer."
    },
    {
      topic: "Mendelian Monohybrid Cross",
      question: "When two heterozygous tall pea plants (Tt \xD7 Tt) are self-crossed, what is the expected genotypic ratio in the F2 generation?",
      options: ["3 : 1", "1 : 2 : 1", "9 : 3 : 3 : 1", "1 : 1"],
      correctOptionIndex: 1,
      explanation: "Tt \xD7 Tt produces 1 TT : 2 Tt : 1 tt (genotypic ratio 1:2:1; phenotypic ratio 3 tall : 1 dwarf)."
    },
    {
      topic: "Sex-Linked Inheritance",
      question: "Which of the following human hereditary conditions is a sex-linked recessive trait carried on the X-chromosome?",
      options: ["Albinism", "Sickle-cell anaemia", "Haemophilia", "Tongue rolling"],
      correctOptionIndex: 2,
      explanation: "Haemophilia and red-green colour blindness are X-linked recessive traits, whereas sickle-cell anaemia and albinism are autosomal recessive."
    },
    {
      topic: "Nucleic Acids (DNA & RNA)",
      question: "In a double-stranded DNA molecule, Adenine (A) always pairs via two hydrogen bonds with:",
      options: ["Uracil (U)", "Cytosine (C)", "Guanine (G)", "Thymine (T)"],
      correctOptionIndex: 3,
      explanation: "Complementary base pairing in DNA links Adenine with Thymine (A=T) and Guanine with Cytosine (G\u2261C); Uracil replaces Thymine only in RNA."
    },
    {
      topic: "Variation",
      question: "Which of the following traits in human populations is an example of discontinuous (physiological) variation?",
      options: ["Body height", "Body weight", "ABO blood group", "Skin pigmentation"],
      correctOptionIndex: 2,
      explanation: "ABO blood groups (A, B, AB, O), rhesus factor, and tongue-rolling have distinct classes with no intermediates (discontinuous variation)."
    },
    {
      topic: "Adaptations of Xerophytes",
      question: "Desert plants such as Cactus (Opuntia) conserve water primarily by:",
      options: [
        "Possessing broad thin leaves with numerous exposed stomata",
        "Reducing leaves to spines and storing water in succulent photosynthetic stems",
        "Having poorly developed shallow root systems",
        "Lacking a waxy cuticle"
      ],
      correctOptionIndex: 1,
      explanation: "Reducing leaves to spines drastically cuts transpirational surface area while thick green succulent stems store water and photosynthesize."
    },
    {
      topic: "Organic Evolution",
      question: "Structures in different vertebrates\u2014such as the human forelimb, whale flipper, and bat wing\u2014that share a common embryonic and skeletal origin despite performing different functions are:",
      options: ["Analogous structures", "Homologous structures", "Vestigial organs", "Mutant appendages"],
      correctOptionIndex: 1,
      explanation: "Pentadactyl vertebrate forelimbs are homologous structures illustrating divergent evolution (adaptive radiation) from a common ancestor."
    }
  ]
};

// src/server/jambPacks/englishPack.ts
var ENGLISH_PACK = {
  subjectId: "english-language",
  subjectName: "English Language",
  iconName: "menu_book",
  description: "JAMB UTME Use of English syllabus (50 CBT questions \xB7 40 mins): Comprehension & Register, Lexis & Structure, Concord Rules, Idioms/Phrasal Verbs, Antonyms/Synonyms, and Oral Forms (Phonetics & Stress).",
  materialId: "mat-jamb-english-syllabus",
  materialTitle: "JAMB UTME Use of English Syllabus Study Guide",
  materialSummary: "Complete JAMB Use of English revision covering Concord Rules, Subjunctive Mood, Lexis/Idioms, Comprehension Inference, Word Stress, and Emphatic Stress.",
  materialSections: [
    `Section 1: Lexis & Structure \u2014 Golden Rules of Concord (JAMB Syllabus)

1. Accompaniment Concord:
\u2022 When two subjects are joined by "as well as", "along with", "together with", "in addition to", "accompanied by", or "no less than", the verb agrees strictly with the FIRST subject:
  - Example: "The principal, together with his vice-principals, IS attending the summit."

2. Proximity Concord:
\u2022 With correlative conjunctions "either...or", "neither...nor", "not only...but also", the verb agrees with the subject NEARER to the verb:
  - Example: "Neither the coach nor the players WERE happy." / "Neither the players nor the coach WAS happy."

3. Indefinite Pronouns & "One of + Plural Noun":
\u2022 Everybody, everyone, each, someone, nobody, neither, either take SINGULAR verbs ("Everyone HAS arrived").
\u2022 "One of the boys IS here", BUT in relative clauses: "Tunde is one of the students who HAVE passed" (verb agrees with antecedent "students"), unless preceded by "the only": "Tunde is the ONLY one of the students who HAS passed."`,
    `Section 2: Unreal Past (Subjunctive), Question Tags & Prepositions

1. High-Time & Subjunctive Structures:
\u2022 Expressions "It is time...", "It is high time...", "I would rather you...", and "I wish..." when followed by a subject take the PAST TENSE verb to express present unreal/urgent action:
  - Correct: "It is high time the government REPAIRED the bridge." (NOT "repairs" or "to repair").

2. Question Tags:
\u2022 Positive statement \u2192 Negative tag; Negative statement \u2192 Positive tag.
\u2022 Words like hardly, scarcely, barely, seldom, rarely, nothing, nobody make a clause NEGATIVE, so they take a POSITIVE tag:
  - Example: "She scarcely visits us, DOES she?"
\u2022 "I am early, AREN'T I?" / "Let's begin the test, SHALL we?"

3. Exam-Tested Prepositional Collocations:
\u2022 Accused OF (not for), Congratulate ON (not for), Comprise (NO "of" in active voice: "The committee comprises five members" OR "is composed of"), Prefer X TO Y (never "prefer X than Y"), Superior/Inferior/Senior/Junior TO (never "than").`,
    `Section 3: Comprehension, Idioms, Antonyms & Synonyms

1. Contextual Vocabulary & Idiomatic Interpretation:
\u2022 Always interpret synonyms and antonyms WITHIN sentence context rather than isolated dictionary meanings.
\u2022 Common JAMB Idioms:
  - "To throw in the towel" = To admit defeat / surrender.
  - "To sit on the fence" = To remain neutral / undecided.
  - "A flash in the pan" = A brief success never repeated.
  - "To turn over a new leaf" = To reform one's behaviour for the better.
  - "At loggerheads" = In fierce disagreement / conflict.`,
    `Section 4: Oral Forms \u2014 Phonetics, Word Stress & Emphatic Stress

1. Polysyllabic Word Stress Rules:
\u2022 Words ending in -TION, -SION, -IC, -IAL take primary stress on the PENULTIMATE syllable (second from the end): e.g., edu-CA-tion, de-CI-sion, demo-CRAT-ic.
\u2022 Words ending in -ITY, -TY, -PHY, -GY, -ATE (3+ syllables) take stress on the ANTEPENULTIMATE syllable (third from the end): e.g., u-ni-VER-si-ty, pho-TOG-ra-phy, de-MOC-ra-cy.

2. Emphatic / Contrastive Stress (Guaranteed JAMB Section):
\u2022 A word written in CAPITAL LETTERS carries emphatic stress.
\u2022 Rule: Choose the option that CONTRADICTS (changes) ONLY the capitalized word while keeping every other word/detail consistent! Note: Do NOT pick an option that merely repeats the capitalized word; pick the question that asks about or contrasts the capitalized element.`
  ],
  pastPaperId: "pq-jamb-english",
  pastPaperTitle: "JAMB UTME Use of English Past Questions & Official Answers (50 Questions)",
  pastPaperYear: "2024",
  pastPaperSummary: "Complete 50-question JAMB UTME Use of English paper covering Comprehension/Registers, Concord, Subjunctive Mood, Lexis, Idioms, Antonyms/Synonyms, Phonetics, Word Stress, and Emphatic Stress.",
  questions: [
    {
      topic: "Concord & Structure",
      question: "Choose the option that best completes the sentence: The Vice-Chancellor, accompanied by the Deans of Faculties, ______ scheduled to address the matriculating students.",
      options: ["are", "were", "is", "have been"],
      correctOptionIndex: 2,
      explanation: 'By the rule of accompaniment concord ("accompanied by", "together with", "as well as"), the verb agrees with the singular head noun "The Vice-Chancellor", taking singular "is".'
    },
    {
      topic: "Subjunctive / Unreal Past",
      question: "Choose the option that best completes the gap: It is high time the youth ______ waiting solely for white-collar jobs.",
      options: ["stop", "stopped", "should stop", "stops"],
      correctOptionIndex: 1,
      explanation: 'After "It is time / It is high time + subject", English grammar requires the past simple subjunctive ("stopped") to express present urgency.'
    },
    {
      topic: "Oral English \u2014 Emphatic Stress",
      question: "Choose the question to which the given sentence is the appropriate answer: Amina bought a BLUE handbag yesterday.",
      options: [
        "Did Fatima buy a blue handbag yesterday?",
        "Did Amina sell a blue handbag yesterday?",
        "Did Amina buy a black handbag yesterday?",
        "Did Amina buy a blue handbag last week?"
      ],
      correctOptionIndex: 2,
      explanation: 'The word in capitals is "BLUE" (adjective of colour). The correct interrogative contrasts "BLUE" with "black" while retaining "Amina", "buy", "handbag", and "yesterday".'
    },
    {
      topic: "Oral English \u2014 Word Stress",
      question: 'Identify the option that has the primary stress on the correct syllable (shown in capitals) for the word "photography":',
      options: [
        "PHO-to-gra-phy",
        "pho-TO-gra-phy",
        "pho-to-GRA-phy",
        "pho-to-gra-PHY"
      ],
      correctOptionIndex: 1,
      explanation: 'Polysyllabic words ending in "-phy" place primary stress on the antepenultimate syllable (third from the end): pho-TO-gra-phy.'
    },
    {
      topic: "Idioms & Figurative Usage",
      question: "Select the interpretation nearest in meaning to the sentence: Despite fierce pressure from both factions, the chairman chose to sit on the fence.",
      options: [
        "He adjourned the meeting abruptly.",
        "He remained neutral and refused to take sides.",
        "He supported the weaker faction secretly.",
        "He resigned his chairmanship."
      ],
      correctOptionIndex: 1,
      explanation: 'The idiom "to sit on the fence" means to remain neutral or undecided in a dispute.'
    },
    {
      topic: "Question Tags",
      question: "Complete the statement with the appropriate question tag: Musa hardly ever misses morning lectures, ______?",
      options: ["doesn\u2019t he", "does he", "isn\u2019t it", "hasn\u2019t he"],
      correctOptionIndex: 1,
      explanation: 'Because "hardly" is a semi-negative adverb, the main clause counts as negative and therefore requires a positive tag using the present simple auxiliary: "does he".'
    },
    {
      topic: "Proximity Concord",
      question: "Choose the option that best completes the sentence: Neither the captain nor his teammates ______ pleased with the referee\u2019s final decision.",
      options: ["was", "is", "were", "has been"],
      correctOptionIndex: 2,
      explanation: 'With "neither...nor", the verb agrees with the nearer subject ("teammates", plural), requiring "were".'
    },
    {
      topic: "Relative Clause Concord",
      question: "Choose the best option: Chinedu is the only one of the applicants who ______ fluent French.",
      options: ["speak", "speaks", "are speaking", "have spoken"],
      correctOptionIndex: 1,
      explanation: 'When "one of + plural noun" is preceded by "the only", the relative pronoun refers strictly to "the only one" (singular), so it takes "speaks".'
    },
    {
      topic: "Prepositional Collocation",
      question: "Fill in the blank: Most candidates prefer studying late at night ______ waking up before dawn.",
      options: ["than", "from", "to", "over than"],
      correctOptionIndex: 2,
      explanation: 'The verb "prefer" collocates with the preposition "to" ("prefer X to Y"), never "than".'
    },
    {
      topic: "Lexis \u2014 Usage of Comprise",
      question: "Choose the grammatically correct option: The investigative panel ______ five retired judges and two senior advocates.",
      options: ["comprises of", "comprises", "is comprise of", "comprising of"],
      correctOptionIndex: 1,
      explanation: 'In active voice, "comprise" means "consist of" and NEVER takes "of" ("comprises five retired judges" or "is composed of").'
    },
    {
      topic: "Prepositions",
      question: "Complete the sentence: The cashier was accused ______ falsifying the company\u2019s quarterly ledger.",
      options: ["for", "with", "of", "on"],
      correctOptionIndex: 2,
      explanation: 'One is "accused of" an offence (whereas one is "charged with" an offence).'
    },
    {
      topic: "Prepositions",
      question: "Complete the sentence: All members of staff congratulated the new director ______ her well-deserved appointment.",
      options: ["for", "about", "on", "with"],
      correctOptionIndex: 2,
      explanation: 'Standard English requires "congratulate someone ON something".'
    },
    {
      topic: "Order of Adjectives",
      question: "Choose the option with the correct grammatical order of adjectives: The diplomat arrived in a ______ limousine.",
      options: [
        "black brand-new German long",
        "brand-new long black German",
        "German black long brand-new",
        "long German brand-new black"
      ],
      correctOptionIndex: 1,
      explanation: "Standard adjective order (OSASCOMP): Opinion/Condition (brand-new) \u2192 Size/Length (long) \u2192 Colour (black) \u2192 Origin (German)."
    },
    {
      topic: "Conditional Sentences (Type 3)",
      question: "Choose the correct completion: Had the fire brigade arrived ten minutes earlier, the warehouse ______ completely saved.",
      options: [
        "will have been",
        "would be",
        "would have been",
        "had been"
      ],
      correctOptionIndex: 2,
      explanation: 'Inverted Type-3 past unreal conditional ("Had + S + past participle") pairs with "would have + past participle".'
    },
    {
      topic: "Subjunctive \u2014 Would Rather",
      question: "Complete the sentence: I would rather you ______ the confidential report directly to the dean tomorrow.",
      options: ["submit", "submitted", "will submit", "submitting"],
      correctOptionIndex: 1,
      explanation: 'When "would rather" is followed by a different subject ("you"), it takes the past simple form ("submitted") for present/future reference.'
    },
    {
      topic: "Reciprocal Pronouns",
      question: "Fill in the gap: All forty delegates in the conference hall exchanged pleasantries with ______ before the plenary began.",
      options: ["each other", "themselves", "one another", "theirselves"],
      correctOptionIndex: 2,
      explanation: '"One another" is traditionally used for reciprocal action involving more than two people, whereas "each other" refers to two.'
    },
    {
      topic: "Pronoun Case",
      question: "Choose the correct option: Strictly between you and ______, the merger proposal is unlikely to pass.",
      options: ["I", "me", "myself", "mine"],
      correctOptionIndex: 1,
      explanation: 'Prepositions such as "between" govern the objective pronoun case ("between you and me").'
    },
    {
      topic: "Quantifiers \u2014 Few vs A Few",
      question: "Complete the sentence: Although the Physics paper was tough, ______ candidates still scored above ninety percent.",
      options: ["little", "a little", "a few", "much"],
      correctOptionIndex: 2,
      explanation: '"Candidates" is countable plural, and the positive contrast ("still scored") requires positive "a few" (= some).'
    },
    {
      topic: "Phrasal Verbs",
      question: "Choose the phrasal verb that best fills the gap: Because of torrential rain, the inter-house sports competition was ______ until next Friday.",
      options: ["called out", "put off", "put out", "turned down"],
      correctOptionIndex: 1,
      explanation: '"Put off" means to postpone; "call off" means to cancel completely; "put out" means to extinguish.'
    },
    {
      topic: "Phrasal Verbs",
      question: "Choose the correct phrasal verb: Several commuters could not ______ the cryptic handwriting on the noticeboard.",
      options: ["make up", "make out", "make over", "make off"],
      correctOptionIndex: 1,
      explanation: '"Make out" means to decipher, discern, or understand with difficulty.'
    },
    {
      topic: "Passive Voice Transformation",
      question: 'Choose the correct passive form of: "The panel is reviewing the scholarship applications."',
      options: [
        "The scholarship applications have been reviewed by the panel.",
        "The scholarship applications are being reviewed by the panel.",
        "The scholarship applications were being reviewed by the panel.",
        "The scholarship applications are reviewed by the panel."
      ],
      correctOptionIndex: 1,
      explanation: 'Present continuous active ("is reviewing") transforms to present continuous passive ("are being reviewed").'
    },
    {
      topic: "Reported (Indirect) Speech",
      question: 'Convert into indirect speech: "I will submit my thesis tomorrow," Halima said.',
      options: [
        "Halima said that she will submit her thesis tomorrow.",
        "Halima said that she would submit her thesis the following day.",
        "Halima says she would submit her thesis yesterday.",
        "Halima said that I would submit my thesis the next day."
      ],
      correctOptionIndex: 1,
      explanation: 'Backshift "will" \u2192 "would", pronoun "I/my" \u2192 "she/her", and adverbial "tomorrow" \u2192 "the following day / the next day".'
    },
    {
      topic: "Gerunds After Prepositional Phrases",
      question: "Choose the best option: All final-year students are looking forward to ______ their project defence next month.",
      options: ["complete", "completing", "completed", "be complete"],
      correctOptionIndex: 1,
      explanation: 'In "look forward to", "to" is a preposition (not an infinitive marker) and must be followed by a noun or "-ing" gerund ("completing").'
    },
    {
      topic: "Inversion with Negative Adverbs",
      question: "Complete the sentence: No sooner had the invigilator distributed the scripts ______ the power went out.",
      options: ["when", "before", "than", "that"],
      correctOptionIndex: 2,
      explanation: '"No sooner..." always correlates with "than" (whereas "Hardly / Scarcely..." correlates with "when").'
    },
    {
      topic: "Synonyms (Nearest in Meaning)",
      question: "Choose the option NEAREST IN MEANING to the capitalized word: The governor\u2019s speech helped to MITIGATE the tension in the community.",
      options: ["aggravate", "lessen", "prolong", "conceal"],
      correctOptionIndex: 1,
      explanation: '"Mitigate" means to make less severe, alleviate, or lessen.'
    },
    {
      topic: "Synonyms (Nearest in Meaning)",
      question: "Choose the option NEAREST IN MEANING to the capitalized word: The witness gave a LUCID account of what transpired at the junction.",
      options: ["clear and coherent", "lengthy and tedious", "vague and doubtful", "hostile"],
      correctOptionIndex: 0,
      explanation: '"Lucid" means expressed clearly and easy to understand.'
    },
    {
      topic: "Synonyms (Nearest in Meaning)",
      question: "Choose the option NEAREST IN MEANING to the capitalized word: The bursar is known for his FRUGAL management of departmental funds.",
      options: ["reckless", "thrifty and economical", "secretive", "generous"],
      correctOptionIndex: 1,
      explanation: '"Frugal" means prudent, sparing, and economical in avoiding waste.'
    },
    {
      topic: "Synonyms (Nearest in Meaning)",
      question: "Choose the option NEAREST IN MEANING to the capitalized word: Counterfeit drugs pose a PERNICIOUS threat to public health.",
      options: ["minor", "deadly and harmful", "temporary", "predictable"],
      correctOptionIndex: 1,
      explanation: '"Pernicious" means having a deeply harmful, destructive, or ruinous effect.'
    },
    {
      topic: "Synonyms (Nearest in Meaning)",
      question: "Choose the option NEAREST IN MEANING to the capitalized word: Her EPHEMERAL fame faded within a single season.",
      options: ["short-lived", "eternal", "widespread", "undeserved"],
      correctOptionIndex: 0,
      explanation: '"Ephemeral" means lasting for a very brief time (transitory, short-lived).'
    },
    {
      topic: "Antonyms (Opposite in Meaning)",
      question: "Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: While the elder brother is GARRULOUS, his twin is remarkably ______.",
      options: ["talkative", "taciturn", "boastful", "jovial"],
      correctOptionIndex: 1,
      explanation: '"Garrulous" means excessively talkative; its direct antonym is "taciturn" (reserved or saying very little).'
    },
    {
      topic: "Antonyms (Opposite in Meaning)",
      question: "Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: Rather than ALLEVIATE the commuters\u2019 hardship, the sudden roadblock ______ it.",
      options: ["eased", "exacerbated", "eliminated", "moderated"],
      correctOptionIndex: 1,
      explanation: '"Alleviate" means to relieve/lessen; "exacerbated" (worsened/aggravated) is its opposite.'
    },
    {
      topic: "Antonyms (Opposite in Meaning)",
      question: "Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: The auditor commended the DILIGENT clerks and reprimanded the ______ ones.",
      options: ["industrious", "indolent", "punctual", "meticulous"],
      correctOptionIndex: 1,
      explanation: '"Diligent" means hardworking and conscientious; "indolent" means lazy/slothful.'
    },
    {
      topic: "Antonyms (Opposite in Meaning)",
      question: "Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: Attendance at the orientation seminar is COMPULSORY for freshmen, whereas the evening concert is ______.",
      options: ["mandatory", "obligatory", "optional", "essential"],
      correctOptionIndex: 2,
      explanation: '"Optional" (voluntary) is the exact opposite of "compulsory" (mandatory).'
    },
    {
      topic: "Antonyms (Opposite in Meaning)",
      question: "Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: What began as an AMICABLE negotiation ended on a ______ note.",
      options: ["friendly", "hostile", "cordial", "harmonious"],
      correctOptionIndex: 1,
      explanation: '"Amicable" means friendly and peaceable; "hostile" is its antonym.'
    },
    {
      topic: "Idioms & Sentence Interpretation",
      question: "Choose the most appropriate interpretation: After three consecutive losses, the boxer finally threw in the towel.",
      options: [
        "He wiped his face before the next round.",
        "He admitted defeat and withdrew from the bout.",
        "He protested against the ringside judges.",
        "He challenged the champion to a rematch."
      ],
      correctOptionIndex: 1,
      explanation: '"To throw in the towel" means to concede defeat or give up.'
    },
    {
      topic: "Idioms & Sentence Interpretation",
      question: "Choose the most appropriate interpretation: Since returning from youth service, Kunle has turned over a new leaf.",
      options: [
        "He started an agricultural business.",
        "He reformed his character and began behaving responsibly.",
        "He bought a brand-new notebook.",
        "He relocated to a rural village."
      ],
      correctOptionIndex: 1,
      explanation: '"To turn over a new leaf" means to make a fresh start by improving one\u2019s conduct.'
    },
    {
      topic: "Idioms & Sentence Interpretation",
      question: "Choose the most appropriate interpretation: Critics dismissed the striker\u2019s opening-day hat-trick as a flash in the pan.",
      options: [
        "A brilliant triumph likely to be repeated every week.",
        "A sudden, isolated success unlikely to happen again.",
        "A goal scored under floodlights.",
        "An unfair advantage caused by poor officiating."
      ],
      correctOptionIndex: 1,
      explanation: '"A flash in the pan" refers to a one-off success that fails to endure.'
    },
    {
      topic: "Idioms & Sentence Interpretation",
      question: "Choose the most appropriate interpretation: The two neighbouring communities have been at loggerheads over boundary farmland for decades.",
      options: [
        "Cooperating in timber logging.",
        "In persistent, bitter dispute.",
        "Sharing farm machinery peacefully.",
        "Negotiating a joint festival."
      ],
      correctOptionIndex: 1,
      explanation: '"At loggerheads" means locked in strong disagreement or conflict.'
    },
    {
      topic: "Register of Law & Judiciary",
      question: "Fill the register gap: Because the prosecution failed to prove guilt beyond reasonable doubt, the trial judge ______ and discharged the defendant.",
      options: ["convicted", "acquitted", "indicted", "remanded"],
      correctOptionIndex: 1,
      explanation: 'In legal register, a court "acquits and discharges" an accused person found not guilty.'
    },
    {
      topic: "Register of Medicine",
      question: "Fill the register gap: Before prescribing any antibiotics, the physician carried out a thorough ______ based on the patient\u2019s laboratory test results.",
      options: ["prognosis", "diagnosis", "autopsy", "quarantine"],
      correctOptionIndex: 1,
      explanation: '"Diagnosis" is the identification of an illness from symptoms and clinical tests ("prognosis" predicts future recovery; "autopsy" is post-mortem).'
    },
    {
      topic: "Register of Aviation & Publishing",
      question: "Fill the register gap: All passengers were instructed to fasten their seatbelts as the aircraft taxied onto the ______ for take-off.",
      options: ["hangar", "runway", "quay", "dockyard"],
      correctOptionIndex: 1,
      explanation: 'Aircraft take off from and land on a "runway" ("hangar" is for parking/maintenance; "quay/dockyard" belong to shipping).'
    },
    {
      topic: "Comprehension & Inference",
      question: 'Read carefully: "True scholarship demands more than passive memorization of formulas; it requires sceptical inquiry and the courage to test cherished assumptions against empirical evidence." Which statement is best supported by this passage?',
      options: [
        "Memorizing formulas is completely useless in examinations.",
        "Genuine scholarship combines critical questioning with evidence-based verification.",
        "Assumptions should never be formulated in science.",
        "Empirical evidence always confirms popular beliefs."
      ],
      correctOptionIndex: 1,
      explanation: 'The passage contrasts mere rote memorization with active critical ("sceptical") inquiry grounded in empirical evidence.'
    },
    {
      topic: "Oral English \u2014 Vowel Sounds",
      question: 'Choose the word that contains the SAME vowel sound as the capitalized letters in "bOOk" (/\u028A/):',
      options: ["food", "blood", "put", "loop"],
      correctOptionIndex: 2,
      explanation: '"book" and "put" share the short lax high back vowel /\u028A/, whereas "food" and "loop" have /u\u02D0/ and "blood" has /\u028C/.'
    },
    {
      topic: "Oral English \u2014 Vowel Sounds",
      question: 'Choose the word that has the SAME vowel sound as the capitalized letters in "hEArt" (/\u0251\u02D0/):',
      options: ["heard", "clerk", "plait", "pat"],
      correctOptionIndex: 1,
      explanation: 'In Received Pronunciation (standard JAMB Oral English), "heart" and "clerk" (/kl\u0251\u02D0k/) share the long open vowel /\u0251\u02D0/.'
    },
    {
      topic: "Oral English \u2014 Silent Consonants",
      question: 'In which of the following words is the letter "b" NOT silent?',
      options: ["plumber", "subtle", "debtor", "fumble"],
      correctOptionIndex: 3,
      explanation: 'The /b/ sound is pronounced in "fumble" (/\u02C8f\u028Cmb\u0259l/), whereas "b" is silent in plumber, subtle, and debtor.'
    },
    {
      topic: "Oral English \u2014 Dental Fricatives",
      question: 'Choose the word that begins with the VOICELESS dental fricative /\u03B8/ (as in "thin"):',
      options: ["though", "worthy", "theme", "leather"],
      correctOptionIndex: 2,
      explanation: '"theme" (/\u03B8i\u02D0m/) begins with the voiceless dental fricative /\u03B8/, whereas "though", "worthy", and "leather" contain voiced /\xF0/.'
    },
    {
      topic: "Oral English \u2014 Rhymes",
      question: 'Choose the option that RHYMES exactly with the word "dough":',
      options: ["cough", "bough", "though", "rough"],
      correctOptionIndex: 2,
      explanation: '"dough" (/d\u0259\u028A/) rhymes with "though" (/\xF0\u0259\u028A/); cough = /k\u0252f/, bough = /ba\u028A/, rough = /r\u028Cf/.'
    },
    {
      topic: "Oral English \u2014 Word Stress",
      question: 'Identify the option with the correct primary stress (in capitals) for the word "education":',
      options: ["ED-u-ca-tion", "ed-U-ca-tion", "ed-u-CA-tion", "ed-u-ca-TION"],
      correctOptionIndex: 2,
      explanation: 'Words ending in "-tion" always carry primary stress on the penultimate syllable (second from the end): ed-u-CA-tion.'
    },
    {
      topic: "Oral English \u2014 Emphatic Stress",
      question: "Choose the question to which the given sentence is the appropriate answer: The principal commended the SENIOR prefects during assembly.",
      options: [
        "Did the vice-principal commend the senior prefects during assembly?",
        "Did the principal punish the senior prefects during assembly?",
        "Did the principal commend the junior prefects during assembly?",
        "Did the principal commend the senior prefects after school?"
      ],
      correctOptionIndex: 2,
      explanation: 'The capitalized word "SENIOR" contrasts directly with "junior" while keeping every other word in the sentence unchanged.'
    },
    {
      topic: "Question Tags \u2014 Imperative / Let\u2019s",
      question: "Complete the sentence with the appropriate question tag: Let us revise all fifty Use of English questions carefully, ______?",
      options: ["will you", "aren\u2019t we", "shall we", "don\u2019t we"],
      correctOptionIndex: 2,
      explanation: 'First-person plural inclusive suggestions beginning with "Let\u2019s / Let us" always take the tag "shall we?".'
    }
  ]
};

// src/server/jambPacks/economicsPack.ts
var ECONOMICS_PACK = {
  subjectId: "economics",
  subjectName: "Economics",
  iconName: "account_balance",
  description: "JAMB UTME Economics syllabus (40 CBT questions \xB7 40 mins): Basic Concepts & Opportunity Cost, Demand/Supply & Elasticity, Cost/Market Structures, National Income, and Fiscal/Monetary Policy.",
  materialId: "mat-jamb-economics-syllabus",
  materialTitle: "JAMB UTME Economics Syllabus Study Guide",
  materialSummary: "Complete JAMB Economics study notes covering Opportunity Cost, Price Elasticity, Utility, Market Structures, National Income, and CBN Monetary Policy.",
  materialSections: [
    `Section 1: Fundamental Economic Concepts & Systems (JAMB Syllabus)

1. Scarcity, Scale of Preference & Opportunity Cost:
\u2022 Scarcity: Limited resources relative to unlimited human wants \u2014 the central economic problem.
\u2022 Scale of Preference: Arrangement of wants in descending order of priority/importance.
\u2022 Opportunity Cost (Real Cost): The next best alternative foregone in order to satisfy a chosen want (distinct from Money Cost, which is nominal expenditure).
\u2022 Production Possibility Curve (PPC): Illustrates opportunity cost, resource efficiency (points on the curve), unemployment/underutilization (points inside the curve), and currently unattainable output (points outside the curve).

2. Economic Systems:
\u2022 Capitalism (Free Market): Private ownership, price mechanism allocates resources, consumer sovereignty.
\u2022 Socialism (Centrally Planned): State ownership and central planning board.
\u2022 Mixed Economy (e.g., Nigeria): Coexistence of private enterprise and public sector intervention.`,
    `Section 2: Theory of Demand, Supply, Equilibrium & Elasticity

1. Market Equilibrium:
\u2022 At equilibrium price P*, Quantity Demanded equals Quantity Supplied: Q_d = Q_s.
\u2022 Price Ceiling (Maximum Price Legislation set BELOW equilibrium): Creates excess demand (shortages, queues, black markets, rationing).
\u2022 Price Floor (Minimum Price Legislation set ABOVE equilibrium, e.g., agricultural price support or minimum wage): Creates excess supply (surpluses).

2. Elasticity Calculations:
\u2022 Price Elasticity of Demand: E_d = (% Change in Q_d) / (% Change in P) = [(\u0394Q / Q1) \xF7 (\u0394P / P1)].
  - E_d > 1 (Elastic): Lowering price INCREASES total revenue.
  - E_d < 1 (Inelastic, e.g., necessities like salt, fuel): Raising price INCREASES total revenue.
\u2022 Cross Elasticity: Positive (+) for Close Substitutes (Milo & Bournvita); Negative (-) for Joint/Complementary goods (Car & Petrol).
\u2022 Income Elasticity: Positive (+) for Normal goods; Negative (-) for Inferior goods.`,
    `Section 3: Production, Cost Concepts & Market Structures

1. Short-Run Cost Relationships:
\u2022 Total Cost (TC) = Total Fixed Cost (TFC) + Total Variable Cost (TVC).
\u2022 Average Cost (AC) = TC / Q; Marginal Cost (MC) = \u0394TC / \u0394Q = TC_n - TC_(n-1).
\u2022 Key Rule: The Marginal Cost (MC) curve always intersects the Average Cost (AC) curve at the MINIMUM point of AC.

2. Profit Maximization & Market Structures:
\u2022 Every firm maximizes profit where Marginal Cost equals Marginal Revenue (MC = MR).
\u2022 Perfect Competition: Many buyers/sellers, homogeneous product, free entry/exit, horizontal perfectly elastic demand curve where Price = AR = MR.
\u2022 Monopoly: Single seller, no close substitutes, barriers to entry (patents, natural resources, legal franchise); downward-sloping demand curve where P > MR.`,
    `Section 4: National Income, Money, Inflation & Public Finance

1. National Income Accounting:
\u2022 GDP (Gross Domestic Product): Market value of final goods/services produced within geographic borders.
\u2022 GNP = GDP + Net Factor Income from Abroad (Receipts - Payments).
\u2022 NNP = GNP - Depreciation (Capital Consumption Allowance).
\u2022 Approaches: Output (Value-Added method avoids double counting), Income, and Expenditure (C + I + G + (X - M)).

2. Money, CBN Monetary Policy & Fiscal Policy:
\u2022 Motives for holding money (Keynes): Transactionary, Precautionary, and Speculative (inversely related to interest rates).
\u2022 Contractionary Monetary Policy (to curb inflation): Central Bank of Nigeria (CBN) SELLS treasury bills in Open Market Operations (OMO), RAISES Monetary Policy Rate (MPR / Bank Rate), and RAISES Cash Reserve Ratio (CRR).
\u2022 Taxation: Direct taxes (Personal Income Tax, Company Tax \u2014 progressive) vs Indirect taxes (VAT, Excise & Customs duties \u2014 often regressive; tax incidence falls on consumers when demand is price-inelastic).`
  ],
  pastPaperId: "pq-jamb-economics",
  pastPaperTitle: "JAMB UTME Economics Past Questions & Official Answers (40 Questions)",
  pastPaperYear: "2024",
  pastPaperSummary: "Complete 40-question JAMB UTME Economics paper covering Market Equilibrium, Price Elasticity, Cost Theory, CBN Monetary Policy, Public Finance, and National Income.",
  questions: [
    {
      topic: "Demand & Supply Equilibrium",
      question: "Given the demand function Qd = 42 - 3P and the supply function Qs = 12 + 2P, determine the equilibrium price and quantity.",
      options: [
        "P = \u20A65, Q = 22 units",
        "P = \u20A66, Q = 24 units",
        "P = \u20A66, Q = 30 units",
        "P = \u20A68, Q = 18 units"
      ],
      correctOptionIndex: 1,
      explanation: "At equilibrium, Qd = Qs \u21D2 42 - 3P = 12 + 2P \u21D2 30 = 5P \u21D2 P = \u20A66. Substitute P = 6 into Qd: Q = 42 - 3(6) = 42 - 18 = 24 units."
    },
    {
      topic: "Price Elasticity of Demand",
      question: "When the price of a commodity rises from \u20A620 to \u20A625, the quantity demanded falls from 100 units to 80 units. What is the coefficient of price elasticity of demand?",
      options: ["0.5", "0.8", "1.25", "2.0"],
      correctOptionIndex: 1,
      explanation: "%\u0394Qd = ((100 - 80) / 100) \xD7 100% = 20%. %\u0394P = ((25 - 20) / 20) \xD7 100% = 25%. Ed = 20% / 25% = 0.8 (inelastic)."
    },
    {
      topic: "CBN Monetary Policy & Inflation",
      question: "To control demand-pull inflation in the economy, the Central Bank of Nigeria (CBN) should:",
      options: [
        "Buy government securities in the open market and lower the cash ratio",
        "Sell government securities in the open market and raise the bank rate",
        "Reduce personal income tax rates across all brackets",
        "Expand commercial bank credit creation"
      ],
      correctOptionIndex: 1,
      explanation: "Selling treasury bills/securities in Open Market Operations (OMO) mops up excess liquidity from commercial banks, while raising the Monetary Policy Rate (bank rate) discourages borrowing."
    },
    {
      topic: "Theory of Costs",
      question: "If a firm\u2019s Total Fixed Cost is \u20A6400 and its Total Variable Cost for producing 10 units is \u20A6600, what is the Average Total Cost (ATC) per unit?",
      options: ["\u20A640", "\u20A660", "\u20A6100", "\u20A61,000"],
      correctOptionIndex: 2,
      explanation: "Total Cost TC = TFC + TVC = \u20A6400 + \u20A6600 = \u20A61,000. Average Total Cost ATC = TC / Q = 1,000 / 10 = \u20A6100."
    },
    {
      topic: "National Income Accounting",
      question: "In computing National Income via the Output Method, double counting is avoided by:",
      options: [
        "Including transfer payments such as pensions and bursaries",
        "Summing only the value added at each stage of production",
        "Adding intermediate raw materials to final output",
        "Excluding exports and imports"
      ],
      correctOptionIndex: 1,
      explanation: "Summing only the Value Added at each production stage (or counting strictly final goods and services) prevents intermediate inputs like flour and bread from being counted twice."
    },
    {
      topic: "Price Legislation",
      question: "When the government fixes a maximum price (price ceiling) below the free-market equilibrium price, the immediate economic consequence is:",
      options: [
        "Excess supply and falling producer inventories",
        "Excess demand, queues, and emergence of a black market",
        "Automatic equilibrium restoration without rationing",
        "A rightward shift of the supply curve"
      ],
      correctOptionIndex: 1,
      explanation: "At a price ceiling below equilibrium, Qd exceeds Qs, creating persistent shortages (excess demand), hoarding, long queues, and parallel black-market pricing."
    },
    {
      topic: "Basic Economic Concepts",
      question: "A student has \u20A65,000 and ranks an Economics textbook (\u20A65,000) ahead of a pair of sandals (\u20A65,000). If she buys the textbook, the sandals foregone represent the:",
      options: ["Money cost", "Marginal cost", "Opportunity cost (real cost)", "Fixed cost"],
      correctOptionIndex: 2,
      explanation: "Opportunity cost is the next best alternative sacrificed in order to satisfy a chosen want; \u20A65,000 is the money cost."
    },
    {
      topic: "Production Possibility Curve (PPC)",
      question: "A point situated strictly INSIDE a country\u2019s Production Possibility Curve indicates:",
      options: [
        "Full and efficient employment of resources",
        "Unattainable output given current technology",
        "Unemployment or underutilization of available resources",
        "Zero opportunity cost"
      ],
      correctOptionIndex: 2,
      explanation: "Points inside the PPC boundary signify idle or inefficiently deployed factors of production."
    },
    {
      topic: "Economic Systems",
      question: "In a pure capitalist (free-market) economy, the fundamental questions of what, how, and for whom to produce are resolved primarily through:",
      options: [
        "A central planning ministry",
        "The price mechanism (forces of demand and supply)",
        "Public referenda",
        "Statutory rationing boards"
      ],
      correctOptionIndex: 1,
      explanation: "Relative price signals and profit incentives guide resource allocation in a market economy."
    },
    {
      topic: "Factors of Production",
      question: "Which factor of production earns profit (or bears risk and uncertainty) as its reward?",
      options: ["Land", "Labour", "Capital", "Entrepreneur"],
      correctOptionIndex: 3,
      explanation: "Rewards: Land \u2192 Rent, Labour \u2192 Wages/Salaries, Capital \u2192 Interest, Entrepreneur \u2192 Profit."
    },
    {
      topic: "Division of Labour",
      question: "As noted by Adam Smith, the extent of division of labour and specialization is ultimately limited by the:",
      options: [
        "Rate of personal income tax",
        "Size (extent) of the market",
        "Number of commercial banks",
        "Age of the entrepreneur"
      ],
      correctOptionIndex: 1,
      explanation: "Mass production via specialization is viable only if market demand is large enough to absorb the output."
    },
    {
      topic: "Scale of Production",
      question: "Cost-saving advantages enjoyed by a single firm specifically as a result of expanding its own scale of output are called:",
      options: [
        "External economies of scale",
        "Internal economies of scale",
        "Social diseconomies",
        "Diminishing marginal utility"
      ],
      correctOptionIndex: 1,
      explanation: "Internal economies (technical, managerial, marketing, financial) accrue to an individual growing firm, whereas external economies stem from industry clustering."
    },
    {
      topic: "Law of Variable Proportions",
      question: "In short-run production, Total Product (TP) reaches its absolute maximum at the exact point where Marginal Product (MP) is:",
      options: ["Maximum", "Equal to Average Product", "Zero", "Rising rapidly"],
      correctOptionIndex: 2,
      explanation: "As long as MP > 0, TP rises; when MP = 0, TP is at its peak; once MP turns negative, TP declines."
    },
    {
      topic: "Business Organizations",
      question: "A key advantage that a Public Limited Liability Company (Plc) enjoys over a Partnership is:",
      options: [
        "Complete freedom from corporate taxation",
        "Ability to raise large equity capital by issuing shares to the general public",
        "Unlimited liability of all shareholders",
        "Absence of annual financial audit requirements"
      ],
      correctOptionIndex: 1,
      explanation: "Public joint-stock companies can invite public subscription on the stock exchange while granting shareholders limited liability."
    },
    {
      topic: "Types of Demand",
      question: "The demand for motor cars and petrol (or torchlights and batteries) is an example of:",
      options: ["Competitive demand", "Complementary (joint) demand", "Composite demand", "Derived demand"],
      correctOptionIndex: 1,
      explanation: "Goods used together to satisfy a single want exhibit joint/complementary demand."
    },
    {
      topic: "Cross Elasticity of Demand",
      question: "If an increase in the price of Milo leads to an increase in the quantity demanded of Bournvita, the cross elasticity of demand between them is:",
      options: ["Negative", "Zero", "Positive", "Infinity"],
      correctOptionIndex: 2,
      explanation: "Close substitutes exhibit positive cross-price elasticity (+%\u0394Qx / +%\u0394Py > 0)."
    },
    {
      topic: "Income Elasticity of Demand",
      question: "Goods whose quantity demanded falls as consumers\u2019 real disposable income rises have a negative income elasticity and are classified as:",
      options: ["Ostentatious goods", "Normal goods", "Inferior goods", "Capital goods"],
      correctOptionIndex: 2,
      explanation: "Inferior goods have negative income elasticity because consumers switch to higher-quality alternatives when income grows."
    },
    {
      topic: "Theory of Consumer Behaviour",
      question: "A rational consumer consuming a single commodity X achieves utility-maximizing equilibrium when:",
      options: [
        "Total Utility equals zero",
        "Marginal Utility of X equals Price of X (MU_x = P_x)",
        "Marginal Utility is rising",
        "Price exceeds Total Utility"
      ],
      correctOptionIndex: 1,
      explanation: "Equilibrium for one good occurs where the marginal utility derived from the last unit equals its price (MU_x = P_x)."
    },
    {
      topic: "Marginal Cost Calculation",
      question: "If the Total Cost of producing 4 units of output is \u20A6520 and the Total Cost of producing 5 units is \u20A6610, what is the Marginal Cost of the 5th unit?",
      options: ["\u20A690", "\u20A6122", "\u20A6130", "\u20A61,130"],
      correctOptionIndex: 0,
      explanation: "MC\u2085 = TC\u2085 - TC\u2084 = \u20A6610 - \u20A6520 = \u20A690."
    },
    {
      topic: "Cost Curves Geometry",
      question: "In short-run cost theory, the Marginal Cost (MC) curve always cuts the Average Total Cost (ATC) curve at:",
      options: [
        "The maximum point of ATC",
        "The minimum (lowest) point of ATC",
        "The vertical intercept of TFC",
        "Zero output"
      ],
      correctOptionIndex: 1,
      explanation: "Whenever MC < ATC, ATC falls; whenever MC > ATC, ATC rises. Hence MC intersects ATC at ATC\u2019s minimum point."
    },
    {
      topic: "Perfect Competition",
      question: "The demand curve facing an individual firm operating under Perfect Competition is:",
      options: [
        "Downward sloping from left to right",
        "Perfectly elastic (horizontal) where Price = AR = MR",
        "Perfectly inelastic (vertical)",
        "Kinked at the ruling market price"
      ],
      correctOptionIndex: 1,
      explanation: "Each perfectly competitive firm is a price-taker selling homogeneous units at the ruling market price, so P = AR = MR."
    },
    {
      topic: "Monopoly & Price Discrimination",
      question: "A monopolist can successfully practice price discrimination between two markets only if:",
      options: [
        "Both markets have identical price elasticities of demand",
        "The markets are segmented with no resale leakage and have different elasticities of demand",
        "There are hundreds of rival sellers",
        "Marginal cost is infinite"
      ],
      correctOptionIndex: 1,
      explanation: "Profitable price discrimination requires market separation (no arbitrage/resale) and differing price elasticities (higher price in the less elastic market)."
    },
    {
      topic: "Distributive Trade",
      question: "Which channel of distribution is most appropriate for complex, custom-built industrial machinery?",
      options: [
        "Manufacturer \u2192 Wholesaler \u2192 Retailer \u2192 Consumer",
        "Manufacturer \u2192 Agent \u2192 Hawker \u2192 Consumer",
        "Manufacturer \u2192 Industrial User (Direct)",
        "Wholesaler \u2192 Petty trader \u2192 Consumer"
      ],
      correctOptionIndex: 2,
      explanation: "Technical capital goods require direct specification, installation, and after-sales servicing from manufacturer to user."
    },
    {
      topic: "Population Economics",
      question: "The optimum population of a country is the population size that yields the:",
      options: [
        "Highest birth rate",
        "Highest output (income) per capita given existing resources and technology",
        "Largest dependency ratio",
        "Lowest life expectancy"
      ],
      correctOptionIndex: 1,
      explanation: "Optimum population combines most efficiently with available land/capital/technology to maximize real income per head."
    },
    {
      topic: "Malthusian Theory",
      question: "Thomas Malthus argued that if unchecked, human population grows at a geometric rate whereas food supply grows at:",
      options: [
        "An exponential rate",
        "An arithmetic rate",
        "A logarithmic rate",
        "Zero rate"
      ],
      correctOptionIndex: 1,
      explanation: "Malthus contrasted geometric population growth (1, 2, 4, 8, 16...) with arithmetic subsistence growth (1, 2, 3, 4, 5...)."
    },
    {
      topic: "Labour Market & Unemployment",
      question: "Unemployment caused by workers lacking the skills required by newly automated or restructured industries is known as:",
      options: ["Seasonal unemployment", "Structural unemployment", "Frictional unemployment", "Disguised unemployment"],
      correctOptionIndex: 1,
      explanation: "Structural unemployment arises from long-term shifts in industrial structure or technology creating a mismatch of skills."
    },
    {
      topic: "Agriculture in West Africa",
      question: "Marketing Boards were historically established in West Africa primarily to:",
      options: [
        "Import luxury consumer electronics",
        "Stabilize producer prices and organize export marketing of cash crops",
        "Collect personal income taxes from civil servants",
        "Print domestic currency notes"
      ],
      correctOptionIndex: 1,
      explanation: "Commodity Marketing Boards bought cocoa, groundnuts, palm produce, and cotton to cushion farmers against world price fluctuations."
    },
    {
      topic: "Industrialization Strategies",
      question: "Establishing local factories to manufacture goods that were previously imported from abroad is known as:",
      options: ["Export promotion", "Import substitution industrialization", "Dumping", "Devaluation"],
      correctOptionIndex: 1,
      explanation: "Import substitution aims to conserve foreign exchange and build domestic manufacturing capacity."
    },
    {
      topic: "National Income \u2014 GDP vs GNP",
      question: "Given GDP = \u20A6850 billion, Factor income received from abroad = \u20A640 billion, and Factor income paid abroad = \u20A665 billion, calculate the Gross National Product (GNP).",
      options: ["\u20A6745 billion", "\u20A6825 billion", "\u20A6875 billion", "\u20A6955 billion"],
      correctOptionIndex: 1,
      explanation: "Net Factor Income from Abroad = 40 - 65 = -\u20A625 billion. GNP = GDP + NFIA = 850 + (-25) = \u20A6825 billion."
    },
    {
      topic: "Keynesian Multiplier",
      question: "If the Marginal Propensity to Consume (MPC) in an economy is 0.75, what is the value of the simple investment multiplier k?",
      options: ["1.33", "2.50", "4.00", "7.50"],
      correctOptionIndex: 2,
      explanation: "Multiplier k = 1 / (1 - MPC) = 1 / (1 - 0.75) = 1 / 0.25 = 4.00."
    },
    {
      topic: "Money & Motives for Liquidity",
      question: "According to Keynes, holding cash balances in order to take advantage of future changes in bond prices and interest rates is the:",
      options: ["Transactionary motive", "Precautionary motive", "Speculative motive", "Deflationary motive"],
      correctOptionIndex: 2,
      explanation: "Speculative demand for money varies inversely with interest rates as investors weigh cash against interest-bearing bonds."
    },
    {
      topic: "Commercial Banking \u2014 Credit Creation",
      question: "If the statutory Cash Reserve Ratio (CRR) is 20% and a commercial bank receives an initial cash deposit of \u20A650,000, what is the maximum total deposit the banking system can create?",
      options: ["\u20A6100,000", "\u20A6200,000", "\u20A6250,000", "\u20A6500,000"],
      correctOptionIndex: 2,
      explanation: "Credit multiplier = 1 / r = 1 / 0.20 = 5. Total deposit creation = \u20A650,000 \xD7 5 = \u20A6250,000."
    },
    {
      topic: "Inflation Effects",
      question: "During a period of rapid unanticipated inflation, which economic group generally gains?",
      options: [
        "Pensioners on fixed annuities",
        "Fixed-salary earners",
        "Debtors (borrowers) repaying fixed nominal loans",
        "Creditors (lenders) on fixed nominal interest"
      ],
      correctOptionIndex: 2,
      explanation: "Debtors repay loans in money whose real purchasing power has fallen, whereas fixed-income earners and creditors lose real value."
    },
    {
      topic: "Public Finance \u2014 Taxation",
      question: "A tax system in which the marginal and average tax rates increase as the taxpayer\u2019s income rises (such as PAYE Personal Income Tax) is:",
      options: ["Regressive", "Proportional", "Progressive", "Poll tax"],
      correctOptionIndex: 2,
      explanation: "Progressive taxes take a higher percentage from high-income earners, helping reduce income inequality."
    },
    {
      topic: "Incidence of Indirect Tax",
      question: "When an indirect excise tax is imposed on a commodity with PERFECTLY INELASTIC demand, the entire burden (incidence) of the tax falls on the:",
      options: ["Producer/seller", "Final consumer/buyer", "Wholesaler alone", "Central Bank"],
      correctOptionIndex: 1,
      explanation: "Because quantity demanded does not fall at all when price rises (Ed = 0), sellers pass 100% of the tax onto consumers."
    },
    {
      topic: "Fiscal Policy & Budgets",
      question: "To stimulate aggregate demand and employment during an economic recession, a government should adopt a:",
      options: [
        "Budget surplus (raising taxes and cutting public spending)",
        "Budget deficit (increasing government expenditure and/or cutting taxes)",
        "Balanced budget with higher import duties",
        "High cash reserve ratio"
      ],
      correctOptionIndex: 1,
      explanation: "Expansionary fiscal policy (deficit financing) injects net spending power into the circular flow during a slump."
    },
    {
      topic: "International Trade Theory",
      question: "David Ricardo\u2019s Principle of Comparative Cost Advantage demonstrates that mutually beneficial trade occurs when countries specialize in goods for which they have the:",
      options: [
        "Highest absolute money wage",
        "Lowest opportunity (comparative) cost of production",
        "Largest land mass",
        "Highest import tariff wall"
      ],
      correctOptionIndex: 1,
      explanation: "Even if one nation is more efficient in producing both goods, world output rises when each specializes where its opportunity cost is lower."
    },
    {
      topic: "Terms of Trade",
      question: "If a country\u2019s index of export prices is 120 and its index of import prices is 80, calculate its Commodity Terms of Trade.",
      options: ["66.7", "100.0", "150.0", "200.0"],
      correctOptionIndex: 2,
      explanation: "Terms of Trade = (Index of Export Prices / Index of Import Prices) \xD7 100 = (120 / 80) \xD7 100 = 150.0 (favourable)."
    },
    {
      topic: "Balance of Payments",
      question: "Foreign tourist expenditure, international shipping freight, insurance, and banking charges are recorded in the Balance of Payments under:",
      options: [
        "Visible trade balance",
        "Invisible trade (Services) in the Current Account",
        "Official gold reserves only",
        "Domestic capital consumption"
      ],
      correctOptionIndex: 1,
      explanation: "Services (shipping, aviation, insurance, tourism, banking) constitute invisible items in the Current Account."
    },
    {
      topic: "International Economic Organizations",
      question: "Which international body was founded in 1960 by major petroleum-exporting nations (which Nigeria joined in 1971) to coordinate crude oil production quotas and stabilize world oil prices?",
      options: ["UNCTAD", "IMF", "OPEC", "WTO"],
      correctOptionIndex: 2,
      explanation: "The Organization of the Petroleum Exporting Countries (OPEC) coordinates member supply quotas to stabilize global oil markets."
    }
  ]
};

// src/server/jambSyllabusSeed.ts
var JAMB_SYLLABUS_PACKS = [
  ENGLISH_PACK,
  // 50 questions
  MATHEMATICS_PACK,
  // 40 questions
  CHEMISTRY_PACK,
  // 40 questions
  PHYSICS_PACK,
  // 40 questions
  BIOLOGY_PACK,
  // 40 questions
  ECONOMICS_PACK,
  // 40 questions
  GEOGRAPHY_PACK
  // 40 questions
];
async function seedJambSyllabusAndPastQuestions(supabaseAdmin2) {
  const dateAdded = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
  const [{ data: existingSubjects }, { data: existingMaterials }, { data: existingQuestions }] = await Promise.all([
    supabaseAdmin2.from("subjects").select("id, name"),
    supabaseAdmin2.from("study_materials").select("id, content"),
    supabaseAdmin2.from("cbt_questions").select("id, subject, text")
  ]);
  const subjectIdByName = /* @__PURE__ */ new Map();
  for (const s of existingSubjects || []) {
    if (s.name && s.id) {
      subjectIdByName.set(String(s.name).trim().toLowerCase(), String(s.id));
    }
  }
  const existingMatById = /* @__PURE__ */ new Map();
  for (const m of existingMaterials || []) {
    if (m.id) {
      existingMatById.set(String(m.id), m);
    }
  }
  const existingQuestionTexts = new Set(
    (existingQuestions || []).map((q) => String(q.text || "").trim().toLowerCase())
  );
  const staleHtmlQuestionIds = (existingQuestions || []).filter((q) => String(q.text || "").includes("<u>")).map((q) => Number(q.id));
  if (staleHtmlQuestionIds.length > 0) {
    await supabaseAdmin2.from("cbt_questions").delete().in("id", staleHtmlQuestionIds);
  }
  let nextQuestionId = (existingQuestions || []).reduce((max, q) => Math.max(max, Number(q.id) || 0), 0) + 1;
  const cbtRowsToInsert = [];
  for (const pack of JAMB_SYLLABUS_PACKS) {
    const resolvedSubjectId = subjectIdByName.get(pack.subjectName.toLowerCase()) || pack.subjectId;
    await supabaseAdmin2.from("subjects").upsert({
      id: resolvedSubjectId,
      name: pack.subjectName,
      description: pack.description,
      tag: "JAMB UTME Syllabus",
      progress: 0,
      lessons_count: 1,
      questions_count: pack.questions.length,
      icon_name: pack.iconName,
      color_theme: "bg-emerald-500/10 text-emerald-400"
    });
    if (!existingMatById.has(pack.materialId)) {
      await supabaseAdmin2.from("study_materials").upsert({
        id: pack.materialId,
        title: pack.materialTitle,
        subject: pack.subjectName,
        level: "JAMB UTME Syllabus",
        date_added: dateAdded,
        summary: pack.materialSummary,
        image_url: null,
        content: pack.materialSections
      });
    }
    const existingPaper = existingMatById.get(pack.pastPaperId);
    let existingItemsCount = 0;
    if (existingPaper?.content) {
      const parsed = typeof existingPaper.content === "string" ? (() => {
        try {
          return JSON.parse(existingPaper.content);
        } catch {
          return null;
        }
      })() : existingPaper.content;
      existingItemsCount = Array.isArray(parsed?.items) ? parsed.items.length : 0;
    }
    if (!existingPaper || existingItemsCount !== pack.questions.length) {
      const qaItems = pack.questions.map((q, idx) => ({
        id: `${pack.pastPaperId}-q${idx + 1}`,
        questionNumber: idx + 1,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        answer: `${String.fromCharCode(65 + q.correctOptionIndex)}. ${q.options[q.correctOptionIndex]}`,
        explanation: q.explanation
      }));
      await supabaseAdmin2.from("study_materials").upsert({
        id: pack.pastPaperId,
        title: pack.pastPaperTitle,
        subject: pack.subjectName,
        level: `JAMB UTME ${pack.pastPaperYear}`,
        date_added: dateAdded,
        summary: pack.pastPaperSummary,
        image_url: null,
        content: {
          kind: "past_question",
          examBody: "JAMB UTME",
          examYear: pack.pastPaperYear,
          paperType: `Objective (${pack.questions.length} Questions \xB7 40 Mins)`,
          items: qaItems,
          attachment: null
        }
      });
    }
    for (const q of pack.questions) {
      const normalized = q.question.trim().toLowerCase();
      if (!existingQuestionTexts.has(normalized)) {
        existingQuestionTexts.add(normalized);
        cbtRowsToInsert.push({
          id: nextQuestionId++,
          subject: pack.subjectName,
          topic: q.topic,
          text: q.question,
          options: q.options,
          correct_option_index: q.correctOptionIndex,
          explanation: q.explanation
        });
      }
    }
  }
  for (let i = 0; i < cbtRowsToInsert.length; i += 100) {
    const batch = cbtRowsToInsert.slice(i, i + 100);
    const { error } = await supabaseAdmin2.from("cbt_questions").insert(batch);
    if (error) {
      console.error("Error seeding JAMB CBT questions batch:", error.message);
    }
  }
  return {
    subjectsSeeded: JAMB_SYLLABUS_PACKS.length,
    cbtQuestionsInserted: cbtRowsToInsert.length
  };
}

// src/server/apiApp.ts
var PLACEHOLDER_SUPABASE_URL = "https://placeholder.supabase.co";
var PLACEHOLDER_SECRET_KEY = "placeholder-server-key-configure-env";
function resolveSupabaseUrl(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed || trimmed.includes("your-project-ref")) return PLACEHOLDER_SUPABASE_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/+$/, "");
  if (/^[a-z0-9]{15,30}$/i.test(trimmed)) return `https://${trimmed}.supabase.co`;
  return PLACEHOLDER_SUPABASE_URL;
}
function resolveKey(raw, fallback = PLACEHOLDER_SECRET_KEY) {
  const trimmed = (raw || "").trim();
  if (trimmed.length >= 20 && !trimmed.startsWith("your_")) return trimmed;
  return fallback;
}
var SUPABASE_URL = resolveSupabaseUrl(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
);
var SUPABASE_SECRET_KEY = resolveKey(
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
var SUPABASE_PUBLIC_AUTH_KEY = resolveKey(
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);
var isSupabaseConfigured = SUPABASE_URL !== PLACEHOLDER_SUPABASE_URL && SUPABASE_SECRET_KEY !== PLACEHOLDER_SECRET_KEY;
var supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
function normalizeSavedResources(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = /* @__PURE__ */ new Set();
  const normalized = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const resourceId = String(item.resourceId || "").trim();
    const rawType = item.resourceType;
    const resourceType = rawType === "past_question" ? "past_question" : rawType === "material" ? "material" : null;
    if (!resourceId || !resourceType) continue;
    const key = `${resourceType}:${resourceId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({
      resourceId,
      resourceType,
      savedAt: String(item.savedAt || (/* @__PURE__ */ new Date()).toISOString())
    });
  }
  return normalized;
}
var ACADEMIC_BUCKET = "academic-resources";
var resolvedAcademicBucket = null;
var autoSeedChecked = false;
async function getAcademicStorageBucket() {
  if (resolvedAcademicBucket) return resolvedAcademicBucket;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === ACADEMIC_BUCKET || b.id === ACADEMIC_BUCKET);
    if (exists) {
      resolvedAcademicBucket = ACADEMIC_BUCKET;
      return ACADEMIC_BUCKET;
    }
    const { error: createErr } = await supabaseAdmin.storage.createBucket(ACADEMIC_BUCKET, {
      public: false
    });
    if (!createErr) {
      resolvedAcademicBucket = ACADEMIC_BUCKET;
      return ACADEMIC_BUCKET;
    }
  } catch {
  }
  resolvedAcademicBucket = "profile pic";
  return "profile pic";
}
function inferSubjectIcon(subjectName) {
  const lower = subjectName.toLowerCase();
  if (/math|calculus|algebra|accounting|bookkeep|further/.test(lower)) return "functions";
  if (/physic|chemis|tech|drawing|science/.test(lower)) return "science";
  if (/biolog|agric|health|animal|nutrition|food/.test(lower)) return "biotech";
  if (/comput|data|ict|program|software/.test(lower)) return "computer";
  if (/govern|econom|commerc|civic|history|insur|market|law/.test(lower)) return "account_balance";
  return "menu_book";
}
async function ensureSubjectExists(rawSubjectName, defaultTag = "WAEC, NECO & JAMB") {
  const cleanName = String(rawSubjectName || "").trim() || "General Studies";
  try {
    const { data: existingList } = await supabaseAdmin.from("subjects").select("id, name");
    const matched = (existingList || []).find(
      (s) => String(s.name || "").trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (matched) {
      return String(matched.name);
    }
    const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `subj-${Date.now()}`;
    await supabaseAdmin.from("subjects").upsert({
      id,
      name: cleanName,
      description: `Comprehensive reading notes, past questions & answers, and timed CBT drills for ${cleanName}.`,
      tag: defaultTag,
      progress: 0,
      lessons_count: 0,
      questions_count: 0,
      icon_name: inferSubjectIcon(cleanName),
      color_theme: "bg-emerald-500/10 text-emerald-400"
    });
  } catch (err) {
    console.warn("Auto subject registration warning:", err);
  }
  return cleanName;
}
function buildInitialsAvatar(name, email) {
  const label = (name || email || "Scholar").trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "EP";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="#18181b"/><circle cx="64" cy="64" r="62" fill="none" stroke="#10b981" stroke-opacity="0.35" stroke-width="2"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="#34d399" font-family="Plus Jakarta Sans, sans-serif" font-size="44" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function deriveNameFromEmail(email) {
  const local = (email.split("@")[0] || "Scholar").trim();
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}
async function logSystemActivity(actorName, action, module, details) {
  if (!isSupabaseConfigured) return;
  try {
    await supabaseAdmin.from("activity_logs").insert({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actor_name: actorName || "System",
      action,
      module,
      details
    });
  } catch (err) {
    console.warn("Activity log write skipped:", err);
  }
}
async function resolveStoragePointer(pointer) {
  if (!pointer || !pointer.trim()) return void 0;
  if (pointer.startsWith("storage://")) {
    const withoutScheme = pointer.slice("storage://".length);
    const slashIdx = withoutScheme.indexOf("/");
    if (slashIdx > 0) {
      const bucket = withoutScheme.slice(0, slashIdx);
      const objectPath = withoutScheme.slice(slashIdx + 1);
      const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(objectPath, 60 * 60 * 24 * 30);
      if (data?.signedUrl) return data.signedUrl;
    }
  }
  return pointer;
}
async function resolveAvatarUrl(rawAvatar, name, email) {
  if (!rawAvatar || !rawAvatar.trim()) {
    return buildInitialsAvatar(name, email);
  }
  const resolved = await resolveStoragePointer(rawAvatar);
  return resolved || buildInitialsAvatar(name, email);
}
async function resolveAttachmentObject(rawAtt) {
  if (!rawAtt || typeof rawAtt !== "object" || !rawAtt.storagePointer) return null;
  const signedUrl = await resolveStoragePointer(String(rawAtt.storagePointer));
  return {
    fileName: String(rawAtt.fileName || "Document"),
    mimeType: String(rawAtt.mimeType || "application/octet-stream"),
    sizeBytes: typeof rawAtt.sizeBytes === "number" ? rawAtt.sizeBytes : void 0,
    storagePointer: String(rawAtt.storagePointer),
    fileUrl: signedUrl
  };
}
async function fetchPlatformSnapshot(getPresence = () => []) {
  if (!isSupabaseConfigured) {
    return {
      users: [],
      materials: [],
      pastQuestions: [],
      questions: [],
      subjects: [],
      examResults: [],
      activityLogs: [],
      recentActivities: [],
      presence: getPresence(),
      supabaseConnected: false,
      configMissing: true,
      syncedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  if (!autoSeedChecked) {
    autoSeedChecked = true;
    try {
      const { count } = await supabaseAdmin.from("subjects").select("id", { count: "exact", head: true });
      if (count === 0) {
        await seedJambSyllabusAndPastQuestions(supabaseAdmin);
      }
    } catch {
    }
  }
  let supabaseConnected = true;
  const [
    authUsersRes,
    profilesRes,
    materialsRes,
    questionsRes,
    subjectsRes,
    examResultsRes,
    activityLogsRes,
    recentActivitiesRes
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1e3 }),
    supabaseAdmin.from("profiles").select("*"),
    supabaseAdmin.from("study_materials").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("cbt_questions").select("*").order("id", { ascending: true }),
    supabaseAdmin.from("subjects").select("*").order("name", { ascending: true }),
    supabaseAdmin.from("exam_results").select("*").order("created_at", { ascending: false }).limit(200),
    supabaseAdmin.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100),
    supabaseAdmin.from("recent_activity").select("*").order("created_at", { ascending: false }).limit(100)
  ]);
  if (authUsersRes.error && subjectsRes.error) {
    console.error("Supabase connection error:", authUsersRes.error.message);
    supabaseConnected = false;
  }
  const rawAuthUsers = authUsersRes.data?.users || [];
  const rawProfiles = profilesRes.data || [];
  const profileById = /* @__PURE__ */ new Map();
  const profileByEmail = /* @__PURE__ */ new Map();
  for (const p of rawProfiles) {
    if (p.id) profileById.set(String(p.id), p);
    if (p.email) profileByEmail.set(String(p.email).trim().toLowerCase(), p);
  }
  const rawExamResults = examResultsRes.data || [];
  const users = await Promise.all(
    rawAuthUsers.map(async (au) => {
      const email = (au.email || "").trim().toLowerCase();
      const matchedProfile = profileById.get(au.id) || (email ? profileByEmail.get(email) : void 0);
      const meta = au.user_metadata || {};
      const resolvedRole = matchedProfile?.role === "admin" || meta.role === "admin" ? "admin" : "student";
      const resolvedName = matchedProfile?.name || meta.full_name || meta.name || deriveNameFromEmail(email || "Scholar");
      const resolvedPhone = matchedProfile?.phone || meta.phone || "";
      const resolvedClass = matchedProfile?.student_class || meta.student_class || (resolvedRole === "admin" ? "Administrator" : "SS 3 Science");
      const resolvedStreak = typeof matchedProfile?.streak_days === "number" ? matchedProfile.streak_days : 1;
      const rawAvatar = matchedProfile?.avatar_url || meta.avatar_url || "";
      const avatarUrl = await resolveAvatarUrl(rawAvatar, resolvedName, email);
      const userAttempts = rawExamResults.filter(
        (r) => r.user_id === au.id || matchedProfile?.id && r.user_id === matchedProfile.id
      );
      const examAttemptsCount = userAttempts.length;
      const averageScore = examAttemptsCount > 0 ? Math.round(
        userAttempts.reduce((acc, item) => acc + (Number(item.score_percentage) || 0), 0) / examAttemptsCount
      ) : null;
      return {
        id: au.id,
        name: resolvedName,
        email: email || au.id,
        phone: resolvedPhone,
        role: resolvedRole,
        studentClass: resolvedClass,
        avatarUrl,
        streakDays: resolvedStreak,
        savedResources: normalizeSavedResources(meta.saved_resources),
        createdAt: au.created_at,
        lastSignInAt: au.last_sign_in_at || null,
        emailVerified: Boolean(au.email_confirmed_at || meta.email_verified),
        examAttemptsCount,
        averageScore
      };
    })
  );
  const userLookup = /* @__PURE__ */ new Map();
  for (const u of users) {
    userLookup.set(u.id, { name: u.name, email: u.email });
  }
  for (const p of rawProfiles) {
    if (p.id && !userLookup.has(p.id)) {
      userLookup.set(p.id, { name: p.name || "Student", email: p.email || "" });
    }
  }
  const materials = [];
  const pastQuestions = [];
  for (const item of materialsRes.data || []) {
    const idStr = String(item.id || "");
    let rawContent = item.content;
    if (typeof rawContent === "string") {
      try {
        rawContent = JSON.parse(rawContent);
      } catch {
      }
    }
    const isPastQuestion = idStr.startsWith("pq-") || rawContent && typeof rawContent === "object" && !Array.isArray(rawContent) && rawContent.kind === "past_question";
    const formattedDate = String(
      item.date_added || new Date(item.created_at || Date.now()).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      })
    );
    if (isPastQuestion) {
      const obj = rawContent && typeof rawContent === "object" && !Array.isArray(rawContent) ? rawContent : {};
      const resolvedAttachment = await resolveAttachmentObject(obj.attachment);
      const qaItems = Array.isArray(obj.items) ? obj.items.map((qa, idx) => ({
        id: String(qa.id || `pqi-${idStr}-${idx}`),
        questionNumber: Number(qa.questionNumber || idx + 1),
        question: String(qa.question || ""),
        options: Array.isArray(qa.options) && qa.options.length >= 2 ? qa.options.map(String) : void 0,
        correctOptionIndex: typeof qa.correctOptionIndex === "number" ? qa.correctOptionIndex : void 0,
        answer: String(qa.answer || ""),
        explanation: qa.explanation ? String(qa.explanation) : void 0
      })) : [];
      pastQuestions.push({
        id: idStr,
        title: String(item.title || ""),
        subject: String(item.subject || "General"),
        examBody: String(obj.examBody || item.level || "WAEC WASSCE"),
        examYear: String(obj.examYear || (/* @__PURE__ */ new Date()).getFullYear()),
        paperType: String(obj.paperType || "Objective & Theory"),
        summary: String(item.summary || ""),
        dateAdded: formattedDate,
        items: qaItems,
        attachment: resolvedAttachment,
        createdAt: item.created_at
      });
    } else {
      let parsedSections = [];
      let resolvedAttachment = null;
      if (Array.isArray(rawContent)) {
        parsedSections = rawContent.map(String);
      } else if (rawContent && typeof rawContent === "object") {
        parsedSections = Array.isArray(rawContent.sections) ? rawContent.sections.map(String) : [];
        resolvedAttachment = await resolveAttachmentObject(rawContent.attachment);
      } else if (typeof rawContent === "string" && rawContent.trim()) {
        parsedSections = [rawContent];
      }
      materials.push({
        id: idStr,
        title: String(item.title || ""),
        subject: String(item.subject || "General"),
        level: String(item.level || "SS 3"),
        dateAdded: formattedDate,
        summary: String(item.summary || ""),
        imageUrl: item.image_url || void 0,
        content: parsedSections,
        attachment: resolvedAttachment,
        createdAt: item.created_at
      });
    }
  }
  const questions = (questionsRes.data || []).map((q) => {
    let parsedOptions = [];
    if (Array.isArray(q.options)) {
      parsedOptions = q.options.map(String);
    } else if (typeof q.options === "string") {
      try {
        const parsed = JSON.parse(q.options);
        parsedOptions = Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        parsedOptions = [];
      }
    }
    return {
      id: Number(q.id),
      subject: String(q.subject || "General"),
      topic: String(q.topic || "General"),
      text: String(q.text || ""),
      options: parsedOptions,
      correctOptionIndex: Number(q.correct_option_index ?? 0),
      explanation: String(q.explanation || ""),
      createdAt: q.created_at
    };
  });
  const subjects = (subjectsRes.data || []).map((s) => {
    const sNameLower = String(s.name || "").toLowerCase();
    const liveSubjectQuestions = questions.filter(
      (q) => q.subject.toLowerCase() === sNameLower || sNameLower.includes(q.subject.toLowerCase())
    ).length;
    const liveSubjectMaterials = materials.filter(
      (m) => m.subject.toLowerCase() === sNameLower || sNameLower.includes(m.subject.toLowerCase())
    ).length;
    const liveSubjectPastPapers = pastQuestions.filter(
      (pq) => pq.subject.toLowerCase() === sNameLower || sNameLower.includes(pq.subject.toLowerCase())
    ).length;
    return {
      id: String(s.id),
      name: String(s.name || ""),
      description: String(s.description || ""),
      tag: String(s.tag || "WAEC & JAMB"),
      progress: Number(s.progress ?? 0),
      lessonsCount: liveSubjectMaterials,
      questionsCount: liveSubjectQuestions,
      pastPapersCount: liveSubjectPastPapers,
      iconName: String(s.icon_name || inferSubjectIcon(String(s.name || ""))),
      colorTheme: String(s.color_theme || "bg-emerald-500/10 text-emerald-400")
    };
  });
  const examResults = rawExamResults.map((r) => {
    const owner = userLookup.get(String(r.user_id));
    return {
      id: String(r.id),
      userId: String(r.user_id),
      userName: owner?.name || String(r.user_id),
      userEmail: owner?.email || "",
      totalQuestions: Number(r.total_questions || 0),
      attemptedCount: Number(r.attempted_count || 0),
      correctCount: Number(r.correct_count || 0),
      wrongCount: Number(r.wrong_count || 0),
      scorePercentage: Number(r.score_percentage || 0),
      subjectBreakdown: r.subject_breakdown && typeof r.subject_breakdown === "object" ? r.subject_breakdown : {},
      timeSpentSeconds: Number(r.time_spent_seconds || 0),
      createdAt: String(r.created_at || (/* @__PURE__ */ new Date()).toISOString())
    };
  });
  const activityLogs = (activityLogsRes.data || []).map((l) => ({
    id: String(l.id),
    actorName: String(l.actor_name || "System"),
    action: String(l.action || ""),
    module: String(l.module || "System"),
    details: String(l.details || ""),
    createdAt: String(l.created_at || (/* @__PURE__ */ new Date()).toISOString())
  }));
  const recentActivities = (recentActivitiesRes.data || []).map((a) => ({
    id: String(a.id),
    userId: String(a.user_id || ""),
    title: String(a.title || ""),
    type: a.type === "reading" || a.type === "practice" ? a.type : "cbt",
    score: a.score ? String(a.score) : void 0,
    detail: String(a.detail || ""),
    timeAgo: String(a.time_ago || "Recently"),
    icon: String(a.icon || "assignment_turned_in"),
    createdAt: String(a.created_at || (/* @__PURE__ */ new Date()).toISOString())
  }));
  return {
    users,
    materials,
    pastQuestions,
    questions,
    subjects,
    examResults,
    activityLogs,
    recentActivities,
    presence: getPresence(),
    supabaseConnected,
    configMissing: false,
    syncedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function syncUserProfileRecord(params) {
  const cleanEmail = String(params.email || "").trim().toLowerCase();
  const { data: authLookup } = params.userId ? await supabaseAdmin.auth.admin.getUserById(String(params.userId)) : { data: null };
  const authUser = authLookup?.user;
  const targetId = authUser?.id || String(params.userId || "");
  const targetEmail = (authUser?.email || cleanEmail).trim().toLowerCase();
  const meta = authUser?.user_metadata || {};
  const { data: byId } = await supabaseAdmin.from("profiles").select("*").eq("id", targetId).maybeSingle();
  let existingProfile = byId;
  if (!existingProfile && targetEmail) {
    const { data: byEmail } = await supabaseAdmin.from("profiles").select("*").eq("email", targetEmail).maybeSingle();
    existingProfile = byEmail;
  }
  let resolvedRole = existingProfile?.role === "admin" || meta.role === "admin" ? "admin" : "student";
  if (params.requestedRole === "admin" && resolvedRole !== "admin") {
    resolvedRole = "admin";
  }
  const resolvedName = existingProfile?.name || meta.full_name || meta.name || deriveNameFromEmail(targetEmail || "Scholar");
  const resolvedPhone = existingProfile?.phone ?? meta.phone ?? "";
  const resolvedClass = existingProfile?.student_class || meta.student_class || (resolvedRole === "admin" ? "Administrator" : "SS 3 Science");
  const resolvedStreak = typeof existingProfile?.streak_days === "number" ? existingProfile.streak_days : 1;
  const rawAvatar = existingProfile?.avatar_url || meta.avatar_url || null;
  if (!existingProfile || existingProfile.id !== targetId || existingProfile.role !== resolvedRole) {
    await supabaseAdmin.from("profiles").upsert({
      id: targetId,
      name: resolvedName,
      email: targetEmail,
      phone: resolvedPhone,
      role: resolvedRole,
      student_class: resolvedClass,
      avatar_url: rawAvatar,
      streak_days: resolvedStreak
    });
  }
  if (authUser && meta.role !== resolvedRole) {
    await supabaseAdmin.auth.admin.updateUserById(targetId, {
      user_metadata: {
        ...meta,
        full_name: resolvedName,
        phone: resolvedPhone,
        role: resolvedRole,
        student_class: resolvedClass
      }
    });
  }
  const avatarUrl = await resolveAvatarUrl(rawAvatar, resolvedName, targetEmail);
  return {
    id: targetId,
    name: resolvedName,
    email: targetEmail,
    phone: resolvedPhone,
    role: resolvedRole,
    studentClass: resolvedClass,
    avatarUrl,
    streakDays: resolvedStreak,
    savedResources: normalizeSavedResources(meta.saved_resources)
  };
}
async function insertObjectiveItemsIntoCbtBank(subject, topicLabel, items) {
  const validObjectives = (items || []).filter(
    (it) => it && it.question && Array.isArray(it.options) && it.options.length >= 2
  );
  if (validObjectives.length === 0) return 0;
  const { data: maxRow } = await supabaseAdmin.from("cbt_questions").select("id").order("id", { ascending: false }).limit(1).maybeSingle();
  let nextId = (Number(maxRow?.id) || 0) + 1;
  const rowsToInsert = validObjectives.map((it) => {
    const cleanOpts = it.options.map((o) => String(o).trim()).filter(Boolean);
    const correctIdx = typeof it.correctOptionIndex === "number" ? Math.max(0, Math.min(it.correctOptionIndex, cleanOpts.length - 1)) : 0;
    return {
      id: nextId++,
      subject,
      topic: topicLabel,
      text: String(it.question).trim(),
      options: cleanOpts,
      correct_option_index: correctIdx,
      explanation: String(it.explanation || it.answer || "").trim()
    };
  });
  const { error } = await supabaseAdmin.from("cbt_questions").insert(rowsToInsert);
  if (error) {
    console.warn("Skipping optional CBT sync:", error.message);
    return 0;
  }
  return rowsToInsert.length;
}
function createApiApp(options = {}) {
  const getPresence = options.getPresence || (() => []);
  const onSnapshotBroadcast = options.onSnapshotBroadcast;
  const refreshAndNotifySnapshot = async () => {
    try {
      const snapshot = await fetchPlatformSnapshot(getPresence);
      if (onSnapshotBroadcast) {
        onSnapshotBroadcast(snapshot);
      }
      return snapshot;
    } catch (err) {
      console.error("Error building platform snapshot:", err);
      return null;
    }
  };
  const app2 = express();
  const jsonParser = express.json({ limit: "25mb" });
  app2.use((req, res, next) => {
    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
      next();
      return;
    }
    if (typeof req.body === "string" && req.body.trim()) {
      try {
        req.body = JSON.parse(req.body);
        next();
        return;
      } catch {
      }
    }
    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      try {
        req.body = JSON.parse(req.body.toString("utf8"));
        next();
        return;
      } catch {
      }
    }
    jsonParser(req, res, next);
  });
  const router = express.Router();
  const ensureConfigured = (res) => {
    if (!isSupabaseConfigured) {
      res.status(503).json({
        error: "Supabase environment variables (SUPABASE_URL and SUPABASE_SECRET_KEY) are missing on this deployment. Add them in Vercel Project Settings \u2192 Environment Variables and redeploy."
      });
      return false;
    }
    return true;
  };
  router.get("/health", (_req, res) => {
    res.json({
      ok: true,
      supabaseConfigured: isSupabaseConfigured,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  router.get("/snapshot", async (_req, res) => {
    try {
      const snapshot = await fetchPlatformSnapshot(getPresence);
      res.json(snapshot);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to load Supabase snapshot" });
    }
  });
  router.post("/admin/seed-jamb", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const actorName = String(req.body?.actorName || "Admin");
      const result = await seedJambSyllabusAndPastQuestions(supabaseAdmin);
      await logSystemActivity(
        actorName,
        "Synced JAMB Syllabus Pack",
        "Curriculum",
        `Verified ${result.subjectsSeeded} JAMB UTME subjects (+${result.cbtQuestionsInserted} new CBT questions)`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ result, snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to seed JAMB syllabus pack." });
    }
  });
  router.post("/upload/resource", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { dataUrl, fileName } = req.body || {};
      if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
        res.status(400).json({ error: "Valid base64 file dataUrl is required." });
        return;
      }
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({ error: "Malformed base64 file payload." });
        return;
      }
      const mimeType = matches[1] || "application/octet-stream";
      const base64Body = matches[2];
      const buffer = Buffer.from(base64Body, "base64");
      const safeName = String(fileName || "resource-file").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 90);
      const objectPath = `uploads/${Date.now()}-${safeName}`;
      const bucketName = await getAcademicStorageBucket();
      const { error: uploadError } = await supabaseAdmin.storage.from(bucketName).upload(objectPath, buffer, {
        contentType: mimeType,
        upsert: true
      });
      if (uploadError) {
        res.status(500).json({ error: uploadError.message });
        return;
      }
      const storagePointer = `storage://${bucketName}/${objectPath}`;
      const { data: signed } = await supabaseAdmin.storage.from(bucketName).createSignedUrl(objectPath, 60 * 60 * 24 * 30);
      res.json({
        attachment: {
          fileName: String(fileName || safeName),
          mimeType,
          sizeBytes: buffer.length,
          storagePointer,
          fileUrl: signed?.signedUrl
        }
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Academic file upload failed." });
    }
  });
  router.post("/auth/login", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { email, password, requestedRole } = req.body || {};
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
      }
      const statelessAuthClient = createClient(SUPABASE_URL, SUPABASE_PUBLIC_AUTH_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      const { data, error } = await statelessAuthClient.auth.signInWithPassword({
        email: cleanEmail,
        password: String(password)
      });
      if (error || !data?.user) {
        res.status(401).json({ error: error?.message || "Invalid email or password." });
        return;
      }
      const userProfile = await syncUserProfileRecord({
        userId: data.user.id,
        email: cleanEmail,
        requestedRole
      });
      await refreshAndNotifySnapshot();
      res.json({
        user: userProfile,
        session: data.session ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        } : null
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Authentication failed." });
    }
  });
  router.post("/auth/register", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { email, password, fullName, phone, role, studentClass } = req.body || {};
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail || !password || String(password).length < 6) {
        res.status(400).json({ error: "Valid email and password (minimum 6 characters) are required." });
        return;
      }
      const resolvedRole = role === "admin" ? "admin" : "student";
      const resolvedName = String(fullName || "").trim() || deriveNameFromEmail(cleanEmail);
      const resolvedPhone = String(phone || "").trim();
      const resolvedClass = String(studentClass || "").trim() || (resolvedRole === "admin" ? "Administrator" : "SS 3 Science");
      const { data: createdAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          full_name: resolvedName,
          phone: resolvedPhone,
          role: resolvedRole,
          student_class: resolvedClass,
          saved_resources: []
        }
      });
      if (createError || !createdAuth?.user) {
        res.status(400).json({ error: createError?.message || "Unable to register account in Supabase Auth." });
        return;
      }
      const authUser = createdAuth.user;
      await supabaseAdmin.from("profiles").upsert({
        id: authUser.id,
        name: resolvedName,
        email: cleanEmail,
        phone: resolvedPhone,
        role: resolvedRole,
        student_class: resolvedClass,
        avatar_url: null,
        streak_days: 1
      });
      await logSystemActivity(
        resolvedName,
        "Account Registered",
        "Authentication",
        `Registered ${resolvedRole} account (${cleanEmail})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      const profile = snapshot?.users.find((u) => u.id === authUser.id) || {
        id: authUser.id,
        name: resolvedName,
        email: cleanEmail,
        phone: resolvedPhone,
        role: resolvedRole,
        studentClass: resolvedClass,
        avatarUrl: buildInitialsAvatar(resolvedName, cleanEmail),
        streakDays: 1,
        savedResources: []
      };
      res.json({ user: profile });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Registration failed." });
    }
  });
  router.post("/auth/sync-profile", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { userId, email, requestedRole } = req.body || {};
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!userId && !cleanEmail) {
        res.status(400).json({ error: "userId or email required" });
        return;
      }
      const userProfile = await syncUserProfileRecord({ userId, email: cleanEmail, requestedRole });
      await refreshAndNotifySnapshot();
      res.json({ user: userProfile });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Profile sync failed." });
    }
  });
  router.put("/profile/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const { name, phone, studentClass, avatarUrl, role } = req.body || {};
      const { data: existing } = await supabaseAdmin.from("profiles").select("*").eq("id", targetId).maybeSingle();
      const { data: authLookup } = await supabaseAdmin.auth.admin.getUserById(targetId);
      const authUser = authLookup?.user;
      const targetEmail = (authUser?.email || existing?.email || "").trim().toLowerCase();
      const updatedName = String(name ?? existing?.name ?? deriveNameFromEmail(targetEmail)).trim();
      const updatedPhone = String(phone ?? existing?.phone ?? "").trim();
      const updatedClass = String(studentClass ?? existing?.student_class ?? "SS 3 Science").trim();
      const updatedRole = role === "admin" || existing?.role === "admin" ? role === "student" ? "student" : "admin" : "student";
      let storedAvatar = existing?.avatar_url || null;
      if (typeof avatarUrl === "string" && avatarUrl.trim()) {
        if (avatarUrl.startsWith("storage://")) {
          storedAvatar = avatarUrl;
        } else if (!avatarUrl.startsWith("data:image/svg+xml") && !avatarUrl.includes("/storage/v1/object/sign/")) {
          storedAvatar = avatarUrl;
        }
      }
      await supabaseAdmin.from("profiles").upsert({
        id: targetId,
        name: updatedName,
        email: targetEmail,
        phone: updatedPhone,
        role: updatedRole,
        student_class: updatedClass,
        avatar_url: storedAvatar,
        streak_days: typeof existing?.streak_days === "number" ? existing.streak_days : 1
      });
      if (authUser) {
        await supabaseAdmin.auth.admin.updateUserById(targetId, {
          user_metadata: {
            ...authUser.user_metadata || {},
            full_name: updatedName,
            phone: updatedPhone,
            role: updatedRole,
            student_class: updatedClass
          }
        });
      }
      await logSystemActivity(updatedName, "Profile Updated", "Users", `Updated profile details for ${targetEmail}`);
      await refreshAndNotifySnapshot();
      const resolvedAvatar = await resolveAvatarUrl(storedAvatar, updatedName, targetEmail);
      res.json({
        user: {
          id: targetId,
          name: updatedName,
          email: targetEmail,
          phone: updatedPhone,
          role: updatedRole,
          studentClass: updatedClass,
          avatarUrl: resolvedAvatar,
          streakDays: typeof existing?.streak_days === "number" ? existing.streak_days : 1,
          savedResources: normalizeSavedResources(authUser?.user_metadata?.saved_resources)
        }
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to update profile." });
    }
  });
  router.post("/profile/:id/bookmarks", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const { resourceId, resourceType, action } = req.body || {};
      const cleanId = String(resourceId || "").trim();
      const cleanType = resourceType === "past_question" ? "past_question" : resourceType === "material" ? "material" : null;
      if (!targetId || !cleanId || !cleanType) {
        res.status(400).json({ error: "Valid userId, resourceId, and resourceType are required." });
        return;
      }
      const { data: authLookup, error: lookupError } = await supabaseAdmin.auth.admin.getUserById(targetId);
      if (lookupError || !authLookup?.user) {
        res.status(404).json({ error: lookupError?.message || "Authenticated user not found." });
        return;
      }
      const authUser = authLookup.user;
      const existingSaved = normalizeSavedResources(authUser.user_metadata?.saved_resources);
      const existsIndex = existingSaved.findIndex(
        (item) => item.resourceId === cleanId && item.resourceType === cleanType
      );
      let nextSaved;
      const resolvedAction = action === "add" ? "add" : action === "remove" ? "remove" : existsIndex >= 0 ? "remove" : "add";
      if (resolvedAction === "remove") {
        nextSaved = existingSaved.filter(
          (item) => !(item.resourceId === cleanId && item.resourceType === cleanType)
        );
      } else if (existsIndex >= 0) {
        nextSaved = existingSaved;
      } else {
        nextSaved = [
          {
            resourceId: cleanId,
            resourceType: cleanType,
            savedAt: (/* @__PURE__ */ new Date()).toISOString()
          },
          ...existingSaved
        ];
      }
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(targetId, {
        user_metadata: {
          ...authUser.user_metadata || {},
          saved_resources: nextSaved
        }
      });
      if (updateErr) {
        res.status(500).json({ error: updateErr.message });
        return;
      }
      const snapshot = await refreshAndNotifySnapshot();
      res.json({
        savedResources: nextSaved,
        isSaved: resolvedAction === "add",
        snapshot
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to update saved resources." });
    }
  });
  router.post("/profile/:id/avatar", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const { dataUrl, fileName } = req.body || {};
      if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
        res.status(400).json({ error: "Valid image dataUrl is required." });
        return;
      }
      const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({ error: "Malformed base64 image payload." });
        return;
      }
      const mimeType = matches[1];
      const base64Body = matches[2];
      const buffer = Buffer.from(base64Body, "base64");
      const ext = (fileName?.split(".").pop() || mimeType.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");
      const objectPath = `avatars/${targetId}-${Date.now()}.${ext}`;
      const bucketName = "profile pic";
      const { error: uploadError } = await supabaseAdmin.storage.from(bucketName).upload(objectPath, buffer, {
        contentType: mimeType,
        upsert: true
      });
      if (uploadError) {
        res.status(500).json({ error: uploadError.message });
        return;
      }
      const storagePointer = `storage://${bucketName}/${objectPath}`;
      const { data: signed } = await supabaseAdmin.storage.from(bucketName).createSignedUrl(objectPath, 60 * 60 * 24 * 365);
      const { data: existing } = await supabaseAdmin.from("profiles").select("*").eq("id", targetId).maybeSingle();
      if (existing) {
        await supabaseAdmin.from("profiles").update({ avatar_url: storagePointer }).eq("id", targetId);
      }
      await refreshAndNotifySnapshot();
      res.json({
        avatarUrl: signed?.signedUrl || dataUrl,
        storagePointer
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Avatar upload failed." });
    }
  });
  router.post("/admin/users", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { email, password, name, phone, role, studentClass, actorName } = req.body || {};
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail || !password || String(password).length < 6) {
        res.status(400).json({ error: "Email and password (min 6 chars) are required." });
        return;
      }
      const resolvedRole = role === "admin" ? "admin" : "student";
      const resolvedName = String(name || "").trim() || deriveNameFromEmail(cleanEmail);
      const resolvedPhone = String(phone || "").trim();
      const resolvedClass = String(studentClass || "").trim() || (resolvedRole === "admin" ? "Administrator" : "SS 3 Science");
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          full_name: resolvedName,
          phone: resolvedPhone,
          role: resolvedRole,
          student_class: resolvedClass,
          saved_resources: []
        }
      });
      if (error || !created?.user) {
        res.status(400).json({ error: error?.message || "Failed to create user in Supabase Auth." });
        return;
      }
      await supabaseAdmin.from("profiles").upsert({
        id: created.user.id,
        name: resolvedName,
        email: cleanEmail,
        phone: resolvedPhone,
        role: resolvedRole,
        student_class: resolvedClass,
        streak_days: 1
      });
      await logSystemActivity(
        actorName || "Admin",
        "Created User",
        "User Management",
        `Added ${resolvedRole} ${resolvedName} (${cleanEmail})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to create user." });
    }
  });
  router.patch("/admin/users/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const { role, name, studentClass, phone, actorName } = req.body || {};
      const { data: authLookup, error: lookupError } = await supabaseAdmin.auth.admin.getUserById(targetId);
      if (lookupError || !authLookup?.user) {
        res.status(404).json({ error: "User not found in Supabase Auth." });
        return;
      }
      const authUser = authLookup.user;
      const cleanEmail = (authUser.email || "").trim().toLowerCase();
      const { data: existingProfile } = await supabaseAdmin.from("profiles").select("*").eq("id", targetId).maybeSingle();
      const nextRole = role === "admin" ? "admin" : role === "student" ? "student" : existingProfile?.role === "admin" ? "admin" : "student";
      const nextName = String(
        name ?? existingProfile?.name ?? authUser.user_metadata?.full_name ?? deriveNameFromEmail(cleanEmail)
      ).trim();
      const nextClass = String(studentClass ?? existingProfile?.student_class ?? "SS 3 Science").trim();
      const nextPhone = String(phone ?? existingProfile?.phone ?? "").trim();
      await supabaseAdmin.auth.admin.updateUserById(targetId, {
        user_metadata: {
          ...authUser.user_metadata || {},
          full_name: nextName,
          role: nextRole,
          student_class: nextClass,
          phone: nextPhone
        }
      });
      await supabaseAdmin.from("profiles").upsert({
        id: targetId,
        name: nextName,
        email: cleanEmail,
        phone: nextPhone,
        role: nextRole,
        student_class: nextClass,
        avatar_url: existingProfile?.avatar_url || null,
        streak_days: existingProfile?.streak_days ?? 1
      });
      await logSystemActivity(
        actorName || "Admin",
        "Updated User",
        "User Management",
        `Updated ${cleanEmail} (role: ${nextRole}, class: ${nextClass})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to update user." });
    }
  });
  router.delete("/admin/users/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const actorName = String(req.query.actor || "Admin");
      const { data: authLookup } = await supabaseAdmin.auth.admin.getUserById(targetId);
      const targetEmail = authLookup?.user?.email || targetId;
      const { error } = await supabaseAdmin.auth.admin.deleteUser(targetId);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await supabaseAdmin.from("profiles").delete().eq("id", targetId);
      await logSystemActivity(
        actorName,
        "Deleted User",
        "User Management",
        `Removed user ${targetEmail} from Supabase Auth`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to delete user." });
    }
  });
  router.post("/materials", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { title, subject, level, summary, content, attachment, imageUrl, actorName } = req.body || {};
      if (!title || !String(title).trim()) {
        res.status(400).json({ error: "Material title is required." });
        return;
      }
      const canonicalSubject = await ensureSubjectExists(String(subject || "General Studies"));
      const id = `mat-${Date.now()}`;
      const dateAdded = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });
      const normalizedSections = Array.isArray(content) && content.length > 0 ? content.map(String) : [`### ${String(title).trim()}

${String(summary || "").trim()}`];
      const storedContent = attachment?.storagePointer ? {
        kind: "reading_material",
        sections: normalizedSections,
        attachment: {
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
          storagePointer: attachment.storagePointer
        }
      } : normalizedSections;
      const { error } = await supabaseAdmin.from("study_materials").insert({
        id,
        title: String(title).trim(),
        subject: canonicalSubject,
        level: String(level || "SS 3").trim(),
        date_added: dateAdded,
        summary: String(summary || "").trim(),
        image_url: imageUrl || null,
        content: storedContent
      });
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(
        actorName || "Admin",
        "Published Reading Material",
        "Reading Materials",
        `Published "${String(title).trim()}" (${canonicalSubject} \xB7 ${level || "SS 3"})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to create reading material." });
    }
  });
  router.put("/materials/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const { title, subject, level, summary, content, attachment, imageUrl, actorName } = req.body || {};
      const canonicalSubject = await ensureSubjectExists(String(subject || "General Studies"));
      const normalizedSections = Array.isArray(content) ? content.map(String) : [];
      const storedContent = attachment?.storagePointer ? {
        kind: "reading_material",
        sections: normalizedSections,
        attachment: {
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
          storagePointer: attachment.storagePointer
        }
      } : normalizedSections;
      const payload = {
        title: String(title || "").trim(),
        subject: canonicalSubject,
        level: String(level || "SS 3").trim(),
        summary: String(summary || "").trim(),
        content: storedContent
      };
      if (imageUrl !== void 0) payload.image_url = imageUrl;
      const { error } = await supabaseAdmin.from("study_materials").update(payload).eq("id", id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(
        actorName || "Admin",
        "Updated Reading Material",
        "Reading Materials",
        `Updated "${String(title || id).trim()}" (${canonicalSubject})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to update reading material." });
    }
  });
  router.delete("/materials/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const actorName = String(req.query.actor || "Admin");
      const { data: existing } = await supabaseAdmin.from("study_materials").select("title").eq("id", id).maybeSingle();
      const { error } = await supabaseAdmin.from("study_materials").delete().eq("id", id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(
        actorName,
        "Deleted Reading Material",
        "Reading Materials",
        `Deleted "${existing?.title || id}"`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to delete material." });
    }
  });
  router.post("/past-questions", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const {
        title,
        subject,
        examBody,
        examYear,
        paperType,
        summary,
        items,
        attachment,
        pushObjectivesToCbt,
        actorName
      } = req.body || {};
      if (!title || !String(title).trim()) {
        res.status(400).json({ error: "Past question paper title is required." });
        return;
      }
      const cleanExamBody = String(examBody || "WAEC WASSCE").trim();
      const cleanExamYear = String(examYear || (/* @__PURE__ */ new Date()).getFullYear()).trim();
      const cleanPaperType = String(paperType || "Objective & Theory").trim();
      const canonicalSubject = await ensureSubjectExists(String(subject || "General Studies"), cleanExamBody);
      const id = `pq-${Date.now()}`;
      const dateAdded = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });
      const normalizedItems = Array.isArray(items) ? items.map((it, idx) => ({
        id: String(it.id || `pqi-${Date.now()}-${idx}`),
        questionNumber: idx + 1,
        question: String(it.question || "").trim(),
        options: Array.isArray(it.options) && it.options.filter(Boolean).length >= 2 ? it.options.map((o) => String(o).trim()).filter(Boolean) : void 0,
        correctOptionIndex: typeof it.correctOptionIndex === "number" ? it.correctOptionIndex : void 0,
        answer: String(it.answer || "").trim(),
        explanation: it.explanation ? String(it.explanation).trim() : void 0
      })).filter((it) => Boolean(it.question)) : [];
      const contentJson = {
        kind: "past_question",
        examBody: cleanExamBody,
        examYear: cleanExamYear,
        paperType: cleanPaperType,
        items: normalizedItems,
        attachment: attachment?.storagePointer ? {
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
          storagePointer: attachment.storagePointer
        } : null
      };
      const { error } = await supabaseAdmin.from("study_materials").insert({
        id,
        title: String(title).trim(),
        subject: canonicalSubject,
        level: `${cleanExamBody} ${cleanExamYear}`,
        date_added: dateAdded,
        summary: String(summary || "").trim() || `${cleanExamBody} ${cleanExamYear} ${canonicalSubject} (${cleanPaperType}) past questions & official answers.`,
        image_url: null,
        content: contentJson
      });
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      let pushedCbtCount = 0;
      if (pushObjectivesToCbt && normalizedItems.length > 0) {
        pushedCbtCount = await insertObjectiveItemsIntoCbtBank(
          canonicalSubject,
          `${cleanExamBody} ${cleanExamYear}`,
          normalizedItems
        );
      }
      await logSystemActivity(
        actorName || "Admin",
        "Uploaded Past Questions & Answers",
        "Past Questions",
        `Published "${String(title).trim()}" (${canonicalSubject} \xB7 ${cleanExamBody} ${cleanExamYear}, ${normalizedItems.length} Q&A${pushedCbtCount > 0 ? `, +${pushedCbtCount} pushed to CBT` : ""})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot, pushedCbtCount });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to upload past questions & answers." });
    }
  });
  router.put("/past-questions/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const {
        title,
        subject,
        examBody,
        examYear,
        paperType,
        summary,
        items,
        attachment,
        pushObjectivesToCbt,
        actorName
      } = req.body || {};
      const cleanExamBody = String(examBody || "WAEC WASSCE").trim();
      const cleanExamYear = String(examYear || (/* @__PURE__ */ new Date()).getFullYear()).trim();
      const cleanPaperType = String(paperType || "Objective & Theory").trim();
      const canonicalSubject = await ensureSubjectExists(String(subject || "General Studies"), cleanExamBody);
      const normalizedItems = Array.isArray(items) ? items.map((it, idx) => ({
        id: String(it.id || `pqi-${Date.now()}-${idx}`),
        questionNumber: idx + 1,
        question: String(it.question || "").trim(),
        options: Array.isArray(it.options) && it.options.filter(Boolean).length >= 2 ? it.options.map((o) => String(o).trim()).filter(Boolean) : void 0,
        correctOptionIndex: typeof it.correctOptionIndex === "number" ? it.correctOptionIndex : void 0,
        answer: String(it.answer || "").trim(),
        explanation: it.explanation ? String(it.explanation).trim() : void 0
      })).filter((it) => Boolean(it.question)) : [];
      const contentJson = {
        kind: "past_question",
        examBody: cleanExamBody,
        examYear: cleanExamYear,
        paperType: cleanPaperType,
        items: normalizedItems,
        attachment: attachment?.storagePointer ? {
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
          storagePointer: attachment.storagePointer
        } : null
      };
      const { error } = await supabaseAdmin.from("study_materials").update({
        title: String(title || "").trim(),
        subject: canonicalSubject,
        level: `${cleanExamBody} ${cleanExamYear}`,
        summary: String(summary || "").trim(),
        content: contentJson
      }).eq("id", id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (pushObjectivesToCbt && normalizedItems.length > 0) {
        await insertObjectiveItemsIntoCbtBank(
          canonicalSubject,
          `${cleanExamBody} ${cleanExamYear}`,
          normalizedItems
        );
      }
      await logSystemActivity(
        actorName || "Admin",
        "Updated Past Questions & Answers",
        "Past Questions",
        `Updated "${String(title || id).trim()}" (${canonicalSubject} \xB7 ${cleanExamBody} ${cleanExamYear})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to update past questions & answers." });
    }
  });
  router.delete("/past-questions/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const actorName = String(req.query.actor || "Admin");
      const { data: existing } = await supabaseAdmin.from("study_materials").select("title").eq("id", id).maybeSingle();
      const { error } = await supabaseAdmin.from("study_materials").delete().eq("id", id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(
        actorName,
        "Deleted Past Questions Paper",
        "Past Questions",
        `Removed "${existing?.title || id}"`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to delete past question paper." });
    }
  });
  router.post("/questions", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { subject, topic, text, options: options2, correctOptionIndex, explanation, actorName } = req.body || {};
      if (!text || !Array.isArray(options2) || options2.length < 2) {
        res.status(400).json({ error: "Question text and at least 2 options are required." });
        return;
      }
      const canonicalSubject = await ensureSubjectExists(String(subject || "General Studies"));
      const { data: maxRow } = await supabaseAdmin.from("cbt_questions").select("id").order("id", { ascending: false }).limit(1).maybeSingle();
      const nextId = (Number(maxRow?.id) || 0) + 1;
      const { error } = await supabaseAdmin.from("cbt_questions").insert({
        id: nextId,
        subject: canonicalSubject,
        topic: String(topic || "General").trim(),
        text: String(text).trim(),
        options: options2.map((o) => String(o).trim()),
        correct_option_index: Number(correctOptionIndex || 0),
        explanation: String(explanation || "").trim()
      });
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(
        actorName || "Admin",
        "Added CBT Question",
        "Question Bank",
        `Added Q#${nextId} in ${canonicalSubject} (${topic || "General"})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to add CBT question." });
    }
  });
  router.post("/questions/bulk", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { questions, actorName } = req.body || {};
      if (!Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ error: "Provide at least 1 valid CBT question to bulk upload." });
        return;
      }
      const validItems = questions.filter(
        (q) => q && q.text && Array.isArray(q.options) && q.options.filter(Boolean).length >= 2
      );
      if (validItems.length === 0) {
        res.status(400).json({ error: "No valid questions with at least 2 options were found." });
        return;
      }
      const distinctSubjects = Array.from(
        new Set(validItems.map((q) => String(q.subject || "General Studies").trim()))
      );
      const subjectMap = /* @__PURE__ */ new Map();
      for (const s of distinctSubjects) {
        const canonical = await ensureSubjectExists(s);
        subjectMap.set(s, canonical);
      }
      const { data: maxRow } = await supabaseAdmin.from("cbt_questions").select("id").order("id", { ascending: false }).limit(1).maybeSingle();
      let nextId = (Number(maxRow?.id) || 0) + 1;
      const rowsToInsert = validItems.map((q) => {
        const rawSubj = String(q.subject || "General Studies").trim();
        const canonicalSubj = subjectMap.get(rawSubj) || rawSubj;
        const cleanOpts = q.options.map((o) => String(o).trim()).filter(Boolean);
        const correctIdx = Math.max(0, Math.min(Number(q.correctOptionIndex || 0), cleanOpts.length - 1));
        return {
          id: nextId++,
          subject: canonicalSubj,
          topic: String(q.topic || "General").trim(),
          text: String(q.text).trim(),
          options: cleanOpts,
          correct_option_index: correctIdx,
          explanation: String(q.explanation || "").trim()
        };
      });
      const { error } = await supabaseAdmin.from("cbt_questions").insert(rowsToInsert);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(
        actorName || "Admin",
        "Bulk Uploaded CBT Questions",
        "Question Bank",
        `Imported ${rowsToInsert.length} CBT question(s) across ${distinctSubjects.join(", ")}`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot, insertedCount: rowsToInsert.length });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to bulk upload CBT questions." });
    }
  });
  router.put("/questions/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = Number(req.params.id);
      const { subject, topic, text, options: options2, correctOptionIndex, explanation, actorName } = req.body || {};
      const canonicalSubject = await ensureSubjectExists(String(subject || "General Studies"));
      const { error } = await supabaseAdmin.from("cbt_questions").update({
        subject: canonicalSubject,
        topic: String(topic || "").trim(),
        text: String(text || "").trim(),
        options: Array.isArray(options2) ? options2.map((o) => String(o).trim()) : [],
        correct_option_index: Number(correctOptionIndex || 0),
        explanation: String(explanation || "").trim()
      }).eq("id", id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(
        actorName || "Admin",
        "Updated CBT Question",
        "Question Bank",
        `Edited Q#${id} (${canonicalSubject} \xB7 ${topic})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to update CBT question." });
    }
  });
  router.delete("/questions/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = Number(req.params.id);
      const actorName = String(req.query.actor || "Admin");
      const { error } = await supabaseAdmin.from("cbt_questions").delete().eq("id", id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(actorName, "Deleted CBT Question", "Question Bank", `Removed question #${id}`);
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to delete CBT question." });
    }
  });
  router.post("/subjects", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { name, description, tag, lessonsCount, questionsCount, iconName, actorName } = req.body || {};
      if (!name || !String(name).trim()) {
        res.status(400).json({ error: "Subject name is required." });
        return;
      }
      const cleanName = String(name).trim();
      const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `subj-${Date.now()}`;
      const { error } = await supabaseAdmin.from("subjects").upsert({
        id,
        name: cleanName,
        description: String(description || "").trim() || `Structured notes, past questions & answers, and CBT practice for ${cleanName}.`,
        tag: String(tag || "WAEC & JAMB").trim(),
        progress: 0,
        lessons_count: Number(lessonsCount || 0),
        questions_count: Number(questionsCount || 0),
        icon_name: String(iconName || inferSubjectIcon(cleanName)),
        color_theme: "bg-emerald-500/10 text-emerald-400"
      });
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(actorName || "Admin", "Saved Subject", "Curriculum", `Configured subject "${cleanName}"`);
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to save subject." });
    }
  });
  router.delete("/subjects/:id", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const actorName = String(req.query.actor || "Admin");
      const { error } = await supabaseAdmin.from("subjects").delete().eq("id", id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      await logSystemActivity(actorName, "Removed Subject", "Curriculum", `Deleted subject ${id}`);
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to delete subject." });
    }
  });
  router.post("/exams/submit", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { userId, userName, title, result } = req.body || {};
      if (!result) {
        res.status(400).json({ error: "Exam result payload required." });
        return;
      }
      const resolvedUserId = String(userId || "guest");
      const { error } = await supabaseAdmin.from("exam_results").insert({
        user_id: resolvedUserId,
        total_questions: Number(result.totalQuestions || 0),
        attempted_count: Number(result.attemptedCount || 0),
        correct_count: Number(result.correctCount || 0),
        wrong_count: Number(result.wrongCount || 0),
        score_percentage: Number(result.scorePercentage || 0),
        subject_breakdown: result.subjectBreakdown || {},
        time_spent_seconds: Number(result.timeSpentSeconds || 0)
      });
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      const mins = Math.max(1, Math.round(Number(result.timeSpentSeconds || 0) / 60));
      await supabaseAdmin.from("recent_activity").insert({
        id: `act-${Date.now()}`,
        user_id: resolvedUserId,
        title: String(title || "CBT Practice Session"),
        type: "cbt",
        score: `${result.scorePercentage}%`,
        detail: `Answered ${result.attemptedCount}/${result.totalQuestions} (${result.correctCount} correct) in ${mins}m`,
        time_ago: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        icon: "assignment_turned_in",
        badge_bg: "bg-emerald-500/10",
        badge_text_color: "text-emerald-400"
      });
      await logSystemActivity(
        userName || resolvedUserId,
        "Completed CBT Exam",
        "CBT Engine",
        `Scored ${result.scorePercentage}% (${result.correctCount}/${result.totalQuestions}) in ${mins}m`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to record exam submission." });
    }
  });
  router.post("/activity/read", async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { userId, userName, materialTitle, subject } = req.body || {};
      if (userId) {
        await supabaseAdmin.from("recent_activity").insert({
          id: `act-${Date.now()}`,
          user_id: String(userId),
          title: `Studied: ${materialTitle}`,
          type: "reading",
          score: null,
          detail: `${subject} academic resource`,
          time_ago: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
          icon: "menu_book",
          badge_bg: "bg-zinc-800",
          badge_text_color: "text-zinc-300"
        });
      }
      await logSystemActivity(
        userName || "Student",
        "Opened Resource",
        "Content Library",
        `Opened "${materialTitle}" (${subject})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to log reading activity." });
    }
  });
  app2.use("/api", router);
  if (options.mountAtRoot || process.env.VERCEL) {
    app2.use("/", router);
  }
  return app2;
}

// src/server/vercelEntry.ts
var app = createApiApp({ mountAtRoot: true });
var vercelEntry_default = app;
export {
  vercelEntry_default as default
};
