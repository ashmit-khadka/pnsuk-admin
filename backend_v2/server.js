const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const port = 3001;
const multer = require("multer");

// Set up storage with Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/assets/images/'); // Set upload folder
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
const db = new sqlite3.Database('C:/Users/44784/Code - Work/pnsuk-admin/backend_v2/db.sqlite3', (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Connected to the database.');
});

// Connect to old the database (for migration only)
const db_old = new sqlite3.Database('C:/Users/ashmi/Documents/Projects/test/pnsuk-react-admin/backend_v2/db_old.sqlite3', (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Connected to the database.');
});

const dbAllAsync = (sql, db, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

// Utility function to wrap db.run in a promise
const dbRunAsync = (sql, db, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};


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

  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }

  const newArticle = {
    id: req.body.id,
    title: req.body.title,
    text: req.body.text,
    date: req.body.date,
    is_event: req.body.is_event,
    is_aid: req.body.is_aid,
    is_guest: req.body.is_guest,
    is_project: req.body.is_project,
    is_home: req.body.is_home,
    is_sport: req.body.is_sport,
    images: { new: req.files, old: req.body.existing_images },
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

const db_exec = async ({
  reqestSQL,
  returnSQL,
}) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(reqestSQL, function (err) {
        if (err) {
          return reject(err);
        }
        db.get(returnSQL, (err, row) => {
          if (err) {
            return reject(err);
          }
          resolve(row);
        });
      });
    });
  });

}

const creatMember = (member) => {
  const memberId = uuidv4();

  db.serialize(() => {
    db.run('INSERT INTO members (id, name, image, position, "order") VALUES (?, ?, ?, ?, ?);', [memberId, member.name, member.image, member.position, member.order]);
  });
};

const updateMember = async (member) => {
  return await db_exec({
    reqestSQL: `UPDATE members SET name = '${member.name}', image = '${member.image}', position = '${member.position}', "order" = ${member.order} WHERE id = '${member.id}';`,
    returnSQL: `SELECT * FROM members WHERE id = '${member.id}';`,
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
    image: image?.filename || '',
    position,
    order,
  };

  creatMember(member);

  res.status(201).send('Member created');
});

app.put("/member/:id", upload.single("image"), async (req, res) => {
  const member = {
    id: req.body?.id,
    name: req.body?.name,
    image: req.file?.filename || '',
    position: req.body?.position,
    order: req.body?.order,
  };

  const updatedMember = await updateMember(member);
  res.json(updatedMember);
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
    db.run('INSERT INTO minutes (id, title, description, date, file) VALUES (?, ?, ?, ?, ?);', [minutesId, minutes.title, minutes.description, minutes.date, minutes.file]);
  });
};

const updateMinutes = (minutes) => {
  db.serialize(() => {
    db.run('UPDATE minutes SET file = ?, date = ?, description = ?, "order" = ? WHERE id = ?;', [minutes.file, minutes.date, minutes.description, minutes.id]);
  });
};

const deleteMinutes = (id) => {
  db.serialize(() => {
    db.run('DELETE FROM minutes WHERE id = ?;', [id]);
  });
}

const getMinutes = async (id) => {
  const minutes = await dbAllAsync('SELECT * FROM minutes;', db);
  return minutes;
}

app.get('/minutes', (req, res) => {
  getMinutes()
    .then(minutes => {
      res.json(minutes);
    })
    .catch(err => {
      console.error(err.message);
      res.status(500).send(err.message);
    });
});

app.post('/minutes', upload.single("document"), (req, res) => {
  const minutes = req.body;

  const minute = {
    title: minutes.title,
    description: minutes.description,
    date: minutes.date,
    file: req.file.filename,
  }

  creatMinutes(minute);

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
    db.run('INSERT INTO articles (id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [uuidv4(), 'Welcome to our website', '2021-01-01', 'Welcome to our website', 'true', 'false', 'false', 'false', 'false', 'false']);
    db.run('INSERT INTO articles (id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [uuidv4(), 'Our mission', '2021-01-02', 'Our mission', 'false', 'true', 'false', 'false', 'false', 'false']);
    db.run('INSERT INTO minutes (id, file, date, description, "order") VALUES (?, ?, ?, ?, ?);', [uuidv4(), 'minutes-2021-01-01.pdf', '2021-01-01', 'Minutes of the meeting on 2021-01-01', 1]);
    db.run('INSERT INTO minutes (id, file, date, description, "order") VALUES (?, ?, ?, ?, ?);', [uuidv4(), 'minutes-2021-01-02.pdf', '2021-01-02', 'Minutes of the meeting on 2021-01-02', 2]);
  }

  );

  res.status(200).send('Database reset');
})



const getEvents = async () => {  
  const events = await dbAllAsync('SELECT * FROM events;', db);
  return events;
}

const createEvent = async (event) => {
  const eventId = uuidv4();

  db.serialize(() => {
    db.run('INSERT INTO events (id, title, description, date, location, contact) VALUES (?, ?, ?, ?, ?, ?);', [eventId, event.title, event.description, event.date, event.location, event.contact]);
  });
};


