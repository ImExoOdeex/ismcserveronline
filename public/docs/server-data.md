
# Minecraft Server Data API

Hi there, in this document we will learn how to use api for Minecraft server data.

### Base URL
`https://api.ismcserver.online/`

# Java

---

## GET /:serverAddress

Get server data using standard Minecraft protocol (status). Use this for standard info. Responses are cached for 15 seconds in server memory to prevent spam pinging servers.

## GET /query/:serverAddress

Get server data using query protocol. This protocol can get more detailed information about the server, but server must have query enabled in `server.properties` configuration file. It's also slower than standard protocol. Responses are cached for 15 seconds in server memory to prevent spam pinging servers.



# Bedrock

---

## GET /bedrock/:serverAddress

Get server data using bedrock protocol. Responses aren't cached.

