// Charlie Munger's mental models, as presented in Poor Charlie's Almanack —
// primarily the "A Lesson on Elementary, Worldly Wisdom" USC talk (1994)
// and the "Psychology of Human Misjudgment" speech (1995).
// Each discipline is a module; each model is a trainable node.

export interface MentalModel {
  id: string
  name: string
  idea: string          // the core idea, one breath
  freight: string       // why it "carries the freight" (Munger's term)
  application: string   // a concrete modern application / drill seed
  quote?: string        // short attributable line
}

export interface Discipline {
  id: string
  name: string
  tagline: string
  hours: number         // module estimate inside a 10–20h sprint
  models: MentalModel[]
}

export const DISCIPLINES: Discipline[] = [
  {
    id: 'math',
    name: 'Mathematics',
    tagline: 'The language the world is written in. Numeracy is non-negotiable.',
    hours: 3,
    models: [
      {
        id: 'compound',
        name: 'Compound Interest',
        idea: 'Growth feeds on itself — small rates, given time, dominate everything.',
        freight: 'It governs money, knowledge, habits, and reputation alike. Munger calls it one of the most important models there is — and most people still can\'t feel it intuitively.',
        application: 'Drill: estimate doubling times with the Rule of 72 until it\'s reflexive — investments, user growth, your own skill compounding.',
        quote: 'Understanding both the power of compound interest and the difficulty of getting it is the heart and soul of understanding a lot of things.',
      },
      {
        id: 'permutations',
        name: 'Permutations & Combinations',
        idea: 'The arithmetic of counting arrangements — the entry point to probability.',
        freight: 'Fermat and Pascal turned it into probability theory; without it you cannot size risk. Munger: it\'s obvious, useful, and almost nobody learns it properly.',
        application: 'Drill: count outcomes before judging odds — card hands, feature combinations, candidate pipelines.',
      },
      {
        id: 'decision-trees',
        name: 'Decision Trees',
        idea: 'Map choices as branching paths with probabilities and payoffs at the leaves.',
        freight: 'Forces you to price uncertainty instead of hand-waving it. Munger links it directly to the math of Fermat/Pascal as a daily thinking tool.',
        application: 'Drill: take a live decision (job offer, launch, hire) and draw the tree with rough probabilities — watch the "obvious" answer flip.',
      },
      {
        id: 'bayes',
        name: 'Bayesian Updating',
        idea: 'Beliefs are probabilities; new evidence multiplies, not replaces.',
        freight: 'The formal antidote to sticking with a stale view. Munger expects you to update priors as naturally as you add numbers.',
        application: 'Drill: state your prior out loud, take one new data point, and re-estimate. Repeat daily for a week.',
      },
      {
        id: 'normal-dist',
        name: 'The Normal Distribution',
        idea: 'Many natural quantities cluster around a mean with predictable tails.',
        freight: 'Tells you when variation is signal vs noise — and when it\'s NOT applicable (power-law domains), which is just as valuable.',
        application: 'Drill: classify ten things you measured this week — normal or fat-tailed? Your risk treatment differs completely.',
      },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    tagline: 'The hard floor of reality — systems obey laws whether you like them or not.',
    hours: 1.5,
    models: [
      {
        id: 'critical-mass',
        name: 'Critical Mass',
        idea: 'Below a threshold nothing happens; above it, the reaction self-sustains.',
        freight: 'Explains why efforts, networks, and brands tip suddenly after long flat stretches — and why sub-threshold effort is wasted.',
        application: 'Drill: for a project stalling out, ask "am I below critical mass, or is the reaction wrong?" The remedies are opposite.',
      },
      {
        id: 'breakpoints',
        name: 'Breakpoints / Equilibrium',
        idea: 'Systems hold until they don\'t; know where the structure gives way.',
        freight: 'Engineering thinking applied to everything: load-bearing assumptions, balance sheets, and people all have breakpoints.',
        application: 'Drill: identify the load-bearing assumption in your current plan and estimate its breaking load.',
      },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    tagline: 'Reactions, catalysts, and runaway feedback.',
    hours: 1,
    models: [
      {
        id: 'autocatalysis',
        name: 'Autocatalysis',
        idea: 'A reaction whose product accelerates the reaction itself.',
        freight: 'The chemistry version of compounding: success feeds success. Disney videocassettes selling Disney movies is Munger\'s example.',
        application: 'Drill: find the autocatalytic loop in your business or skill practice — then feed it, not something else.',
      },
    ],
  },
  {
    id: 'biology',
    name: 'Biology & Evolution',
    tagline: 'Competition, adaptation, and extinction — the market before markets existed.',
    hours: 1.5,
    models: [
      {
        id: 'natural-selection',
        name: 'Natural Selection / Competitive Destruction',
        idea: 'Variation plus selection pressure eliminates the unfit — relentlessly, impersonally.',
        freight: 'Munger insists business is biology: what gets rewarded gets repeated; what can\'t adapt dies. Pattern-recognition gold across domains.',
        application: 'Drill: audit what your environment actually rewards (not what it claims to) — in your company, market, or codebase.',
      },
      {
        id: 'ecosystem-niche',
        name: 'Niches & Adaptation',
        idea: 'Survival belongs to the organism best fitted to its niche, not the biggest.',
        freight: 'Explains why small specialists beat generalist giants in the right habitat — and why habitats shift.',
        application: 'Drill: define your niche precisely enough that you can name what would outcompete you in it.',
      },
    ],
  },
  {
    id: 'economics',
    name: 'Economics',
    tagline: 'Incentives, scarcity, and the machine that allocates everything.',
    hours: 3,
    models: [
      {
        id: 'opportunity-cost',
        name: 'Opportunity Cost',
        idea: 'The true cost of anything is the best alternative you gave up.',
        freight: 'Kills more bad decisions than any other model. Munger compares every investment to the best available alternative — always.',
        application: 'Drill: before saying yes this week, write down the #2 use of that time/money and compare honestly.',
      },
      {
        id: 'comparative-advantage',
        name: 'Comparative Advantage',
        idea: 'Specialize where your relative edge is greatest — even if you\'re better at everything.',
        freight: 'The deep logic of trade and delegation. Counterintuitive, universally applicable, rarely internalized.',
        application: 'Drill: list your tasks; delegate or drop the ones where your relative (not absolute) edge is smallest.',
      },
      {
        id: 'scale-economies',
        name: 'Economies of Scale',
        idea: 'Volume lowers unit cost — until bureaucracy quietly taxes it back.',
        freight: 'Munger\'s two-sided lesson: scale is a weapon and a disease (complacency, layer-cake management). Both halves carry freight.',
        application: 'Drill: for a product, name the three scale advantages you\'d gain — and the two scale diseases that would arrive with them.',
      },
      {
        id: 'moats',
        name: 'Moats & Competitive Destruction',
        idea: 'Capitalism attacks every profit pool; only structural defenses keep returns.',
        freight: 'The reason Munger and Buffett buy businesses, not tickers. Asking "what destroys this?" is the whole game.',
        application: 'Drill: write the attack plan against your own project — the strongest competitor with unlimited money. Then fix the weakest wall.',
      },
      {
        id: 'surfing',
        name: 'Surfing (Riding the Wave)',
        idea: 'Getting in early on a big technological wave can carry a company for decades.',
        freight: 'Munger\'s explanation of National Cash Register and the Washington Post: some advantages are caught, not built. Recognize waves.',
        application: 'Drill: name one genuine wave in your field (not a fad) and one concrete way to paddle onto it this quarter.',
      },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    tagline: 'Build for failure before failure builds for you.',
    hours: 1.5,
    models: [
      {
        id: 'backup-systems',
        name: 'Backup Systems & Redundancy',
        idea: 'Critical components get spares; single points of failure are design errors.',
        freight: 'Transfers everywhere: money reserves, key-person risk, data, health. Munger treats redundancy as elementary wisdom, not caution.',
        application: 'Drill: list your three single points of failure — personal and professional — and price the backup for each.',
      },
      {
        id: 'margin-of-safety',
        name: 'Margin of Safety',
        idea: 'Demand a gap between capacity and load — bridges, balance sheets, forecasts.',
        freight: 'The central concept Munger imported from Graham via engineering: you will be wrong; size the cushion for it.',
        application: 'Drill: take your most confident current estimate and stress it at 2× the assumed load. Does the plan survive?',
      },
      {
        id: 'inversion',
        name: 'Inversion',
        idea: 'Instead of asking how to succeed, ask how you\'d guarantee failure — then avoid it.',
        freight: 'From the algebraist Jacobi via Munger\'s constant use. Hard problems crack open when flipped; it is his single most-quoted method.',
        application: 'Drill: "How would I ruin this project in 30 days?" List it, then invert every item into a guardrail.',
        quote: 'Invert, always invert.',
      },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    tagline: 'The language of business — and its limits.',
    hours: 1,
    models: [
      {
        id: 'double-entry',
        name: 'Double-Entry Thinking',
        idea: 'Every action has two entries; nothing is free, everything balances somewhere.',
        freight: 'Munger insists on knowing accounting AND its limits — the books describe the past, and can be gamed. Read them skeptically.',
        application: 'Drill: for one metric you trust, ask "what would gaming this number look like?" — someone, somewhere, is doing it.',
      },
    ],
  },
  {
    id: 'psychology',
    name: 'Psychology of Human Misjudgment',
    tagline: 'The 25 standard causes — the module Munger said was worth more than all the rest.',
    hours: 4,
    models: [
      {
        id: 'incentives',
        name: 'Incentive-Caused Bias (Reward Superresponse)',
        idea: '"Show me the incentive and I will show you the outcome." People rationalize toward their pay.',
        freight: 'Tendency #1 in the Almanack and Munger\'s candidate for most powerful of all. FedEx\'s night-shift fix (pay per shift, not per hour) is his canonical story.',
        application: 'Drill: before trusting any advice, ask what the adviser is paid to believe. Include yourself.',
      },
      {
        id: 'social-proof',
        name: 'Social-Proof Tendency',
        idea: 'Under uncertainty, we copy the crowd — especially under stress and ambiguity.',
        freight: 'Explains bubbles, mobs, and corporate groupthink. Doubly dangerous combined with stress (Munger: the recipe for cult conversion).',
        application: 'Drill: catch one decision this week you made "because everyone does it" and re-decide it on evidence.',
      },
      {
        id: 'deprival',
        name: 'Deprival-Superreaction Tendency',
        idea: 'Losing something — or almost getting it — hurts far more than equivalent gain feels good.',
        freight: 'Drives sunk-cost escalation, bidding wars, and holding losers. Munger: a dog won\'t bite a friend but will bite over a bone it already has.',
        application: 'Drill: for something you can\'t let go of, ask "would I buy this today at this price?" If no — sell.',
      },
      {
        id: 'contrast',
        name: 'Contrast-Misreaction Tendency',
        idea: 'We judge by comparison to what came before, not by absolute value.',
        freight: 'How $1,000 options get sold after a $60,000 car, and how mediocre successors follow great leaders unnoticed. Munger: ruin your judgment one small step at a time.',
        application: 'Drill: evaluate your next purchase/decision against absolute alternatives, not the anchor it was presented next to.',
      },
      {
        id: 'association',
        name: 'Influence-from-Mere-Association Tendency',
        idea: 'We irrationally transfer feelings between things merely linked in experience.',
        freight: 'Why advertisers pair products with beauty, why messengers get shot, why "priced so high it must be good" works.',
        application: 'Drill: notice one judgment you made from packaging/context rather than substance this week.',
      },
      {
        id: 'inconsistency-avoidance',
        name: 'Inconsistency-Avoidance Tendency',
        idea: 'The brain conserves energy by refusing to change — habits, identities, conclusions.',
        freight: 'The reason first conclusions stick and bad habits calcify. Munger: an ounce of prevention is worth a ton of cure, especially with minds.',
        application: 'Drill: steelman the opposite of a belief you\'ve held for 5+ years. Write it down convincingly.',
      },
      {
        id: 'availability',
        name: 'Availability-Misweighing Tendency',
        idea: 'What\'s vivid and recent feels more probable than what\'s true.',
        freight: 'Plane crashes beat car deaths in our risk math. The fix Munger prescribes: checklists, and deliberately seeking disconfirming evidence.',
        application: 'Drill: find one fear/priority driven by a vivid story rather than base rates. Replace it with the base rate.',
      },
      {
        id: 'self-regard',
        name: 'Excessive Self-Regard Tendency',
        idea: 'We overrate ourselves, our decisions, and our "endowments" — everything we own becomes more valuable.',
        freight: 'Explains why 90% of drivers think they\'re above average and why people defend their worst work. Munger\'s fix: force yourself to be more objective than feels reasonable.',
        application: 'Drill: ask a candid colleague to rank your last piece of work — and don\'t argue with the answer.',
      },
      {
        id: 'lollapalooza',
        name: 'Lollapalooza Tendency',
        idea: 'When multiple biases point the same way, the compound effect is extreme and nonlinear.',
        freight: 'The 25th tendency and the capstone of the whole speech: open-outcry auctions, cults, bubbles — all are stacked tendencies, not single causes.',
        application: 'Drill: analyze one crowd phenomenon you participated in — stack the tendencies that were simultaneously operating on you.',
      },
    ],
  },
]

// The remaining tendencies Munger lists (shown as a reference index in the module).
export const TENDENCY_INDEX: { n: number; name: string }[] = [
  { n: 1, name: 'Reward & Punishment Superresponse' },
  { n: 2, name: 'Liking/Loving' },
  { n: 3, name: 'Disliking/Hating' },
  { n: 4, name: 'Doubt-Avoidance' },
  { n: 5, name: 'Inconsistency-Avoidance' },
  { n: 6, name: 'Curiosity' },
  { n: 7, name: 'Kantian Fairness' },
  { n: 8, name: 'Envy/Jealousy' },
  { n: 9, name: 'Reciprocation' },
  { n: 10, name: 'Influence-from-Mere-Association' },
  { n: 11, name: 'Pain-Avoiding Psychological Denial' },
  { n: 12, name: 'Excessive Self-Regard' },
  { n: 13, name: 'Overoptimism' },
  { n: 14, name: 'Deprival-Superreaction' },
  { n: 15, name: 'Social-Proof' },
  { n: 16, name: 'Contrast-Misreaction' },
  { n: 17, name: 'Stress-Influence' },
  { n: 18, name: 'Availability-Misweighing' },
  { n: 19, name: 'Use-It-or-Lose-It' },
  { n: 20, name: 'Drug-Misinfluence' },
  { n: 21, name: 'Senescence-Misinfluence' },
  { n: 22, name: 'Authority-Misinfluence' },
  { n: 23, name: 'Twaddle' },
  { n: 24, name: 'Reason-Respecting' },
  { n: 25, name: 'Lollapalooza' },
]

export const TOTAL_MODELS = DISCIPLINES.reduce((a, d) => a + d.models.length, 0)
export const TOTAL_HOURS = DISCIPLINES.reduce((a, d) => a + d.hours, 0)
