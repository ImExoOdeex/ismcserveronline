export interface MinecraftImage {
	name: string;
	url: string;
	credits: string;
}

const images = [
	{
		name: "Sleeping Cat",
		url: "https://i.pinimg.com/564x/b1/61/86/b16186708349ead1e9fa67b03d4062c2.jpg",
		credits: "https://pl.pinterest.com/pin/800655640020159683/"
	},
	{
		name: "Minecraft Earth",
		url: "https://i.pinimg.com/564x/1a/3d/9a/1a3d9a91d9db65574d45293160c74eb2.jpg",
		credits: "https://pl.pinterest.com/pin/52354414396762498/"
	},
	{
		name: "Snowy Mountain",
		url: "https://i.pinimg.com/564x/06/e4/ea/06e4ea034033dedfbd8d9c47031ba21d.jpg",
		credits: "https://pl.pinterest.com/pin/603412050082265804/"
	},
	{
		name: "Ender Knights",
		url: "https://i.pinimg.com/564x/14/d3/9e/14d39e5a7d8ca5bd6b8efdc98237a8db.jpg",
		credits: "https://pl.pinterest.com/pin/573575702554061802/"
	},
	{
		name: "Fantasy Oak Tree",
		url: "https://i.pinimg.com/736x/d9/7b/42/d97b42587fee562fc20d601cd46f7022.jpg",
		credits: "https://pl.pinterest.com/pin/484348134942234787/"
	}
] satisfies MinecraftImage[];

export function getRandomMinecarftImage(): MinecraftImage {
	return images[Math.floor(Math.random() * images.length)];
}
