import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import env from "dotenv";
import { render } from "ejs";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";


const app = express();
const port = 3000;
const SEARCH_API_URL = "https://openlibrary.org/"  
// const COVER_API_URL = "https://covers.openlibrary.org/b/" fetching the cover_id from the above api and have put this api in notes_details.ejs.
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public/"));

async function getAllUserBooks(sorting){
  let result;
  if(sorting){    
    result = await db.query(
      `SELECT * FROM user_books ORDER BY ${sorting} DESC`
    )
  } else {
    result = await db.query(
      "SELECT * FROM user_books"
    )
  }

  return result.rows
}

app.get("/",  async (req, res) => {
  try {
    const sortingParam = req.query.sort;
    const allUserBooks = await getAllUserBooks(sortingParam)
    res.render("index.ejs", {allUserBooks:allUserBooks, totalBookNumber:allUserBooks.length})
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }
});


app.get("/new", (req, res) => {
  res.render("new.ejs")
})

app.post("/new/add",  async (req, res) => {
  const title = req.body.title;
  const dateRead = req.body.dateRead;
  const rating = req.body.rating;
  const review = req.body.review;
  try {
    const search_result = await axios.get(SEARCH_API_URL + `search.json?title=${encodeURIComponent(req.body.title)}`)
    const cover_id = search_result.data.docs[0].cover_i;
    // console.log(cover_id);
    await db.query(
      "INSERT INTO user_books(title, cover_id, date_read, rating, review) VALUES ($1, $2, $3, $4, $5)",
      [title, cover_id, dateRead, rating, review]
    )
    res.redirect("/");
  } catch (error) {
    console.error("Error occured: ", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }
});


app.post("/delete/:id", async (req,res) => {
  const id = req.params.id
  try {
    await db.query("DELETE FROM notes WHERE book_id = $1", [id]);
    await db.query("DELETE FROM user_books WHERE id = $1", [id]);
    res.redirect("/")
  } catch (error) {
    console.error("Error occured: ", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }
})

app.get("/add-note/:id", (req, res) => {
  res.render("note.ejs", {bookId: req.params.id})
})

app.post("/add-note/:id", async (req, res) => {
  const pageNumber= Number(req.body.pageNumber);
  const note = req.body.note
  const bookId = Number(req.params.id)
  try {
    await db.query(
      "INSERT INTO notes(book_id, date_created, note, page_num) VALUES($1, NOW(), $2, $3)",
      [bookId, note, pageNumber]
    );
    res.redirect("/details/" + bookId);
  } catch (error) {
    console.error("Error occured: ", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }
})

app.get("/edit/:id", async (req,res) => {
  const id = Number(req.params.id);
  try {
    const result = await db.query(
      "SELECT id,title,date_read,review,rating FROM user_books WHERE id=$1",
      [id]
    )
    const bookData = result.rows[0]
    res.render("edit.ejs", {bookData: bookData})
  } catch (error) {
    console.error("Error occured: ", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }
})

app.post("/edit/:id", async (req,res) => {
  const id = Number(req.params.id);
  const title = req.body.title;
  const dateRead = req.body.dateRead;
  const rating = req.body.rating;
  const review = req.body.review;
  try {
    await db.query(
      "UPDATE user_books SET title=$1, date_read=$2, rating=$3, review=$4 WHERE id=$5",
      [title, dateRead, rating, review, id]
    )

    res.redirect("/")
  } catch (error) {
    console.error("Error occured: ", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }
})

app.get("/details/:id", async (req,res) => {
  const id = Number(req.params.id)
  try {
    const book = await db.query(
      "SELECT * FROM user_books WHERE id=$1",
      [id]
    );
    const notes = await db.query(
      "SELECT * FROM notes WHERE book_id=$1",
      [id]
      )

    res.render("note_details.ejs", {book:book.rows[0], notes:notes.rows})
  } catch (error) {
    console.error("Error occured: ", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }

})

app.get("/edit-note/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await db.query(
      "SELECT id, page_num, note FROM notes WHERE id=$1",
      [id]
    )
    const noteData = result.rows[0]
    res.render("edit_note.ejs", {noteData: noteData})
  } catch (error) {
    console.error("Error occured: ", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }
})

app.post("/edit-note/:id", async (req, res) => {
  const id = Number(req.params.id);
  const pageNumber = Number(req.body.pageNumber);
  const noteText = req.body.note;
  try {
    await db.query(
      "UPDATE notes SET page_num=$1, note=$2 WHERE id=$3",
      [pageNumber, noteText, id]
    )

    const result_bookid = await db.query(
      "SELECT book_id FROM notes WHERE id=$1",
      [id]
    )
    const book_id = result_bookid.rows[0].book_id
    res.redirect("/details/" + book_id  )
  } catch (error) {
    console.error("Error occured: ", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }
})

app.post("/delete-note/:id", async (req,res) => {
  const id = req.params.id
  try {
    const result_bookid = await db.query(
      "SELECT book_id FROM notes WHERE id=$1",
      [id]
    )
    await db.query("DELETE FROM notes WHERE id = $1", [id]);

    const bookId = result_bookid.rows[0].book_id
    res.redirect("/details/" + bookId)
  } catch (error) {
    console.error("Error occured: ", error.message);
    res.render("index.ejs", {
        error: error.message,
    });
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
 