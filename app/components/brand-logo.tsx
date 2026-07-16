import Image from "next/image";

export function BrandLogo() {
  return <Image className="brand-logo" src="/sm-logo.png" alt="SM Literatura" width={150} height={64} priority />;
}
