let selectedIngredients = [];

const ingredientInput = document.getElementById('ingredientInput');
const addIngredientBtn = document.getElementById('addIngredient');
const ingredientTags = document.getElementById('ingredientTags');
const clearAllBtn = document.getElementById('clearAll');
const recipeResults = document.getElementById('recipeResults');
const recipeCount = document.getElementById('recipeCount');
const recipeSearch = document.getElementById('recipeSearch');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const recipeModal = document.getElementById('recipeModal');
const closeModal = document.getElementById('closeModal');
const recipeForm = document.getElementById('recipeForm');

function addIngredient() {
    const ingredient = ingredientInput.value.trim().toLowerCase();

    if (ingredient && !selectedIngredients.includes(ingredient)) {
        selectedIngredients.push(ingredient);
        ingredientInput.value = '';
        updateUI();
    }
}

function removeIngredient(ingredient) {
    selectedIngredients = selectedIngredients.filter(item => item !== ingredient);
    updateUI();
}

function clearAll() {
    selectedIngredients = [];
    updateUI();
}

function updateUI() {
    renderIngredientTags();
    renderRecipes();
}

function getSearchTerm() {
    return recipeSearch.value.trim().toLowerCase();
}

function formatIngredientDisplay(ingredient) {
    if (/^\d|cup|cups|tbsp|tsp|oz|lb|clove|slice|can|package|pinch|dash/i.test(ingredient)) {
        return ingredient;
    }

    const lower = ingredient.toLowerCase();
    const exactMeasurements = [
        { match: 'black pepper', amount: '1/4 tsp' },
        { match: 'salt', amount: '1/2 tsp' },
        { match: 'eggs', amount: '2' },
        { match: 'egg', amount: '1' },
        { match: 'garlic', amount: '2 cloves' },
        { match: 'bread', amount: '2 slices' },
        { match: 'butter', amount: '2 tbsp' },
        { match: 'olive oil', amount: '2 tbsp' },
        { match: 'oil', amount: '2 tbsp' },
        { match: 'mayonnaise', amount: '2 tbsp' },
        { match: 'mustard', amount: '1 tbsp' },
        { match: 'milk', amount: '1 cup' },
        { match: 'cream', amount: '1 cup' },
        { match: 'broth', amount: '2 cups' },
        { match: 'sauce', amount: '1 cup' },
        { match: 'rice', amount: '1 cup' },
        { match: 'pasta', amount: '8 oz' },
        { match: 'ziti', amount: '8 oz' },
        { match: 'macaroni', amount: '8 oz' },
        { match: 'fettuccine', amount: '8 oz' },
        { match: 'flour', amount: '2 cups' },
        { match: 'oats', amount: '1 cup' },
        { match: 'parmesan', amount: '1/2 cup' },
        { match: 'mozzarella', amount: '1 cup' },
        { match: 'cheddar cheese', amount: '1 cup' },
        { match: 'cheese', amount: '1 cup' },
        { match: 'chicken broth', amount: '2 cups' },
        { match: 'vegetable broth', amount: '2 cups' },
        { match: 'chicken', amount: '1 lb' },
        { match: 'ground beef', amount: '1 lb' },
        { match: 'beef', amount: '1 lb' },
        { match: 'ground turkey', amount: '1 lb' },
        { match: 'turkey', amount: '1 lb' },
        { match: 'sausage', amount: '12 oz' },
        { match: 'shrimp', amount: '1 lb' },
        { match: 'salmon', amount: '1 lb' },
        { match: 'bacon', amount: '6 slices' },
        { match: 'onion', amount: '1' },
        { match: 'tomato', amount: '2' },
        { match: 'potatoes', amount: '4' },
        { match: 'potato', amount: '1' },
        { match: 'carrots', amount: '2' },
        { match: 'carrot', amount: '1' },
        { match: 'cucumber', amount: '1' },
        { match: 'lemon', amount: '1' },
        { match: 'lime', amount: '1' },
        { match: 'avocado', amount: '1' },
        { match: 'banana', amount: '2' },
        { match: 'apples', amount: '2' },
        { match: 'apple', amount: '1' },
        { match: 'bell pepper', amount: '1' },
        { match: 'broccoli', amount: '2 cups' },
        { match: 'spinach', amount: '2 cups' },
        { match: 'lettuce', amount: '1 head' },
        { match: 'cabbage', amount: '2 cups' },
        { match: 'vegetables', amount: '2 cups' },
        { match: 'parsley', amount: '2 tbsp' },
        { match: 'basil', amount: '1/4 cup' },
        { match: 'beans', amount: '1 can' },
        { match: 'black beans', amount: '1 can' },
        { match: 'red beans', amount: '1 can' },
        { match: 'breadcrumbs', amount: '1/2 cup' },
        { match: 'sour cream', amount: '1/2 cup' },
        { match: 'yogurt', amount: '1/2 cup' },
        { match: 'honey', amount: '2 tbsp' },
        { match: 'sugar', amount: '1/2 cup' },
        { match: 'brown sugar', amount: '1/2 cup' },
        { match: 'vanilla', amount: '1 tsp' },
        { match: 'baking powder', amount: '1 tsp' },
        { match: 'baking soda', amount: '1 tsp' },
        { match: 'cinnamon', amount: '1 tsp' },
        { match: 'cocoa powder', amount: '1/4 cup' },
        { match: 'chocolate chips', amount: '1 cup' }
    ];

    const match = exactMeasurements.find(entry => lower.includes(entry.match));
    if (match) {
        return `${match.amount} ${ingredient}`;
    }

    return `1 ${ingredient}`;
}

