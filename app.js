const express = require('express');
let app = express();
const port = 3000;
const path = require("path");
const Book = require('./models/Book');
const connectDB = require('./config/db');
connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


app.get('/', async (req, res) => {
  const { q } = req.query;
  let books;
  if (q) {
    books = await Book.find({
      $or: [
        { title: new RegExp(q, 'i') },
        { author: new RegExp(q, 'i') }
      ]
    });
  } else {
    books = await Book.find();
  }
  res.render('show', { books, q });
});


app.get("/books/new", (req,res) => {
    res.render("new.ejs");
})

app.get("/books/given", async (req, res) => {
    const books = await Book.find({ givenTo: { $ne: null } });
    res.render("lent.ejs", { books });
});



app.post('/books', async (req, res) => {
  const newBook = new Book({ title, author, coverImage });
  await newBook.save();
  res.redirect('/');
});

app.delete('/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch {
    res.status(400).send('Invalid book id');
  }
});


app.get('/books/:id/given', async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).send('Book not found');
    res.render('give', { book });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
app.get('/books/:id/given', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid book ID');
  }

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).send('Book not found');
    res.render('give', { book });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});



app.post('/books/:id/given', async (req, res) => {
  const { id } = req.params;
  try {
    const { givenTo } = req.body;
    const updatedBook = await Book.findByIdAndUpdate(id, { givenTo });
    if (!updatedBook) return res.status(404).send('Book not found');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});