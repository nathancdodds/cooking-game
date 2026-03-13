const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS,
  });
}

function normalizeRecipePayload(payload) {
  const name = String(payload?.name ?? "").trim();
  const instructions = String(payload?.instructions ?? "").trim();
  const source = String(payload?.source ?? "").trim();
  const sourceUrl = String(payload?.sourceUrl ?? "").trim();
  const ingredientsRaw = Array.isArray(payload?.ingredients) ? payload.ingredients : [];

  const ingredients = ingredientsRaw
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);

  if (!name || !instructions || ingredients.length === 0) {
    return { error: "Missing required recipe fields" };
  }

  return {
    recipe: {
      name,
      ingredients,
      instructions,
      source: source || null,
      sourceUrl: sourceUrl || null,
    },
  };
}

async function getRecipes(db) {
  const statement = db.prepare(
    `SELECT id, name, ingredients_json, instructions, source, source_url
     FROM recipes
     ORDER BY id ASC`
  );
  const rows = await statement.all();

  const results = (rows.results || []).map((row) => {
    let ingredients = [];
    try {
      const parsed = JSON.parse(row.ingredients_json);
      ingredients = Array.isArray(parsed) ? parsed : [];
    } catch {
      ingredients = [];
    }

    const recipe = {
      name: row.name,
      ingredients,
      instructions: row.instructions,
    };

    if (row.source) {
      recipe.source = row.source;
    }
    if (row.source_url) {
      recipe.sourceUrl = row.source_url;
    }

    return recipe;
  });

  return results;
}

async function createRecipe(db, request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const normalized = normalizeRecipePayload(payload);
  if (normalized.error) {
    return jsonResponse({ error: normalized.error }, 400);
  }

  const { recipe } = normalized;

  await db
    .prepare(
      `INSERT INTO recipes (name, ingredients_json, instructions, source, source_url)
       VALUES (?1, ?2, ?3, ?4, ?5)`
    )
    .bind(
      recipe.name,
      JSON.stringify(recipe.ingredients),
      recipe.instructions,
      recipe.source,
      recipe.sourceUrl
    )
    .run();

  const responseRecipe = {
    name: recipe.name,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
  };

  if (recipe.source) {
    responseRecipe.source = recipe.source;
  }
  if (recipe.sourceUrl) {
    responseRecipe.sourceUrl = recipe.sourceUrl;
  }

  return jsonResponse(responseRecipe, 201);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/recipes") {
      if (!env.DB) {
        return jsonResponse({ error: "Database binding missing" }, 500);
      }

      if (request.method === "GET") {
        const recipes = await getRecipes(env.DB);
        return jsonResponse(recipes);
      }

      if (request.method === "POST") {
        return createRecipe(env.DB, request);
      }

      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    return env.ASSETS.fetch(request);
  },
};
