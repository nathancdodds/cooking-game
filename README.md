# Recipe Finder

A simple web application that helps you find recipes based on ingredients you have at home.

## How to Use

1. Open `index.html` in your web browser
2. Type an ingredient you have (e.g., "chicken", "eggs", "tomato")
3. Click "Add" or press Enter
4. Keep adding more ingredients
5. Watch as recipes appear that match your ingredients!

## Features

- **Smart Matching**: Recipes are sorted by how many ingredients you have
- **Visual Feedback**: Green checkmarks show ingredients you have, circles show what you need
- **Easy Management**: Remove individual ingredients or clear all at once
- **20+ Recipes**: Includes popular dishes like Spaghetti Carbonara, Tacos, Pizza, and more

## Adding More Recipes

To add your own recipes, edit `recipes.js` and add new recipe objects following this format:

```javascript
{
    name: "Recipe Name",
    ingredients: ["ingredient1", "ingredient2", "ingredient3"],
    instructions: "Step-by-step cooking instructions here."
}
```

## Files

- `index.html` - Main HTML structure
- `styles.css` - All styling and animations
- `recipes.js` - Recipe database
- `app.js` - Application logic and UI interactions

Enjoy cooking!

## Deploy (Render)

1. Push this project to a GitHub repository.
2. In Render, click **New +** -> **Blueprint**.
3. Connect your GitHub repo and choose this project.
4. Render will detect `render.yaml` and create the web service.
5. Deploy and open the generated URL.

Render will run `python server.py` and automatically set the `PORT` environment variable.
Recipes are stored in a SQLite database file (`recipe_finder.db`) and the app can use `DATA_DIR` for where that file lives.

### Important Data Note

The app now stores submitted recipes in SQLite (`recipe_finder.db`).

For true cloud persistence on Render:
1. Use a plan that supports persistent disks.
2. In `render.yaml`, uncomment the `disks` section.
3. Keep `DATA_DIR=/var/data` so the SQLite file is written to the mounted disk.

Without a persistent disk, data can still reset on restart/redeploy.
