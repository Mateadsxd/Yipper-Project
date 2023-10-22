# Yipper API Documentation

The Yipper API provides endpoints for retrieving yip data, searching for specific yips, accessing user-specific yip data,
updating yip likes, and adding new yips with detailed request formats, examples, and data formats for each endpoint.

## Get all yip data or yip data matching a given search term

**Request Format:** /yipper/yips

**Query Parameters:** search

**Request Type:** GET

**Returned Data Format**: JSON

**Description 1:** Retrieves all yip data available or yip data matching a given search term, returning a JSON object containing yip details such as ID, name, yip content, hashtag, likes, and date.

**Example Request 1:** /yipper/yips

**Example Output 1:**
``` json
{
  "yips":[
    {
      "id": 25,
      "name": "Mister Fluffers",
      "yip": "It is sooooo fluffy I am gonna die",
      "hashtag": "fluff",
      "likes": 6,
      "date": "2020-07-07 03:48:28"
    },
    {
      "id": 24,
      "name": "Sir Barks a Lot",
      "yip": "Imagine if my name was sir barks a lot and I was meowing all day haha",
      "hashtag": "clown",
      "likes": 6,
      "date": "2020-07-06 00:55:08"
    },
    ...
  ]
}
```

**Error Handling 1:**

- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `An error occurred on the server. Try again later.`

**Description 2:** Retrieves yip data matching a specific search term, returning a JSON object with the IDs of the matching yips.

**Example Request 2:** /yipper/yips?search=if

**Example Output 2:**
``` json
{
  "yips" : [
    {
      "id": 8
    },
    {
      "id": 24
    }
  ]
}

```

**Error Handling 2:**

- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `An error occurred on the server. Try again later.`

## Get yip data for a designated user

**Request Format:** /yipper/user/:user

**Query Parameters:** none.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves yip data for a designated user specified in the request URL, returning a JSON object containing yip details including the user's name, yip content, associated hashtag, and the date of each yip.

**Example Request:** /yipper/user/Chewbarka

**Example Output:**
```json
[
  {
    "name": "Chewbarka",
    "yip": "chewy or soft cookies. I chew them all",
    "hashtag": "largebrain",
    "date": "2020-07-09 22:26:38",
  },
  {
    "name": "Chewbarka",
    "yip": "Every snack you make every meal you bake every bite you take... I will be watching you.",
    "hashtag": "foodie",
    "date": "2019-06-28 23:22:21"
  }
]
```

**Error Handling:**
- Possible 404 (not found) error (All plain text) :
  - If a request to /yipper/user/:user is made and user is not an existing name of the Yipper site, the service will turn `Yikes. User does not exist.`.
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `An error occurred on the server. Try again later.`

## Update the likes for a designated yip

**Request Format:** /yipper/likes

**Body Parameters:** id

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Updates the number of likes for a designated yip by sending a POST request to the /yipper/likes endpoint with the yip's ID provided in the request body parameters, returning the updated number of likes as plain text.

**Example Request:** /yipper/likes

**Example Output:**
```

8

```

**Error Handling:**

- Possible 400 (invalid request) errors (all plain text):
  - If request is missing one (or more) of the required parameters, the service responds in plain text with the message `Missing one or more of the required params.`.
- Possible 404 (not found) error (All plain text):
  - If a request to yipper/likes is made with an invalid id, the service responds in plain text with the message `Yikes. ID does not exist.`.
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `An error occurred on the server. Try again later.`

## Add a new yip

**Request Format:** /yipper/new

**Body Parameters:** name and full

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Adds a new yip with the name and full content provided in the request body parameters, returning a JSON object containing the newly created yip's ID, name, yip content, associated hashtag, number of likes (initialized as 0), and the date of creation.

**Example Request:** /yipper/new

**Example Output:**
``` json
{
  "id": 528,
  "name": "Chewbarka",
  "yip": "love to yip allllll day long",
  "hashtag": "coolkids",
  "likes": 0,
  "date": "2020-09-09 18:16:18"
}

```

**Error Handling:**

- Possible 400 (invalid request) errors (all plain text):
  - If request is missing one (or more) of the required parameters, your service should respond in plain text with the message `Missing one or more of the required params.`.
- Possible 404 (not found) error (All plain text):
  - If a request to /yipper/new is made and the name is not an existing name of the Yipper site the service responds in plain text with the message `Yikes. User does not exist.`.
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `An error occurred on the server. Try again later.`
