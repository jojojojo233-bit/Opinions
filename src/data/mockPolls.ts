export interface PollData {
  id: string; // The Poll Address
  title: string;
  category: string;
  context: string;
  creator: string;
  reward: number;
  responses: number;
  options: { text: string; percentage: number }[];
  endsAt: string;
}

export const mockPolls: PollData[] = [
  {
    id: "1",
    title: "Do you prefer self checkout or a human cashier for more than 10 items?",
    category: "Finance",
    context: "Retailers are increasingly moving towards automation to reduce costs, but customer satisfaction varies significantly based on cart size.",
    creator: "Loblaws",
    reward: 0.5,
    responses: 1234,
    options: [
      { text: "Human Cashier", percentage: 62 },
      { text: "Self Checkout", percentage: 38 },
    ],
    endsAt: "2026-12-31",
  },
  {
    id: "2",
    title: "Are physical discs still important to you, or are you 100% digital?",
    category: "Gaming",
    context: "Digital sales have overtaken physical media, raising questions about long-term ownership, resale value, and preservation.",
    creator: "Playstation",
    reward: 0.2,
    responses: 856,
    options: [
      { text: "Physical", percentage: 10 },
      { text: "Digital", percentage: 68 },
      { text: "Hybrid", percentage: 22 },
    ],
    endsAt: "2026-02-15",
  },
  {
    id: "3",
    title: "Would you pay $8+ for a high quality \"superfood\" latte?",
    category: "Finance",
    context: "Coffee prices have surged due to inflation and premium branding strategies, testing the limits of consumer spending on daily luxuries.",
    creator: "Starbucks",
    reward: 0.8,
    responses: 2103,
    options: [
      { text: "Yes", percentage: 45 },
      { text: "No", percentage: 55 },
    ],
    endsAt: "2030-01-01",
  },
  {
    id: "4",
    title: "If you could only keep ONE subscription, which would it be? (Netflix / Disney+ / HBO Max / YouTube Premium)",
    category: "Entertainment",
    context: "The streaming market is saturated, leading consumers to cancel services and consolidate their monthly subscriptions.",
    creator: "Netflix",
    reward: 0.1,
    responses: 967,
    options: [
      { text: "Netflix", percentage: 38 },
      { text: "Disney+", percentage: 34 },
      { text: "Crave", percentage: 10 },
      { text: "Youtube Premium", percentage: 8 },
      { text: "other", percentage: 4 },
      { text: "I would not keep any", percentage: 3 },
    ],
    endsAt: "2035-01-01",
  },
  {
    id: "5",
    title: "In an office enviorment, what is your ideal schedule?",
    category: "Office",
    context: "Companies are debating the optimal balance between in-person collaboration and remote flexibility as return-to-office mandates increase.",
    creator: "Amazon",
    reward: 0.5,
    responses: 543,
    options: [
      { text: "Full Remote", percentage: 50 },
      { text: "Hybrid", percentage: 40 },
      { text: "Full Office", percentage: 10 },
    ],
    endsAt: "2027-03-01",
  },
  {
    id: "6",
    title: "Would you take a 10% pay cut for a guaranteed 4-day work week?",
    category: "Office",
    context: "The 4-day work week is gaining traction globally as a way to improve mental health and productivity, often without pay reductions.",
    creator: "Microsoft",
    reward: 0.3,
    responses: 1876,
    options: [
      { text: "Yes", percentage: 48 },
      { text: "No", percentage: 52 },
    ],
    endsAt: "2028-12-31",
  },
  {
    id: "7",
    title: "Is it acceptable to have your camera off during every meeting?",
    category: "Office",
    context: "Remote work etiquette is evolving, with different expectations for engagement and visual presence in virtual meetings.",
    creator: "GamerPro",
    reward: 0.9,
    responses: 1432,
    options: [
      { text: "Yes", percentage: 55 },
      { text: "No", percentage: 45 },
    ],
    endsAt: "2026-12-31",
  },
  {
    id: "8",
    title: "Do you believe AI will make your specific job easier or replace it entirely?",
    category: "Politics",
    context: "Rapid advancements in AI are reshaping the labor market, creating a divide between those who view it as a tool vs. a threat.eve AI will make your specific job easier or replace it entirely?",
    creator: "Apple",
    reward: 0.5,
    responses: 1654,
    options: [
      { text: "Yes", percentage: 78 },
      { text: "No", percentage: 12 },
    ],
    endsAt: "2026-12-31",
  },
];
