import { SubjectPack } from './types';

export const ECONOMICS_PACK: SubjectPack = {
  subjectId: 'economics',
  subjectName: 'Economics',
  iconName: 'account_balance',
  description:
    'JAMB UTME Economics syllabus (40 CBT questions · 40 mins): Basic Concepts & Opportunity Cost, Demand/Supply & Elasticity, Cost/Market Structures, National Income, and Fiscal/Monetary Policy.',
  materialId: 'mat-jamb-economics-syllabus',
  materialTitle: 'JAMB UTME Economics Syllabus Study Guide',
  materialSummary:
    'Complete JAMB Economics study notes covering Opportunity Cost, Price Elasticity, Utility, Market Structures, National Income, and CBN Monetary Policy.',
  materialSections: [
    `Section 1: Fundamental Economic Concepts & Systems (JAMB Syllabus)

1. Scarcity, Scale of Preference & Opportunity Cost:
• Scarcity: Limited resources relative to unlimited human wants — the central economic problem.
• Scale of Preference: Arrangement of wants in descending order of priority/importance.
• Opportunity Cost (Real Cost): The next best alternative foregone in order to satisfy a chosen want (distinct from Money Cost, which is nominal expenditure).
• Production Possibility Curve (PPC): Illustrates opportunity cost, resource efficiency (points on the curve), unemployment/underutilization (points inside the curve), and currently unattainable output (points outside the curve).

2. Economic Systems:
• Capitalism (Free Market): Private ownership, price mechanism allocates resources, consumer sovereignty.
• Socialism (Centrally Planned): State ownership and central planning board.
• Mixed Economy (e.g., Nigeria): Coexistence of private enterprise and public sector intervention.`,

    `Section 2: Theory of Demand, Supply, Equilibrium & Elasticity

1. Market Equilibrium:
• At equilibrium price P*, Quantity Demanded equals Quantity Supplied: Q_d = Q_s.
• Price Ceiling (Maximum Price Legislation set BELOW equilibrium): Creates excess demand (shortages, queues, black markets, rationing).
• Price Floor (Minimum Price Legislation set ABOVE equilibrium, e.g., agricultural price support or minimum wage): Creates excess supply (surpluses).

2. Elasticity Calculations:
• Price Elasticity of Demand: E_d = (% Change in Q_d) / (% Change in P) = [(ΔQ / Q1) ÷ (ΔP / P1)].
  - E_d > 1 (Elastic): Lowering price INCREASES total revenue.
  - E_d < 1 (Inelastic, e.g., necessities like salt, fuel): Raising price INCREASES total revenue.
• Cross Elasticity: Positive (+) for Close Substitutes (Milo & Bournvita); Negative (-) for Joint/Complementary goods (Car & Petrol).
• Income Elasticity: Positive (+) for Normal goods; Negative (-) for Inferior goods.`,

    `Section 3: Production, Cost Concepts & Market Structures

1. Short-Run Cost Relationships:
• Total Cost (TC) = Total Fixed Cost (TFC) + Total Variable Cost (TVC).
• Average Cost (AC) = TC / Q; Marginal Cost (MC) = ΔTC / ΔQ = TC_n - TC_(n-1).
• Key Rule: The Marginal Cost (MC) curve always intersects the Average Cost (AC) curve at the MINIMUM point of AC.

2. Profit Maximization & Market Structures:
• Every firm maximizes profit where Marginal Cost equals Marginal Revenue (MC = MR).
• Perfect Competition: Many buyers/sellers, homogeneous product, free entry/exit, horizontal perfectly elastic demand curve where Price = AR = MR.
• Monopoly: Single seller, no close substitutes, barriers to entry (patents, natural resources, legal franchise); downward-sloping demand curve where P > MR.`,

    `Section 4: National Income, Money, Inflation & Public Finance

1. National Income Accounting:
• GDP (Gross Domestic Product): Market value of final goods/services produced within geographic borders.
• GNP = GDP + Net Factor Income from Abroad (Receipts - Payments).
• NNP = GNP - Depreciation (Capital Consumption Allowance).
• Approaches: Output (Value-Added method avoids double counting), Income, and Expenditure (C + I + G + (X - M)).

2. Money, CBN Monetary Policy & Fiscal Policy:
• Motives for holding money (Keynes): Transactionary, Precautionary, and Speculative (inversely related to interest rates).
• Contractionary Monetary Policy (to curb inflation): Central Bank of Nigeria (CBN) SELLS treasury bills in Open Market Operations (OMO), RAISES Monetary Policy Rate (MPR / Bank Rate), and RAISES Cash Reserve Ratio (CRR).
• Taxation: Direct taxes (Personal Income Tax, Company Tax — progressive) vs Indirect taxes (VAT, Excise & Customs duties — often regressive; tax incidence falls on consumers when demand is price-inelastic).`,
  ],
  pastPaperId: 'pq-jamb-economics',
  pastPaperTitle: 'JAMB UTME Economics Past Questions & Official Answers (40 Questions)',
  pastPaperYear: '2024',
  pastPaperSummary:
    'Complete 40-question JAMB UTME Economics paper covering Market Equilibrium, Price Elasticity, Cost Theory, CBN Monetary Policy, Public Finance, and National Income.',
  questions: [
    {
      topic: 'Demand & Supply Equilibrium',
      question:
        'Given the demand function Qd = 42 - 3P and the supply function Qs = 12 + 2P, determine the equilibrium price and quantity.',
      options: [
        'P = ₦5, Q = 22 units',
        'P = ₦6, Q = 24 units',
        'P = ₦6, Q = 30 units',
        'P = ₦8, Q = 18 units',
      ],
      correctOptionIndex: 1,
      explanation:
        'At equilibrium, Qd = Qs ⇒ 42 - 3P = 12 + 2P ⇒ 30 = 5P ⇒ P = ₦6. Substitute P = 6 into Qd: Q = 42 - 3(6) = 42 - 18 = 24 units.',
    },
    {
      topic: 'Price Elasticity of Demand',
      question:
        'When the price of a commodity rises from ₦20 to ₦25, the quantity demanded falls from 100 units to 80 units. What is the coefficient of price elasticity of demand?',
      options: ['0.5', '0.8', '1.25', '2.0'],
      correctOptionIndex: 1,
      explanation:
        '%ΔQd = ((100 - 80) / 100) × 100% = 20%. %ΔP = ((25 - 20) / 20) × 100% = 25%. Ed = 20% / 25% = 0.8 (inelastic).',
    },
    {
      topic: 'CBN Monetary Policy & Inflation',
      question:
        'To control demand-pull inflation in the economy, the Central Bank of Nigeria (CBN) should:',
      options: [
        'Buy government securities in the open market and lower the cash ratio',
        'Sell government securities in the open market and raise the bank rate',
        'Reduce personal income tax rates across all brackets',
        'Expand commercial bank credit creation',
      ],
      correctOptionIndex: 1,
      explanation:
        'Selling treasury bills/securities in Open Market Operations (OMO) mops up excess liquidity from commercial banks, while raising the Monetary Policy Rate (bank rate) discourages borrowing.',
    },
    {
      topic: 'Theory of Costs',
      question:
        'If a firm’s Total Fixed Cost is ₦400 and its Total Variable Cost for producing 10 units is ₦600, what is the Average Total Cost (ATC) per unit?',
      options: ['₦40', '₦60', '₦100', '₦1,000'],
      correctOptionIndex: 2,
      explanation:
        'Total Cost TC = TFC + TVC = ₦400 + ₦600 = ₦1,000. Average Total Cost ATC = TC / Q = 1,000 / 10 = ₦100.',
    },
    {
      topic: 'National Income Accounting',
      question:
        'In computing National Income via the Output Method, double counting is avoided by:',
      options: [
        'Including transfer payments such as pensions and bursaries',
        'Summing only the value added at each stage of production',
        'Adding intermediate raw materials to final output',
        'Excluding exports and imports',
      ],
      correctOptionIndex: 1,
      explanation:
        'Summing only the Value Added at each production stage (or counting strictly final goods and services) prevents intermediate inputs like flour and bread from being counted twice.',
    },
    {
      topic: 'Price Legislation',
      question:
        'When the government fixes a maximum price (price ceiling) below the free-market equilibrium price, the immediate economic consequence is:',
      options: [
        'Excess supply and falling producer inventories',
        'Excess demand, queues, and emergence of a black market',
        'Automatic equilibrium restoration without rationing',
        'A rightward shift of the supply curve',
      ],
      correctOptionIndex: 1,
      explanation:
        'At a price ceiling below equilibrium, Qd exceeds Qs, creating persistent shortages (excess demand), hoarding, long queues, and parallel black-market pricing.',
    },
    {
      topic: 'Basic Economic Concepts',
      question:
        'A student has ₦5,000 and ranks an Economics textbook (₦5,000) ahead of a pair of sandals (₦5,000). If she buys the textbook, the sandals foregone represent the:',
      options: ['Money cost', 'Marginal cost', 'Opportunity cost (real cost)', 'Fixed cost'],
      correctOptionIndex: 2,
      explanation:
        'Opportunity cost is the next best alternative sacrificed in order to satisfy a chosen want; ₦5,000 is the money cost.',
    },
    {
      topic: 'Production Possibility Curve (PPC)',
      question:
        'A point situated strictly INSIDE a country’s Production Possibility Curve indicates:',
      options: [
        'Full and efficient employment of resources',
        'Unattainable output given current technology',
        'Unemployment or underutilization of available resources',
        'Zero opportunity cost',
      ],
      correctOptionIndex: 2,
      explanation:
        'Points inside the PPC boundary signify idle or inefficiently deployed factors of production.',
    },
    {
      topic: 'Economic Systems',
      question:
        'In a pure capitalist (free-market) economy, the fundamental questions of what, how, and for whom to produce are resolved primarily through:',
      options: [
        'A central planning ministry',
        'The price mechanism (forces of demand and supply)',
        'Public referenda',
        'Statutory rationing boards',
      ],
      correctOptionIndex: 1,
      explanation:
        'Relative price signals and profit incentives guide resource allocation in a market economy.',
    },
    {
      topic: 'Factors of Production',
      question:
        'Which factor of production earns profit (or bears risk and uncertainty) as its reward?',
      options: ['Land', 'Labour', 'Capital', 'Entrepreneur'],
      correctOptionIndex: 3,
      explanation:
        'Rewards: Land → Rent, Labour → Wages/Salaries, Capital → Interest, Entrepreneur → Profit.',
    },
    {
      topic: 'Division of Labour',
      question:
        'As noted by Adam Smith, the extent of division of labour and specialization is ultimately limited by the:',
      options: [
        'Rate of personal income tax',
        'Size (extent) of the market',
        'Number of commercial banks',
        'Age of the entrepreneur',
      ],
      correctOptionIndex: 1,
      explanation:
        'Mass production via specialization is viable only if market demand is large enough to absorb the output.',
    },
    {
      topic: 'Scale of Production',
      question:
        'Cost-saving advantages enjoyed by a single firm specifically as a result of expanding its own scale of output are called:',
      options: [
        'External economies of scale',
        'Internal economies of scale',
        'Social diseconomies',
        'Diminishing marginal utility',
      ],
      correctOptionIndex: 1,
      explanation:
        'Internal economies (technical, managerial, marketing, financial) accrue to an individual growing firm, whereas external economies stem from industry clustering.',
    },
    {
      topic: 'Law of Variable Proportions',
      question:
        'In short-run production, Total Product (TP) reaches its absolute maximum at the exact point where Marginal Product (MP) is:',
      options: ['Maximum', 'Equal to Average Product', 'Zero', 'Rising rapidly'],
      correctOptionIndex: 2,
      explanation:
        'As long as MP > 0, TP rises; when MP = 0, TP is at its peak; once MP turns negative, TP declines.',
    },
    {
      topic: 'Business Organizations',
      question:
        'A key advantage that a Public Limited Liability Company (Plc) enjoys over a Partnership is:',
      options: [
        'Complete freedom from corporate taxation',
        'Ability to raise large equity capital by issuing shares to the general public',
        'Unlimited liability of all shareholders',
        'Absence of annual financial audit requirements',
      ],
      correctOptionIndex: 1,
      explanation:
        'Public joint-stock companies can invite public subscription on the stock exchange while granting shareholders limited liability.',
    },
    {
      topic: 'Types of Demand',
      question:
        'The demand for motor cars and petrol (or torchlights and batteries) is an example of:',
      options: ['Competitive demand', 'Complementary (joint) demand', 'Composite demand', 'Derived demand'],
      correctOptionIndex: 1,
      explanation:
        'Goods used together to satisfy a single want exhibit joint/complementary demand.',
    },
    {
      topic: 'Cross Elasticity of Demand',
      question:
        'If an increase in the price of Milo leads to an increase in the quantity demanded of Bournvita, the cross elasticity of demand between them is:',
      options: ['Negative', 'Zero', 'Positive', 'Infinity'],
      correctOptionIndex: 2,
      explanation:
        'Close substitutes exhibit positive cross-price elasticity (+%ΔQx / +%ΔPy > 0).',
    },
    {
      topic: 'Income Elasticity of Demand',
      question:
        'Goods whose quantity demanded falls as consumers’ real disposable income rises have a negative income elasticity and are classified as:',
      options: ['Ostentatious goods', 'Normal goods', 'Inferior goods', 'Capital goods'],
      correctOptionIndex: 2,
      explanation:
        'Inferior goods have negative income elasticity because consumers switch to higher-quality alternatives when income grows.',
    },
    {
      topic: 'Theory of Consumer Behaviour',
      question:
        'A rational consumer consuming a single commodity X achieves utility-maximizing equilibrium when:',
      options: [
        'Total Utility equals zero',
        'Marginal Utility of X equals Price of X (MU_x = P_x)',
        'Marginal Utility is rising',
        'Price exceeds Total Utility',
      ],
      correctOptionIndex: 1,
      explanation:
        'Equilibrium for one good occurs where the marginal utility derived from the last unit equals its price (MU_x = P_x).',
    },
    {
      topic: 'Marginal Cost Calculation',
      question:
        'If the Total Cost of producing 4 units of output is ₦520 and the Total Cost of producing 5 units is ₦610, what is the Marginal Cost of the 5th unit?',
      options: ['₦90', '₦122', '₦130', '₦1,130'],
      correctOptionIndex: 0,
      explanation:
        'MC₅ = TC₅ - TC₄ = ₦610 - ₦520 = ₦90.',
    },
    {
      topic: 'Cost Curves Geometry',
      question:
        'In short-run cost theory, the Marginal Cost (MC) curve always cuts the Average Total Cost (ATC) curve at:',
      options: [
        'The maximum point of ATC',
        'The minimum (lowest) point of ATC',
        'The vertical intercept of TFC',
        'Zero output',
      ],
      correctOptionIndex: 1,
      explanation:
        'Whenever MC < ATC, ATC falls; whenever MC > ATC, ATC rises. Hence MC intersects ATC at ATC’s minimum point.',
    },
    {
      topic: 'Perfect Competition',
      question:
        'The demand curve facing an individual firm operating under Perfect Competition is:',
      options: [
        'Downward sloping from left to right',
        'Perfectly elastic (horizontal) where Price = AR = MR',
        'Perfectly inelastic (vertical)',
        'Kinked at the ruling market price',
      ],
      correctOptionIndex: 1,
      explanation:
        'Each perfectly competitive firm is a price-taker selling homogeneous units at the ruling market price, so P = AR = MR.',
    },
    {
      topic: 'Monopoly & Price Discrimination',
      question:
        'A monopolist can successfully practice price discrimination between two markets only if:',
      options: [
        'Both markets have identical price elasticities of demand',
        'The markets are segmented with no resale leakage and have different elasticities of demand',
        'There are hundreds of rival sellers',
        'Marginal cost is infinite',
      ],
      correctOptionIndex: 1,
      explanation:
        'Profitable price discrimination requires market separation (no arbitrage/resale) and differing price elasticities (higher price in the less elastic market).',
    },
    {
      topic: 'Distributive Trade',
      question:
        'Which channel of distribution is most appropriate for complex, custom-built industrial machinery?',
      options: [
        'Manufacturer → Wholesaler → Retailer → Consumer',
        'Manufacturer → Agent → Hawker → Consumer',
        'Manufacturer → Industrial User (Direct)',
        'Wholesaler → Petty trader → Consumer',
      ],
      correctOptionIndex: 2,
      explanation:
        'Technical capital goods require direct specification, installation, and after-sales servicing from manufacturer to user.',
    },
    {
      topic: 'Population Economics',
      question:
        'The optimum population of a country is the population size that yields the:',
      options: [
        'Highest birth rate',
        'Highest output (income) per capita given existing resources and technology',
        'Largest dependency ratio',
        'Lowest life expectancy',
      ],
      correctOptionIndex: 1,
      explanation:
        'Optimum population combines most efficiently with available land/capital/technology to maximize real income per head.',
    },
    {
      topic: 'Malthusian Theory',
      question:
        'Thomas Malthus argued that if unchecked, human population grows at a geometric rate whereas food supply grows at:',
      options: [
        'An exponential rate',
        'An arithmetic rate',
        'A logarithmic rate',
        'Zero rate',
      ],
      correctOptionIndex: 1,
      explanation:
        'Malthus contrasted geometric population growth (1, 2, 4, 8, 16...) with arithmetic subsistence growth (1, 2, 3, 4, 5...).',
    },
    {
      topic: 'Labour Market & Unemployment',
      question:
        'Unemployment caused by workers lacking the skills required by newly automated or restructured industries is known as:',
      options: ['Seasonal unemployment', 'Structural unemployment', 'Frictional unemployment', 'Disguised unemployment'],
      correctOptionIndex: 1,
      explanation:
        'Structural unemployment arises from long-term shifts in industrial structure or technology creating a mismatch of skills.',
    },
    {
      topic: 'Agriculture in West Africa',
      question:
        'Marketing Boards were historically established in West Africa primarily to:',
      options: [
        'Import luxury consumer electronics',
        'Stabilize producer prices and organize export marketing of cash crops',
        'Collect personal income taxes from civil servants',
        'Print domestic currency notes',
      ],
      correctOptionIndex: 1,
      explanation:
        'Commodity Marketing Boards bought cocoa, groundnuts, palm produce, and cotton to cushion farmers against world price fluctuations.',
    },
    {
      topic: 'Industrialization Strategies',
      question:
        'Establishing local factories to manufacture goods that were previously imported from abroad is known as:',
      options: ['Export promotion', 'Import substitution industrialization', 'Dumping', 'Devaluation'],
      correctOptionIndex: 1,
      explanation:
        'Import substitution aims to conserve foreign exchange and build domestic manufacturing capacity.',
    },
    {
      topic: 'National Income — GDP vs GNP',
      question:
        'Given GDP = ₦850 billion, Factor income received from abroad = ₦40 billion, and Factor income paid abroad = ₦65 billion, calculate the Gross National Product (GNP).',
      options: ['₦745 billion', '₦825 billion', '₦875 billion', '₦955 billion'],
      correctOptionIndex: 1,
      explanation:
        'Net Factor Income from Abroad = 40 - 65 = -₦25 billion. GNP = GDP + NFIA = 850 + (-25) = ₦825 billion.',
    },
    {
      topic: 'Keynesian Multiplier',
      question:
        'If the Marginal Propensity to Consume (MPC) in an economy is 0.75, what is the value of the simple investment multiplier k?',
      options: ['1.33', '2.50', '4.00', '7.50'],
      correctOptionIndex: 2,
      explanation:
        'Multiplier k = 1 / (1 - MPC) = 1 / (1 - 0.75) = 1 / 0.25 = 4.00.',
    },
    {
      topic: 'Money & Motives for Liquidity',
      question:
        'According to Keynes, holding cash balances in order to take advantage of future changes in bond prices and interest rates is the:',
      options: ['Transactionary motive', 'Precautionary motive', 'Speculative motive', 'Deflationary motive'],
      correctOptionIndex: 2,
      explanation:
        'Speculative demand for money varies inversely with interest rates as investors weigh cash against interest-bearing bonds.',
    },
    {
      topic: 'Commercial Banking — Credit Creation',
      question:
        'If the statutory Cash Reserve Ratio (CRR) is 20% and a commercial bank receives an initial cash deposit of ₦50,000, what is the maximum total deposit the banking system can create?',
      options: ['₦100,000', '₦200,000', '₦250,000', '₦500,000'],
      correctOptionIndex: 2,
      explanation:
        'Credit multiplier = 1 / r = 1 / 0.20 = 5. Total deposit creation = ₦50,000 × 5 = ₦250,000.',
    },
    {
      topic: 'Inflation Effects',
      question:
        'During a period of rapid unanticipated inflation, which economic group generally gains?',
      options: [
        'Pensioners on fixed annuities',
        'Fixed-salary earners',
        'Debtors (borrowers) repaying fixed nominal loans',
        'Creditors (lenders) on fixed nominal interest',
      ],
      correctOptionIndex: 2,
      explanation:
        'Debtors repay loans in money whose real purchasing power has fallen, whereas fixed-income earners and creditors lose real value.',
    },
    {
      topic: 'Public Finance — Taxation',
      question:
        'A tax system in which the marginal and average tax rates increase as the taxpayer’s income rises (such as PAYE Personal Income Tax) is:',
      options: ['Regressive', 'Proportional', 'Progressive', 'Poll tax'],
      correctOptionIndex: 2,
      explanation:
        'Progressive taxes take a higher percentage from high-income earners, helping reduce income inequality.',
    },
    {
      topic: 'Incidence of Indirect Tax',
      question:
        'When an indirect excise tax is imposed on a commodity with PERFECTLY INELASTIC demand, the entire burden (incidence) of the tax falls on the:',
      options: ['Producer/seller', 'Final consumer/buyer', 'Wholesaler alone', 'Central Bank'],
      correctOptionIndex: 1,
      explanation:
        'Because quantity demanded does not fall at all when price rises (Ed = 0), sellers pass 100% of the tax onto consumers.',
    },
    {
      topic: 'Fiscal Policy & Budgets',
      question:
        'To stimulate aggregate demand and employment during an economic recession, a government should adopt a:',
      options: [
        'Budget surplus (raising taxes and cutting public spending)',
        'Budget deficit (increasing government expenditure and/or cutting taxes)',
        'Balanced budget with higher import duties',
        'High cash reserve ratio',
      ],
      correctOptionIndex: 1,
      explanation:
        'Expansionary fiscal policy (deficit financing) injects net spending power into the circular flow during a slump.',
    },
    {
      topic: 'International Trade Theory',
      question:
        'David Ricardo’s Principle of Comparative Cost Advantage demonstrates that mutually beneficial trade occurs when countries specialize in goods for which they have the:',
      options: [
        'Highest absolute money wage',
        'Lowest opportunity (comparative) cost of production',
        'Largest land mass',
        'Highest import tariff wall',
      ],
      correctOptionIndex: 1,
      explanation:
        'Even if one nation is more efficient in producing both goods, world output rises when each specializes where its opportunity cost is lower.',
    },
    {
      topic: 'Terms of Trade',
      question:
        'If a country’s index of export prices is 120 and its index of import prices is 80, calculate its Commodity Terms of Trade.',
      options: ['66.7', '100.0', '150.0', '200.0'],
      correctOptionIndex: 2,
      explanation:
        'Terms of Trade = (Index of Export Prices / Index of Import Prices) × 100 = (120 / 80) × 100 = 150.0 (favourable).',
    },
    {
      topic: 'Balance of Payments',
      question:
        'Foreign tourist expenditure, international shipping freight, insurance, and banking charges are recorded in the Balance of Payments under:',
      options: [
        'Visible trade balance',
        'Invisible trade (Services) in the Current Account',
        'Official gold reserves only',
        'Domestic capital consumption',
      ],
      correctOptionIndex: 1,
      explanation:
        'Services (shipping, aviation, insurance, tourism, banking) constitute invisible items in the Current Account.',
    },
    {
      topic: 'International Economic Organizations',
      question:
        'Which international body was founded in 1960 by major petroleum-exporting nations (which Nigeria joined in 1971) to coordinate crude oil production quotas and stabilize world oil prices?',
      options: ['UNCTAD', 'IMF', 'OPEC', 'WTO'],
      correctOptionIndex: 2,
      explanation:
        'The Organization of the Petroleum Exporting Countries (OPEC) coordinates member supply quotas to stabilize global oil markets.',
    },
  ],
};
