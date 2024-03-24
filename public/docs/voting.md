
# Voting API

Hi there, in this document we will learn how to use api for votes.

### Base URL
`https:/ismcserver.online/`

---

## GET /api/votes

Get votes information about username votes for your server.

### Authorization

This endpoint requires the use of a token, which is generated from the server panel. Insert the token in the `Authorization` header.

### Search Parameters

You can use the following parameters to filter the results:

| Parameter | Type | Description                                                | Required |
|-----------| --- |------------------------------------------------------------|----------|
| nick      | string | The nickname of the player.                                | No       |
| hours    | number | The number of hours to search for.                         | No       |
| thisMonth | boolean | If true, the search will be limited to the current month.  | No       |

if `hours` and `thisMonth` are specified, api will use `thisMonth` parameter.
