export interface MinecraftImage {
    name: string;
    url: string;
    credits: string;
}

const images = [
    {
        name: "Bamboo Forest",
        url: "https://64.media.tumblr.com/5d1e299f7d47f1e9ec26ffe3e924d670/tumblr_pxw1tnbCqT1y7ei2ho2_1280.png",
        credits: "https://chillcrafting.tumblr.com/post/187758662713"
    },
    {
        name: "Grassy Pirramid",
        url: "https://64.media.tumblr.com/53984e850b2a859fca369c5d14183d76/2b502819bed4dc9d-3d/s1280x1920/75328452522a16e40a08bffd0aa8f060914050b5.png",
        credits: "https://chillcrafting.tumblr.com/post/682632057031196672"
    },
    {
        name: "Mesa House",
        url: "https://64.media.tumblr.com/1b2de4b3211f36776a7c150103708063/6fe88e95ceb3044d-93/s1280x1920/4a3598a214d455cc756213e0df51152e672350b9.png",
        credits: "https://chillcrafting.tumblr.com/post/682541451206393856"
    },
    {
        name: "Underwater",
        url: "https://cdn.ismcserver.online/tumblr_0d76b3fea4b8d1af66c90b05a4764c5a_f330cd0d_500.png",
        credits: "https://chillcrafting.tumblr.com/post/644735831106535424"
    },
    {
        name: "Market",
        url: "https://64.media.tumblr.com/e2f882f862e618f2ca9e844a36d28e6e/387b360bf4fd922a-78/s1280x1920/7588fcb6ee6930229e96ada8b4c762b46f9cd6ae.png",
        credits: "https://chillcrafting.tumblr.com/post/635786478032683009"
    }
] satisfies MinecraftImage[];

export function getRandomMinecarftImage(): MinecraftImage {
    return images[Math.floor(Math.random() * images.length)];
}
