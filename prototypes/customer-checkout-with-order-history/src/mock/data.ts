import type { Order, OrderLine, Product } from "./types";

const ADJ = ["Pine", "Slate", "Coral", "Amber", "Birch"];
const NOUN = [
  "desk lamp",
  "notebook",
  "water bottle",
  "backpack",
  "headphones",
  "coffee mug",
  "keyboard",
  "mouse pad",
  "plant pot",
  "tote bag",
  "phone stand",
  "wall clock",
  "candle",
  "blanket",
  "cushion",
  "umbrella",
  "pen set",
  "sketchbook",
  "speaker",
  "desk organiser",
];

/** 100 synthetic products. p97/p98 are price-range test items, p100 is not purchasable. */
export const PRODUCTS: Product[] = Array.from({ length: 100 }, (_, i) => {
  const adj = ADJ[Math.floor(i / 20)] ?? "Sample";
  const noun = NOUN[i % 20] ?? "item";
  const id = `p${i + 1}`;
  let name = `${adj} ${noun}`;
  let priceCents = 499 + ((i * 937) % 9000);
  let purchasable = true;
  if (id === "p97") {
    name = "Synthetic bulk crate (test data)";
    priceCents = 6_000_000;
  }
  if (id === "p98") {
    name = "Synthetic sample card (test data)";
    priceCents = 25;
  }
  if (id === "p100") {
    name = "Retired demo item (test data)";
    purchasable = false;
  }
  return {
    id,
    name,
    description: `Synthetic description for ${name}. This is mock data for the prototype only.`,
    priceCents,
    purchasable,
  };
});

export const DEFAULT_CART_IDS: Array<[string, number]> = [
  ["p3", 2],
  ["p12", 1],
  ["p27", 3],
];

function pickLines(i: number): OrderLine[] {
  const count = 1 + (i % 3);
  const lines: OrderLine[] = [];
  for (let k = 0; k < count; k += 1) {
    const p = PRODUCTS[(i * 7 + k * 13) % 90];
    if (!p) continue;
    lines.push({
      productId: p.id,
      name: p.name,
      qty: 1 + ((i + k) % 3),
      unitCents: p.priceCents,
    });
  }
  return lines;
}

const DAY = 86_400_000;

/** Synthetic order history: 45 visible orders plus hidden cancelled and expired ones. */
export function seedOrders(base: number): Order[] {
  const out: Order[] = [];
  for (let n = 1; n <= 50; n += 1) {
    const i = n - 1;
    let lines = pickLines(i);
    if (n === 12) {
      // J-15: snapshot differs from the live product p12 (renamed and repriced since).
      lines = [
        {
          productId: "p12",
          name: "Legacy name: Pine wall clock",
          qty: 1,
          unitCents: 1999,
        },
      ];
    }
    let status: Order["status"] = "paid";
    if (n % 9 === 4 && n <= 45) status = "failed";
    if (n === 46 || n === 47 || n === 48) status = "cancelled";
    if (n === 49 || n === 50) status = "expired";
    const paid = status === "paid";
    out.push({
      id: `o-${n}`,
      number: `SH-${10000 + n}`,
      createdAt:
        base - n * 36 * 3_600_000 - ((n * 7919) % 600) * 60_000 - DAY / 2,
      status,
      lines,
      totalCents: lines.reduce((a, l) => a + l.qty * l.unitCents, 0),
      cartSignature: `seed-${n}`,
      hasSession: false,
      card: paid && n % 3 !== 0 ? { brand: "Visa", last4: "4242" } : null,
      failure: status === "failed" ? "declined" : null,
      cancelReturn: false,
      resolveAt: null,
      resolveTo: null,
    });
  }
  return out;
}
