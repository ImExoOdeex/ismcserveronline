export interface MinecraftImage {
    name: string;
    url: string;
    credits: string;
}

const images = [
    {
        name: "Bamboo Forest",
        url: "/bamboo-forest.jpg",
        credits: "https://chillcrafting.tumblr.com/post/187758662713"
    },
    {
        name: "Grassy Pyramid",
        url: "/grassy-pyramid.png",
        credits: "https://chillcrafting.tumblr.com/post/682632057031196672"
    },
    {
        name: "Mesa House",
        url: "/mesa-house.png",
        credits: "https://chillcrafting.tumblr.com/post/682541451206393856"
    },
    {
        name: "Market",
        url: "/market.png",
        credits: "https://chillcrafting.tumblr.com/post/635786478032683009"
    }
] satisfies MinecraftImage[];

export function getRandomMinecraftImage(): MinecraftImage {
    return images[Math.floor(Math.random() * images.length)];
}
