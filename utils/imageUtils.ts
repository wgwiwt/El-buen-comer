// Mapping of categories to specific high-quality Unsplash Image IDs/URLs
// We use specific photos to ensure the "Aesthetic" fits the requested quality

const CATEGORY_MAP: Record<string, { gourmet: string[], community: string[] }> = {
  steak: {
    gourmet: [
      "https://images.unsplash.com/photo-1546833999-b9f581612b66?auto=format&fit=crop&q=80&w=800", // Dark steak
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800", // Fine dining steak
      "https://images.unsplash.com/photo-1504973960431-1c46b84542d5?auto=format&fit=crop&q=80&w=800", // Plated meat
    ],
    community: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800", // BBQ Ribs
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&q=80&w=800", // Meat platter
      "https://images.unsplash.com/photo-1558030006-4506719b740f?auto=format&fit=crop&q=80&w=800", // Steak grill
    ]
  },
  sushi: {
    gourmet: [
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800", // High end sushi dark
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=800", // Omakase
      "https://images.unsplash.com/photo-1617196034496-64ac500f31a5?auto=format&fit=crop&q=80&w=800", // Sushi art
    ],
    community: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=800", // Sushi plate bright
      "https://images.unsplash.com/photo-1583623025817-d180a4795b29?auto=format&fit=crop&q=80&w=800", // Rolls
    ]
  },
  seafood: {
    gourmet: [
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=800", // Oysters/Plating
      "https://images.unsplash.com/photo-1615141982880-1313d41813d1?auto=format&fit=crop&q=80&w=800", // Fancy fish
      "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=800", // Lobster
    ],
    community: [
      "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800", // Fried fish / Fish & chips
      "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=800", // Seafood boil/paella
    ]
  },
  italian: {
    gourmet: [
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800", // Plated pasta
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800", // Green pasta
    ],
    community: [
      "https://images.unsplash.com/photo-1579631542720-3a87824fff86?auto=format&fit=crop&q=80&w=800", // Spaghetti tomato
      "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&q=80&w=800", // Pizza box/slice
    ]
  },
  pizza: {
    gourmet: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800", // Gourmet pizza
      "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&q=80&w=800", // Pizza oven
    ],
    community: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800", // Cheesy pizza
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800", // Pizza
    ]
  },
  burger: {
    gourmet: [
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800", // Fancy burger
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800", // Gourmet burger
    ],
    community: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800", // Street burger
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800", // Burger & fries
    ]
  },
  asian: {
    gourmet: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800", // Modern asian interior
      "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800", // Dim sum basket
    ],
    community: [
      "https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&q=80&w=800", // Ramen
      "https://images.unsplash.com/photo-1626804475297-411dbe169c66?auto=format&fit=crop&q=80&w=800", // Noodles box
    ]
  },
  wine: {
    gourmet: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800", // Wine glass dark
      "https://images.unsplash.com/photo-1474722883778-792e799291f6?auto=format&fit=crop&q=80&w=800", // Barrels
    ],
    community: [
      "https://images.unsplash.com/photo-1569937756447-e1544265cc7f?auto=format&fit=crop&q=80&w=800", // Friends drinking
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800", // Toast
    ]
  },
  cocktail: {
    gourmet: [
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800", // Dark cocktail
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800", // Fancy drink
    ],
    community: [
      "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?auto=format&fit=crop&q=80&w=800", // Colorful drink
      "https://images.unsplash.com/photo-1536935338788-843bb6d8d94e?auto=format&fit=crop&q=80&w=800", // Beer/Drink
    ]
  },
  coffee: {
    gourmet: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800", // Coffee beans/dark
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800", // Latte art
    ],
    community: [
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=800", // Cafe view
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800", // Mug
    ]
  },
  tapas: {
    gourmet: [
      "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&q=80&w=800", // Fancy plating
      "https://images.unsplash.com/photo-1541544744-378ca6e3679f?auto=format&fit=crop&q=80&w=800", // Small plates
    ],
    community: [
      "https://images.unsplash.com/photo-1621855662706-c870956923b7?auto=format&fit=crop&q=80&w=800", // Pinxtos
      "https://images.unsplash.com/photo-1536304993881-ffc02132e6f3?auto=format&fit=crop&q=80&w=800", // Platter
    ]
  },
  modern: {
    gourmet: [
      "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&q=80&w=800", // Minimalist food
      "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?auto=format&fit=crop&q=80&w=800", // Modern decor
    ],
    community: [
      "https://images.unsplash.com/photo-1554679665-f5537f187268?auto=format&fit=crop&q=80&w=800", // Bright cafe
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800", // Friends
    ]
  },
  default: {
    gourmet: [
       "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800", // Dark interior
       "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800", // French cuisine
       "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800", // Cocktail
       "https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&q=80&w=800", // Ribs/Dark
       "https://images.unsplash.com/photo-1424847651672-bf202175b63a?auto=format&fit=crop&q=80&w=800", // Elegant food
    ],
    community: [
       "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800", // Bright interior
       "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800", // Restaurant generic
       "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800", // Lively
       "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?auto=format&fit=crop&q=80&w=800", // Outdoor
       "https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&q=80&w=800", // Cheerful
    ]
  }
};

export const getRestaurantImage = (name: string, isGourmet: boolean, category?: string): string => {
  // 1. Determine the image set based on category
  const safeCategory = category ? category.toLowerCase().trim() : 'default';
  
  // Find the matching key in our map (partial match or exact)
  const matchedKey = Object.keys(CATEGORY_MAP).find(k => safeCategory.includes(k)) || 'default';
  
  const targetArray = isGourmet 
    ? (CATEGORY_MAP[matchedKey]?.gourmet || CATEGORY_MAP['default'].gourmet)
    : (CATEGORY_MAP[matchedKey]?.community || CATEGORY_MAP['default'].community);

  // 2. Select specific image deterministically based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Ensure we always have an image even if array is empty (unlikely with default)
  if (!targetArray || targetArray.length === 0) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800";
  }

  const index = Math.abs(hash) % targetArray.length;
  
  return targetArray[index];
};