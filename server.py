from __future__ import annotations

import json
import os
import sqlite3
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "8000"))
LEGACY_RECIPES_FILE = BASE_DIR / "user_recipes.json"


def resolve_data_dir() -> Path:
    configured = os.environ.get("DATA_DIR", "")
    candidate = Path(configured).expanduser() if configured else BASE_DIR

    try:
        candidate.mkdir(parents=True, exist_ok=True)
        test_path = candidate / ".write_test"
        test_path.write_text("ok", encoding="utf-8")
        test_path.unlink(missing_ok=True)
        return candidate
    except OSError:
        return BASE_DIR


DATA_DIR = resolve_data_dir()
DB_FILE = DATA_DIR / "recipe_finder.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                ingredients_json TEXT NOT NULL,
                instructions TEXT NOT NULL,
                source TEXT,
                source_url TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def migrate_legacy_json_if_needed() -> None:
    if not LEGACY_RECIPES_FILE.exists():
        return

    try:
        legacy_payload = json.loads(LEGACY_RECIPES_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return

    if not isinstance(legacy_payload, list) or not legacy_payload:
        return

    with get_connection() as conn:
        existing_count = conn.execute("SELECT COUNT(*) FROM recipes").fetchone()[0]
        if existing_count > 0:
            return

        for recipe in legacy_payload:
            if not isinstance(recipe, dict):
                continue

            name = str(recipe.get("name", "")).strip()
            instructions = str(recipe.get("instructions", "")).strip()
            ingredients = recipe.get("ingredients", [])

            if not name or not instructions or not isinstance(ingredients, list):
                continue

            cleaned_ingredients = [str(item).strip() for item in ingredients if str(item).strip()]
            if not cleaned_ingredients:
                continue

            source = str(recipe.get("source", "")).strip() or None
            source_url = str(recipe.get("sourceUrl", "")).strip() or None

            conn.execute(
                """
                INSERT INTO recipes (name, ingredients_json, instructions, source, source_url)
                VALUES (?, ?, ?, ?, ?)
                """,
                (name, json.dumps(cleaned_ingredients), instructions, source, source_url),
            )


def read_user_recipes() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT name, ingredients_json, instructions, source, source_url
            FROM recipes
            ORDER BY id ASC
            """
        ).fetchall()

    recipes: list[dict] = []
    for row in rows:
        try:
            ingredients = json.loads(row["ingredients_json"])
        except (json.JSONDecodeError, TypeError):
            ingredients = []

        recipe: dict[str, object] = {
            "name": row["name"],
            "ingredients": ingredients if isinstance(ingredients, list) else [],
            "instructions": row["instructions"],
        }

        if row["source"]:
            recipe["source"] = row["source"]
        if row["source_url"]:
            recipe["sourceUrl"] = row["source_url"]

        recipes.append(recipe)

    return recipes


def save_recipe(recipe: dict[str, object]) -> None:
    source = str(recipe.get("source", "")).strip() or None
    source_url = str(recipe.get("sourceUrl", "")).strip() or None
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO recipes (name, ingredients_json, instructions, source, source_url)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                str(recipe["name"]),
                json.dumps(recipe["ingredients"]),
                str(recipe["instructions"]),
                source,
                source_url,
            ),
        )


class RecipeRequestHandler(SimpleHTTPRequestHandler):
    def _send_json(self, payload: object, status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/api/recipes":
            self._send_json(read_user_recipes())
            return

        super().do_GET()

    def do_POST(self) -> None:
        if self.path != "/api/recipes":
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length)

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            self._send_json({"error": "Invalid JSON"}, HTTPStatus.BAD_REQUEST)
            return

        name = str(payload.get("name", "")).strip()
        instructions = str(payload.get("instructions", "")).strip()
        ingredients = payload.get("ingredients", [])

        if not name or not instructions or not isinstance(ingredients, list) or not ingredients:
            self._send_json({"error": "Missing required recipe fields"}, HTTPStatus.BAD_REQUEST)
            return

        cleaned_recipe = {
            "name": name,
            "ingredients": [str(item).strip() for item in ingredients if str(item).strip()],
            "instructions": instructions,
        }

        source = str(payload.get("source", "")).strip()
        source_url = str(payload.get("sourceUrl", "")).strip()

        if source:
            cleaned_recipe["source"] = source
        if source_url:
            cleaned_recipe["sourceUrl"] = source_url

        save_recipe(cleaned_recipe)

        self._send_json(cleaned_recipe, HTTPStatus.CREATED)


def main() -> None:
    init_db()
    migrate_legacy_json_if_needed()

    handler = partial(RecipeRequestHandler, directory=str(BASE_DIR))
    server = ThreadingHTTPServer(("0.0.0.0", PORT), handler)
    print(f"Serving Recipe Finder on http://localhost:{PORT}")
    print(f"Using recipe database at: {DB_FILE}")
    server.serve_forever()


if __name__ == "__main__":
    main()
