// Production experience. Featured roles get a station each on the causeway; the rest share one "Also" station. Numbers stay on the CV; the site keeps what a visitor can open.

import type { LinkItem } from "./profile";
import type { EmblemKind } from "./media";

/** A product shipped in a role, shown as a row with its own cover under the role. */
export type Build = {
  title: string;
  /** What it is, in a few words: the row's eyebrow. */
  kind: string;
  /** Where the title and the cover go. */
  href: string;
  summary: string;
  emblem: EmblemKind;
  /** Every place to open it, in the row's action line. */
  links: LinkItem[];
};

export type Role = {
  slug: string;
  company: string;
  href: string;
  role: string;
  period: string;
  summary: string;
  bullets: string[];
  stack: string[];
  /** Proof a visitor can open: PRs, products, talks. */
  proof: LinkItem[];
  /** Shown when the work itself can't be linked. */
  note?: string;
  /** Products shipped there that a visitor can open. */
  builds?: Build[];
  image?: { src: string; alt: string; href: string };
  /** The company's mark as a living cover, beside the role. */
  emblem?: EmblemKind;
};

export const featuredRoles: Role[] = [
  {
    slug: "herodotus",
    company: "Herodotus",
    href: "https://herodotus.dev/",
    role: "Software Engineer",
    period: "2024 – 2026",
    summary: "Storage proofs and zero-knowledge co-processing for Ethereum, then infrastructure for DeFi lending.",
    bullets: [
      "Extended hdp-cairo, the Herodotus Data Processor, from EVM storage proofs to plain Merkle and Patricia-trie state proofs, so off-chain systems can prove the state they read.",
      "Low-latency infrastructure for DeFi lending and prime brokerage: real-time order-book pipelines and RFQ quoting.",
      "Risk tooling: on-chain credit pricing, and an AI risk analysis of DeFi protocols mapped onto the infrastructure they depend on.",
    ],
    stack: ["Cairo", "Rust", "TypeScript", "Python"],
    proof: [],
    emblem: "herodotus",
    builds: [
      {
        title: "Daloc",
        kind: "Onchain prime brokerage",
        href: "https://daloc.xyz",
        summary:
          "One account across chains: pledge collateral and trade on credit. I built the real-time order-book pipelines and RFQ quoting behind it.",
        emblem: "daloc",
        links: [
          { label: "daloc.xyz", href: "https://daloc.xyz" },
          { label: "Docs", href: "https://docs.daloc.xyz" },
        ],
      },
      {
        title: "hdp-cairo",
        kind: "Open source · ZK co-processor",
        href: "https://github.com/HerodotusDev/hdp-cairo",
        summary:
          "The Herodotus Data Processor: runs programs over multi-chain data and proves what they read. I took it from EVM storage proofs to plain Merkle and Patricia-trie proofs.",
        emblem: "hdp",
        links: [
          { label: "GitHub", href: "https://github.com/HerodotusDev/hdp-cairo" },
          {
            label: "My PRs",
            href: "https://github.com/HerodotusDev/hdp-cairo/pulls?q=is%3Apr+author%3APedroRosalba+is%3Amerged",
          },
        ],
      },
    ],
  },
];

// Shorter rows, one shared station.
export const earlierRoles: Role[] = [
  {
    slug: "enor",
    company: "eNor",
    href: "https://enorsecurities.com/",
    role: "Software Engineer",
    period: "2026",
    summary: "Rust payments, ledgers and custody for a regulated securities firm. Closed source; the scope is on the CV.",
    bullets: [],
    stack: [],
    proof: [],
    emblem: "enor",
  },
  {
    slug: "mediolano",
    company: "Mediolano",
    href: "https://www.medialane.io/",
    role: "Developer Relations",
    period: "2022 – 2024",
    summary: "IP licensing on Starknet: Cairo contracts, IPFS and zero-knowledge proofs of license.",
    bullets: [],
    stack: [],
    proof: [
      { label: "mediolano-app", href: "https://github.com/mediolano-os/mediolano-app/pulls?q=is%3Apr+author%3APedroRosalba" },
      {
        label: "mediolano-contracts",
        href: "https://github.com/mediolano-os/mediolano-contracts/pulls?q=is%3Apr+author%3APedroRosalba",
      },
    ],
    emblem: "mediolano",
  },
];
