"use strict";

const cors = require('cors');
const express = require("express");
const app = express();
const multer = require("multer");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");

const HTTP_SERVER_ERROR = 500;
const HTTP_NOT_FOUND = 404;
const HTTP_BAD_REQUEST = 400;
const DEFAULT_PORT = 8000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
app.use(cors());

/**
 * Establishes a database connection to the database and return the databse object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "yipper.db",
    driver: sqlite3.Database
  });
  return db;
}

/**
 * Retrieves yips from the database based on a search keyword.
 * @param {Object} db - The database connection.
 * @param {string} search - The search keyword to match against yip content.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an
 * array of yips matching the search keyword.
 */
async function getYipsBySearch(db, search) {
  const query = `SELECT id FROM yips WHERE yip LIKE ? ORDER BY id`;
  const yips = await db.all(query, [`%${search}%`]);
  return yips;
}

/**
 * Retrieves yips from the database for a specific user.
 * @param {Object} db - The database connection.
 * @param {string} user - The name of the user whose yips to retrieve.
 * @returns {Promise<Array<Object>>} - A promise that resolves to
 * an array of yips for the specified user.
 */
async function getYipsByUser(db, user) {
  const query = `SELECT name, yip, hashtag, date FROM yips WHERE name = ?
  ORDER BY DATETIME(date) DESC`;
  const yips = await db.all(query, user);
  return yips;
}

// Fetches yips from the database based on search query or returns all yips.
app.get("/yipper/yips", async (req, res) => {
  const db = await getDBConnection();

  try {
    const search = req.query.search;

    if (search) {
      const yips = await getYipsBySearch(db, search);
      res.json({yips});
    } else {
      const query = `SELECT id, name, yip, hashtag, likes, date FROM yips
      ORDER BY DATETIME(date) DESC`;
      const yips = await db.all(query);
      res.json({yips});
    }
  } catch (error) {
    res.status(HTTP_SERVER_ERROR).send("An error occurred on the server. Try again later.");
  }
});

// Retrieves yips from the database for a specific user based on username.
app.get("/yipper/user/:user", async (req, res) => {
  const db = await getDBConnection();

  try {
    const user = req.params.user;
    const yips = await getYipsByUser(db, user);

    if (yips.length === 0) {
      res.status(HTTP_NOT_FOUND).send("Yikes. User does not exist.");
      return;
    }

    res.json(yips);
  } catch (error) {
    res.status(HTTP_SERVER_ERROR).send("An error occurred on the server. Try again later.");
  }
});

// Increases the number of likes for a yip with the specified ID.
app.post("/yipper/likes", async (req, res) => {
  const db = await getDBConnection();

  try {
    const id = req.body.id;

    if (!id) {
      res.status(HTTP_BAD_REQUEST).send("Missing one or more of the required params.");
      return;
    }

    let query = `SELECT * FROM yips WHERE id = ?`;
    const yip = await db.get(query, id);

    if (!yip) {
      res.status(HTTP_NOT_FOUND).send("Yikes. ID does not exist.");
      return;
    }

    query = `UPDATE yips SET likes = likes + 1 WHERE id = ?`;
    await db.run(query, id);

    query = `SELECT likes FROM yips WHERE id = ?`;
    const updatedYip = await db.get(query, id);

    res.send(updatedYip.likes.toString());
  } catch (error) {
    res.status(HTTP_SERVER_ERROR).send("An error occurred on the server. Try again later.");
  }
});

// Creates a new yip with the specified name, yip content, and optional hashtag.
app.post("/yipper/new", async (req, res) => {
  const db = await getDBConnection();

  try {
    const name = req.body.name;
    const full = req.body.full;

    if (!name || !full) {
      res.status(HTTP_BAD_REQUEST).send("Missing one or more of the required params.");
      return;
    }

    let query = `SELECT * FROM yips WHERE name = ?`;
    const user = await db.get(query, name);

    if (!user) {
      res.status(HTTP_NOT_FOUND).send("Yikes. User does not exist.");
      return;
    }

    let [yip, hashtag] = full.split("#");
    yip = yip.trim();

    query = `INSERT INTO yips(name, yip, hashtag, likes) VALUES(?, ?, ?, 0)`;
    const result = await db.run(query, [name, yip, hashtag]);

    query = `SELECT * FROM yips WHERE id = ?`;
    const newYip = await db.get(query, result.lastID);

    res.json(newYip);
  } catch (error) {
    res.status(HTTP_SERVER_ERROR).send("An error occurred on the server. Try again later.");
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);
