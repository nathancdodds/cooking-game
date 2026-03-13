CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  ingredients_json TEXT NOT NULL,
  instructions TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
