import Image from "next/image";

export function BrandMark({ size = "normal" }: { size?: "normal" | "large" }) {
  return <span className={`brand-mark ${size === "large" ? "h-12 w-12" : "h-10 w-10"}`}>
    <Image src="/brand/davino-neves-logo.png" alt="Logomarca Davino Neves" width={1580} height={797} className="brand-mark-image" />
  </span>;
}
