export type BookRecord = {
  slug: string;
  title: string;
  author: string;
  illustrator?: string;
  age: string;
  school?: string;
  level: string;
  series: string;
  theme: string;
  color: string;
  accent: string;
  image?: string;
  price?: number;
  note?: string;
  description?: string;
};

export const catalogBooks: BookRecord[] = [
  { slug: "casi-medio-ano", title: "¡Casi medio año!", author: "M. B. Brozon", illustrator: "David Espinosa «El Dee»", age: "9+", school: "Primaria", level: "Nivel 3", series: "Trotamundos", theme: "Aventura", color: "#f6b94b", accent: "#145f63", image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2026/06/416iKU4NpnL._SY445_SX342_ML2_.jpg", price: 249, note: "Una historia sobre crecer, hacer amigos y encontrar la propia voz.", description: "La suerte puso en manos de Santiago el cuaderno donde empezó a escribir este diario. En él cuenta las cosas que vive cualquier niño de su edad: sus travesuras, su primera novia, cómo son los días con su familia y los juegos con sus amigos." },
  { slug: "chiflagoras", title: "Chiflágoras", author: "Irma Ibarra", age: "6+", level: "Nivel 2", series: "El Barco de Vapor", theme: "Imaginación", color: "#ef6f61", accent: "#f9e6b8", image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2026/06/228697-Chiflagoras-600x913.webp", price: 199, note: "Palabras juguetonas para leer en voz alta y dejar volar la imaginación." },
  { slug: "xocolatl", title: "Xocolátl", author: "Enrique Escalona", age: "9+", level: "Nivel 4", series: "Trotamundos", theme: "Identidad", color: "#9c6bba", accent: "#f7ce5b", image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2026/06/227928-XOCOLATL-600x950.webp", price: 229, note: "Una aventura de identidad, memoria y pertenencia con sabor mexicano." },
  { slug: "como-se-siente-osito", title: "¿Cómo se siente Osito?", author: "Carles Ballesteros", age: "0–5", level: "Primeros lectores", series: "Álbumes", theme: "Emociones", color: "#7aaed6", accent: "#fff2cf", image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2025/01/175652-197x300.jpg", price: 179, note: "Una primera conversación sobre las emociones cotidianas." },
  { slug: "grimorio", title: "Grimorio", author: "Ana Romero", age: "9+", level: "Nivel 4", series: "Loran", theme: "Fantasía", color: "#24566a", accent: "#efb04d", image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2025/01/196633-189x300.jpg", price: 229, note: "Fórmulas mágicas, secretos y una lectura para conversar en grupo." },
  { slug: "donde-surgen-las-sombras", title: "Donde surgen las sombras", author: "David Lozano", age: "Bachillerato", level: "Juvenil", series: "Gran Angular", theme: "Misterio", color: "#37334f", accent: "#ed7d70", image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2025/01/174103-197x300.jpg", price: 249, note: "Suspenso juvenil para lectores que buscan una historia intensa." },
];

export const sectionBooks = catalogBooks;
export const featuredBook = { ...catalogBooks[0], title: "¡Casi medio año! Edición especial 30 aniversario", theme: "Aventura · Crecimiento · Escuela", description: catalogBooks[0].description ?? "" };

export function getBookBySlug(slug: string | null | undefined) {
  return catalogBooks.find((book) => book.slug === slug) ?? featuredBook;
}
