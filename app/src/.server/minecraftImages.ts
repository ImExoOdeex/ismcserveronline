export interface MinecraftImage {
    name: string;
    url: string;
    credits: string;
}

const images = [
    {
        name: "Bamboo Forest",
        url: "https://cdn.ismcserver.online/tumblr_pxw1tnbCqT1y7ei2ho2_1280.jpg",
        credits: "https://chillcrafting.tumblr.com/post/187758662713"
    },
    {
        name: "Grassy Pyramid",
        url: "https://cdn.ismcserver.online/tumblr_53984e850b2a859fca369c5d14183d76_75328452_1280.png",
        credits: "https://chillcrafting.tumblr.com/post/682632057031196672"
    },
    {
        name: "Mesa House",
        url: "https://cdn.ismcserver.online/tumblr_1b2de4b3211f36776a7c150103708063_4a3598a2_1280.png",
        credits: "https://chillcrafting.tumblr.com/post/682541451206393856"
    },
    {
        name: "Underwater",
        url: "https://cdn.ismcserver.online/tumblr_0d76b3fea4b8d1af66c90b05a4764c5a_f330cd0d_500.png",
        credits: "https://chillcrafting.tumblr.com/post/644735831106535424"
    },
    {
        name: "Market",
        url: "https://cdn.ismcserver.online/tumblr_e2f882f862e618f2ca9e844a36d28e6e_7588fcb6_1280.png",
        credits: "https://chillcrafting.tumblr.com/post/635786478032683009"
    }
] satisfies MinecraftImage[];

export function getRandomMinecarftImage(): MinecraftImage {
    return images[Math.floor(Math.random() * images.length)];
}