function renderIngredientTags() {
    if (selectedIngredients.length === 0) {
        ingredientTags.innerHTML = '<p style="color: #999; font-style: italic;">No ingredients added yet</p>';
        return;
    }

    ingredientTags.innerHTML = selectedIngredients.map(ingredient => `
        <div class="ingredient-tag">
            <span>${ingredient}</span>
            <span class="remove" onclick="removeIngredient('${ingredient}')">x</span>
        </div>
    `).join('');
}

function findMatchingRecipes() {
    const term = getSearchTerm();

    if (selectedIngredients.length === 0 && !term) {
        return [];
    }

    return recipes.map(recipe => {
        const normalizedRecipeIngredients = recipe.ingredients.map(item => item.toLowerCase());
        const matchingIngredients = selectedIngredients.filter(selected =>
            normalizedRecipeIngredients.some(recipeIngredient =>
                recipeIngredient.includes(selected) || selected.includes(recipeIngredient)
            )
        );

        const matchCount = matchingIngredients.length;
        const totalIngredients = recipe.ingredients.length;
        const matchPercentage = totalIngredients === 0 ? 0 : (matchCount / totalIngredients) * 100;

        return {
            ...recipe,
            matchCount,
            totalIngredients,
            matchPercentage
        };
    })
    .filter(recipe => selectedIngredients.length === 0 || recipe.matchCount > 0)
    .filter(recipe => !term || recipe.name.toLowerCase().includes(term))
    .sort((a, b) => {
        if (b.matchPercentage !== a.matchPercentage) {
            return b.matchPercentage - a.matchPercentage;
        }
        return b.matchCount - a.matchCount;
    });
}

