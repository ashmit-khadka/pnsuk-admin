const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const multer = require("multer");

// Set up storage with Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set upload folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.use(bodyParser.json());
app.use(cors());

// Connect to the database
const db = new sqlite3.Database('C:/Users/ashmi/Documents/Projects/pnsuk-react/backend_v2/db.sqlite3', (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Connected to the database.');
});

app.get('/migration', (req, res) => {
  // Get all articles from the database
  db.all('SELECT * FROM articles_original;', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send(err.message);
      return;
    }

    db.serialize(() => {
      db.run('DROP TABLE IF EXISTS articles;');
      db.run('DROP TABLE IF EXISTS article_images;');

      db.run('CREATE TABLE articles (id TEXT PRIMARY KEY, title TEXT, date TEXT, text TEXT, is_event INTEGER, is_aid INTEGER, is_guest INTEGER, is_project INTEGER, is_home INTEGER, is_sport INTEGER);');
      db.run('CREATE TABLE article_images (id TEXT PRIMARY KEY, article TEXT, image TEXT);');

      const insertArticleStmt = db.prepare('INSERT INTO articles (id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);');
      const insertImageStmt = db.prepare('INSERT INTO article_images (id, article, image) VALUES (?, ?, ?);');

      // rows.forEach(row => {
      //   const articleId = uuidv4();
      //   insertArticleStmt.run(articleId, row.title, row.date, row.text, parseInt(row.event), parseInt(row.aid), parseInt(row.guest), parseInt(row.project), parseInt(row.home), parseInt(row.sport), (err) => {
      //     if (err) {
      //       console.error(err.message);
      //       res.status(500).send(err.message);
      //       return;
      //     }
      //   });
      //   insertImageStmt.run(uuidv4(), articleId, row.image, (err) => {
      //     if (err) {
      //       console.error(err.message);
      //       res.status(500).send(err.message);
      //       return;
      //     }
      //   });
      // });

      insertArticleStmt.finalize();
      insertImageStmt.finalize();

      res.json(rows);
    });
  });
});

app.get('/articles', (req, res) => {
  // Get all articles from the database with images
  db.all('SELECT articles.id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport, image FROM articles JOIN article_images ON articles.id = article_images.article;', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send(err.message);
      return;
    }
    // map 1 to true and 0 to false
    rows = rows.map(row => {
      row.is_event = row.is_event === 1;
      row.is_aid = row.is_aid === 1;
      row.is_guest = row.is_guest === 1;
      row.is_project = row.is_project === 1;
      row.is_home = row.is_home === 1;
      row.is_sport = row.is_sport === 1;
      return row;
    });
    res.status(200).json(rows);
  });
});

app.get('/article/:id', (req, res) => {
  // Get article from the database with images
  db.get('SELECT articles.id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport, image FROM articles JOIN article_images ON articles.id = article_images.article WHERE articles.id = ?;', [req.params.id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send(err.message);
      return;
    }
    res.json(row);
  });
});

app.post('/article', upload.array("images", 10), (req, res) => {
  const article = req.body;
  const articleId = uuidv4();
  const imageId = uuidv4();

  // db.serialize(() => {
  //   db.run('INSERT INTO articles (id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [articleId, article.title, article.date, article.text, article.is_event, article.is_aid, article.is_guest, article.is_project, article.is_home, article.is_sport]);
  //   db.run('INSERT INTO article_images (id, article, image) VALUES (?, ?, ?);', [imageId, articleId, article.image]);
  // });

  res.status(201).send('Article created');
});

// Endpoint to handle multiple files and text data upload
app.post("/upload", upload.array("images", 10), (req, res) => {
  const { title, description } = req.body; // Access text fields

  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }

  res.json({
    message: "Files and text data uploaded successfully",
    files: req.files,
    data: {
      title,
      description
    }
  });
});
app.put('/article/:id', (req, res) => {
  const article = req.body;

  db.serialize(() => {
    db.run('UPDATE articles SET title = ?, date = ?, text = ?, is_event = ?, is_aid = ?, is_guest = ?, is_project = ?, is_home = ?, is_sport = ? WHERE id = ?;', [article.title, article.date, article.text, article.is_event, article.is_aid, article.is_guest, article.is_project, article.is_home, article.is_sport, req.params.id]);
  });

  res.status(200).send('Article updated');
});

app.delete('/article/:id', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM articles WHERE id = ?;', [req.params.id]);
    db.run('DELETE FROM article_images WHERE article = ?;', [req.params.id]);
  });

  res.status(200).send('Article deleted');
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});