let inventory = {}; // Store inventory items
let jsonData = {};  // Will hold the fetched JSON data
let macca = 0; // Example starting value
let filterLevel = 100; // Default level filter

// Function to load the JSON data from the file
function loadJSONData() {
  fetch('demons.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('JSON Data Loaded:', data);  // Debugging line
      jsonData = data;
      populateDemonList();  // Populate the demon list after loading the data
    })
    .catch(error => console.error('Error loading JSON:', error));
}

// Populate demon list dynamically with color coding based on overwoldLoc
function populateDemonListLegacyFormat() {
  const demonList = document.getElementById('demon-list');
  demonList.innerHTML = ''; // Clear any existing list items

  Object.keys(jsonData).forEach(demonTag => {
    const demon = jsonData[demonTag];
    const listItem = document.createElement('li');
    listItem.textContent = demon.demonTag;
    listItem.dataset.tag = demonTag;

    // Apply color based on overwoldLoc
    if (demon.overwoldLoc === 'Special_Fusion') {
      listItem.classList.add('demon', 'special-fusion'); // Dark red
    } else if (demon.overwoldLoc === 'Fusion') {
      listItem.classList.add('demon', 'fusion');         // Dark yellow
    } else {
      listItem.classList.add('demon', 'default');        // Dark green
    }

    listItem.onclick = () => displayDemon(demonTag);
    demonList.appendChild(listItem);
  });
}

// Function to set the filter level and update the demon list
function setFilterLevel(level) {
  filterLevel = level || 0; // Default to 0 if no value is entered
  populateDemonList();      // Re-populate the demon list based on the new filter
}

// Populate demon list dynamically with color coding based on overwoldLoc
function populateDemonList() {
  const demonList = document.getElementById('demon-list');
  demonList.innerHTML = ''; // Clear any existing list items

  Object.keys(jsonData)
    .sort((a, b) => a.localeCompare(b)) // Sort by keys for consistent ordering
    .forEach(demonTag => {
      const demon = jsonData[demonTag];
      const listItem = document.createElement('li');
      const demonLevel = parseInt(demonTag.split('_')[0], 10); // Extract the level from demonTag

      // Format recipesSize to always have 3 digits
      const formattedRecipesSize = String(demon.recipesSize).padStart(2, '0');
      // Display recipesSize as prefix to the demon's formatted tag
      listItem.textContent = `${formattedRecipesSize}/ ${formatIngredient(demon.demonTag)}`;
      listItem.dataset.tag = demonTag;

      // Apply color based on overwoldLoc
      if (demon.overwoldLoc === 'Special_Fusion') {
        listItem.classList.add('demon', 'special-fusion'); // Dark red
      } else if (demon.overwoldLoc === 'Fusion') {
        listItem.classList.add('demon', 'fusion');         // Dark yellow
      } else {
        listItem.classList.add('demon', 'default');        // Dark green
      }

		// Apply strikethrough if demon level is above filterLevel or already in inventory
		if (demonLevel > filterLevel || inventory.hasOwnProperty(demonTag)) {
			listItem.style.textDecoration = 'line-through';
		}	
	
      listItem.onclick = () => displayDemon(demonTag);
      demonList.appendChild(listItem);
    });
}

// Function to update the displayed macca value
function updateMaccaDisplay() {
  const maccaDisplay = document.getElementById('macca-amount');
  maccaDisplay.textContent = `Macca: ${macca.toLocaleString()}`; // Format with commas
}

// Function to display inventory
function displayInventory() {
  const inventoryList = document.getElementById('inventory-list');
  inventoryList.innerHTML = ''; // Clear previous inventory items

  // Sort keys directly as the level is at the start of each key
  const sortedKeys = Object.keys(inventory).sort();

  sortedKeys.forEach(tag => {
    const listItem = document.createElement('li');
    //listItem.textContent = inventory[tag].demonTag;
    listItem.textContent = formatIngredient(inventory[tag].demonTag);


    // Add remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => removeFromInventory(tag);
    listItem.appendChild(removeButton);

    inventoryList.appendChild(listItem);
  });
}
// Function to add demon to inventory
function addToInventory(demonTag) {
  const demon = jsonData[demonTag];
  if (demon && !inventory[demonTag]) {
    inventory[demonTag] = demon;
    displayInventory();
    // Subtract demon price from macca
    macca -= demon.demonPrice;
    updateMaccaDisplay(); // Update macca display after crafting
	populateDemonList(); // Re-populate the demon list to apply strikethrough
  }
}

