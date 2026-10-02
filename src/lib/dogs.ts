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
  name: string;
  breed: string;
  avatar: string;
  photo_url: string | null;
  medical_alerts: string | null;
  owner_name: string;
  owner_phone: string;
  fingerprint_id: string;
};

// Used by the simulated scanner when no dogs are registered yet.
export const DEMO_DOGS: MatchDog[] = [
  { name: "Μέλο", breed: "Γκόλντεν Ριτρίβερ", avatar: "golden", photo_url: null, medical_alerts: "Χρειάζεται καθημερινά ινσουλίνη", owner_name: "Ελένη (demo)", owner_phone: "+30 690 000 0001", fingerprint_id: "DEMO7A3F91C2" },
  { name: "Μπόμπος", breed: "Μπιγκλ", avatar: "beagle", photo_url: null, medical_alerts: null, owner_name: "Νίκος (demo)", owner_phone: "+30 690 000 0002", fingerprint_id: "DEMO4B8E02D1" },
];

/** Shrinks an uploaded photo so it can be stored directly with the passport. */
export async function resizePhoto(file: File, size = 320): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = url;
  });
  const canvas = document.createElement("canvas");
  const s = Math.min(img.width, img.height);
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
