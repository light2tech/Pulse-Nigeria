import { SubjectPack } from './types';

export const PHYSICS_PACK: SubjectPack = {
  subjectId: 'physics',
  subjectName: 'Physics',
  iconName: 'science',
  description:
    'JAMB UTME Physics syllabus (40 CBT questions · 40 mins): Mechanics, Projectiles, Simple Machines, Heat, Waves & Optics, Current Electricity, Capacitance, and Modern Physics.',
  materialId: 'mat-jamb-physics-syllabus',
  materialTitle: 'JAMB UTME Physics Syllabus Study Guide',
  materialSummary:
    'High-yield JAMB Physics notes covering Kinematics, Projectiles, Work/Energy, Optics, Waves, Electricity, and Nuclear Physics.',
  materialSections: [
    `Section 1: Mechanics, Scalars/Vectors & Projectile Motion (JAMB Syllabus)

1. Fundamental vs Derived Quantities:
• Fundamental units: Mass (kg), Length (m), Time (s), Electric Current (A), Thermodynamic Temperature (K), Amount of Substance (mol), Luminous Intensity (cd).
• Dimensions: Force [MLT⁻²], Pressure/Stress/Young's Modulus [ML⁻¹T⁻²], Work/Energy/Torque [ML²T⁻²], Power [ML²T⁻³], Momentum/Impulse [MLT⁻¹].

2. Equations of Uniformly Accelerated Motion & Projectiles:
• v = u + at;  s = ut + ½at²;  v² = u² + 2as.
• For a projectile launched at speed u and angle θ to the horizontal:
  - Time of Flight: T = (2u sin θ) / g
  - Maximum Height: H = (u² sin² θ) / (2g)
  - Horizontal Range: R = (u² sin 2θ) / g  (Maximum range occurs at θ = 45° where R_max = u² / g).

3. Equilibrium of Forces & Moments:
• Principle of Moments: Sum of clockwise moments about any pivot equals sum of anticlockwise moments.
• Newton's 2nd Law & Impulse: F = m(v - u)/t  ⇒  Ft = mv - mu.`,

    `Section 2: Work, Energy, Simple Machines, Elasticity & Pressure

1. Mechanical Energy & Simple Machines:
• Kinetic Energy KE = ½mv²; Gravitational Potential Energy PE = mgh.
• Mechanical Advantage (MA) = Load / Effort; Velocity Ratio (VR) = Distance moved by Effort / Distance moved by Load.
• Efficiency η = (MA / VR) × 100%.
  - Inclined plane of angle θ: VR = 1 / sin θ
  - Block & tackle pulley system with n pulleys: VR = n
  - Screw jack of pitch p and handle radius r: VR = (2πr) / p

2. Hooke's Law & Elastic Potential Energy:
• F = ke (provided elastic limit is not exceeded).
• Energy stored in a stretched spring/wire: W = ½Fe = ½ke².

3. Hydrostatics & Upthrust:
• Liquid Pressure P = ρgh.
• Archimedes' Principle: Upthrust equals the weight of fluid displaced. Relative Density = Weight in air / Upthrust in water.`,

    `Section 3: Heat, Waves, Sound & Geometrical Optics

1. Thermal Physics:
• Heat capacity: Q = mcΔθ; Latent heat: Q = mL.
• Linear expansivity α = ΔL / (L₀Δθ); Area expansivity β = 2α; Cubic expansivity γ = 3α.

2. Wave Motion & Sound:
• Wave speed v = fλ.
• Echo depth/distance formula: d = (v × t) / 2.
• Fundamental frequency of a stretched string: f₀ = (1 / 2L) √(T / μ). Closed pipe produces only odd harmonics (f₀, 3f₀, 5f₀); open pipe produces all harmonics (f₀, 2f₀, 3f₀).

3. Mirror & Lens Formulae + Refraction:
• 1/f = 1/u + 1/v; Linear Magnification M = v / u = h_i / h_o.
• Snell's Law: n = sin i / sin r = Real Depth / Apparent Depth = c / v.
• Critical angle C: sin C = 1 / n (Total internal reflection occurs when light travels from optically denser to less dense medium at i > C, e.g., optical fibres and mirages).`,

    `Section 4: Electricity, Magnetism & Modern Physics

1. Direct Current Circuits & Capacitors:
• Ohm's Law: V = IR; Terminal p.d. of a cell with internal resistance r: V = E - Ir, I = E / (R + r).
• Resistors in Series: R_eq = R1 + R2; Parallel: 1/R_eq = 1/R1 + 1/R2.
• Capacitors (OPPOSITE to resistors!): Parallel: C_eq = C1 + C2; Series: 1/C_eq = 1/C1 + 1/C2. Energy stored E = ½CV².
• Electrical Power & Cost: P = IV = I²R = V²/R; 1 kWh = 3.6 × 10⁶ J.

2. Transformers & Modern Physics:
• Ideal Transformer: V_s / V_p = N_s / N_p = I_p / I_s. Eddy current losses are minimized by laminating the soft-iron core.
• Photoelectric Effect: hf = hf₀ + ½mv²_max (Work function W₀ = hf₀).
• Radioactive Half-Life: N(t) = N₀ (½)^(t / T_½).`,
  ],
  pastPaperId: 'pq-jamb-physics',
  pastPaperTitle: 'JAMB UTME Physics Past Questions & Official Answers (40 Questions)',
  pastPaperYear: '2024',
  pastPaperSummary:
    'Complete 40-question JAMB UTME Physics paper covering Projectiles, Mechanics, Optics, Waves, Electricity, and Nuclear Physics.',
  questions: [
    {
      topic: 'Projectile Motion',
      question:
        'A projectile is fired with an initial velocity of 40 m/s at an angle of 30° to the horizontal. Calculate the maximum height attained. [g = 10 m/s²]',
      options: ['10 m', '20 m', '40 m', '80 m'],
      correctOptionIndex: 1,
      explanation:
        'Maximum height H = (u² sin² θ) / (2g) = (40² × (sin 30°)²) / (2 × 10) = (1600 × 0.25) / 20 = 400 / 20 = 20 m.',
    },
    {
      topic: 'Current Electricity',
      question:
        'A cell of e.m.f. 1.5 V and internal resistance 0.5 Ω is connected across an external resistor of 2.5 Ω. Find the terminal potential difference across the cell.',
      options: ['0.25 V', '1.00 V', '1.25 V', '1.50 V'],
      correctOptionIndex: 2,
      explanation:
        'Current I = E / (R + r) = 1.5 / (2.5 + 0.5) = 1.5 / 3.0 = 0.5 A. Terminal p.d. V = I × R = 0.5 × 2.5 = 1.25 V.',
    },
    {
      topic: 'Capacitance',
      question:
        'Two capacitors of capacitances 3 μF and 6 μF are connected in series across a 100 V DC supply. Calculate the energy stored in the combination.',
      options: ['0.01 J', '0.02 J', '0.045 J', '0.09 J'],
      correctOptionIndex: 0,
      explanation:
        'For series capacitors: C_eq = (3 × 6) / (3 + 6) = 18 / 9 = 2 μF = 2 × 10⁻⁶ F. Energy E = ½ C_eq V² = 0.5 × (2 × 10⁻⁶) × (100)² = 10⁻⁶ × 10⁴ = 0.01 J.',
    },
    {
      topic: 'Refraction & Optics',
      question:
        'A coin lies at the bottom of a swimming pool of real depth 2.4 m. If the refractive index of water is 4/3, what is the apparent vertical displacement of the coin?',
      options: ['0.6 m', '1.2 m', '1.8 m', '3.2 m'],
      correctOptionIndex: 0,
      explanation:
        'Apparent depth = Real depth / n = 2.4 / (4/3) = 1.8 m. Vertical displacement d = Real depth - Apparent depth = 2.4 - 1.8 = 0.6 m.',
    },
    {
      topic: 'Simple Machines',
      question:
        'A block and tackle system of 5 pulleys has an efficiency of 80%. What effort is required to lift a load of 400 N?',
      options: ['80 N', '100 N', '125 N', '160 N'],
      correctOptionIndex: 1,
      explanation:
        'VR = number of pulleys = 5. Efficiency = (MA / VR) × 100% ⇒ 0.80 = MA / 5 ⇒ MA = 4. Since MA = Load / Effort, Effort = 400 / 4 = 100 N.',
    },
    {
      topic: 'Radioactivity & Half-Life',
      question:
        'A radioactive isotope of mass 64 g has a half-life of 6 days. What mass of the isotope remains undecayed after 24 days?',
      options: ['2 g', '4 g', '8 g', '16 g'],
      correctOptionIndex: 1,
      explanation:
        'Number of half-lives n = 24 / 6 = 4. Remaining mass N = 64 × (1/2)⁴ = 64 / 16 = 4 g.',
    },
    {
      topic: 'Units & Dimensions',
      question:
        'What is the correct dimensional formula for Young’s Modulus of elasticity?',
      options: ['MLT⁻²', 'ML⁻¹T⁻²', 'ML²T⁻²', 'ML⁻¹T⁻¹'],
      correctOptionIndex: 1,
      explanation:
        'Young’s Modulus = Stress / Strain. Since Strain is dimensionless, Young’s Modulus has the dimensions of Stress (Force / Area) = MLT⁻² / L² = ML⁻¹T⁻².',
    },
    {
      topic: 'Scalars & Vectors',
      question:
        'Two perpendicular forces of magnitudes 6 N and 8 N act simultaneously at a point. What is the magnitude of their resultant force?',
      options: ['2 N', '10 N', '14 N', '48 N'],
      correctOptionIndex: 1,
      explanation:
        'For perpendicular vectors: R = √(6² + 8²) = √(36 + 64) = √100 = 10 N.',
    },
    {
      topic: 'Kinematics',
      question:
        'A car accelerates uniformly from rest at 3 m/s² for 8 seconds. Calculate the distance covered during this time.',
      options: ['24 m', '48 m', '96 m', '192 m'],
      correctOptionIndex: 2,
      explanation:
        's = ut + ½at² = 0 + 0.5 × 3 × 8² = 0.5 × 3 × 64 = 96 m.',
    },
    {
      topic: 'Free Fall & Gravity',
      question:
        'A stone is projected vertically upwards with an initial speed of 30 m/s. How long does it take to return to the point of projection? [g = 10 m/s²]',
      options: ['3.0 s', '4.5 s', '6.0 s', '9.0 s'],
      correctOptionIndex: 2,
      explanation:
        'Time to maximum height t = u / g = 30 / 10 = 3.0 s. Total time of flight back to launch level = 2t = 6.0 s.',
    },
    {
      topic: 'Momentum & Impulse',
      question:
        'A ball of mass 0.5 kg moving at 12 m/s hits a vertical wall and rebounds in the opposite direction at 8 m/s. Calculate the magnitude of the impulse exerted by the wall.',
      options: ['2.0 Ns', '4.0 Ns', '6.0 Ns', '10.0 Ns'],
      correctOptionIndex: 3,
      explanation:
        'Impulse = m(v - u) = 0.5 × [8 - (-12)] = 0.5 × 20 = 10.0 Ns.',
    },
    {
      topic: 'Equilibrium & Moments',
      question:
        'A uniform metre rule is pivoted at the 40 cm mark and balanced horizontally when a mass of 60 g is hung at the 20 cm mark. Calculate the mass of the metre rule.',
      options: ['60 g', '80 g', '120 g', '240 g'],
      correctOptionIndex: 2,
      explanation:
        'Weight of uniform metre rule acts at 50 cm mark (distance 10 cm from pivot). Anticlockwise moment = Clockwise moment: 60 × (40 - 20) = M × (50 - 40) ⇒ 1200 = 10M ⇒ M = 120 g.',
    },
    {
      topic: 'Friction',
      question:
        'A wooden block of mass 5 kg rests on a rough horizontal table. If a horizontal force of 20 N just sets it in motion, find the coefficient of static friction. [g = 10 m/s²]',
      options: ['0.20', '0.25', '0.40', '0.50'],
      correctOptionIndex: 2,
      explanation:
        'Normal reaction R = mg = 5 × 10 = 50 N. μ = F_max / R = 20 / 50 = 0.40.',
    },
    {
      topic: 'Work, Energy & Power',
      question:
        'An electric water pump lifts 300 kg of water through a vertical height of 12 m in 20 seconds. What is the useful power output of the pump? [g = 10 m/s²]',
      options: ['180 W', '1,800 W', '3,600 W', '7,200 W'],
      correctOptionIndex: 1,
      explanation:
        'Power P = mgh / t = (300 × 10 × 12) / 20 = 36,000 / 20 = 1,800 W.',
    },
    {
      topic: 'Circular Motion',
      question:
        'A body of mass 2 kg moves in a horizontal circle of radius 4 m at a constant speed of 6 m/s. Calculate the centripetal force acting on it.',
      options: ['3 N', '9 N', '18 N', '36 N'],
      correctOptionIndex: 2,
      explanation:
        'Centripetal force F = mv² / r = (2 × 6²) / 4 = 72 / 4 = 18 N.',
    },
    {
      topic: 'Simple Harmonic Motion',
      question:
        'If the length of a simple pendulum is quadrupled (increased fourfold), its period of oscillation is:',
      options: ['Halved', 'Doubled', 'Quadrupled', 'Unchanged'],
      correctOptionIndex: 1,
      explanation:
        'Period T = 2π√(L/g). Since T ∝ √L, multiplying L by 4 multiplies T by √4 = 2 (doubled).',
    },
    {
      topic: 'Hooke’s Law & Elasticity',
      question:
        'A spiral spring of force constant 200 N/m is stretched by 0.05 m. Calculate the elastic potential energy stored in the spring.',
      options: ['0.25 J', '0.50 J', '5.00 J', '10.0 J'],
      correctOptionIndex: 0,
      explanation:
        'Elastic PE = ½ke² = 0.5 × 200 × (0.05)² = 100 × 0.0025 = 0.25 J.',
    },
    {
      topic: 'Hydrostatic Pressure',
      question:
        'Calculate the pressure due to water alone at a depth of 15 m below the surface of a freshwater lake. [Density of water = 1000 kg/m³, g = 10 m/s²]',
      options: ['1.5 × 10⁴ Pa', '1.5 × 10⁵ Pa', '1.5 × 10⁶ Pa', '1.0 × 10⁵ Pa'],
      correctOptionIndex: 1,
      explanation:
        'Liquid pressure P = ρgh = 1000 × 10 × 15 = 150,000 Pa = 1.5 × 10⁵ Pa.',
    },
    {
      topic: 'Archimedes’ Principle',
      question:
        'A solid weighs 45 N in air and 30 N when completely immersed in water. Calculate the relative density of the solid.',
      options: ['1.5', '2.0', '3.0', '4.5'],
      correctOptionIndex: 2,
      explanation:
        'Upthrust in water = 45 - 30 = 15 N. Relative density = Weight in air / Upthrust in water = 45 / 15 = 3.0.',
    },
    {
      topic: 'Thermal Expansion',
      question:
        'A brass rod of length 2.0 m at 20°C is heated to 120°C. If the linear expansivity of brass is 1.9 × 10⁻⁵ K⁻¹, find the increase in length.',
      options: ['0.38 mm', '1.90 mm', '3.80 mm', '7.60 mm'],
      correctOptionIndex: 2,
      explanation:
        'ΔL = αL₀Δθ = (1.9 × 10⁻⁵) × 2.0 × (120 - 20) = 3.8 × 10⁻³ m = 3.80 mm.',
    },
    {
      topic: 'Specific Heat Capacity',
      question:
        'How much heat energy is required to raise the temperature of 0.5 kg of water from 20°C to 60°C? [Specific heat capacity of water = 4200 J kg⁻¹ K⁻¹]',
      options: ['42 kJ', '84 kJ', '126 kJ', '168 kJ'],
      correctOptionIndex: 1,
      explanation:
        'Q = mcΔθ = 0.5 × 4200 × (60 - 20) = 2100 × 40 = 84,000 J = 84 kJ.',
    },
    {
      topic: 'Latent Heat',
      question:
        'Calculate the quantity of heat needed to melt 0.2 kg of ice completely at 0°C into water at 0°C. [Specific latent heat of fusion of ice = 3.36 × 10⁵ J/kg]',
      options: ['33.6 kJ', '67.2 kJ', '168.0 kJ', '336.0 kJ'],
      correctOptionIndex: 1,
      explanation:
        'Q = mL_f = 0.2 × 3.36 × 10⁵ = 67,200 J = 67.2 kJ.',
    },
    {
      topic: 'Heat Transfer',
      question:
        'In a vacuum (thermos) flask, heat loss by radiation is minimized primarily by:',
      options: [
        'The cork stopper at the neck',
        'The vacuum between the double walls',
        'Silvering the glass surfaces',
        'The plastic outer casing',
      ],
      correctOptionIndex: 2,
      explanation:
        'Silvered shiny surfaces are poor emitters and strong reflectors of infrared thermal radiation; the vacuum prevents conduction and convection.',
    },
    {
      topic: 'Wave Properties',
      question:
        'A progressive wave has a frequency of 250 Hz and travels at a speed of 350 m/s. What is its wavelength?',
      options: ['0.71 m', '1.40 m', '2.50 m', '8.75 m'],
      correctOptionIndex: 1,
      explanation:
        'λ = v / f = 350 / 250 = 1.40 m.',
    },
    {
      topic: 'Sound Waves & Echoes',
      question:
        'A ship sends an ultrasonic pulse vertically downwards to the seabed and receives the echo 1.2 seconds later. If the speed of sound in seawater is 1500 m/s, find the depth of the sea.',
      options: ['600 m', '900 m', '1,250 m', '1,800 m'],
      correctOptionIndex: 1,
      explanation:
        'Echo depth d = (v × t) / 2 = (1500 × 1.2) / 2 = 900 m.',
    },
    {
      topic: 'Vibrations in Pipes',
      question:
        'Which harmonics can be produced by an air column in a pipe closed at one end?',
      options: [
        'Even harmonics only (2f₀, 4f₀, 6f₀...)',
        'All integer harmonics (f₀, 2f₀, 3f₀...)',
        'Odd harmonics only (f₀, 3f₀, 5f₀...)',
        'Fundamental frequency only',
      ],
      correctOptionIndex: 2,
      explanation:
        'A closed pipe must have a node at the closed end and an antinode at the open end, supporting only odd multiples of the fundamental frequency.',
    },
    {
      topic: 'Plane Mirrors',
      question:
        'Two plane mirrors are inclined at an angle of 60° to each other. How many images of an object placed symmetrically between them are formed?',
      options: ['4', '5', '6', '7'],
      correctOptionIndex: 1,
      explanation:
        'Number of images n = (360° / θ) - 1 = (360 / 60) - 1 = 6 - 1 = 5.',
    },
    {
      topic: 'Curved Mirrors & Lenses',
      question:
        'An object is placed 30 cm in front of a converging lens of focal length 10 cm. Find the image distance from the lens.',
      options: ['7.5 cm', '15.0 cm', '20.0 cm', '60.0 cm'],
      correctOptionIndex: 1,
      explanation:
        '1/f = 1/u + 1/v ⇒ 1/10 = 1/30 + 1/v ⇒ 1/v = 1/10 - 1/30 = 2/30 = 1/15 ⇒ v = 15.0 cm.',
    },
    {
      topic: 'Total Internal Reflection',
      question:
        'If the refractive index of a glass prism is 2.0, what is its critical angle in air?',
      options: ['30°', '42°', '45°', '60°'],
      correctOptionIndex: 0,
      explanation:
        'sin C = 1 / n = 1 / 2.0 = 0.5 ⇒ C = 30°.',
    },
    {
      topic: 'Optical Instruments & Eye Defects',
      question:
        'Short-sightedness (myopia), in which distant objects focus in front of the retina, is corrected using a:',
      options: ['Converging (convex) lens', 'Diverging (concave) lens', 'Cylindrical lens', 'Bifocal plane mirror'],
      correctOptionIndex: 1,
      explanation:
        'A diverging (concave) lens diverges incoming parallel rays slightly before they enter the eye so they focus accurately on the retina.',
    },
    {
      topic: 'Electromagnetic Spectrum',
      question:
        'Which of the following electromagnetic waves has the shortest wavelength and highest penetrating power?',
      options: ['Ultraviolet rays', 'X-rays', 'Gamma rays', 'Microwaves'],
      correctOptionIndex: 2,
      explanation:
        'Gamma rays have the highest frequency, highest photon energy, and shortest wavelength in the electromagnetic spectrum.',
    },
    {
      topic: 'Electrostatics & Coulomb’s Law',
      question:
        'If the distance between two point electric charges is doubled while their magnitudes remain constant, the electrostatic force between them becomes:',
      options: ['Twice as great', 'Half as great', 'One-quarter as great', 'Four times as great'],
      correctOptionIndex: 2,
      explanation:
        'By Coulomb’s inverse-square law, F ∝ 1 / r². Doubling r reduces F to 1 / 2² = 1/4 of its original value.',
    },
    {
      topic: 'Resistors in Parallel',
      question:
        'Three resistors of resistances 2 Ω, 3 Ω, and 6 Ω are connected in parallel. What is their combined effective resistance?',
      options: ['0.5 Ω', '1.0 Ω', '2.0 Ω', '11.0 Ω'],
      correctOptionIndex: 1,
      explanation:
        '1/R = 1/2 + 1/3 + 1/6 = (3 + 2 + 1) / 6 = 6 / 6 = 1 ⇒ R = 1.0 Ω.',
    },
    {
      topic: 'Electrical Energy & Power',
      question:
        'An electric kettle rated 2000 W, 240 V is operated for 3 hours daily for 10 days. Calculate the total electrical energy consumed in kilowatt-hours (kWh).',
      options: ['6 kWh', '20 kWh', '60 kWh', '600 kWh'],
      correctOptionIndex: 2,
      explanation:
        'Power = 2000 W = 2 kW. Total time = 3 × 10 = 30 hours. Energy = 2 kW × 30 h = 60 kWh.',
    },
    {
      topic: 'Galvanometer Conversion',
      question:
        'To convert a sensitive moving-coil galvanometer into an ammeter capable of reading large currents, one connects a:',
      options: [
        'High resistance multiplier in series',
        'Low resistance shunt in parallel',
        'Low resistance shunt in series',
        'High resistance multiplier in parallel',
      ],
      correctOptionIndex: 1,
      explanation:
        'A low-resistance shunt in parallel diverts the bulk of the main current while allowing full-scale deflection safely.',
    },
    {
      topic: 'Transformers',
      question:
        'A step-down transformer has 1200 turns in its primary coil and 60 turns in its secondary coil. If the primary is connected to a 240 V AC mains, find the secondary output voltage.',
      options: ['6 V', '12 V', '20 V', '48 V'],
      correctOptionIndex: 1,
      explanation:
        'Vs / Vp = Ns / Np ⇒ Vs = 240 × (60 / 1200) = 240 / 20 = 12 V.',
    },
    {
      topic: 'Electromagnetic Induction',
      question:
        'Lenz’s law of electromagnetic induction is a direct consequence of the law of conservation of:',
      options: ['Electric charge', 'Linear momentum', 'Energy', 'Mass'],
      correctOptionIndex: 2,
      explanation:
        'Mechanical work must be done against the opposing magnetic force to induce electrical energy, upholding conservation of energy.',
    },
    {
      topic: 'Alternating Current (AC)',
      question:
        'If the peak voltage of an alternating current supply is 340 V, calculate its root-mean-square (r.m.s.) voltage. [√2 ≈ 1.414]',
      options: ['170 V', '240 V', '340 V', '481 V'],
      correctOptionIndex: 1,
      explanation:
        'V_rms = V_0 / √2 = 340 / 1.414 ≈ 240 V.',
    },
    {
      topic: 'Photoelectric Effect',
      question:
        'In photoelectric emission, the maximum kinetic energy of emitted photoelectrons depends solely on the:',
      options: [
        'Intensity of the incident light',
        'Time of exposure to light',
        'Frequency of the incident radiation and work function of the metal',
        'Surface area of the cathode',
      ],
      correctOptionIndex: 2,
      explanation:
        'By Einstein’s equation KE_max = hf - W₀, kinetic energy increases with photon frequency f, whereas light intensity only alters the number of electrons emitted.',
    },
    {
      topic: 'Nuclear Physics',
      question:
        'When a radioactive nucleus ²³⁸₉₂U emits one alpha (α) particle, the mass number and atomic number of the daughter nucleus are respectively:',
      options: ['234 and 90', '234 and 92', '238 and 93', '236 and 91'],
      correctOptionIndex: 0,
      explanation:
        'An alpha particle is a ⁴₂He nucleus, reducing the mass number by 4 (238 → 234) and the atomic number by 2 (92 → 90).',
    },
  ],
};
