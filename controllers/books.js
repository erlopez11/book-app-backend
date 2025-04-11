const express = require("express");
const router = express.Router();
const { URLSearchParams } = require("url");

const parseGoogleBook = ({ id, volumeInfo }) => ({
  id,
  title: volumeInfo.title,
  author: volumeInfo.authors?.[0] ?? "N/A",
  thumbnailUrl: volumeInfo.imageLinks?.thumbnail,
  description: volumeInfo.description,
  numberOfPages: volumeInfo.pageCount,
});

router.get("/", async (req, res) => {
  const { startIndex, maxResults, q } = req.query;
  console.log(`Fetching books with query: ${q}, startIndex: ${startIndex}, maxResults: ${maxResults}`);
  try {
    const params = new URLSearchParams();
    params.append("q", q);
    params.append("maxResults", Number(maxResults));
    params.append("orderBy", "newest");
    params.append("key", process.env.GOOGLE_BOOKS_KEY);
    params.append("startIndex", Number(startIndex));
    
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
    console.log(`Fetching from Google Books API: ${apiUrl}`);
    
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      console.error(`Google Books API error: ${apiResponse.status} ${apiResponse.statusText}`);
      return res.status(apiResponse.status).json({ error: `Google Books API error: ${apiResponse.statusText}` });
    }
    
    const json = await apiResponse.json();
    console.log(`Received ${json.items?.length || 0} books from Google Books API`);
    
    const parsedBooks = json.items?.map(parseGoogleBook) ?? [];
    console.log(`Parsed ${parsedBooks.length} books`);
    
    // Log the IDs of the first few books
    if (parsedBooks.length > 0) {
      console.log(`First few book IDs: ${parsedBooks.slice(0, 3).map(book => book.id).join(', ')}`);
    }
    
    res.json(parsedBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:bookId", async (req, res) => {
  const { bookId } = req.params;
  console.log(`Fetching book with ID: ${bookId}`);
  try {
    const params = new URLSearchParams();
    params.append("key", process.env.GOOGLE_BOOKS_KEY);
    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}?${params.toString()}`;
    console.log(`Fetching from Google Books API: ${apiUrl}`);
    
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      console.error(`Google Books API error: ${apiResponse.status} ${apiResponse.statusText}`);
      return res.status(apiResponse.status).json({ error: `Google Books API error: ${apiResponse.statusText}` });
    }
    
    const googleBook = await apiResponse.json();
    console.log(`Received book from Google Books API: ${googleBook.id} - ${googleBook.volumeInfo?.title}`);
    
    const parsedBook = parseGoogleBook(googleBook);
    console.log(`Parsed book: ${JSON.stringify(parsedBook)}`);
    
    res.json(parsedBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
