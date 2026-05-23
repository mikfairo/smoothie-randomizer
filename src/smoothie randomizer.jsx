import { Check, Heart, Pencil, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ingredientPools = {
  fruit: [
    { name: "Mango", color: "#ffb238", shape: "mango" },
    { name: "Strawberry", color: "#e93f5f", shape: "strawberry" },
    { name: "Blueberry", color: "#4d5ecf", shape: "blueberry" },
    { name: "Pineapple", color: "#ffd447", shape: "pineapple" },
    { name: "Peach", color: "#ff9365", shape: "peach" },
    { name: "Raspberry", color: "#c81f58", shape: "raspberry" }
  ],
  green: [
    { name: "Spinach", color: "#3aa657", shape: "leaf" },
    { name: "Kale", color: "#267a43", shape: "leaf" },
    { name: "Mint", color: "#63c57f", shape: "leaf" },
    { name: "Avocado", color: "#8fbf4f", shape: "avocado" }
  ],
  base: [
    { name: "Coconut Water", color: "#b7edf0", shape: "splash" },
    { name: "Oat Milk", color: "#ead9b5", shape: "splash" },
    { name: "Greek Yogurt", color: "#f7f1dc", shape: "splash" },
    { name: "Almond Milk", color: "#e6cfad", shape: "splash" }
  ],
  boost: [
    { name: "Chia Seeds", color: "#383536", shape: "seeds" },
    { name: "Ginger", color: "#d79a3d", shape: "ginger" },
    { name: "Honey", color: "#f0a91e", shape: "drop" },
    { name: "Protein", color: "#d5bd92", shape: "powder" }
  ]
};

const adjectives = ["Velvet", "Sunrise", "Zippy", "Glow", "Cloud", "Wild"];
const finishes = ["Splash", "Blend", "Swirl", "Rush", "Whip", "Fizz"];
const favoritesStorageKey = "smoothie-randomizer-favorites";

function pickOne(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildSmoothie() {
  const fruitOne = pickOne(ingredientPools.fruit);
  let fruitTwo = pickOne(ingredientPools.fruit);

  while (fruitTwo.name === fruitOne.name) {
    fruitTwo = pickOne(ingredientPools.fruit);
  }

  const ingredients = [
    fruitOne,
    fruitTwo,
    pickOne(ingredientPools.green),
    pickOne(ingredientPools.base),
    pickOne(ingredientPools.boost)
  ];

  return {
    id: crypto.randomUUID(),
    name: `${pickOne(adjectives)} ${fruitOne.name} ${pickOne(finishes)}`,
    ingredients,
    colorA: ingredients[0].color,
    colorB: ingredients[1].color,
    colorC: ingredients[2].color
  };
}

function getSmoothieSignature(smoothie) {
  return smoothie.ingredients.map((ingredient) => ingredient.name).sort().join("|");
}

function loadFavorites() {
  try {
    const savedFavorites = window.localStorage.getItem(favoritesStorageKey);
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  } catch {
    return [];
  }
}

export default function SmoothieRandomizer() {
  const [smoothie, setSmoothie] = useState(() => buildSmoothie());
  const [isBlending, setIsBlending] = useState(false);
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [editingSignature, setEditingSignature] = useState("");
  const [editingName, setEditingName] = useState("");

  const fallingIngredients = useMemo(
    () =>
      smoothie.ingredients.map((ingredient, index) => ({
        ...ingredient,
        delay: `${index * 0.15}s`,
        left: `${18 + index * 15}%`
      })),
    [smoothie]
  );

  const smoothieSignature = getSmoothieSignature(smoothie);
  const isFavorite = favorites.some((favorite) => favorite.signature === smoothieSignature);

  useEffect(() => {
    window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
  }, [favorites]);

  function randomizeSmoothie() {
    setIsBlending(true);
    setSmoothie(buildSmoothie());
    window.setTimeout(() => setIsBlending(false), 900);
  }

  function saveFavorite() {
    if (isFavorite) {
      return;
    }

    setFavorites((currentFavorites) => [
      {
        ...smoothie,
        signature: smoothieSignature,
        savedAt: new Date().toISOString()
      },
      ...currentFavorites
    ]);
  }

  function removeFavorite(signature) {
    setFavorites((currentFavorites) =>
      currentFavorites.filter((favorite) => favorite.signature !== signature)
    );
  }

  function startEditingFavorite(favorite) {
    setEditingSignature(favorite.signature);
    setEditingName(favorite.name);
  }

  function saveFavoriteName(signature) {
    const nextName = editingName.trim();

    if (!nextName) {
      setEditingSignature("");
      setEditingName("");
      return;
    }

    setFavorites((currentFavorites) =>
      currentFavorites.map((favorite) =>
        favorite.signature === signature ? { ...favorite, name: nextName } : favorite
      )
    );
    setEditingSignature("");
    setEditingName("");
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="recipe-panel">
          <p className="eyebrow">Smoothie lab</p>
          <h1>{smoothie.name}</h1>
          <div className="ingredient-grid" aria-label="Current smoothie ingredients">
            {smoothie.ingredients.map((ingredient) => (
              <div className="ingredient-card" key={`${smoothie.id}-${ingredient.name}`}>
                <span
                  className="ingredient-swatch"
                  style={{ backgroundColor: ingredient.color }}
                  aria-hidden="true"
                />
                <span>{ingredient.name}</span>
              </div>
            ))}
          </div>
          <button className="randomize-button" type="button" onClick={randomizeSmoothie}>
            <RefreshCw size={19} aria-hidden="true" />
            Randomize blend
          </button>
        </div>

        <div className="blender-stage" aria-label="Animated blender preview">
          <div className="ingredient-rain" aria-hidden="true">
            {fallingIngredients.map((ingredient, index) => (
              <span
                className="falling-bit"
                key={`${smoothie.id}-${ingredient.name}-${index}`}
                style={{
                  "--bit-color": ingredient.color,
                  "--bit-delay": ingredient.delay,
                  "--bit-left": ingredient.left
                }}
              >
                <span className={`fruit-shape ${ingredient.shape}`} />
              </span>
            ))}
          </div>

          <div className={`blender ${isBlending ? "is-blending" : ""}`}>
            <div className="lid" />
            <div className="jar">
              <div
                className="smoothie-fill"
                style={{
                  "--smoothie-a": smoothie.colorA,
                  "--smoothie-b": smoothie.colorB,
                  "--smoothie-c": smoothie.colorC
                }}
              >
              </div>
              <div className="blade">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="collar" />
            <button
              className={`base favorite-base ${isFavorite ? "is-favorite" : ""}`}
              type="button"
              onClick={saveFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "This smoothie is already saved as a favorite" : "Save this smoothie as a favorite"}
            >
              <Heart size={25} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
              <span className="power-light" />
              <Sparkles size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        <aside className="favorites-panel" aria-label="Saved smoothie favorites">
          <div className="favorites-header">
            <p className="eyebrow">Favorites</p>
            <span>{favorites.length}</span>
          </div>

          {favorites.length === 0 ? (
            <p className="empty-favorites">Click the blender base to save a combo for later.</p>
          ) : (
            <div className="favorites-list">
              {favorites.map((favorite) => (
                <article className="favorite-card" key={favorite.signature}>
                  <div>
                    {editingSignature === favorite.signature ? (
                      <input
                        className="favorite-name-input"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        onBlur={() => saveFavoriteName(favorite.signature)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.currentTarget.blur();
                          }
                        }}
                        aria-label={`Edit name for ${favorite.name}`}
                        autoFocus
                      />
                    ) : (
                      <h2>{favorite.name}</h2>
                    )}
                    <p>{favorite.ingredients.map((ingredient) => ingredient.name).join(", ")}</p>
                  </div>
                  {editingSignature === favorite.signature ? (
                    <button
                      className="edit-favorite"
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => saveFavoriteName(favorite.signature)}
                      aria-label={`Save name for ${favorite.name}`}
                    >
                      <Check size={17} aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      className="edit-favorite"
                      type="button"
                      onClick={() => startEditingFavorite(favorite)}
                      aria-label={`Edit name for ${favorite.name}`}
                    >
                      <Pencil size={17} aria-hidden="true" />
                    </button>
                  )}
                  <button
                    className="remove-favorite"
                    type="button"
                    onClick={() => removeFavorite(favorite.signature)}
                    aria-label={`Remove ${favorite.name} from favorites`}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
