# **[IsMcServer.online](https://ismcserver.online/)**

This is a server-side rendered, fullstack app built with **_[remix](https://remix.run)_**. UI by **_[Chakra-ui](https://chakra-ui.com/)_**.

### Routes overview

- `/` is the homepage. It contains some information about the website and an expandable area that contains information about the Discord bot.
- `/*`, where * is a Minecraft server address.
- `/bedrock/*` is the same as above but allows users to check Bedrock servers.
- `/popular-servers` has a list of the most played premium Minecraft servers.
- `/faq` is a frequently asked questions page. It contains the most commonly asked questions and their answers in very simple and understandable words.
- `/api` is our free-to-use API. Users can join our Discord server, generate a new token, and use our API on their own.
- `/tos` is a simple terms of service page.
- `/dashboard` is a web dashboard for our Discord bot.
- `/dashboard/*` is a web dashboard for a guild, where * is a guild ID.
- `/login` is a login route that allows users to log in via Discord and continue to the dashboard.
- `/api/*` is an API resource folder. It is used to integrate with the Discord token bot, popular servers API, Discord authorization, and a few interactions on the page.
