import Image from "next/image";

export function HeroArtwork() {
  return (
    <figure className="artwork-frame">
      <span className="brace" aria-hidden="true">&#123;</span>
      <Image
        src="/tablo-minimal-hero.png"
        alt="人物与播客麦克风的极简抽象线稿"
        width={1536}
        height={1024}
        priority
      />
      <span className="artwork-index">HT / 2026</span>
    </figure>
  );
}
