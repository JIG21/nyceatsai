export type Restaurant = {
    id: number;
    name: string;
    lat: number;
    lng: number;
    neighborhood: string;
    categories: string[];
    rating: number;
    price: string;
    etaMinutes: number;
    image: string;
  };
  
  export const restaurants: Restaurant[] = [
    {
      id: 1,
      name: "Joe's Pizza",
      lat: 40.73061,
      lng: -73.935242,
      neighborhood: "East Village",
      categories: ["Pizza", "🔥 Trending"],
      rating: 4.8,
      price: "$",
      etaMinutes: 20,
      image:
        "https://images.pexels.com/photos/1580466/pexels-photo-1580466.jpeg",
    },
    {
      id: 2,
      name: "Shake Shack Union Square",
      lat: 40.7363,
      lng: -73.9901,
      neighborhood: "Union Square",
      categories: ["🍔 Burgers"],
      rating: 4.6,
      price: "$$",
      etaMinutes: 25,
      image:
        "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg",
    },
    {
      id: 3,
      name: "Blue Ribbon Sushi",
      lat: 40.723301,
      lng: -73.998123,
      neighborhood: "SoHo",
      categories: ["🍣 Sushi"],
      rating: 4.7,
      price: "$$$",
      etaMinutes: 35,
      image:
        "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg",
    },
  ];
  