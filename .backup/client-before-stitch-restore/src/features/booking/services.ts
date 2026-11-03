import {
  Banknote,
  CircleStar,
  Clock,
  HeartPulse,
  HousePlus,
  IdCard,
  Landmark,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";

export type ServiceId = "money-cards" | "savings" | "loans" | "protection" | "id-passport";

/** Colour family for a card. Most cards are blue, "Life & Health" is violet. */
export type ServiceTone = "blue" | "violet";

export interface ServiceOption {
  id: ServiceId;
  /** Small label above the title, e.g. "Fast cash & cards". */
  category: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: ServiceTone;
  /** Line at the bottom of the card: appointment length or a perk. */
  note: { icon: LucideIcon; label: string };
}

export const SERVICES: readonly ServiceOption[] = [
  {
    id: "money-cards",
    category: "Fast cash & cards",
    title: "Money & Cards",
    description: "Deposit or withdraw cash, get a replacement debit card, or pay bills at the counter.",
    icon: Banknote,
    tone: "blue",
    note: { icon: Clock, label: "~ 10 min appointment" },
  },
  {
    id: "savings",
    category: "Save & grow",
    title: "Savings & Piggy Bank",
    description: "Open a high-interest savings account, fixed deposits, or set up automated monthly savings.",
    icon: PiggyBank,
    tone: "blue",
    note: { icon: CircleStar, label: "Dedicated Advisor Ready" },
  },
  {
    id: "loans",
    category: "Home & vehicle",
    title: "Loans & Borrowing",
    description: "Apply for a home mortgage, buy a new car, or discuss lower interest borrowing options.",
    icon: HousePlus,
    tone: "blue",
    note: { icon: Clock, label: "~ 25 min appointment" },
  },
  {
    id: "protection",
    category: "Life & health",
    title: "Family Protection",
    description: "Protect loved ones with affordable life insurance, medical emergency cover, and estate plans.",
    icon: HeartPulse,
    tone: "violet",
    note: { icon: Clock, label: "~ 20 min appointment" },
  },
  {
    id: "id-passport",
    category: "Official verification",
    title: "Smart ID & Passport",
    description:
      "Fingerprint scans, biometric photos, national ID card renewals, and official document certification.",
    icon: IdCard,
    tone: "blue",
    note: { icon: Landmark, label: "Official Branch Booth" },
  },
];

export function findService(id: ServiceId | null): ServiceOption | null {
  return SERVICES.find((service) => service.id === id) ?? null;
}
