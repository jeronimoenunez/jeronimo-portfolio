export type Project = {
  slug: string;
  title: string;
  category: string;  // "Residential", "Multi-residential", etc.
  year: string;      // "2025"
  image: {
    src: string;
    alt: string;
  };
};

export const projects: Project[] = [
  // {
  //   slug: "filabe",
  //   title: "Filabe",
  //   category: "Real State",
  //   year: "2025",
  //   image: { src: "https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg", alt: "Proyecto web de Real State Filabe" },
  // },
  {
    slug: "vma",
    title: "VMA Rental S.R.L",
    category: "Plataforma Industrial",
    year: "2025",
    image: { src: "/img/VMA-1.webp", alt: "Proyecto web de Maquinaria industrial VMA rental srl" },
  },
  {
    slug: "tierras-nuestras",
    title: "Tierras Nuestras",
    category: "Plataforma Comercial",
    year: "2024",
    image: { src: "/img/TN-1.webp", alt: "Proyecto web de plataforma comercial de Tierras Nuestras" },
  },
];