function renderRecipes() {
    const matchingRecipes = findMatchingRecipes();
    recipeCount.textContent = matchingRecipes.length;

    if (selectedIngredients.length === 0 && !getSearchTerm()) {
        recipeResults.innerHTML = `
            <div class="empty-state">
                <p>Add some ingredients above to find recipes!</p>
            </div>
        `;
        return;
    }

    if (matchingRecipes.length === 0) {
        recipeResults.innerHTML = `
            <div class="no-results">
                <p>No recipes found with those ingredients.</p>
                <p style="font-size: 0.9em;">Try adding more common ingredients!</p>
            </div>
        `;
        return;
    }

    recipeResults.innerHTML = matchingRecipes.map(recipe => {
        const canMakeIt = recipe.matchCount === recipe.totalIngredients;
        const matchText = canMakeIt
            ? 'You have all ingredients!'
            : `You have ${recipe.matchCount} of ${recipe.totalIngredients} ingredients`;

        const ingredientsList = recipe.ingredients.map(ingredient => {
            const hasIt = selectedIngredients.some(selected =>
                ingredient.toLowerCase().includes(selected) || selected.includes(ingredient.toLowerCase())
            );
            return `<li class="${hasIt ? 'have' : 'need'}">${formatIngredientDisplay(ingredient)}</li>`;
        }).join('');

        const sourceHtml = recipe.source
            ? recipe.sourceUrl
                ? `<div class="recipe-source">Source: <a href="${recipe.sourceUrl}" target="_blank" rel="noopener noreferrer">${recipe.source}</a></div>`
                : `<div class="recipe-source">Source: ${recipe.source}</div>`
            : '';

        return `
            <div class="recipe-card">
                <h3>${recipe.name}</h3>
                <div class="match-info">${matchText}</div>
                <div class="ingredients-list">
                    <h4>Ingredients / Measurements:</h4>
                    <ul>
                        ${ingredientsList}
                    </ul>
                </div>
                <div class="instructions">
                    <strong>Instructions:</strong> ${recipe.instructions}
                </div>
                ${sourceHtml}
            </div>
        `;
    }).join('');
}

async function loadSharedRecipes() {
    try {
        const response = await fetch('/api/recipes');
        if (!response.ok) {
            throw new Error('Failed to load shared recipes');
        }

        const sharedRecipes = await response.json();
        recipes.push(...sharedRecipes);
    } catch (error) {
        console.error('Error loading shared recipes:', error);
    }
}

async function saveRecipeToServer(recipe) {
    const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipe)
    });

    if (!response.ok) {
        throw new Error('Failed to save recipe');
    }

    return response.json();
}

async function handleAddRecipe(event) {
    event.preventDefault();

    const name = document.getElementById('recipeName').value.trim();
    const ingredientsStr = document.getElementById('recipeIngredients').value.trim();
    const instructions = document.getElementById('recipeInstructions').value.trim();
    const source = document.getElementById('recipeSource').value.trim();
    const sourceUrl = document.getElementById('recipeSourceUrl').value.trim();

    if (!name || !ingredientsStr || !instructions) {
        alert('Please fill out all required fields');
        return;
    }

    const ingredients = ingredientsStr.split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
    const newRecipe = {
        name,
        ingredients,
        instructions
    };

    if (source) {
        newRecipe.source = source;
    }

    if (sourceUrl) {
        newRecipe.sourceUrl = sourceUrl;
    }

    try {
        const savedRecipe = await saveRecipeToServer(newRecipe);
        recipes.push(savedRecipe);
        recipeForm.reset();
        closeModalFunc();
        updateUI();
        alert('Recipe added successfully! Everyone who refreshes will see it.');
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Could not save recipe to the shared server. Please try again in a moment.');
    }
}

function openModal() {
    recipeModal.style.display = 'block';
}

function closeModalFunc() {
    recipeModal.style.display = 'none';
}

window.removeIngredient = removeIngredient;

window.addEventListener('click', event => {
    if (event.target === recipeModal) {
        closeModalFunc();
    }
});

addIngredientBtn.addEventListener('click', addIngredient);
ingredientInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        addIngredient();
    }
});
clearAllBtn.addEventListener('click', clearAll);
recipeSearch.addEventListener('input', renderRecipes);
addRecipeBtn.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModalFunc);
recipeForm.addEventListener('submit', handleAddRecipe);

async function initializeApp() {
    await loadSharedRecipes();
    updateUI();
}

initializeApp();