app.get('/events', (req, res) => {
  getEvents().then(events => {
    res.json(events);
  }).catch(err => {
    console.error(err.message);
    res.status(500).send(err.message);
  });
});

app.post("/events", (req, res) => {
  const {
    title,
    description,
    date,
    location,
    contact,
  } = req.body;

  const event = {
    title,
    description,
    date,
    location,
    contact,
  };

  createEvent(event);

  res.status(201).send('Event created');
});

app.get('/test', async (req, res) => {


  // Function to delete all tables in the database
  const deleteAllTables = async () => {
    try {
      const tables = await dbAllAsync("SELECT name FROM sqlite_master WHERE type='table';", db);
      for (const table of tables) {
        if (table.name === 'sqlite_sequence') {
          continue;
        }
        await dbRunAsync(`DROP TABLE IF EXISTS ${table.name};`, db);
      }
      console.log('All tables deleted');
    } catch (err) {
      console.error('Error deleting tables:', err.message);
    }
  };

  const addData = (data, table) => {
    data.forEach(async row => {
      const keys = Object.keys(row);
      const values = Object.values(row);
      const placeholders = keys.map(() => '?').join(',');
      const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders});`;
      await db.dbAllAsync(sql, values, function (err) {
        if (err) {
          console.error('Error inserting data:', err.message);
          return;
        }
        console.log(`Row inserted with id ${this.lastID}`);
      });
    });
  }

  //drop all data
  await deleteAllTables();


  const articles = await dbAllAsync('SELECT * FROM pns_article;', db_old);
  const members = await dbAllAsync('SELECT * FROM pns_member;', db_old);
  const events = await dbAllAsync('SELECT * FROM pns_event;', db_old);
  const minutes = await dbAllAsync('SELECT * FROM pns_minute;', db_old);
  const login = [
    {
      id: uuidv4(),
      username: 'admin',
      password: 'admin',
    }
  ]

  const data = {
    articles,
    members,
    events,
    minutes,
  };

  await dbRunAsync('CREATE TABLE articles (id TEXT PRIMARY KEY, title TEXT, date TEXT, text TEXT, is_event INTEGER, is_aid INTEGER, is_guest INTEGER, is_project INTEGER, is_home INTEGER, is_sport INTEGER);', db);
  await dbRunAsync('CREATE TABLE article_images (id TEXT PRIMARY KEY, article TEXT, image TEXT);', db);
  await dbRunAsync('CREATE TABLE members (id TEXT PRIMARY KEY, name TEXT, image TEXT, position TEXT, "order" INTEGER);', db);
  await dbRunAsync('CREATE TABLE minutes (id TEXT PRIMARY KEY, "title" TEXT, file TEXT, description TEXT, date TEXT);', db);
  await dbRunAsync('CREATE TABLE events (id TEXT PRIMARY KEY, title TEXT, description TEXT, date TEXT, "location" TEXT, "contact" TEXT);', db);
  await dbRunAsync('CREATE TABLE login (id TEXT PRIMARY KEY, username TEXT, password TEXT);', db);

  articles.forEach(async article => {
    const articleId = uuidv4();
    await dbRunAsync('INSERT INTO articles (id, title, date, text, is_event, is_aid, is_guest, is_project, is_home, is_sport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', db, [articleId, article.title, article.date, article.text, article.event, article.aid, article.guest, article.project, article.home, article.sport]);
  });

  members.forEach(async member => {
    const memberId = uuidv4();
    const formatedImage = member.image.split('member_imgs/').join('');
    await dbRunAsync('INSERT INTO members (id, name, image, position, "order") VALUES (?, ?, ?, ?, ?);', db, [memberId, member.name, formatedImage, member.position, member.order]);
  }); 
 
  events.forEach(async event => {
    const eventId = uuidv4();
    await dbRunAsync('INSERT INTO events (id, title, description, date, location, contact) VALUES (?, ?, ?, ?, ?, ?);', db, [eventId, event.title, event.description, event.date, event.location, event.contact]);
  });

  minutes.forEach(async minute => 
  {
    const minuteId = uuidv4();
    const formatedFile = minute.file.split('minute_docs/').join('');
    await dbRunAsync('INSERT INTO minutes (id, title, file, description, date) VALUES (?, ?, ?, ?, ?);', db, [minuteId, formatedFile, formatedFile, minute.description, minute.date]);
  });

  login.forEach(async user => {
    await dbRunAsync('INSERT INTO login (id, username, password) VALUES (?, ?, ?);', db, [user.id, user.username, user.password]);
  });

  res.json(data);
})


const isLoginValid = async (username, password) => {
  const user = await dbAllAsync(`SELECT * FROM login WHERE username = '${username}' AND password = '${password}';`, db);
  return user.length > 0;
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const isValid = await isLoginValid(username, password);
  if (isValid) {
    res.status(200).send('Login successful');
  } else {
    res.status(401).send('Login failed');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});