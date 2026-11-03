// Hackathon wins. Prize names come from the ETHGlobal certificates and the Devfolio project page.

import type { LinkItem } from "./profile";

export type Hackathon = {
  event: string;
  year: string;
  project: string;
  pitch: string;
  prizes: string[];
  image: string;
  links: LinkItem[];
};

export const hackathons: Hackathon[] = [
  {
    event: "ETHGlobal Prague",
    year: "2025",
    project: "QuantumLeap",
    pitch: "Multi-chain market data turned into risk-adjusted DeFi portfolio suggestions.",
    prizes: ["Blockscout Explorer Pool", "1inch APIs"],
    image: "/shots/quantumleap.jpg",
    links: [
      { label: "Showcase", href: "https://ethglobal.com/showcase/quantumleap-r31vu" },
      { label: "Code", href: "https://github.com/elbarroca/eth_global_prague" },
    ],
  },
  {
    event: "ETHDenver",
    year: "2025",
    project: "Cran",
    pitch: "Private memory for AI agents: memory stored under homomorphic encryption, recalled without decrypting.",
    prizes: ["zkSync 2nd", "Somnia 2nd", "Flow 3rd"],
    image: "/shots/cran.jpg",
    links: [
      { label: "Devfolio", href: "https://devfolio.co/projects/cranberry-bd29" },
      { label: "Code", href: "https://github.com/Arthur-Jacobina/cran" },
    ],
  },
  {
    event: "ETHGlobal Brussels",
    year: "2024",
    project: "Goals",
    pitch: "Stake crypto on a habit: keep it and get your stake back, plus a share of what others lost.",
    prizes: ["Celo, stable gas", "Web3Auth mobile SDK"],
    image: "/shots/goals.jpg",
    links: [{ label: "Showcase", href: "https://ethglobal.com/showcase/goals-m5kr7" }],
  },
];