// Function to craft an ingredient, similar to crafting a demon
function craftIngredient(ingredientTag) {
  const ingredient = jsonData[ingredientTag];
  if (ingredient && !inventory[ingredientTag]) {
    inventory[ingredientTag] = ingredient;
    displayInventory();
    // Subtract ingredient price from macca
    macca -= ingredient.demonPrice;
    updateMaccaDisplay(); // Update macca display after crafting
  }
}

// Function to handle the fusion of a demon
function fuseDemon(demonTag, ingredientTags) {
  // Check if the result demon is already in the inventory
  if (inventory[demonTag]) {
    //alert(`The demon ${formatIngredient(demonTag)} is already in your inventory.`);
    return; // Exit the function if the demon is already present
  }

  inventory[demonTag] = jsonData[demonTag];
  
  // Remove the used ingredients from the inventory
  ingredientTags.forEach(tag => {
    if (inventory[tag]) {
    delete inventory[tag];
    }
  });

  // Update inventory and macca display
  displayInventory();
  updateMaccaDisplay();

  //alert(`Successfully fused ${formatIngredient(demonTag)}!`);
}

// Function to remove demon from inventory
function removeFromInventory(demonTag) {
  delete inventory[demonTag];
  displayInventory();
}
// Function to clear all items from inventory
function clearInventory() {
  inventory = {};
  displayInventory();
}
//Listeners Section
document.addEventListener('DOMContentLoaded', function () {

  // Add event listener to clear inventory button
  document.getElementById('clear-inventory').addEventListener('click', clearInventory);
  // Load JSON data and initialize UI
  loadJSONData();
  const toggleInventoryButton = document.getElementById('toggle-inventory');
  const inventory = document.getElementById('inventory');

  toggleInventoryButton.addEventListener('click', function () {
    if (inventory.classList.contains('hidden')) {
      inventory.classList.remove('hidden');
      toggleInventoryButton.textContent = 'Hide Inventory';
    } else {
      inventory.classList.add('hidden');
      toggleInventoryButton.textContent = 'Show Inventory';
    }
  });
  updateMaccaDisplay(); // Update macca when page loads
});

// Bind the level filter input box to the setFilterLevel function
document.getElementById('level-filter-input').addEventListener('input', function() {
  setFilterLevel(parseInt(this.value, 10));
});

// Your existing functions for displaying demons and ingredients...

// Function to display a selected demon and its recipes (clickable)
function displayDemon(demonTag) {
  const demon = jsonData[demonTag];
  const details = document.getElementById('demon-details');
  const recipeList = document.getElementById('recipe-list');

  details.innerHTML = `
    <h2>${demon.demonTag}</h2>
    <p>Location: ${demon.overwoldLoc}</p>
    <p>Price: ${demon.demonPrice.toLocaleString()}</p>  <!-- Price with commas -->
    <button onclick="addToInventory('${demonTag}')">Add to Inventory</button>
  `;
  recipeList.innerHTML = '';  // Clear previous recipes

  demon.recipes.forEach(recipe => {
    let ingredients = [];
    let ingredientTags = [];

    // Extract ingredient keys dynamically
    Object.keys(recipe).forEach(key => {
      if (key.startsWith('ingredient')) {
        const ingredientTag = recipe[key];
        const ingredient = jsonData[ingredientTag]; // Fetch ingredient
        if (ingredient) {
          ingredients.push(ingredient);
          ingredientTags.push(ingredient.demonTag);
        }
      }
    });

    // Create a list item for the recipe
    const listItem = document.createElement('li');
    const status = updateRecipeStatus(ingredientTags) || 'missing';
    listItem.innerHTML = ingredients.map(i => styleIngredient(i.demonTag)).join(' + ');

    // Add color based on inventory status
    //const status = updateRecipeStatus( ingredients.map(i => i.demonTag) ) || 'missing';
    listItem.classList.add('recipe', status);

    // Add "Fusion" button only if the recipe status is 'has-all' (green)
    if (status === 'has-all') {
      const fusionButton = document.createElement('button');
      fusionButton.textContent = 'Fusion';
      fusionButton.onclick = () => fuseDemon(demonTag, ingredientTags); // Add fusion logic
      listItem.appendChild(fusionButton);
    }

    // Append to recipe list
    recipeList.appendChild(listItem);
  });
}

