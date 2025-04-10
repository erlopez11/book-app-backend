const express = require("express");
const router = express.Router();
const { URLSearchParams } = require("url");

router.get("/", async (req, res) => {
  const { startIndex, maxResults, q } = req.query;
  try {
    const params = new URLSearchParams();
    params.append("q", q);
    params.append("maxResults", Number(maxResults));
    params.append("orderBy", "newest");
    params.append("key", process.env.GOOGLE_BOOKS_KEY);
    params.append("startIndex", Number(startIndex));
    const apiResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?${params.toString()}`
    );
    const json = await apiResponse.json();
    res.json(
      json.items.map(({ id, volumeInfo }) => ({
        isbn: id,
        title: volumeInfo.title,
        author: volumeInfo.authors?.[0] ?? "N/A",
        thumbnailUrl: volumeInfo.imageLinks?.thumbnail,
        description: volumeInfo.description,
        numberOfPages: volumeInfo.pageCount,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
