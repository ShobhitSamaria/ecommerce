const PRODUCTS = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        category: "Mobile Phones",
        price: 134900,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
        description: "The ultimate iPhone. Forged in titanium. Features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
        stock: 10
    },
    {
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        category: "Mobile Phones",
        price: 129999,
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
        description: "Unleash your creativity, productivity, and possibility with the Samsung Galaxy S24 Ultra. Featuring AI-powered features and the S Pen.",
        stock: 15
    },
    {
        id: 3,
        name: "MacBook Air M2",
        category: "Laptops",
        price: 114900,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80",
        description: "Supercharged by M2. Strikingly thin and fast so you can work, play, or create just about anything — anywhere.",
        stock: 8
    },
    {
        id: 4,
        name: "Dell XPS 13",
        category: "Laptops",
        price: 145000,
        image: "https://images.unsplash.com/photo-1593642632823-8f78536709c7?w=500&q=80",
        description: "Our smallest 13-inch laptop features a borderless display and long battery life, making it the perfect companion for on-the-go productivity.",
        stock: 5
    },
    {
        id: 5,
        name: "iPad Pro 12.9",
        category: "Tablets",
        price: 112900,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80",
        description: "The ultimate iPad experience. Now with the M2 chip, next-level Apple Pencil hover experience, and ProRes video capture.",
        stock: 12
    },
    {
        id: 6,
        name: "Samsung Galaxy Tab S9",
        category: "Tablets",
        price: 72999,
        image: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=500&q=80",
        description: "Set a new standard for premium tablets. With a Dynamic AMOLED 2X display, it's durable and water-resistant.",
        stock: 20
    }
];

const CATEGORIES = [
    { 
        name: "Mobile Phones", 
        icon: "smartphone", 
        description: "Latest smartphones and devices",
        bgColor: "bg-blue-50" 
    },
    { 
        name: "Laptops", 
        icon: "laptop", 
        description: "Powerful computers for work & play",
        bgColor: "bg-purple-50"
    },
    { 
        name: "Tablets", 
        icon: "tablet", 
        description: "Portable touch devices",
        bgColor: "bg-green-50"
    }
];
export { PRODUCTS, CATEGORIES };