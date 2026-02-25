export const works: Work[] = [
  { id: "w1", title: "Vision", cover: "/img/BP-2.webp" },
  { id: "w2", title: "Schematic", cover: "/img/R-1.webp" },
  { id: "w3", title: "Archive", cover: "/img/DR-2.webp" },
  { id: "w4", title: "Concept", cover: "/img/BP-1.webp" },
  { id: "w5",  title: "Framework", cover: "/img/EB-1.webp" },
  { id: "w6",  title: "Material",  cover: "/img/EB-2.webp" },
  { id: "w7",  title: "Structure", cover: "/img/VS-1.webp" },
  { id: "w8",  title: "Details",   cover: "/img/M-2.webp" },
  { id: "w9",  title: "Form",      cover: "/img/DR-1.webp" },
  { id: "w10", title: "Light",     cover: "/img/M-1.webp" },
  { id: "w11", title: "Scale",     cover: "/img/TN-2.webp" },
  { id: "w12", title: "Grid",      cover: "/img/VS-2.webp" },
];

export interface Work {
  id: string;
  title: string;
  cover: string;
  href?: string;
}

export interface WorkMotion {
  id: string;
  from: { x: number; y: number; s: number; o?: number };
  to: { x: number; y: number; s: number; o?: number };
  at: { start: number; end: number };
  depth?: number;
}

export const workMotion: WorkMotion[] = [
  {
    id: "w1",
    from: { x: 20, y: 80, s: 0.4, o: 0 },
    to:   { x: 30, y: 30, s: 0.8, o: 1 },
    at:   { start: 0.05, end: 0.4 },
    depth: 1.2,
  },
  {
    id: "w2", 
    from: { x: 80, y: 70, s: 0.3, o: 0 },
    to:   { x: 50, y: 50, s: 1.1, o: 1 }, 
    at:   { start: 0.1, end: 0.5 },
    depth: 0.8,
  },
  {
    id: "w3",
    from: { x: 10, y: 20, s: 0.2, o: 0 },
    to:   { x: 70, y: 25, s: 0.7, o: 1 },
    at:   { start: 0.15, end: 0.45 },
    depth: 1.5,
  },
  {
    id: "w4",
    from: { x: 90, y: 10, s: 0.5, o: 0 },
    to:   { x: 25, y: 65, s: 0.9, o: 1 },
    at:   { start: 0.2, end: 0.6 },
    depth: 0.5,
  },
  {
    id: "w5",
    from: { x: 5,  y: 95, s: 0.25, o: 0 },
    to:   { x: 18, y: 58, s: 0.65, o: 1 },
    at:   { start: 0.08, end: 0.48 },
    depth: 1.3,
  },
  {
    id: "w6",
    from: { x: 110, y: 18, s: 0.30, o: 0 },
    to:   { x: 82,  y: 26, s: 0.72, o: 1 },
    at:   { start: 0.10, end: 0.52 },
    depth: 0.9,
  },
  {
    id: "w7",
    from: { x: -8, y: 40, s: 0.35, o: 0 },
    to:   { x: 12, y: 42, s: 0.78, o: 1 },
    at:   { start: 0.12, end: 0.56 },
    depth: 1.1,
  },
  {
    id: "w8",
    from: { x: 60, y: 102, s: 0.28, o: 0 },
    to:   { x: 56, y: 84,  s: 0.85, o: 1 },
    at:   { start: 0.16, end: 0.62 },
    depth: 0.7,
  },
  {
    id: "w9",
    from: { x: 35, y: 8,  s: 0.22, o: 0 },
    to:   { x: 58, y: 18, s: 0.62, o: 1 },
    at:   { start: 0.18, end: 0.58 },
    depth: 1.4,
  },
  {
    id: "w10",
    from: { x: 98, y: 92, s: 0.26, o: 0 },
    to:   { x: 86, y: 72, s: 0.74, o: 1 },
    at:   { start: 0.20, end: 0.66 },
    depth: 0.6,
  },
  {
    id: "w11",
    from: { x: -12, y: 78, s: 0.30, o: 0 },
    to:   { x: 22,  y: 90, s: 0.70, o: 1 },
    at:   { start: 0.22, end: 0.70 },
    depth: 1.0,
  },
  {
    id: "w12",
    from: { x: 112, y: 40, s: 0.28, o: 0 },
    to:   { x: 104, y: 48, s: 0.68, o: 1 },
    at:   { start: 0.24, end: 0.74 },
    depth: 0.8,
  },
];