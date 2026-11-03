import type { ProductWindow as Product } from "@/content/projects";

/** The live product, framed like a window and tinted into the world's violet; hover shows its true colours. */
export function ProductWindow({ product }: { product: Product }) {
  return (
    <a className="product-window" href={product.href} target="_blank" rel="noreferrer">
      <span className="pw-bar">
        <span className="pw-seam" aria-hidden="true" />
        <span>{product.label}</span>
        <span aria-hidden="true">↗</span>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.src} alt={product.alt} loading="lazy" decoding="async" />
    </a>
  );
}
