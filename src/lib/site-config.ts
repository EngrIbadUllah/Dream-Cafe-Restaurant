// Central place for restaurant identity used across the site.
// Update these values here and they propagate everywhere.

export const site = {
  name: "Dream Cafe & Restaurant",
  shortName: "Dream Cafe",
  tagline: "Where every bite feels like home",
  description:
    "Dream Cafe & Restaurant in Shakargarh serves premium BBQ, Chinese, Continental and authentic Pakistani cuisine. Dine-in, takeaway and delivery on Noor Kot Road.",
  address: {
    line1: "Noor Kot Road, Gamtala Chowk",
    city: "Shakargarh",
    region: "Punjab",
    postalCode: "51800",
    country: "Pakistan",
  },
  phones: [
    { label: "Reservations", number: "0300 1212790", tel: "+923001212790" },
    { label: "Orders", number: "0300 1212 283", tel: "+923001212283" },
    { label: "Orders", number: "0300 1212 928", tel: "+923001212928" },
  ],
  whatsapp: "+923001212790",
  email: "hello@dreamcafeskg.com",
  hours: [
    { day: "Monday – Thursday", time: "11:00 AM – 12:00 AM" },
    { day: "Friday", time: "2:00 PM – 12:00 AM" },
    { day: "Saturday – Sunday", time: "11:00 AM – 1:00 AM" },
  ],
  social: {
    facebook: "https://facebook.com/dreamcafeskg",
    instagram: "https://instagram.com/dreamcafeskg",
    tiktok: "https://tiktok.com/@dreamcafeskg",
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
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function whatsappLink(message = "Hi Dream Cafe, I'd like to place an order.") {
  const num = site.whatsapp.replace(/[^\d]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
