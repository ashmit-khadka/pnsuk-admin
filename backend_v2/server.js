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
    // file name should be unique, use uuidv4 and use original file extension
    cb(null, `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`);
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to the database
const db = new sqlite3.Database('C:/Users/ashmi/Documents/Projects/test/pnsuk-react-admin/backend_v2/db.sqlite3', (err) => {
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

const getArticles = async () => {
  // Get all articles from the database
  const articles = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM articles;', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });

  // Get all images from the database
  const images = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM article_images;', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });

  // Combine articles and images
  const articlesWithImages = articles.map(article => {
    article.images = images.filter(image => image.article === article.id) || [];
    return article;
  });

  return articlesWithImages;
};

const getArticleById = async (id) => {
  const articles = await getArticles();
  const article = articles.find(article => article.id === id);
  return article;
};

app.get('/articles', async (req, res) => {
  try {
    const articles = await getArticles();
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.get('/article/:id', async (req, res) => {
  // Get article from the database with images
  const article = await getArticleById(req.params.id);
  res.json(article);  
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
  const {
    id,
    title,
    text,
    date,
    is_event,
    is_aid,
    is_guest,
    is_project,
    is_home,
    is_sport,
  } = req.body;
  const images = { new: req.files, old: req.body.existing_images };

  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }

  const newArticle = {
    id,
    title,
    text,
    date,
    is_event,
    is_aid,
    is_guest,
    is_project,
    is_home,
    is_sport,
    images,
  };

  if (id) {
    updateArticle(newArticle);
  } else {
    creatArticle(newArticle);
  }
});

const creatArticle = (article) => {
  const articleId = uuidv4();

  db.serialize(() => {
    db.run('INSERT INTO articles (id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [articleId, article.title, article.date, article.text, article.is_event, article.is_aid, article.is_guest, article.is_project, article.is_home, article.is_sport]);

    article.images.new.forEach((image) => {
      const imageId = uuidv4();
      db.run('INSERT INTO article_images (id, article, image) VALUES (?, ?, ?);', [imageId, articleId, image.filename]);
    });
  });
};

const updateArticle = (article) => {
  db.serialize(() => {
    db.run('UPDATE articles SET title = ?, date = ?, text = ?, is_event = ?, is_aid = ?, is_guest = ?, is_project = ?, is_home = ?, is_sport = ? WHERE id = ?;', [article.title, article.date, article.text, article.is_event, article.is_aid, article.is_guest, article.is_project, article.is_home, article.is_sport, article.id]);
  });

  // find current images for article and delete and add where necessary
  db.serialize(() => {
    db.run('DELETE FROM article_images WHERE article = ?;', [article.id]);

    article.images.new.forEach((image) => {
      const imageId = uuidv4();
      db.run('INSERT INTO article_images (id, article, image) VALUES (?, ?, ?);', [imageId, article.id, image.filename]);
    });
    article.images.old.forEach((image) => {
      const imageId = uuidv4();
      db.run('INSERT INTO article_images (id, article, image) VALUES (?, ?, ?);', [imageId, article.id, image]);
    });
  });
};

const deleteArticleImages = (imageId) => {
  db.serialize(() => {
    db.run('DELETE FROM article_images WHERE image = ?;', [imageId]);
  });
}

app.delete('/article/image/:id', (req, res) => {
  deleteArticleImages(req.params.id);

  res.status(200).send('Article image deleted');
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

app.put('/articles/clear', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM articles;');
    db.run('DELETE FROM article_images;');
  });

  res.status(200).send('Articles cleared');
});

/**
 * Member object: 
 * {
 * id: string,
 * name: string,
 * image: string,
 * position: string,
 * order: number,
 * }
 */

const creatMember = (member) => {
  const memberId = uuidv4();

  db.serialize(() => {
    db.run('INSERT INTO members (id, name, image, position, "order") VALUES (?, ?, ?, ?, ?);', [memberId, member.name, member.image, member.position, member.order]);
  });
};

const updateMember = (member) => {
  db.serialize(() => {
    db.run('UPDATE members SET name = ?, image = ?, position = ?, "order" = ? WHERE id = ?;', [member.name, member.image, member.position, member.order, member.id]);
  });
};

const deleteMember = (id) => {
  db.serialize(() => {
    db.run('DELETE FROM members WHERE id = ?;', [id]);
  });
}

const getMember = async (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM members WHERE id = ?;', [id], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
};

app.get('/members', (req, res) => {
  // Get all members from the database
  db.all('SELECT * FROM members;', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

app.post("/member", upload.single("image"), (req, res) => {
  const {
    name,
    position,
    order,
  } = req.body;

  const image = req.file

  const member = {
    name,
    image: image.filename,
    position,
    order,
  };

  creatMember(member);

  res.status(201).send('Member created');
});

app.put('/member/:id', (req, res) => {
  const member = req.body;

  updateMember(member);

  res.status(200).send('Member updated');
});

app.delete('/member/:id', (req, res) => {
  deleteMember(req.params.id);

  res.status(200).send('Member deleted');
});

app.get('/member/:id', async (req, res) => {
  const member = await getMember(req.params.id);
  res.json(member);
});


/**
 * Minutes object: 
 * {
 * id: string,
 * file: string,
 * date: string,
 * description: string,
 * order: number,
 * }
 */

const creatMinutes = (minutes) => {
  const minutesId = uuidv4();

  db.serialize(() => {
    db.run('INSERT INTO minutes (id, file, date, description, "order") VALUES (?, ?, ?, ?, ?);', [minutesId, minutes.file, minutes.date, minutes.description, minutes.order]);
  });
};

const updateMinutes = (minutes) => {
  db.serialize(() => {
    db.run('UPDATE minutes SET file = ?, date = ?, description = ?, "order" = ? WHERE id = ?;', [minutes.file, minutes.date, minutes.description, minutes.order, minutes.id]);
  });
};

const deleteMinutes = (id) => {
  db.serialize(() => {
    db.run('DELETE FROM minutes WHERE id = ?;', [id]);
  });
}

app.get('/minutes', (req, res) => {
  // Get all minutes from the database
  db.all('SELECT * FROM minutes;', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

app.post('/minutes', (req, res) => {
  const minutes = req.body;

  creatMinutes(minutes);

  res.status(201).send('Minutes created');
});

app.put('/minutes/:id', (req, res) => {
  const minutes = req.body;

  updateMinutes(minutes);

  res.status(200).send('Minutes updated');
});

app.delete('/minutes/:id', (req, res) => {
  deleteMinutes(req.params.id);

  res.status(200).send('Minutes deleted');
});

app.get('/reset', (req, res) => {
  db.serialize(() => {
    // drop tables if they exist
    db.run('DROP TABLE IF EXISTS articles;');
    db.run('DROP TABLE IF EXISTS article_images;');
    db.run('DROP TABLE IF EXISTS members;');
    db.run('DROP TABLE IF EXISTS minutes;');

    // create tables
    db.run('CREATE TABLE articles (id TEXT PRIMARY KEY, title TEXT, date TEXT, text TEXT, is_event INTEGER, is_aid INTEGER, is_guest INTEGER, is_project INTEGER, is_home INTEGER, is_sport INTEGER);');
    db.run('CREATE TABLE article_images (id TEXT PRIMARY KEY, article TEXT, image TEXT);');
    db.run('CREATE TABLE members (id TEXT PRIMARY KEY, name TEXT, image TEXT, position TEXT, "order" INTEGER);');
    db.run('CREATE TABLE minutes (id TEXT PRIMARY KEY, file TEXT, date TEXT, description TEXT, "order" INTEGER);');

    // insert default data
    db.run('INSERT INTO members (id, name, image, position, "order") VALUES (?, ?, ?, ?, ?);', [uuidv4(), 'John Doe', 'john-doe.jpg', 'CEO', 1]);
    db.run('INSERT INTO members (id, name, image, position, "order") VALUES (?, ?, ?, ?, ?);', [uuidv4(), 'Jane Doe', 'jane-doe.jpg', 'CTO', 2]);
    db.run('INSERT INTO articles (id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [uuidv4(), 'Welcome to our website', '2021-01-01', 'Welcome to our website', 1, 0, 0, 0, 0, 0]);
    db.run('INSERT INTO articles (id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [uuidv4(), 'Our mission', '2021-01-02', 'Our mission', 0, 1, 0, 0, 0, 0]);
    db.run('INSERT INTO minutes (id, file, date, description, "order") VALUES (?, ?, ?, ?, ?);', [uuidv4(), 'minutes-2021-01-01.pdf', '2021-01-01', 'Minutes of the meeting on 2021-01-01', 1]);
    db.run('INSERT INTO minutes (id, file, date, description, "order") VALUES (?, ?, ?, ?, ?);', [uuidv4(), 'minutes-2021-01-02.pdf', '2021-01-02', 'Minutes of the meeting on 2021-01-02', 2]);
  }

  );

  res.status(200).send('Database reset');
})


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});