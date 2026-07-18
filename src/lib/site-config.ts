// Central place for restaurant identity used across the site.
// Update these values here and they propagate everywhere.

export const site = {
  name: "Demo Restaurant",
  shortName: "Demo Restaurant",
  tagline: "Where every bite feels like home",
  description:
    "Demo Restaurant in Shakargarh serves premium BBQ, Chinese, Continental and authentic Pakistani cuisine. Dine-in, takeaway and delivery on Noor Kot Road.",
  address: {
    line1: "Noor Kot Road, Gamtala Chowk",
    city: "Shakargarh",
    region: "Punjab",
    postalCode: "51800",
    country: "Pakistan",
  },
  phones: [
    { label: "Reservations", number: "0300 1212790", tel: "+923001212790" },
    { label: "Orders", number: "0300 1212283", tel: "+923001212283" },
    { label: "Orders", number: "0300 1212928", tel: "+923001212928" },
  ],
  whatsapp: "+923001212790",
  whatsappMessage: "Hi Demo Restaurant, I'd like to place an order.",
  email: "hello@demorestaurant.com",
  hours: [
    { day: "Monday – Thursday", time: "11:00 AM – 12:00 AM" },
    { day: "Friday", time: "2:00 PM – 12:00 AM" },
    { day: "Saturday – Sunday", time: "11:00 AM – 1:00 AM" },
  ],
  social: {
    facebook: { url: "https://facebook.com/demorestaurant", enabled: true },
    instagram: { url: "https://instagram.com/demorestaurant", enabled: true },
    tiktok: { url: "https://tiktok.com/@demorestaurant", enabled: false },
    youtube: { url: "", enabled: false },
  },
  mapEmbed:
    "https://www.google.com/maps?q=Dream+Cafe+%26+Restaurant+Noor+Kot+Road+Shakargarh&output=embed",
  priceRangeLabel: "Rs 1,000 – 2,000 / person",
} as const;

export const nav = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/reservations", label: "Reservations" },
  { to: "/gallery", label: "Gallery" },
  { to: "/offers", label: "Offers" },
  { to: "/blog", label: "Blog" },
  { to: "/reviews", label: "Reviews" },
  { to: "/track", label: "Track Order" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function whatsappLink(message?: string, number?: string) {
  const num = (number ?? site.whatsapp).replace(/[^\d]/g, "");
  const text = message ?? site.whatsappMessage;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