// Function to display a selected ingredient and its recipes (non-clickable)
function displayIngredient(ingredientTag) {
  const ingredient = jsonData[ingredientTag];
  const ingredientDetails = document.getElementById('ingredient-details');
  const ingredientRecipeList = document.getElementById('ingredient-recipe-list');

  if (ingredient) {
    // Display ingredient details
    ingredientDetails.innerHTML = `
      <h2>${ingredient.demonTag}</h2>
      <p>Location: ${ingredient.overwoldLoc}</p>
      <p>Price: ${ingredient.demonPrice.toLocaleString()}</p>  <!-- Price with commas -->
	  <button onclick="craftIngredient('${ingredientTag}')">Craft</button> <!-- Craft button added -->
    `;
    ingredientRecipeList.innerHTML = ''; // Clear previous recipes

    // Display non-clickable recipes for the ingredient
    ingredient.recipes.forEach(recipe => {
      let ingredients = [];

      Object.keys(recipe).forEach(key => {
        if (key.startsWith('ingredient')) {
          const ingredientTag = recipe[key];
          const ingredient = jsonData[ingredientTag]; // Fetch ingredient
          if (ingredient) {
            ingredients.push(ingredient);
          }
        }
      });

      // Create a list item for the recipe (non-clickable)
      const listItem = document.createElement('li');
      listItem.innerHTML = ingredients.map(i => styleIngredient(i.demonTag)).join(' + ');
      //listItem.textContent = ingredients.map(i => i.demonTag).join(' + ');

      // Add color based on inventory status
      const status = updateRecipeStatus(ingredients.map(i => i.demonTag)) || 'missing';
      listItem.classList.add('recipe', status);

      // Append to ingredient recipe list
      ingredientRecipeList.appendChild(listItem);
    });
  } else {
    ingredientDetails.innerHTML = `<p>No details available for this ingredient.</p>`;
    ingredientRecipeList.innerHTML = ''; // Clear recipes if none
  }
}

// Function to update recipe color based on inventory
function updateRecipeStatus(ingredientTags) {
  // Check if inventory has all, some, or none of the ingredients
  const hasAll = ingredientTags.every(tag => inventory.hasOwnProperty(tag));
  const hasSome = ingredientTags.some(tag => inventory.hasOwnProperty(tag));

  if (hasAll) {
    return 'has-all';  // Green
  } else if (hasSome) {
    return 'has-some'; // Yellow
  } else {
    return 'missing'; // Red (default)
  }
}

//shorte ingredient text
function formatIngredient(ingredientTag) {
  const parts = ingredientTag.split('$');
  const levelRace = parts[0].split('_'); // Split to get level
  const name = parts[1];

  // Determine the suffix based on the overworld location
  //const suffix = parts.length > 2 ? (parts[2] === 'Special_Fusion' ? '$SF' : '$F') : '';
  suffix = "";
  if (parts[2] === 'Special_Fusion') {
    suffix = "$SF";
  } else if (parts[2] === 'Fusion') {
    suffix = "$F";
  }
  return `${levelRace[0]}_${name}${suffix}`;
}

//apply italics bolding
function styleIngredient(ingredientTag) {
  let style = '';
  if (ingredientTag.includes('$Special_Fusion')) {
    style = 'font-weight: bold; font-style: italic;';
  } else if (ingredientTag.includes('$Fusion')) {
    style = 'font-style: italic;';
  }

  let formattedTag = formatIngredient(ingredientTag);

  return `<span class="ingredient" style="${style}" onclick="displayIngredient('${ingredientTag}')">${formattedTag}</span>`;
}



