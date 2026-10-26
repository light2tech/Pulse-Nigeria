import { SubjectPack } from './types';

export const MATHEMATICS_PACK: SubjectPack = {
  subjectId: 'mathematics',
  subjectName: 'Mathematics',
  iconName: 'functions',
  description:
    'JAMB UTME Mathematics syllabus (40 CBT questions · 40 mins): Number Bases, Indices/Logarithms, Surds, Matrices, Progressions, Calculus (Differentiation & Integration), and Probability.',
  materialId: 'mat-jamb-mathematics-syllabus',
  materialTitle: 'JAMB UTME Mathematics Syllabus Study Guide',
  materialSummary:
    'Complete JAMB Mathematics formula & method guide covering Number Bases, Surds, Matrices, AP/GP, Coordinate Geometry, Calculus, and Statistics.',
  materialSections: [
    `Section 1: Number Bases, Indices, Logarithms, Surds & Sets (JAMB Syllabus)

1. Number Base Conversions:
• Convert base b to base 10 by expanding in powers of b: e.g., 231₄ = 2(4²) + 3(4¹) + 1(4⁰) = 32 + 12 + 1 = 45₁₀.
• Convert base 10 to base b by repeated division by b and reading remainders upwards.

2. Laws of Indices & Logarithms:
• a^m × a^n = a^(m+n);  a^(-n) = 1 / a^n;  a^(p/q) = (q√a)^p.
• log_a(XY) = log_a X + log_a Y;  log_a(X/Y) = log_a X - log_a Y;  log_a(X^k) = k log_a X;  log_b X = (log_a X)/(log_a b).

3. Surds & Two-Set / Three-Set Venn Formulas:
• Rationalize a / (√b - √c) by multiplying numerator and denominator by the conjugate (√b + √c), using (√b)² - (√c)² = b - c.
• Two sets: n(A ∪ B) = n(A) + n(B) - n(A ∩ B).`,

    `Section 2: Polynomials, Progressions (AP/GP) & Matrices

1. Arithmetic & Geometric Progressions:
• AP: nth term T_n = a + (n - 1)d; Sum S_n = (n/2)[2a + (n - 1)d] = (n/2)(a + l).
• GP: nth term T_n = ar^(n - 1); Sum S_n = a(1 - r^n)/(1 - r); Sum to infinity (|r| < 1): S_∞ = a / (1 - r).

2. Quadratic Roots & Remainder Theorem:
• For ax² + bx + c = 0 with roots α and β: Sum α + β = -b/a; Product αβ = c/a; α² + β² = (α + β)² - 2αβ.
• Remainder Theorem: When polynomial f(x) is divided by (x - a), the remainder is f(a).

3. 2×2 Matrices & Determinants:
• For A = [[a, b], [c, d]], det(A) = |A| = ad - bc.
• A is singular (no inverse) when ad - bc = 0.
• Inverse A⁻¹ = (1 / (ad - bc)) × [[d, -b], [-c, a]].`,

    `Section 3: Coordinate Geometry, Trigonometry & Mensuration

1. Straight Lines:
• Gradient m = (y2 - y1) / (x2 - x1); Midpoint = ((x1+x2)/2, (y1+y2)/2); Distance d = √[(x2-x1)² + (y2-y1)²].
• Parallel lines have equal gradients (m1 = m2); Perpendicular lines satisfy m1 × m2 = -1.

2. Mensuration & Circle Theorems:
• Sector of radius r and angle θ°: Arc length L = (θ/360) × 2πr; Sector Area = (θ/360) × πr².
• Angle at the centre of a circle is twice the angle at the circumference; opposite angles of a cyclic quadrilateral sum to 180°; angle in a semicircle is 90°.`,

    `Section 4: Calculus, Permutations/Combinations & Probability

1. Differentiation & Integration:
• If y = ax^n, dy/dx = n·ax^(n-1). Stationary/turning points occur where dy/dx = 0 (minimum if d²y/dx² > 0; maximum if d²y/dx² < 0).
• Indefinite Integral: ∫ x^n dx = x^(n+1)/(n+1) + C (for n ≠ -1).
• Kinematics link: v = ds/dt and a = dv/dt.

2. Combinatorics & Probability:
• Permutations: ^nP_r = n! / (n - r)!; Arrangements of word with repeated letters = n! / (p! q! ...).
• Combinations: ^nC_r = n! / [(n - r)! r!].
• Mutually exclusive events (OR): P(A ∪ B) = P(A) + P(B). Independent events (AND): P(A ∩ B) = P(A) × P(B).`,
  ],
  pastPaperId: 'pq-jamb-mathematics',
  pastPaperTitle: 'JAMB UTME Mathematics Past Questions & Official Answers (40 Questions)',
  pastPaperYear: '2024',
  pastPaperSummary:
    'Complete 40-question JAMB UTME Mathematics paper covering Number Bases, Matrices, Progressions, Differentiation, Integration, Geometry, and Probability.',
  questions: [
    {
      topic: 'Calculus — Differentiation',
      question:
        'Find the value of x at which the curve y = x³ - 6x² + 9x + 2 attains its local maximum.',
      options: ['x = 1', 'x = 2', 'x = 3', 'x = -1'],
      correctOptionIndex: 0,
      explanation:
        'dy/dx = 3x² - 12x + 9 = 3(x - 1)(x - 3) = 0 ⇒ x = 1 or x = 3. Second derivative d²y/dx² = 6x - 12. At x = 1, d²y/dx² = 6(1) - 12 = -6 < 0, confirming a local maximum at x = 1.',
    },
    {
      topic: 'Matrices & Determinants',
      question:
        'Find the positive value of x if the matrix P = [[2x, 4], [9, x]] is singular.',
      options: ['2', '3', '3√2', '6'],
      correctOptionIndex: 2,
      explanation:
        'A matrix is singular when its determinant is zero: (2x)(x) - (4)(9) = 0 ⇒ 2x² = 36 ⇒ x² = 18 ⇒ x = √18 = 3√2.',
    },
    {
      topic: 'Geometric Progression',
      question:
        'The first term of an infinite geometric progression is 18 and its sum to infinity is 27. Find the common ratio r.',
      options: ['1/3', '2/3', '1/2', '3/4'],
      correctOptionIndex: 0,
      explanation:
        'S_∞ = a / (1 - r) ⇒ 27 = 18 / (1 - r) ⇒ 1 - r = 18 / 27 = 2/3 ⇒ r = 1 - 2/3 = 1/3.',
    },
    {
      topic: 'Number Bases',
      question: 'If 23_x + 101_2 = 18_10, find the base x.',
      options: ['4', '5', '6', '7'],
      correctOptionIndex: 1,
      explanation:
        'Convert each term to base 10: (2x + 3) + (1×2² + 0×2¹ + 1×2⁰) = 18 ⇒ 2x + 3 + 5 = 18 ⇒ 2x = 10 ⇒ x = 5.',
    },
    {
      topic: 'Coordinate Geometry',
      question:
        'Find the equation of the line passing through (2, -1) and perpendicular to the line 3x - 2y + 7 = 0.',
      options: [
        '2x + 3y - 1 = 0',
        '3x + 2y - 4 = 0',
        '2x - 3y - 7 = 0',
        '2x + 3y + 1 = 0',
      ],
      correctOptionIndex: 0,
      explanation:
        'Rewrite 3x - 2y + 7 = 0 as y = (3/2)x + 7/2, so m1 = 3/2. Perpendicular gradient m2 = -1/m1 = -2/3. Line through (2, -1): y - (-1) = (-2/3)(x - 2) ⇒ 3y + 3 = -2x + 4 ⇒ 2x + 3y - 1 = 0.',
    },
    {
      topic: 'Permutations & Arrangements',
      question:
        'In how many distinct ways can the letters of the word COMMITTEE be arranged?',
      options: ['45,360', '90,720', '181,440', '362,880'],
      correctOptionIndex: 0,
      explanation:
        'COMMITTEE has 9 letters with M repeated 2 times, T repeated 2 times, and E repeated 2 times. Distinct arrangements = 9! / (2! × 2! × 2!) = 362,880 / 8 = 45,360.',
    },
    {
      topic: 'Binary Arithmetic',
      question:
        'Convert 37₁₀ to a binary (base 2) number.',
      options: ['100101₂', '101001₂', '100011₂', '110001₂'],
      correctOptionIndex: 0,
      explanation:
        '37 = 32 + 4 + 1 = 1(2⁵) + 0(2⁴) + 0(2³) + 1(2²) + 0(2¹) + 1(2⁰) = 100101₂.',
    },
    {
      topic: 'Indices',
      question:
        'Solve for x in the exponential equation 9^(x + 1) = 27^(x - 1).',
      options: ['3', '4', '5', '6'],
      correctOptionIndex: 2,
      explanation:
        '(3²)^(x + 1) = (3³)^(x - 1) ⇒ 3^(2x + 2) = 3^(3x - 3) ⇒ 2x + 2 = 3x - 3 ⇒ x = 5.',
    },
    {
      topic: 'Logarithms',
      question:
        'Evaluate log₁₀ 25 + log₁₀ 40 - log₁₀ 10.',
      options: ['1', '2', '3', '10'],
      correctOptionIndex: 1,
      explanation:
        'log₁₀[(25 × 40) / 10] = log₁₀(1000 / 10) = log₁₀ 100 = 2.',
    },
    {
      topic: 'Surds',
      question:
        'Simplify and rationalize: 6 / (√5 - √2).',
      options: ['2(√5 + √2)', '2(√5 - √2)', '3(√5 + √2)', '√5 + √2'],
      correctOptionIndex: 0,
      explanation:
        'Multiply numerator and denominator by (√5 + √2): 6(√5 + √2) / (5 - 2) = 6(√5 + √2) / 3 = 2(√5 + √2).',
    },
    {
      topic: 'Sets & Venn Diagrams',
      question:
        'In a class of 50 students, 32 offer Physics, 28 offer Chemistry, and 5 offer neither subject. How many students offer BOTH Physics and Chemistry?',
      options: ['10', '15', '18', '20'],
      correctOptionIndex: 1,
      explanation:
        'n(P ∪ C) = 50 - 5 = 45. Since n(P ∪ C) = n(P) + n(C) - n(P ∩ C), 45 = 32 + 28 - x ⇒ x = 60 - 45 = 15.',
    },
    {
      topic: 'Commercial Arithmetic',
      question:
        'Find the simple interest on ₦45,000 for 4 years at 8% per annum.',
      options: ['₦12,600', '₦14,400', '₦16,200', '₦18,000'],
      correctOptionIndex: 1,
      explanation:
        'I = (P × R × T) / 100 = (45,000 × 8 × 4) / 100 = 450 × 32 = ₦14,400.',
    },
    {
      topic: 'Variation',
      question:
        'If y varies inversely as the square of x, and y = 4 when x = 3, find y when x = 6.',
      options: ['1', '2', '8', '16'],
      correctOptionIndex: 0,
      explanation:
        'y = k / x² ⇒ k = yx² = 4 × 3² = 36. When x = 6, y = 36 / 6² = 36 / 36 = 1.',
    },
    {
      topic: 'Quadratic Roots',
      question:
        'If α and β are the roots of 2x² - 7x + 3 = 0, find the value of α + β + αβ.',
      options: ['2', '5', '7/2', '10'],
      correctOptionIndex: 1,
      explanation:
        'α + β = -(-7)/2 = 7/2 and αβ = 3/2. Therefore α + β + αβ = 7/2 + 3/2 = 10/2 = 5.',
    },
    {
      topic: 'Remainder Theorem',
      question:
        'Find the remainder when f(x) = 2x³ - 3x² + 4x - 5 is divided by (x - 2).',
      options: ['3', '5', '7', '11'],
      correctOptionIndex: 2,
      explanation:
        'By Remainder Theorem, R = f(2) = 2(2³) - 3(2²) + 4(2) - 5 = 16 - 12 + 8 - 5 = 7.',
    },
    {
      topic: 'Simultaneous Linear Equations',
      question:
        'Solve simultaneously: 3x + 2y = 13 and 2x - y = 4. Find (x + y).',
      options: ['4', '5', '6', '7'],
      correctOptionIndex: 1,
      explanation:
        'From 2x - y = 4, y = 2x - 4. Substitute into 3x + 2(2x - 4) = 13 ⇒ 7x - 8 = 13 ⇒ 7x = 21 ⇒ x = 3. Then y = 2(3) - 4 = 2. Hence x + y = 5.',
    },
    {
      topic: 'Linear Inequalities',
      question:
        'Find the range of values of x satisfying 3 - 2x < 11.',
      options: ['x < -4', 'x > -4', 'x < 4', 'x > 4'],
      correctOptionIndex: 1,
      explanation:
        '-2x < 11 - 3 ⇒ -2x < 8. Dividing by -2 reverses the inequality sign: x > -4.',
    },
    {
      topic: 'Arithmetic Progression (AP)',
      question:
        'The 4th term of an Arithmetic Progression is 15 and the 9th term is 35. Find the first term a.',
      options: ['2', '3', '4', '5'],
      correctOptionIndex: 1,
      explanation:
        'a + 3d = 15 and a + 8d = 35. Subtracting gives 5d = 20 ⇒ d = 4. Substituting d = 4: a + 3(4) = 15 ⇒ a = 3.',
    },
    {
      topic: 'Sum of Arithmetic Progression',
      question:
        'Find the sum of the first 20 terms of the Arithmetic Progression: 3, 7, 11, 15, ...',
      options: ['780', '820', '840', '860'],
      correctOptionIndex: 1,
      explanation:
        'Here a = 3, d = 4, n = 20. S₂₀ = (20/2)[2(3) + (19)(4)] = 10 × [6 + 76] = 10 × 82 = 820.',
    },
    {
      topic: 'Binary Operations',
      question:
        'An operation * is defined on real numbers by p * q = p + q - pq. Find the identity element e under *.',
      options: ['-1', '0', '1', '2'],
      correctOptionIndex: 1,
      explanation:
        'Require p * e = p ⇒ p + e - pe = p ⇒ e(1 - p) = 0 for all p ⇒ e = 0.',
    },
    {
      topic: 'Inverse of a 2×2 Matrix',
      question:
        'Find the determinant of the matrix M = [[5, -2], [3, 4]].',
      options: ['14', '20', '26', '-26'],
      correctOptionIndex: 2,
      explanation:
        'det(M) = (5)(4) - (-2)(3) = 20 - (-6) = 26.',
    },
    {
      topic: 'Polygons',
      question:
        'Each interior angle of a regular polygon is 150°. How many sides does the polygon have?',
      options: ['8', '10', '12', '15'],
      correctOptionIndex: 2,
      explanation:
        'Each exterior angle = 180° - 150° = 30°. Number of sides n = 360° / 30° = 12.',
    },
    {
      topic: 'Circle Theorems',
      question:
        'PQRS is a cyclic quadrilateral inscribed in a circle. If ∠PQR = 112°, find ∠PSR.',
      options: ['56°', '68°', '78°', '112°'],
      correctOptionIndex: 1,
      explanation:
        'Opposite interior angles of a cyclic quadrilateral are supplementary: ∠PSR = 180° - 112° = 68°.',
    },
    {
      topic: 'Mensuration — Sector of Circle',
      question:
        'Calculate the area of a sector of a circle of radius 14 cm which subtends an angle of 90° at the centre. [Take π = 22/7]',
      options: ['77 cm²', '154 cm²', '308 cm²', '616 cm²'],
      correctOptionIndex: 1,
      explanation:
        'Area = (90 / 360) × (22/7) × 14 × 14 = (1/4) × 616 = 154 cm².',
    },
    {
      topic: 'Mensuration — Solid Shapes',
      question:
        'Find the volume of a right circular cone of base radius 7 cm and perpendicular height 12 cm. [Take π = 22/7]',
      options: ['154 cm³', '616 cm³', '924 cm³', '1,848 cm³'],
      correctOptionIndex: 1,
      explanation:
        'Volume of cone = (1/3)πr²h = (1/3) × (22/7) × 7 × 7 × 12 = 22 × 7 × 4 = 616 cm³.',
    },
    {
      topic: 'Coordinate Geometry — Midpoint & Distance',
      question:
        'Calculate the straight-line distance between points A(-1, 2) and B(4, 14).',
      options: ['12 units', '13 units', '15 units', '17 units'],
      correctOptionIndex: 1,
      explanation:
        'd = √[(4 - (-1))² + (14 - 2)²] = √(5² + 12²) = √(25 + 144) = √169 = 13 units.',
    },
    {
      topic: 'Trigonometric Ratios',
      question:
        'If sin θ = 5/13 and θ is an acute angle, evaluate tan θ.',
      options: ['5/12', '12/13', '12/5', '13/12'],
      correctOptionIndex: 0,
      explanation:
        'Adjacent side = √(13² - 5²) = √(169 - 25) = 12. Thus tan θ = Opposite / Adjacent = 5/12.',
    },
    {
      topic: 'Angles of Elevation',
      question:
        'From a point on level ground 30 m away from the foot of a vertical mast, the angle of elevation of the top of the mast is 60°. Find the height of the mast.',
      options: ['10√3 m', '15√3 m', '30 m', '30√3 m'],
      correctOptionIndex: 3,
      explanation:
        'tan 60° = h / 30 ⇒ h = 30 tan 60° = 30√3 m.',
    },
    {
      topic: 'Differentiation — Chain/Power Rule',
      question:
        'Find dy/dx if y = (2x + 3)⁴.',
      options: ['4(2x + 3)³', '8(2x + 3)³', '2(2x + 3)³', '8(2x + 3)⁴'],
      correctOptionIndex: 1,
      explanation:
        'By the chain rule, dy/dx = 4(2x + 3)³ × d/dx(2x + 3) = 4(2x + 3)³ × 2 = 8(2x + 3)³.',
    },
    {
      topic: 'Differentiation — Trigonometric Functions',
      question:
        'Differentiate y = sin(3x) with respect to x.',
      options: ['cos(3x)', '3 cos(3x)', '-3 cos(3x)', '(1/3) cos(3x)'],
      correctOptionIndex: 1,
      explanation:
        'd/dx[sin(kx)] = k cos(kx), so d/dx[sin(3x)] = 3 cos(3x).',
    },
    {
      topic: 'Calculus in Kinematics',
      question:
        'The displacement s metres of a particle after t seconds is given by s = t³ - 4t² + 5t. Find its velocity when t = 3 seconds.',
      options: ['6 m/s', '8 m/s', '10 m/s', '14 m/s'],
      correctOptionIndex: 1,
      explanation:
        'Velocity v = ds/dt = 3t² - 8t + 5. At t = 3: v = 3(9) - 8(3) + 5 = 27 - 24 + 5 = 8 m/s.',
    },
    {
      topic: 'Definite Integration',
      question:
        'Evaluate the definite integral ∫₀² (3x² + 2x) dx.',
      options: ['8', '10', '12', '16'],
      correctOptionIndex: 2,
      explanation:
        '∫(3x² + 2x) dx = [x³ + x²]₀² = (2³ + 2²) - (0 + 0) = 8 + 4 = 12.',
    },
    {
      topic: 'Indefinite Integration',
      question:
        'Find ∫ (6x² - 4x + 5) dx.',
      options: [
        '2x³ - 2x² + 5x + C',
        '6x³ - 4x² + 5x + C',
        '3x³ - 2x² + 5 + C',
        '12x - 4 + C',
      ],
      correctOptionIndex: 0,
      explanation:
        'Integrating term-by-term: 6(x³/3) - 4(x²/2) + 5x + C = 2x³ - 2x² + 5x + C.',
    },
    {
      topic: 'Descriptive Statistics — Mean',
      question:
        'The mean of the five numbers 4, 7, x, 11, and 13 is 9. Find the value of x.',
      options: ['8', '9', '10', '12'],
      correctOptionIndex: 2,
      explanation:
        '(4 + 7 + x + 11 + 13) / 5 = 9 ⇒ 35 + x = 45 ⇒ x = 10.',
    },
    {
      topic: 'Statistics — Median',
      question:
        'Find the median of the dataset: 14, 8, 21, 11, 19, 9, 15.',
      options: ['11', '14', '15', '19'],
      correctOptionIndex: 1,
      explanation:
        'Arrange in ascending order: 8, 9, 11, 14, 15, 19, 21. The middle (4th) value is 14.',
    },
    {
      topic: 'Statistics — Pie Chart',
      question:
        'A family spends ₦36,000 on food out of a monthly income of ₦120,000. What sector angle represents food on a pie chart?',
      options: ['72°', '90°', '108°', '120°'],
      correctOptionIndex: 2,
      explanation:
        'Sector angle = (36,000 / 120,000) × 360° = 0.3 × 360° = 108°.',
    },
    {
      topic: 'Measures of Dispersion — Variance',
      question:
        'Calculate the variance of the numbers 2, 4, 6, 8.',
      options: ['√5', '4', '5', '20'],
      correctOptionIndex: 2,
      explanation:
        'Mean x̄ = (2 + 4 + 6 + 8)/4 = 5. Deviations squared: (2-5)² + (4-5)² + (6-5)² + (8-5)² = 9 + 1 + 1 + 9 = 20. Variance = 20 / 4 = 5.',
    },
    {
      topic: 'Combinations',
      question:
        'A committee of 3 students is to be chosen from 6 boys and 4 girls. In how many ways can the committee consist of 2 boys and 1 girl?',
      options: ['24', '60', '120', '144'],
      correctOptionIndex: 1,
      explanation:
        'Number of ways = ⁶C₂ × ⁴C₁ = [6×5 / 2] × 4 = 15 × 4 = 60.',
    },
    {
      topic: 'Probability — Without Replacement',
      question:
        'A bag contains 5 red balls and 3 blue balls. If one ball is drawn at random, what is the probability that it is blue?',
      options: ['3/8', '5/8', '3/5', '1/3'],
      correctOptionIndex: 0,
      explanation:
        'Total balls = 5 + 3 = 8. P(Blue) = 3/8.',
    },
    {
      topic: 'Probability — Independent Events',
      question:
        'Two fair six-sided dice are tossed simultaneously once. What is the probability of obtaining a total sum of 9?',
      options: ['1/12', '1/9', '1/6', '5/36'],
      correctOptionIndex: 1,
      explanation:
        'Favourable outcomes for sum 9: (3,6), (4,5), (5,4), (6,3) = 4 outcomes out of 36. Probability = 4/36 = 1/9.',
    },
  ],
};
