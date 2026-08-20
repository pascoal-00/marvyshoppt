import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import edit1 from "@/assets/edit1.jpg";
import edit2 from "@/assets/edit2.jpg";
import mcqueenA from "@/assets/image.asset.json";
import mcqueenB from "@/assets/image-2.asset.json";
import dgWhite from "@/assets/image-3.asset.json";
import dgBlack from "@/assets/image-4.asset.json";
import af1White from "@/assets/image-5.asset.json";
import af1Black from "@/assets/image-6.asset.json";
import sambaOg from "@/assets/image-7.asset.json";
import nb530 from "@/assets/image-8.asset.json";


export type Availability = "in_stock" | "low_stock" | "unknown";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: "sneakers" | "acessorios";
  style: "everyday" | "street" | "sport" | "essentials";
  images: string[];
  sizes: string[];
  availability: Availability;
  isNew: boolean;
  bestSeller: boolean;
  description: string;
  details: string[];
  createdAt: string;
};

const SNEAKER_SIZES = ["39", "40", "41", "42", "43", "44", "45"];
const APPAREL_SIZES = ["S", "M", "L", "XL"];

export const products: Product[] = [
  {
    id: "1",
    slug: "alexander-mcqueen-oversized-sneaker",
    name: "ALEXANDER MCQUEEN OVERSIZED SNEAKER",
    price: 390,
    category: "sneakers",
    style: "street",
    images: [mcqueenA.url, mcqueenB.url],
    sizes: SNEAKER_SIZES,
    availability: "low_stock",
    isNew: true,
    bestSeller: true,
    description:
      "O icónico Oversized Sneaker em pele preta lisa com a sola oversized branca. Silhueta de assinatura da Alexander McQueen, presença imediata em qualquer look.",
    details: [
      "Pele de bezerro com acabamento liso",
      "Sola oversized em borracha branca",
      "Logo Alexander McQueen no calcanhar",
      "Corte low-top unissexo",
    ],
    createdAt: "2026-08-14",
  },
  {
    id: "2",
    slug: "dolce-gabbana-portofino-dg-white",
    name: "DOLCE & GABBANA PORTOFINO DG WHITE",
    price: 420,
    category: "sneakers",
    style: "street",
    images: [dgWhite.url, dgBlack.url],
    sizes: SNEAKER_SIZES,
    availability: "low_stock",
    isNew: true,
    bestSeller: true,
    description:
      "Portofino em pele branca com o logo DG em preto na lateral e contraforte contrastante. Luxo italiano em versão sneaker.",
    details: [
      "Pele de novilho branca",
      "Logo DG impresso na lateral",
      "Contraforte em pele preta",
      "Sola em borracha leve",
    ],
    createdAt: "2026-08-13",
  },
  {
    id: "3",
    slug: "dolce-gabbana-portofino-black",
    name: "DOLCE & GABBANA PORTOFINO BLACK",
    price: 420,
    category: "sneakers",
    style: "street",
    images: [dgBlack.url, dgWhite.url],
    sizes: SNEAKER_SIZES,
    availability: "unknown",
    isNew: true,
    bestSeller: false,
    description:
      "Versão preta do Portofino, com língua em prata metalizada e sola branca. Contraste elegante para uso diário.",
    details: [
      "Pele preta com acabamento mate",
      "Detalhe metalizado na língua",
      "Lettering Dolce & Gabbana no calcanhar",
      "Sola branca em borracha",
    ],
    createdAt: "2026-08-11",
  },
  {
    id: "4",
    slug: "nike-air-force-1-07-white",
    name: "NIKE AIR FORCE 1 '07 WHITE",
    price: 129,
    category: "sneakers",
    style: "everyday",
    images: [af1White.url, af1Black.url],
    sizes: SNEAKER_SIZES,
    availability: "in_stock",
    isNew: true,
    bestSeller: true,
    description:
      "O clássico total white que nunca sai de moda. Pele lisa, perfurações no antepé e amortecimento Nike Air.",
    details: [
      "Parte superior em pele",
      "Amortecimento Nike Air na entressola",
      "Sola em borracha com padrão pivot",
      "Corte low-top unissexo",
    ],
    createdAt: "2026-08-10",
  },
  {
    id: "5",
    slug: "nike-air-force-1-07-black",
    name: "NIKE AIR FORCE 1 '07 BLACK",
    price: 129,
    category: "sneakers",
    style: "everyday",
    images: [af1Black.url, af1White.url],
    sizes: SNEAKER_SIZES,
    availability: "in_stock",
    isNew: false,
    bestSeller: true,
    description:
      "Air Force 1 em total black, com detalhes prateados nos ilhoses. Versátil, resistente e sempre atual.",
    details: [
      "Pele preta com Swoosh tonal",
      "Amortecimento Nike Air",
      "Sola em borracha",
      "Corte low-top unissexo",
    ],
    createdAt: "2026-08-05",
  },
  {
    id: "9",
    slug: "adidas-samba-og-white-gum",
    name: "ADIDAS SAMBA OG WHITE GUM",
    price: 139,
    category: "sneakers",
    style: "everyday",
    images: [sambaOg.url, edit1],
    sizes: SNEAKER_SIZES,
    availability: "low_stock",
    isNew: true,
    bestSeller: true,
    description:
      "Samba OG em pele branca com três riscas pretas, biqueira em camurça e sola gum. O clássico terrace que domina as ruas.",
    details: [
      "Pele branca com três riscas pretas",
      "Biqueira em camurça (T-toe)",
      "Sola gum de borracha",
      "Corte low-top unissexo",
    ],
    createdAt: "2026-08-09",
  },
  {
    id: "10",
    slug: "new-balance-530-white-silver",
    name: "NEW BALANCE 530 WHITE SILVER",
    price: 149,
    category: "sneakers",
    style: "sport",
    images: [nb530.url, edit2],
    sizes: SNEAKER_SIZES,
    availability: "in_stock",
    isNew: true,
    bestSeller: false,
    description:
      "New Balance 530 em branco, prateado e navy. Estética retro running com amortecimento ABZORB para uso diário.",
    details: [
      "Malha e sintético com detalhes prateados",
      "Amortecimento ABZORB",
      "Logo N em relevo",
      "Corte low-top unissexo",
    ],
    createdAt: "2026-08-07",
  },

  {
    id: "6",
    slug: "m-shop-cap-01",
    name: "M-SHOP CAP 01",
    price: 25,
    category: "acessorios",
    style: "essentials",
    images: [p6, edit2],
    sizes: ["Tamanho único"],
    availability: "in_stock",
    isNew: false,
    bestSeller: true,
    description: "Boné de seis painéis em sarja de algodão, com fecho ajustável.",
    details: ["100% algodão", "Fecho metálico ajustável", "Aba pré-curvada"],
    createdAt: "2026-07-20",
  },
  {
    id: "7",
    slug: "m-shop-essential-tee",
    name: "M-SHOP ESSENTIAL TEE",
    price: 35,
    category: "acessorios",
    style: "essentials",
    images: [p7, edit1],
    sizes: APPAREL_SIZES,
    availability: "in_stock",
    isNew: true,
    bestSeller: false,
    description: "T-shirt oversized em algodão pesado, com caimento estruturado.",
    details: ["Algodão 240 g/m²", "Corte oversized", "Gola canelada reforçada"],
    createdAt: "2026-08-14",
  },
  {
    id: "8",
    slug: "m-shop-utility-bag",
    name: "M-SHOP UTILITY BAG",
    price: 45,
    category: "acessorios",
    style: "everyday",
    images: [p8, edit2],
    sizes: ["Tamanho único"],
    availability: "low_stock",
    isNew: false,
    bestSeller: false,
    description: "Bolsa crossbody em nylon técnico com dois compartimentos com fecho.",
    details: ["Nylon resistente à água", "Alça ajustável", "Dois compartimentos com fecho"],
    createdAt: "2026-07-15",
  },
];

export const categories = [
  { slug: "sneakers", label: "SNEAKERS", image: af1White.url },
  { slug: "acessorios", label: "ACESSÓRIOS", image: p6 },
  { slug: "new-in", label: "NEW IN", image: sambaOg.url },
  { slug: "best-sellers", label: "BEST SELLERS", image: mcqueenA.url },
];

export const styles = [
  { slug: "everyday", label: "EVERYDAY" },
  { slug: "street", label: "STREET" },
  { slug: "sport", label: "SPORT" },
  { slug: "essentials", label: "ESSENTIALS" },
];

export const availabilityLabel: Record<Availability, string> = {
  in_stock: "Disponível",
  low_stock: "Últimas unidades",
  unknown: "Disponibilidade a confirmar",
};

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getByCategorySlug(slug: string) {
  if (slug === "new-in") return products.filter((p) => p.isNew);
  if (slug === "best-sellers") return products.filter((p) => p.bestSeller);
  return products.filter((p) => p.category === slug);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}
