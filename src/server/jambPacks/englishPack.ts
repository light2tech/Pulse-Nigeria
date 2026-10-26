import { SubjectPack } from './types';

export const ENGLISH_PACK: SubjectPack = {
  subjectId: 'english-language',
  subjectName: 'English Language',
  iconName: 'menu_book',
  description:
    'JAMB UTME Use of English syllabus (50 CBT questions · 40 mins): Comprehension & Register, Lexis & Structure, Concord Rules, Idioms/Phrasal Verbs, Antonyms/Synonyms, and Oral Forms (Phonetics & Stress).',
  materialId: 'mat-jamb-english-syllabus',
  materialTitle: 'JAMB UTME Use of English Syllabus Study Guide',
  materialSummary:
    'Complete JAMB Use of English revision covering Concord Rules, Subjunctive Mood, Lexis/Idioms, Comprehension Inference, Word Stress, and Emphatic Stress.',
  materialSections: [
    `Section 1: Lexis & Structure — Golden Rules of Concord (JAMB Syllabus)

1. Accompaniment Concord:
• When two subjects are joined by "as well as", "along with", "together with", "in addition to", "accompanied by", or "no less than", the verb agrees strictly with the FIRST subject:
  - Example: "The principal, together with his vice-principals, IS attending the summit."

2. Proximity Concord:
• With correlative conjunctions "either...or", "neither...nor", "not only...but also", the verb agrees with the subject NEARER to the verb:
  - Example: "Neither the coach nor the players WERE happy." / "Neither the players nor the coach WAS happy."

3. Indefinite Pronouns & "One of + Plural Noun":
• Everybody, everyone, each, someone, nobody, neither, either take SINGULAR verbs ("Everyone HAS arrived").
• "One of the boys IS here", BUT in relative clauses: "Tunde is one of the students who HAVE passed" (verb agrees with antecedent "students"), unless preceded by "the only": "Tunde is the ONLY one of the students who HAS passed."`,

    `Section 2: Unreal Past (Subjunctive), Question Tags & Prepositions

1. High-Time & Subjunctive Structures:
• Expressions "It is time...", "It is high time...", "I would rather you...", and "I wish..." when followed by a subject take the PAST TENSE verb to express present unreal/urgent action:
  - Correct: "It is high time the government REPAIRED the bridge." (NOT "repairs" or "to repair").

2. Question Tags:
• Positive statement → Negative tag; Negative statement → Positive tag.
• Words like hardly, scarcely, barely, seldom, rarely, nothing, nobody make a clause NEGATIVE, so they take a POSITIVE tag:
  - Example: "She scarcely visits us, DOES she?"
• "I am early, AREN'T I?" / "Let's begin the test, SHALL we?"

3. Exam-Tested Prepositional Collocations:
• Accused OF (not for), Congratulate ON (not for), Comprise (NO "of" in active voice: "The committee comprises five members" OR "is composed of"), Prefer X TO Y (never "prefer X than Y"), Superior/Inferior/Senior/Junior TO (never "than").`,

    `Section 3: Comprehension, Idioms, Antonyms & Synonyms

1. Contextual Vocabulary & Idiomatic Interpretation:
• Always interpret synonyms and antonyms WITHIN sentence context rather than isolated dictionary meanings.
• Common JAMB Idioms:
  - "To throw in the towel" = To admit defeat / surrender.
  - "To sit on the fence" = To remain neutral / undecided.
  - "A flash in the pan" = A brief success never repeated.
  - "To turn over a new leaf" = To reform one's behaviour for the better.
  - "At loggerheads" = In fierce disagreement / conflict.`,

    `Section 4: Oral Forms — Phonetics, Word Stress & Emphatic Stress

1. Polysyllabic Word Stress Rules:
• Words ending in -TION, -SION, -IC, -IAL take primary stress on the PENULTIMATE syllable (second from the end): e.g., edu-CA-tion, de-CI-sion, demo-CRAT-ic.
• Words ending in -ITY, -TY, -PHY, -GY, -ATE (3+ syllables) take stress on the ANTEPENULTIMATE syllable (third from the end): e.g., u-ni-VER-si-ty, pho-TOG-ra-phy, de-MOC-ra-cy.

2. Emphatic / Contrastive Stress (Guaranteed JAMB Section):
• A word written in CAPITAL LETTERS carries emphatic stress.
• Rule: Choose the option that CONTRADICTS (changes) ONLY the capitalized word while keeping every other word/detail consistent! Note: Do NOT pick an option that merely repeats the capitalized word; pick the question that asks about or contrasts the capitalized element.`,
  ],
  pastPaperId: 'pq-jamb-english',
  pastPaperTitle: 'JAMB UTME Use of English Past Questions & Official Answers (50 Questions)',
  pastPaperYear: '2024',
  pastPaperSummary:
    'Complete 50-question JAMB UTME Use of English paper covering Comprehension/Registers, Concord, Subjunctive Mood, Lexis, Idioms, Antonyms/Synonyms, Phonetics, Word Stress, and Emphatic Stress.',
  questions: [
    {
      topic: 'Concord & Structure',
      question:
        'Choose the option that best completes the sentence: The Vice-Chancellor, accompanied by the Deans of Faculties, ______ scheduled to address the matriculating students.',
      options: ['are', 'were', 'is', 'have been'],
      correctOptionIndex: 2,
      explanation:
        'By the rule of accompaniment concord ("accompanied by", "together with", "as well as"), the verb agrees with the singular head noun "The Vice-Chancellor", taking singular "is".',
    },
    {
      topic: 'Subjunctive / Unreal Past',
      question:
        'Choose the option that best completes the gap: It is high time the youth ______ waiting solely for white-collar jobs.',
      options: ['stop', 'stopped', 'should stop', 'stops'],
      correctOptionIndex: 1,
      explanation:
        'After "It is time / It is high time + subject", English grammar requires the past simple subjunctive ("stopped") to express present urgency.',
    },
    {
      topic: 'Oral English — Emphatic Stress',
      question:
        'Choose the question to which the given sentence is the appropriate answer: Amina bought a BLUE handbag yesterday.',
      options: [
        'Did Fatima buy a blue handbag yesterday?',
        'Did Amina sell a blue handbag yesterday?',
        'Did Amina buy a black handbag yesterday?',
        'Did Amina buy a blue handbag last week?',
      ],
      correctOptionIndex: 2,
      explanation:
        'The word in capitals is "BLUE" (adjective of colour). The correct interrogative contrasts "BLUE" with "black" while retaining "Amina", "buy", "handbag", and "yesterday".',
    },
    {
      topic: 'Oral English — Word Stress',
      question:
        'Identify the option that has the primary stress on the correct syllable (shown in capitals) for the word "photography":',
      options: [
        'PHO-to-gra-phy',
        'pho-TO-gra-phy',
        'pho-to-GRA-phy',
        'pho-to-gra-PHY',
      ],
      correctOptionIndex: 1,
      explanation:
        'Polysyllabic words ending in "-phy" place primary stress on the antepenultimate syllable (third from the end): pho-TO-gra-phy.',
    },
    {
      topic: 'Idioms & Figurative Usage',
      question:
        'Select the interpretation nearest in meaning to the sentence: Despite fierce pressure from both factions, the chairman chose to sit on the fence.',
      options: [
        'He adjourned the meeting abruptly.',
        'He remained neutral and refused to take sides.',
        'He supported the weaker faction secretly.',
        'He resigned his chairmanship.',
      ],
      correctOptionIndex: 1,
      explanation:
        'The idiom "to sit on the fence" means to remain neutral or undecided in a dispute.',
    },
    {
      topic: 'Question Tags',
      question:
        'Complete the statement with the appropriate question tag: Musa hardly ever misses morning lectures, ______?',
      options: ['doesn’t he', 'does he', 'isn’t it', 'hasn’t he'],
      correctOptionIndex: 1,
      explanation:
        'Because "hardly" is a semi-negative adverb, the main clause counts as negative and therefore requires a positive tag using the present simple auxiliary: "does he".',
    },
    {
      topic: 'Proximity Concord',
      question:
        'Choose the option that best completes the sentence: Neither the captain nor his teammates ______ pleased with the referee’s final decision.',
      options: ['was', 'is', 'were', 'has been'],
      correctOptionIndex: 2,
      explanation:
        'With "neither...nor", the verb agrees with the nearer subject ("teammates", plural), requiring "were".',
    },
    {
      topic: 'Relative Clause Concord',
      question:
        'Choose the best option: Chinedu is the only one of the applicants who ______ fluent French.',
      options: ['speak', 'speaks', 'are speaking', 'have spoken'],
      correctOptionIndex: 1,
      explanation:
        'When "one of + plural noun" is preceded by "the only", the relative pronoun refers strictly to "the only one" (singular), so it takes "speaks".',
    },
    {
      topic: 'Prepositional Collocation',
      question:
        'Fill in the blank: Most candidates prefer studying late at night ______ waking up before dawn.',
      options: ['than', 'from', 'to', 'over than'],
      correctOptionIndex: 2,
      explanation:
        'The verb "prefer" collocates with the preposition "to" ("prefer X to Y"), never "than".',
    },
    {
      topic: 'Lexis — Usage of Comprise',
      question:
        'Choose the grammatically correct option: The investigative panel ______ five retired judges and two senior advocates.',
      options: ['comprises of', 'comprises', 'is comprise of', 'comprising of'],
      correctOptionIndex: 1,
      explanation:
        'In active voice, "comprise" means "consist of" and NEVER takes "of" ("comprises five retired judges" or "is composed of").',
    },
    {
      topic: 'Prepositions',
      question:
        'Complete the sentence: The cashier was accused ______ falsifying the company’s quarterly ledger.',
      options: ['for', 'with', 'of', 'on'],
      correctOptionIndex: 2,
      explanation:
        'One is "accused of" an offence (whereas one is "charged with" an offence).',
    },
    {
      topic: 'Prepositions',
      question:
        'Complete the sentence: All members of staff congratulated the new director ______ her well-deserved appointment.',
      options: ['for', 'about', 'on', 'with'],
      correctOptionIndex: 2,
      explanation:
        'Standard English requires "congratulate someone ON something".',
    },
    {
      topic: 'Order of Adjectives',
      question:
        'Choose the option with the correct grammatical order of adjectives: The diplomat arrived in a ______ limousine.',
      options: [
        'black brand-new German long',
        'brand-new long black German',
        'German black long brand-new',
        'long German brand-new black',
      ],
      correctOptionIndex: 1,
      explanation:
        'Standard adjective order (OSASCOMP): Opinion/Condition (brand-new) → Size/Length (long) → Colour (black) → Origin (German).',
    },
    {
      topic: 'Conditional Sentences (Type 3)',
      question:
        'Choose the correct completion: Had the fire brigade arrived ten minutes earlier, the warehouse ______ completely saved.',
      options: [
        'will have been',
        'would be',
        'would have been',
        'had been',
      ],
      correctOptionIndex: 2,
      explanation:
        'Inverted Type-3 past unreal conditional ("Had + S + past participle") pairs with "would have + past participle".',
    },
    {
      topic: 'Subjunctive — Would Rather',
      question:
        'Complete the sentence: I would rather you ______ the confidential report directly to the dean tomorrow.',
      options: ['submit', 'submitted', 'will submit', 'submitting'],
      correctOptionIndex: 1,
      explanation:
        'When "would rather" is followed by a different subject ("you"), it takes the past simple form ("submitted") for present/future reference.',
    },
    {
      topic: 'Reciprocal Pronouns',
      question:
        'Fill in the gap: All forty delegates in the conference hall exchanged pleasantries with ______ before the plenary began.',
      options: ['each other', 'themselves', 'one another', 'theirselves'],
      correctOptionIndex: 2,
      explanation:
        '"One another" is traditionally used for reciprocal action involving more than two people, whereas "each other" refers to two.',
    },
    {
      topic: 'Pronoun Case',
      question:
        'Choose the correct option: Strictly between you and ______, the merger proposal is unlikely to pass.',
      options: ['I', 'me', 'myself', 'mine'],
      correctOptionIndex: 1,
      explanation:
        'Prepositions such as "between" govern the objective pronoun case ("between you and me").',
    },
    {
      topic: 'Quantifiers — Few vs A Few',
      question:
        'Complete the sentence: Although the Physics paper was tough, ______ candidates still scored above ninety percent.',
      options: ['little', 'a little', 'a few', 'much'],
      correctOptionIndex: 2,
      explanation:
        '"Candidates" is countable plural, and the positive contrast ("still scored") requires positive "a few" (= some).',
    },
    {
      topic: 'Phrasal Verbs',
      question:
        'Choose the phrasal verb that best fills the gap: Because of torrential rain, the inter-house sports competition was ______ until next Friday.',
      options: ['called out', 'put off', 'put out', 'turned down'],
      correctOptionIndex: 1,
      explanation:
        '"Put off" means to postpone; "call off" means to cancel completely; "put out" means to extinguish.',
    },
    {
      topic: 'Phrasal Verbs',
      question:
        'Choose the correct phrasal verb: Several commuters could not ______ the cryptic handwriting on the noticeboard.',
      options: ['make up', 'make out', 'make over', 'make off'],
      correctOptionIndex: 1,
      explanation:
        '"Make out" means to decipher, discern, or understand with difficulty.',
    },
    {
      topic: 'Passive Voice Transformation',
      question:
        'Choose the correct passive form of: "The panel is reviewing the scholarship applications."',
      options: [
        'The scholarship applications have been reviewed by the panel.',
        'The scholarship applications are being reviewed by the panel.',
        'The scholarship applications were being reviewed by the panel.',
        'The scholarship applications are reviewed by the panel.',
      ],
      correctOptionIndex: 1,
      explanation:
        'Present continuous active ("is reviewing") transforms to present continuous passive ("are being reviewed").',
    },
    {
      topic: 'Reported (Indirect) Speech',
      question:
        'Convert into indirect speech: "I will submit my thesis tomorrow," Halima said.',
      options: [
        'Halima said that she will submit her thesis tomorrow.',
        'Halima said that she would submit her thesis the following day.',
        'Halima says she would submit her thesis yesterday.',
        'Halima said that I would submit my thesis the next day.',
      ],
      correctOptionIndex: 1,
      explanation:
        'Backshift "will" → "would", pronoun "I/my" → "she/her", and adverbial "tomorrow" → "the following day / the next day".',
    },
    {
      topic: 'Gerunds After Prepositional Phrases',
      question:
        'Choose the best option: All final-year students are looking forward to ______ their project defence next month.',
      options: ['complete', 'completing', 'completed', 'be complete'],
      correctOptionIndex: 1,
      explanation:
        'In "look forward to", "to" is a preposition (not an infinitive marker) and must be followed by a noun or "-ing" gerund ("completing").',
    },
    {
      topic: 'Inversion with Negative Adverbs',
      question:
        'Complete the sentence: No sooner had the invigilator distributed the scripts ______ the power went out.',
      options: ['when', 'before', 'than', 'that'],
      correctOptionIndex: 2,
      explanation:
        '"No sooner..." always correlates with "than" (whereas "Hardly / Scarcely..." correlates with "when").',
    },
    {
      topic: 'Synonyms (Nearest in Meaning)',
      question:
        'Choose the option NEAREST IN MEANING to the capitalized word: The governor’s speech helped to MITIGATE the tension in the community.',
      options: ['aggravate', 'lessen', 'prolong', 'conceal'],
      correctOptionIndex: 1,
      explanation:
        '"Mitigate" means to make less severe, alleviate, or lessen.',
    },
    {
      topic: 'Synonyms (Nearest in Meaning)',
      question:
        'Choose the option NEAREST IN MEANING to the capitalized word: The witness gave a LUCID account of what transpired at the junction.',
      options: ['clear and coherent', 'lengthy and tedious', 'vague and doubtful', 'hostile'],
      correctOptionIndex: 0,
      explanation:
        '"Lucid" means expressed clearly and easy to understand.',
    },
    {
      topic: 'Synonyms (Nearest in Meaning)',
      question:
        'Choose the option NEAREST IN MEANING to the capitalized word: The bursar is known for his FRUGAL management of departmental funds.',
      options: ['reckless', 'thrifty and economical', 'secretive', 'generous'],
      correctOptionIndex: 1,
      explanation:
        '"Frugal" means prudent, sparing, and economical in avoiding waste.',
    },
    {
      topic: 'Synonyms (Nearest in Meaning)',
      question:
        'Choose the option NEAREST IN MEANING to the capitalized word: Counterfeit drugs pose a PERNICIOUS threat to public health.',
      options: ['minor', 'deadly and harmful', 'temporary', 'predictable'],
      correctOptionIndex: 1,
      explanation:
        '"Pernicious" means having a deeply harmful, destructive, or ruinous effect.',
    },
    {
      topic: 'Synonyms (Nearest in Meaning)',
      question:
        'Choose the option NEAREST IN MEANING to the capitalized word: Her EPHEMERAL fame faded within a single season.',
      options: ['short-lived', 'eternal', 'widespread', 'undeserved'],
      correctOptionIndex: 0,
      explanation:
        '"Ephemeral" means lasting for a very brief time (transitory, short-lived).',
    },
    {
      topic: 'Antonyms (Opposite in Meaning)',
      question:
        'Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: While the elder brother is GARRULOUS, his twin is remarkably ______.',
      options: ['talkative', 'taciturn', 'boastful', 'jovial'],
      correctOptionIndex: 1,
      explanation:
        '"Garrulous" means excessively talkative; its direct antonym is "taciturn" (reserved or saying very little).',
    },
    {
      topic: 'Antonyms (Opposite in Meaning)',
      question:
        'Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: Rather than ALLEVIATE the commuters’ hardship, the sudden roadblock ______ it.',
      options: ['eased', 'exacerbated', 'eliminated', 'moderated'],
      correctOptionIndex: 1,
      explanation:
        '"Alleviate" means to relieve/lessen; "exacerbated" (worsened/aggravated) is its opposite.',
    },
    {
      topic: 'Antonyms (Opposite in Meaning)',
      question:
        'Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: The auditor commended the DILIGENT clerks and reprimanded the ______ ones.',
      options: ['industrious', 'indolent', 'punctual', 'meticulous'],
      correctOptionIndex: 1,
      explanation:
        '"Diligent" means hardworking and conscientious; "indolent" means lazy/slothful.',
    },
    {
      topic: 'Antonyms (Opposite in Meaning)',
      question:
        'Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: Attendance at the orientation seminar is COMPULSORY for freshmen, whereas the evening concert is ______.',
      options: ['mandatory', 'obligatory', 'optional', 'essential'],
      correctOptionIndex: 2,
      explanation:
        '"Optional" (voluntary) is the exact opposite of "compulsory" (mandatory).',
    },
    {
      topic: 'Antonyms (Opposite in Meaning)',
      question:
        'Choose the word MOST NEARLY OPPOSITE IN MEANING to the capitalized word: What began as an AMICABLE negotiation ended on a ______ note.',
      options: ['friendly', 'hostile', 'cordial', 'harmonious'],
      correctOptionIndex: 1,
      explanation:
        '"Amicable" means friendly and peaceable; "hostile" is its antonym.',
    },
    {
      topic: 'Idioms & Sentence Interpretation',
      question:
        'Choose the most appropriate interpretation: After three consecutive losses, the boxer finally threw in the towel.',
      options: [
        'He wiped his face before the next round.',
        'He admitted defeat and withdrew from the bout.',
        'He protested against the ringside judges.',
        'He challenged the champion to a rematch.',
      ],
      correctOptionIndex: 1,
      explanation:
        '"To throw in the towel" means to concede defeat or give up.',
    },
    {
      topic: 'Idioms & Sentence Interpretation',
      question:
        'Choose the most appropriate interpretation: Since returning from youth service, Kunle has turned over a new leaf.',
      options: [
        'He started an agricultural business.',
        'He reformed his character and began behaving responsibly.',
        'He bought a brand-new notebook.',
        'He relocated to a rural village.',
      ],
      correctOptionIndex: 1,
      explanation:
        '"To turn over a new leaf" means to make a fresh start by improving one’s conduct.',
    },
    {
      topic: 'Idioms & Sentence Interpretation',
      question:
        'Choose the most appropriate interpretation: Critics dismissed the striker’s opening-day hat-trick as a flash in the pan.',
      options: [
        'A brilliant triumph likely to be repeated every week.',
        'A sudden, isolated success unlikely to happen again.',
        'A goal scored under floodlights.',
        'An unfair advantage caused by poor officiating.',
      ],
      correctOptionIndex: 1,
      explanation:
        '"A flash in the pan" refers to a one-off success that fails to endure.',
    },
    {
      topic: 'Idioms & Sentence Interpretation',
      question:
        'Choose the most appropriate interpretation: The two neighbouring communities have been at loggerheads over boundary farmland for decades.',
      options: [
        'Cooperating in timber logging.',
        'In persistent, bitter dispute.',
        'Sharing farm machinery peacefully.',
        'Negotiating a joint festival.',
      ],
      correctOptionIndex: 1,
      explanation:
        '"At loggerheads" means locked in strong disagreement or conflict.',
    },
    {
      topic: 'Register of Law & Judiciary',
      question:
        'Fill the register gap: Because the prosecution failed to prove guilt beyond reasonable doubt, the trial judge ______ and discharged the defendant.',
      options: ['convicted', 'acquitted', 'indicted', 'remanded'],
      correctOptionIndex: 1,
      explanation:
        'In legal register, a court "acquits and discharges" an accused person found not guilty.',
    },
    {
      topic: 'Register of Medicine',
      question:
        'Fill the register gap: Before prescribing any antibiotics, the physician carried out a thorough ______ based on the patient’s laboratory test results.',
      options: ['prognosis', 'diagnosis', 'autopsy', 'quarantine'],
      correctOptionIndex: 1,
      explanation:
        '"Diagnosis" is the identification of an illness from symptoms and clinical tests ("prognosis" predicts future recovery; "autopsy" is post-mortem).',
    },
    {
      topic: 'Register of Aviation & Publishing',
      question:
        'Fill the register gap: All passengers were instructed to fasten their seatbelts as the aircraft taxied onto the ______ for take-off.',
      options: ['hangar', 'runway', 'quay', 'dockyard'],
      correctOptionIndex: 1,
      explanation:
        'Aircraft take off from and land on a "runway" ("hangar" is for parking/maintenance; "quay/dockyard" belong to shipping).',
    },
    {
      topic: 'Comprehension & Inference',
      question:
        'Read carefully: "True scholarship demands more than passive memorization of formulas; it requires sceptical inquiry and the courage to test cherished assumptions against empirical evidence." Which statement is best supported by this passage?',
      options: [
        'Memorizing formulas is completely useless in examinations.',
        'Genuine scholarship combines critical questioning with evidence-based verification.',
        'Assumptions should never be formulated in science.',
        'Empirical evidence always confirms popular beliefs.',
      ],
      correctOptionIndex: 1,
      explanation:
        'The passage contrasts mere rote memorization with active critical ("sceptical") inquiry grounded in empirical evidence.',
    },
    {
      topic: 'Oral English — Vowel Sounds',
      question:
        'Choose the word that contains the SAME vowel sound as the capitalized letters in "bOOk" (/ʊ/):',
      options: ['food', 'blood', 'put', 'loop'],
      correctOptionIndex: 2,
      explanation:
        '"book" and "put" share the short lax high back vowel /ʊ/, whereas "food" and "loop" have /uː/ and "blood" has /ʌ/.',
    },
    {
      topic: 'Oral English — Vowel Sounds',
      question:
        'Choose the word that has the SAME vowel sound as the capitalized letters in "hEArt" (/ɑː/):',
      options: ['heard', 'clerk', 'plait', 'pat'],
      correctOptionIndex: 1,
      explanation:
        'In Received Pronunciation (standard JAMB Oral English), "heart" and "clerk" (/klɑːk/) share the long open vowel /ɑː/.',
    },
    {
      topic: 'Oral English — Silent Consonants',
      question:
        'In which of the following words is the letter "b" NOT silent?',
      options: ['plumber', 'subtle', 'debtor', 'fumble'],
      correctOptionIndex: 3,
      explanation:
        'The /b/ sound is pronounced in "fumble" (/ˈfʌmbəl/), whereas "b" is silent in plumber, subtle, and debtor.',
    },
    {
      topic: 'Oral English — Dental Fricatives',
      question:
        'Choose the word that begins with the VOICELESS dental fricative /θ/ (as in "thin"):',
      options: ['though', 'worthy', 'theme', 'leather'],
      correctOptionIndex: 2,
      explanation:
        '"theme" (/θiːm/) begins with the voiceless dental fricative /θ/, whereas "though", "worthy", and "leather" contain voiced /ð/.',
    },
    {
      topic: 'Oral English — Rhymes',
      question:
        'Choose the option that RHYMES exactly with the word "dough":',
      options: ['cough', 'bough', 'though', 'rough'],
      correctOptionIndex: 2,
      explanation:
        '"dough" (/dəʊ/) rhymes with "though" (/ðəʊ/); cough = /kɒf/, bough = /baʊ/, rough = /rʌf/.',
    },
    {
      topic: 'Oral English — Word Stress',
      question:
        'Identify the option with the correct primary stress (in capitals) for the word "education":',
      options: ['ED-u-ca-tion', 'ed-U-ca-tion', 'ed-u-CA-tion', 'ed-u-ca-TION'],
      correctOptionIndex: 2,
      explanation:
        'Words ending in "-tion" always carry primary stress on the penultimate syllable (second from the end): ed-u-CA-tion.',
    },
    {
      topic: 'Oral English — Emphatic Stress',
      question:
        'Choose the question to which the given sentence is the appropriate answer: The principal commended the SENIOR prefects during assembly.',
      options: [
        'Did the vice-principal commend the senior prefects during assembly?',
        'Did the principal punish the senior prefects during assembly?',
        'Did the principal commend the junior prefects during assembly?',
        'Did the principal commend the senior prefects after school?',
      ],
      correctOptionIndex: 2,
      explanation:
        'The capitalized word "SENIOR" contrasts directly with "junior" while keeping every other word in the sentence unchanged.',
    },
    {
      topic: 'Question Tags — Imperative / Let’s',
      question:
        'Complete the sentence with the appropriate question tag: Let us revise all fifty Use of English questions carefully, ______?',
      options: ['will you', 'aren’t we', 'shall we', 'don’t we'],
      correctOptionIndex: 2,
      explanation:
        'First-person plural inclusive suggestions beginning with "Let’s / Let us" always take the tag "shall we?".',
    },
  ],
};
