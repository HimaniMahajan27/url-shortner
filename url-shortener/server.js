const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./shorturl');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1/urlShortener').then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
  try {
    const allUrls = await ShortUrl.find();
    res.render('index', { shortUrls: allUrls, error: null });
  } catch (err) {
    console.error(err);
    res.render('index', { shortUrls: [], error: "Error fetching URLs" });
  }
});

app.post('/shorten', async (req, res) => {
  const { fullUrl } = req.body;
  if (!fullUrl) {
    return res.render('index', { shortUrls: await ShortUrl.find(), error: '❌ URL is required' });
  }

  try {
    let url = await ShortUrl.findOne({ full: fullUrl });
    if (url) {
      return res.redirect('/');
    }

    await ShortUrl.create({ full: fullUrl });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('index', { shortUrls: await ShortUrl.find(), error: "Server error!" });
  }
});

app.get('/:shortId', async (req, res) => {
  try {
    const url = await ShortUrl.findOne({ short: req.params.shortId });
    if (!url) return res.status(404).render('404');

    url.clicks++;
    await url.save();
    res.redirect(url.full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(5000, () => {
    console.log(`🚀 Server running at: http://localhost:5000`);
});

