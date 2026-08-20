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
    slug: "m-shop-court-02",
    name: "M-SHOP COURT 02",
    price: 89,
    category: "sneakers",
    style: "everyday",
    images: [p1, edit1],
    sizes: SNEAKER_SIZES,
    availability: "in_stock",
    isNew: true,
    bestSeller: true,
    description:
      "Silhueta court em pele lisa branca com sola robusta. Um clássico limpo que combina com tudo.",
    details: ["Parte superior em pele sintética premium", "Sola em borracha de perfil alto", "Interior acolchoado", "Corte low-top unissexo"],
    createdAt: "2026-08-12",
  },
  {
    id: "2",
    slug: "m-shop-mono-01",
    name: "M-SHOP MONO 01",
    price: 95,
    category: "sneakers",
    style: "street",
    images: [p2, edit2],
    sizes: SNEAKER_SIZES,
    availability: "in_stock",
    isNew: true,
    bestSeller: false,
    description:
      "Total black, sem ruído. Construção minimalista para quem quer discrição com atitude.",
    details: ["Acabamento total black", "Sola vulcanizada", "Atacadores em algodão encerado", "Corte low-top unissexo"],
    createdAt: "2026-08-10",
  },
  {
    id: "3",
    slug: "m-shop-street-03",
    name: "M-SHOP STREET 03",
    price: 110,
    category: "sneakers",
    style: "street",
    images: [p3, edit1],
    sizes: SNEAKER_SIZES,
    availability: "low_stock",
    isNew: true,
    bestSeller: true,
    description:
      "Contraste preto e branco com sola oversized. Presença imediata em qualquer look.",
    details: ["Pele com acabamento mate", "Sola oversized 4 cm", "Reforço no calcanhar", "Corte low-top unissexo"],
    createdAt: "2026-08-08",
  },
  {
    id: "4",
    slug: "m-shop-runner-01",
    name: "M-SHOP RUNNER 01",
    price: 99,
    category: "sneakers",
    style: "everyday",
    images: [p4, edit2],
    sizes: SNEAKER_SIZES,
    availability: "in_stock",
    isNew: true,
    bestSeller: false,
    description:
      "Runner retro em camurça e nylon com sola gum. Conforto diário com leitura vintage.",
    details: ["Camurça e nylon", "Sola gum de borracha", "Palmilha amortecida", "Corte low-top unissexo"],
    createdAt: "2026-08-06",
  },
  {
    id: "5",
    slug: "m-shop-tech-05",
    name: "M-SHOP TECH 05",
    price: 125,
    category: "sneakers",
    style: "sport",
    images: [p5, edit1],
    sizes: SNEAKER_SIZES,
    availability: "unknown",
    isNew: false,
    bestSeller: true,
    description:
      "Chunky runner em malha técnica e detalhes prateados. Volume, tecnologia e street.",
    details: ["Malha técnica respirável", "Detalhes refletores", "Entressola de duas densidades", "Corte low-top unissexo"],
    createdAt: "2026-07-28",
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
  { slug: "sneakers", label: "SNEAKERS", image: p3 },
  { slug: "acessorios", label: "ACESSÓRIOS", image: p6 },
  { slug: "new-in", label: "NEW IN", image: p4 },
  { slug: "best-sellers", label: "BEST SELLERS", image: p1 },
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
