import golden from "@/assets/dog-golden.png";
import beagle from "@/assets/dog-beagle.png";
import frenchie from "@/assets/dog-frenchie.png";
import collie from "@/assets/dog-collie.png";

export const AVATARS: Record<string, { src: string; breed: string }> = {
  golden: { src: golden, breed: "Γκόλντεν Ριτρίβερ" },
  beagle: { src: beagle, breed: "Μπιγκλ" },
  frenchie: { src: frenchie, breed: "Γαλλικό Μπουλντόγκ" },
  collie: { src: collie, breed: "Κόλεϊ" },
};

export function avatarSrc(key?: string | null) {
  return AVATARS[key ?? "golden"]?.src ?? golden;
}

export type MatchDog = {
  dog_id: string | null;
  name: string;
  breed: string;
  avatar: string;
  photo_url: string | null;
  medical_alerts: string | null;
  fingerprint_id: string;
  purebred: boolean;
};

export const REGIONS: Record<string, string> = {
  ATTICA: "Αττική",
  THESSALONIKI: "Θεσσαλονίκη",
  HERAKLION: "Ηράκλειο",
  ACHAEA: "Αχαΐα",
  LARISSA: "Λάρισα",
  CHANIA: "Χανιά",
  RHODES: "Ρόδος",
  OTHER_GREECE: "Υπόλοιπη Ελλάδα",
};

// Used by the simulated scanner when no dogs are registered in the chosen region.
export const DEMO_DOGS: MatchDog[] = [
  { dog_id: null, name: "Μέλο", breed: "Γκόλντεν Ριτρίβερ", avatar: "golden", photo_url: null, medical_alerts: "Χρειάζεται καθημερινά ινσουλίνη", fingerprint_id: "DEMO7A3F91C2", purebred: true },
  { dog_id: null, name: "Μπόμπος", breed: "Ημίαιμο", avatar: "beagle", photo_url: null, medical_alerts: null, fingerprint_id: "DEMO4B8E02D1", purebred: false },
];

/** Trust stars for a finder report: shelter = 5; else location 1 + 2nd photo 2 + confident match 2. */
export function reportStars(o: { shelter: boolean; secondPhoto: boolean; score: number; purebred: boolean }) {
  if (o.shelter) return 5;
  let s = 1;
  if (o.secondPhoto) s += 2;
  if (o.score >= (o.purebred ? 90 : 80)) s += 2;
  return s;
}

/** Shrinks an uploaded photo so it can be stored directly with the passport. */
/** Re-encoding through canvas strips EXIF (GPS, device, time); `crop` < 1 keeps a tight centre (dog's head). */
export async function resizePhoto(file: File, size = 320, crop = 1): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = url;
  });
  const canvas = document.createElement("canvas");
  const s = Math.min(img.width, img.height) * crop;
  canvas.width = canvas.height = size;
  canvas.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
  URL.revokeObjectURL(url);
  return canvas.toDataURL("image/jpeg", 0.8);
}

/** Simulated 896-d fingerprint preview (384 DINO + 512 DogFace), deterministic per id. */
export function fakeVector(seed: string, n = 24) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Array.from({ length: n }, (_, i) => {
    h = (h * 1103515245 + 12345 + i) | 0;
    return ((h >>> 8) % 1000) / 1000;
  });
}
