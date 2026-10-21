// Production experience, newest first. The first `featured` roles get a station each on the causeway;
// the rest share one "Earlier" station. Numbers stay on the CV; the site keeps what a visitor can open.

import type { LinkItem } from "./profile";

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
  /** Products shipped there that a visitor can open, with a snapshot of the first. */
  builds?: LinkItem[];
  image?: { src: string; alt: string; href: string };
};

export const featuredRoles: Role[] = [
  {
    slug: "enor",
    company: "eNor",
    href: "https://enorsecurities.com/",
    role: "Software Engineer",
    period: "2026",
    summary: "A Rust money-movement platform: payments, ledgers and custody for a regulated securities firm.",
    bullets: [
      "Central-bank integrations: the BCR Transfer365 instant-payment rail (ISO 20022) and LBTR gross settlement.",
      "Double-entry and TigerBeetle ledgers over Kafka/Redpanda, with transactional outbox relays and circuit breakers between services.",
      "Crypto swap and custody: exchange orders signed through Cloud KMS, Fireblocks custody with MFA-gated withdrawals, and IP-jurisdiction compliance in front of every money action.",
    ],
    stack: ["Rust", "Axum", "Kafka/Redpanda", "TigerBeetle", "GKE", "Terraform"],
    proof: [],
    note: "Closed source. Scope and numbers are on the CV.",
  },
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
    proof: [
      {
        label: "hdp-cairo PRs",
        href: "https://github.com/HerodotusDev/hdp-cairo/pulls?q=is%3Apr+author%3APedroRosalba+is%3Amerged",
      },
      { label: "HDP session, Invisible Garden 2025", href: "https://luma.com/porsxgac" },
    ],
    builds: [
      { label: "Daloc", href: "https://daloc.xyz" },
      { label: "Risklayer", href: "https://risklayer.online" },
    ],
    image: { src: "/shots/daloc.jpg", alt: "Daloc, onchain prime brokerage: landing page.", href: "https://daloc.xyz" },
  },
];

export const earlierRoles: Role[] = [
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
  },
  {
    slug: "blockchain-league",
    company: "Rio de Janeiro University Blockchain League",
    href: "https://linktr.ee/liga_carioca_de_blockchain",
    role: "Founder",
    period: "2024 – 2026",
    summary: "A blockchain engineering community built on workshops, hackathons and meetups.",
    bullets: [],
    stack: [],
    proof: [],
  },
  {
    slug: "pensi",
    company: "Colégio e Curso Pensi",
    href: "",
    role: "Math Olympiad Instructor",
    period: "2023 – 2025",
    summary: "",
    bullets: [],
    stack: [],
    proof: [],
  },
];
