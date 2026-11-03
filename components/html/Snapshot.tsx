/** A still of the work: a diagram from its write-up, or the product itself. Links out when it can. */
export function Snapshot({ src, alt, href }: { src: string; alt: string; href?: string | null }) {
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={src} alt={alt} loading="lazy" decoding="async" />;
  return href ? (
    <a className="snapshot" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {img}
    </a>
  ) : (
    <div className="snapshot">{img}</div>
  );
}
