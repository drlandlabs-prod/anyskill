// Finance curriculum — money theory → personal finance → credit → financial
// statements → investing. The business/financial-statement arc follows Bill
// Ackman's "Everything You Need to Know About Finance and Investing in Under
// an Hour" (Big Think) — the lemonade-stand company walkthrough.

export interface FinanceLesson {
  id: string
  name: string
  idea: string
  detail: string
  drill: string
  ackman?: string   // tie to the Ackman talk where relevant
}

export interface FinanceModule {
  id: string
  name: string
  tagline: string
  hours: number
  lessons: FinanceLesson[]
}

export const FINANCE_MODULES: FinanceModule[] = [
  {
    id: 'money-theory',
    name: 'Money Theory',
    tagline: 'What money actually is before you try to manage it.',
    hours: 2,
    lessons: [
      {
        id: 'functions',
        name: 'The Three Functions of Money',
        idea: 'Money is a medium of exchange, a unit of account, and a store of value — and it fails differently at each.',
        detail: 'Most money confusion comes from conflating the three. Inflation is a store-of-value failure; a barter economy is a medium-of-exchange failure. Once you can name which function is breaking, news about currencies stops being noise.',
        drill: 'Take Bitcoin, the US dollar, and a gift card. For each, grade the three functions A–F. Defend your grades out loud.',
      },
      {
        id: 'tvm',
        name: 'Time Value of Money',
        idea: 'A dollar today is worth more than a dollar tomorrow — because today\'s dollar can earn.',
        detail: 'This single idea generates all of finance: interest, discounting, annuities, valuation. If you can convert future money into present money (and back), you can price almost anything.',
        drill: 'Would you take $1,000 now or $1,100 in a year? Compute the implied interest rate, then decide at what rate you\'d flip your answer.',
      },
      {
        id: 'inflation',
        name: 'Inflation & Purchasing Power',
        idea: 'Nominal numbers lie; real numbers are what you can actually buy.',
        detail: 'At 3% inflation, purchasing power halves in about 24 years. Cash under the mattress is a slow, guaranteed loss — which is why "doing nothing" is itself an investment decision.',
        drill: 'Find your savings account rate. Subtract current inflation. That negative number is your real return — now you know why people invest.',
      },
      {
        id: 'compounding',
        name: 'Compounding',
        idea: 'Returns earning returns — the exponential engine under all long-term wealth.',
        detail: 'Ackman opens and closes his talk here: start early, because the last doublings of a compounding curve outweigh everything that came before. Time in the market is the variable you control.',
        drill: 'Rule of 72 drills until reflexive: 8% returns double in ~9 years. Now compute what $500/month at 8% becomes in 30 years — and what a 10-year delay costs you.',
        ackman: 'Ackman: "Start early" is his #1 piece of investing advice — the compounding curve does the heavy lifting.',
      },
    ],
  },
  {
    id: 'personal-finance',
    name: 'Personal Finance',
    tagline: 'The operating system for your own balance sheet.',
    hours: 2.5,
    lessons: [
      {
        id: 'savings-rate',
        name: 'Savings Rate > Everything',
        idea: 'Early in your career, how much you save matters far more than what you earn on it.',
        detail: 'A 20% savings rate beats brilliant stock-picking on a 2% rate, for years. Income minus expenses is the first equation of personal finance — and expenses are the side you fully control.',
        drill: 'Compute your actual savings rate for last month: (income − spending) / income. No rounding up.',
      },
      {
        id: 'emergency-fund',
        name: 'The Emergency Fund',
        idea: '3–6 months of expenses in boring, liquid cash — before any investing.',
        detail: 'This is your personal margin of safety (hello, Munger). Without it, one bad month forces you to sell investments at the worst time or take on expensive debt. Ackman\'s version: don\'t invest money you can\'t afford to lose or will need soon.',
        drill: 'Price your emergency fund: monthly essential expenses × 4. Open a separate high-yield account and automate the transfer.',
        ackman: 'Ackman\'s preconditions for investing: no credit card debt, and a cushion you won\'t need to touch.',
      },
      {
        id: 'budgeting',
        name: 'Budgeting as Feedback Loop',
        idea: 'A budget isn\'t a diet — it\'s telemetry on where money actually goes.',
        detail: 'Track for 30 days before optimizing anything. Most people find 10–15% of spending they don\'t even value. The goal is a system you don\'t have to think about, not monthly willpower.',
        drill: 'Categorize one month of statements into Needs / Wants / Waste. The Waste column is your raise.',
      },
      {
        id: 'insurance',
        name: 'Insurance: Transferring Ruin',
        idea: 'Insure what would bankrupt you; self-insure what merely annoys you.',
        detail: 'Health, disability, liability, term life (if anyone depends on your income). Skip extended warranties and low-deductible everything — you\'re paying a premium to smooth noise.',
        drill: 'List every insurance policy you pay for. For each: "does the worst case ruin me?" If no, you\'re probably over-insured.',
      },
    ],
  },
  {
    id: 'credit-debt',
    name: 'Credit & Debt',
    tagline: 'Borrowed money is a tool with the safety off.',
    hours: 2,
    lessons: [
      {
        id: 'credit-score',
        name: 'How Credit Scores Actually Work',
        idea: 'Payment history (~35%), utilization (~30%), history length, new credit, mix.',
        detail: 'A credit score is a reputation compounding machine: boring consistency wins. Utilization under ~10% and never missing a payment does almost all the work — the rest is optimization theater.',
        drill: 'Pull your free credit report. Find your utilization per card. If any card is above 30%, that\'s your action item.',
      },
      {
        id: 'apr',
        name: 'APR & the True Cost of Debt',
        idea: 'Interest rates compound against you just as hard as they compound for you.',
        detail: 'A 24% credit card APR doubles what you owe in 3 years if unpaid. Minimum payments are engineered to keep you there. Ackman is blunt: credit card debt is the first thing to eliminate before investing a dollar.',
        drill: 'Take any balance and its APR. Compute the total cost of paying it off at minimums vs. an aggressive 12-month plan. The gap is the price of patience.',
        ackman: 'Ackman: pay off high-interest debt first — no investment reliably beats a 20%+ APR.',
      },
      {
        id: 'good-bad-debt',
        name: 'Leverage: Good Debt, Bad Debt',
        idea: 'Debt that buys appreciating or income-producing assets ≠ debt that funds consumption.',
        detail: 'A fixed-rate mortgage on a home you can afford and a 24% card balance are both "debt," but one is a tool and the other is a leak. The test: does the borrowed money generate more than its interest cost?',
        drill: 'Classify every debt you have: tool or leak? For each leak, write the payoff order (highest APR first — the avalanche).',
      },
    ],
  },
  {
    id: 'how-business-works',
    name: 'How a Business Works',
    tagline: 'Ackman\'s lemonade stand — equity, debt, and what investors actually buy.',
    hours: 2,
    lessons: [
      {
        id: 'equity-vs-debt',
        name: 'Equity vs. Debt',
        idea: 'Sell a piece of the business (equity) or borrow against it (debt) — the two ways to fund anything.',
        detail: 'In the talk, Ackman starts a lemonade stand with $1,000: $500 borrowed at 10%, $500 from an investor for 50% of the business. Debt gets paid first and takes no upside; equity eats last and owns the upside. Every capital structure on Earth is a remix of this.',
        drill: 'Your friend needs $10k to open a coffee cart. Price both deals: what interest rate would you charge as a lender? What ownership % would you demand as an investor? Why are they different?',
        ackman: 'The opening act of Ackman\'s talk — the lemonade stand cap table.',
      },
      {
        id: 'why-leverage-dangerous',
        name: 'Why Leverage Is Dangerous',
        idea: 'Debt multiplies outcomes in both directions — and the downside includes zero.',
        detail: 'Ackman shows the stand earning $1,000 one year and nearly nothing the next. Equity absorbs the swing; the lender still demands $50. Leverage turns volatility into bankruptcy risk — in businesses, mortgages, and margin accounts alike.',
        drill: 'Take any investment returning ±30% in a year. Replay it with 2× borrowed money. Notice the equity swing is now ±60% — and one bad year can wipe you out.',
        ackman: 'Ackman\'s explicit warning: "Don\'t use leverage" — both in business and in your own portfolio.',
      },
      {
        id: 'what-investors-buy',
        name: 'What a Share Really Is',
        idea: 'A stock is fractional ownership of a real business, not a ticker that wiggles.',
        detail: 'This is the mindset pivot of the whole talk: when you buy a share you\'re buying a claim on future profits. Price is what you pay; value is what the business earns. Confusing the two is how people buy high and sell low.',
        drill: 'Pick one company you own or follow. Write one sentence: "This business makes money by ___." If you can\'t, you don\'t own it — you\'re renting a ticker.',
        ackman: 'Core Ackman: "Understand what a stock is" — a proportional share of a business\'s future earnings.',
      },
    ],
  },
  {
    id: 'balance-sheet',
    name: 'Reading a Balance Sheet',
    tagline: 'The snapshot: what a company owns, owes, and what\'s left for owners.',
    hours: 2.5,
    lessons: [
      {
        id: 'ale-equation',
        name: 'Assets = Liabilities + Equity',
        idea: 'The one equation the entire statement obeys — always, by construction.',
        detail: 'Assets are what the company controls; liabilities are what it owes; equity is the residual claim. Ackman builds the lemonade stand\'s balance sheet line by line: cash, inventory and the stand itself on the left; the loan and shareholder equity on the right.',
        drill: 'Build YOUR personal balance sheet right now: list assets (cash, accounts, property) and liabilities (every debt). The difference is your net worth — your equity.',
        ackman: 'Ackman constructs the stand\'s balance sheet on screen — assets on one side, debt + equity on the other.',
      },
      {
        id: 'current-vs-longterm',
        name: 'Current vs. Long-Term',
        idea: 'Split everything by the one-year line: liquidity on top, structure below.',
        detail: 'Current assets (cash, receivables, inventory) vs. fixed assets (equipment, buildings); current liabilities (payables, short-term debt) vs. long-term debt. The current split tells you whether the company can survive the next 12 months.',
        drill: 'Pull any public company\'s 10-K balance sheet. Compute current assets − current liabilities (working capital). Positive and growing = breathing room.',
      },
      {
        id: 'red-flags-bs',
        name: 'Balance Sheet Red Flags',
        idea: 'Debt rising faster than assets, shrinking cash, ballooning receivables.',
        detail: 'The balance sheet is where weak companies confess. If receivables grow faster than revenue, customers aren\'t paying; if debt climbs while cash falls, the business is borrowing to stand still.',
        drill: 'Compare the same company\'s balance sheet 3 years apart. Find one line that moved most and write a one-sentence theory of why.',
      },
    ],
  },
  {
    id: 'income-statement',
    name: 'Reading an Income Statement',
    tagline: 'The movie: revenue at the top, profit at the bottom, story in between.',
    hours: 2.5,
    lessons: [
      {
        id: 'waterfall',
        name: 'The Revenue → Net Income Waterfall',
        idea: 'Revenue − COGS = gross profit − operating expenses = operating income − interest & taxes = net income.',
        detail: 'Ackman walks the stand\'s P&L: $800 of lemonade sales, minus lemons/sugar/cups (COGS), minus labor, minus interest on the loan — what\'s left belongs to the owners. Every public company report is this same waterfall with bigger numbers.',
        drill: 'Memorize the waterfall by rebuilding it from any real 10-K: find revenue, gross profit, operating income, net income. Four numbers, one story.',
        ackman: 'The middle act of Ackman\'s talk — the stand\'s income statement, line by line.',
      },
      {
        id: 'margins',
        name: 'Margins Are the Moat Made Visible',
        idea: 'Gross margin shows pricing power; operating margin shows discipline; net margin shows what owners keep.',
        detail: 'A company selling $1 of product for 40¢ of cost has room to compete; one at 5¢ lives on a knife edge. Compare margins across competitors and across years — the trend matters more than the level.',
        drill: 'Compute gross and net margins for Coca-Cola and a grocery chain. Same equation, wildly different businesses. Explain the difference in one sentence.',
      },
      {
        id: 'earnings-quality',
        name: 'Earnings Quality',
        idea: 'Profit is an opinion; check what produced it.',
        detail: 'One-time gains, aggressive revenue recognition, and shrinking expenses can flatter a single year. Ask: is this profit repeatable, and does cash actually arrive? That question is the bridge to the cash flow statement.',
        drill: 'Find a company whose net income jumped >50% in a year. Read the footnotes: was it operations or a one-time event?',
      },
    ],
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow Statement',
    tagline: 'The lie detector: cash in, cash out, no accounting opinions.',
    hours: 2,
    lessons: [
      {
        id: 'cash-vs-earnings',
        name: 'Cash vs. Earnings',
        idea: 'You can report a profit and still run out of money.',
        detail: 'Accrual accounting books revenue before cash arrives and spreads costs across years. The cash flow statement reconciles the fantasy with the bank account: operating, investing, and financing sections.',
        drill: 'For one company, compare net income to operating cash flow for 3 years. If cash consistently trails profit, find out why before believing either number.',
      },
      {
        id: 'fcf',
        name: 'Free Cash Flow',
        idea: 'Operating cash flow − capital expenditures = the money actually available to owners.',
        detail: 'FCF funds dividends, buybacks, debt paydown, and growth — it\'s the number valuation ultimately rests on. A business that consumes cash to grow is very different from one that generates it.',
        drill: 'Compute FCF for one company for 5 years. Is it positive, growing, and roughly tracking earnings? That trio is a green flag.',
      },
    ],
  },
  {
    id: 'investing',
    name: 'Investing Basics',
    tagline: 'Ackman\'s closing advice — what to actually do with all of the above.',
    hours: 2,
    lessons: [
      {
        id: 'index-funds',
        name: 'Index Funds & the Fee Drag',
        idea: 'Own the whole market cheaply instead of paying dearly to be beaten by it.',
        detail: 'Most professionals underperform the index after fees — and fees compound against you exactly like returns compound for you. Ackman\'s advice for most people: low-cost index funds, held for the long term.',
        drill: 'Compare a 0.03% index fund vs. a 1% active fund on $100k over 30 years at 8% gross. The fee difference costs you roughly a quarter of your ending wealth. Compute it.',
        ackman: 'Ackman\'s default recommendation: diversified, low-fee index funds for nearly everyone.',
      },
      {
        id: 'when-ready',
        name: 'When You\'re Ready to Invest',
        idea: 'No high-interest debt, an emergency fund, and money you won\'t need for 5+ years.',
        detail: 'Ackman\'s preconditions are the whole risk-management section in one checklist. Money you\'ll need soon doesn\'t belong in stocks, because volatility forces selling at the wrong time.',
        drill: 'Run the checklist on yourself: debt ≤ ~8% APR? ✓/✗ · 3–6 months saved? ✓/✗ · horizon ≥ 5 years? ✓/✗. Any ✗ is your real next task — not stock-picking.',
        ackman: 'Straight from the talk\'s closing: the readiness checklist before putting a dollar in the market.',
      },
      {
        id: 'psychology-investing',
        name: 'Investor Psychology',
        idea: 'Your biggest risk isn\'t the market — it\'s you, at the extremes.',
        detail: 'Greed at the top, fear at the bottom: the average investor underperforms their own funds by buying high and selling low. Ackman\'s antidotes: understand what you own, avoid leverage, and never invest on tips.',
        drill: 'Write your panic plan now, in calm: "If my portfolio drops 30%, I will ___." Sign it. That document is worth more than any stock tip.',
        ackman: 'Ackman: avoid investments you don\'t understand and be ready for volatility — temperament beats IQ.',
      },
    ],
  },
]

export const FIN_TOTAL_LESSONS = FINANCE_MODULES.reduce((a, m) => a + m.lessons.length, 0)
export const FIN_TOTAL_HOURS = FINANCE_MODULES.reduce((a, m) => a + m.hours, 0)
