import React, { useMemo, useState } from "react";

// Devil Wears Prada themed recipes
// - Two small-bites recipes
// - One cocktail with a zero-proof toggle
// Tailwind is assumed to be configured in the host app.

export default function Recipes() {
  const [unitSystem, setUnitSystem] = useState("US"); // "US" | "Metric"

  const recipes = useMemo(() => getRecipes(), []);

  return (
    <section className="section max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-white tracking-tight text-white">
            The Devil Wears Prada - Menu
          </h2>
          <p className="text-white-600 dark:text-white-300 mt-1">
            Chic, quick, and camera-ready. Two bites and a runway-blue spritz.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setUnitSystem("US")}
            className={cx(
              "px-3 py-1.5 text-sm rounded-lg transition",
              unitSystem === "US"
                ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            )}
            aria-pressed={unitSystem === "US"}
          >
            US units
          </button>
          <button
            onClick={() => setUnitSystem("Metric")}
            className={cx(
              "px-3 py-1.5 text-sm rounded-lg transition",
              unitSystem === "Metric"
                ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            )}
            aria-pressed={unitSystem === "Metric"}
          >
            Metric
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} unitSystem={unitSystem} />
        ))}
      </div>
    </section>
  );
}

function RecipeCard({ recipe, unitSystem }) {
  const [servings, setServings] = useState(recipe.baseServings);
  const [copied, setCopied] = useState(false);
  const [na, setNa] = useState(false); // for cocktail

  const scale = servings / recipe.baseServings;

  function copyList() {
    const lines = [];
    lines.push(`${recipe.title} - shopping list (${unitSystem})`);

    const workingIngredients =
      recipe.isCocktail && na
        ? recipe.ingredientsNA ?? recipe.ingredients
        : recipe.ingredients;

    for (const ing of workingIngredients) {
      const line = formatIngredientLine(ing, scale, unitSystem);
      if (line) lines.push(`• ${line}`);
    }
    const text = lines.join("\n");
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => setCopied(true));
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <article
      className={cx(
        "relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-rose-100 dark:bg-rose-900",
        recipe.isCocktail
          ? "from-sky-100 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30"
          : "from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/40"
      )}
    >
      {/* top banner */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-3">
          <Badge>{recipe.isCocktail ? "Cocktail" : "Bite"}</Badge>
          {recipe.tags?.map((t) => (
            <Badge key={t} subtle>
              {t}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Meta icon={<ClockIcon />} label={recipe.time} />
          <span className="hidden sm:inline">•</span>
          <Meta icon={<ChefHatIcon />} label={recipe.difficulty} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {recipe.title}
        </h3>
        {recipe.kicker && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {recipe.kicker}
          </p>
        )}

        <div className="mt-4 grid gap-6 sm:grid-cols-5">
          {/* image block */}
          <div className="sm:col-span-2">
            <div
              className={cx(
                "aspect-[4/3] w-full rounded-xl border border-slate-200/70 dark:border-slate-700/60",
                "bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.12),transparent_40%),_radial-gradient(ellipse_at_bottom_right,rgba(29,78,216,0.14),transparent_42%)]",
                "flex items-center justify-center overflow-hidden"
              )}
            >
              <img
                src={recipe.image || "/images/placeholder.jpg"}
                alt={recipe.title}
                className="object-cover w-full h-full"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const el = e.currentTarget;
                  if (el.src.indexOf("/images/placeholder.jpg") === -1) {
                    el.src = "/images/placeholder.jpg";
                  }
                }}
              />
            </div>
          </div>

          {/* ingredients */}
          <div className="sm:col-span-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Meta
                  icon={<UsersIcon />}
                  label={`${servings} ${recipe.servingLabel}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setServings((s) => Math.max(1, s - (recipe.stepSize || 1)))
                  }
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 hover:shadow"
                  aria-label="decrease servings"
                >
                  −
                </button>
                <button
                  onClick={() => setServings((s) => s + (recipe.stepSize || 1))}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 hover:shadow"
                  aria-label="increase servings"
                >
                  +
                </button>
                <button
                  onClick={copyList}
                  className="ml-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm hover:opacity-90"
                >
                  {copied ? "Copied" : "Copy list"}
                </button>
              </div>
            </div>

            {recipe.isCocktail && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    checked={na}
                    onChange={(e) => setNa(e.target.checked)}
                  />
                  <span className="text-slate-700 dark:text-slate-200">
                    Zero-proof version
                  </span>
                </label>
              </div>
            )}

            <ul className="mt-4 space-y-2">
              {(recipe.isCocktail && na
                ? recipe.ingredientsNA ?? recipe.ingredients
                : recipe.ingredients
              ).map((ing, i) => (
                <li key={i} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-slate-800 dark:text-slate-100">
                    {renderIngredient(ing, scale, unitSystem)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* steps */}
        <div className="mt-6">
          <h4 className="font-semibold text-slate-900 dark:text-white">Steps</h4>
          <ol className="mt-2 space-y-2 list-decimal list-inside text-slate-800 dark:text-slate-100">
            {(recipe.isCocktail && na
              ? recipe.stepsNA ?? recipe.steps
              : recipe.steps
            ).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        {/* tips */}
        {recipe.tips?.length ? (
          <div className="mt-5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
            <h5 className="font-semibold text-slate-900 dark:text-white">
              Pro tips
            </h5>
            <ul className="mt-2 list-disc list-inside text-slate-700 dark:text-slate-200 space-y-1">
              {recipe.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* ----------------------------- Recipe Data ----------------------------- */

function getRecipes() {
  return [
    {
      id: "cerulean-crostini",
      title: "Cerulean Crostini - Seared Steak + Blue Cheese",
      kicker: "A wink at the cerulean monologue. Punchy, elegant, two bites max.",
      isCocktail: false,
      time: "30 min",
      difficulty: "Easy",
      tags: ["make-ahead", "party"],
      baseServings: 12,
      servingLabel: "pieces",
      stepSize: 2,
      image: "/images/steak.jpg",
      ingredients: [
        qtyUSMetric(
          { us: [24, "slice"], metric: [24, "slice"] },
          "Baguette, 1/2 inch slices"
        ),
        qtyUSMetric({ us: [3, "tbsp"], metric: [45, "mL"] }, "Olive oil"),
        qtyUSMetric({ us: [1, "clove"], metric: [1, "clove"] }, "Garlic, halved"),
        qtyUSMetric({ us: [12, "oz"], metric: [340, "g"] }, "Flank steak"),
        qtyUSMetric(
          { us: [4, "oz"], metric: [115, "g"] },
          "Gorgonzola or blue cheese, crumbled"
        ),
        qtyUSMetric({ us: [2, "cup"], metric: [60, "g"] }, "Baby arugula"),
        qtyUSMetric({ us: [2, "tbsp"], metric: [30, "mL"] }, "Balsamic glaze"),
        noteOnly("Kosher salt and pepper, to taste"),
      ],
      steps: [
        "Heat broiler. Brush baguette slices with 2 tbsp oil and broil until golden. Rub tops lightly with cut garlic.",
        "Season steak with salt and pepper. Sear in 1 tbsp oil over high heat 3 to 4 min per side for medium-rare. Rest 5 min, then slice very thin across the grain.",
        "Top toasts with a few arugula leaves, warm steak, and crumbled blue cheese. Drizzle with balsamic glaze just before serving.",
      ],
      tips: [
        "Swap flank for sliced roast beef if you need true last-minute service.",
        "Warm the toasts in a 300°F oven for 3 minutes right before plating so the cheese softens slightly.",
      ],
    },
    {
      id: "runway-truffle-popcorn",
      title: "Runway Truffle Parmesan Popcorn",
      kicker: "Crisp, aromatic, and dangerously snackable between scenes.",
      isCocktail: false,
      time: "15 min",
      difficulty: "Easy",
      tags: ["stovetop", "shareable"],
      baseServings: 12, // cups popped
      servingLabel: "cups",
      stepSize: 2,
      image: "/images/pop.jpg",
      ingredients: [
        qtyUSMetric({ us: [0.5, "cup"], metric: [100, "g"] }, "Popcorn kernels"),
        qtyUSMetric({ us: [2, "tbsp"], metric: [30, "mL"] }, "Neutral oil"),
        qtyUSMetric({ us: [3, "tbsp"], metric: [42, "g"] }, "Unsalted butter, melted"),
        qtyUSMetric({ us: [1, "tsp"], metric: [5, "mL"] }, "Truffle oil"),
        qtyUSMetric({ us: [1, "cup"], metric: [80, "g"] }, "Parmesan, finely grated"),
        qtyUSMetric({ us: [1, "tsp"], metric: [1, "g"] }, "Fresh rosemary, minced"),
        qtyUSMetric({ us: [1, "tsp"], metric: [1, "tsp"] }, "Lemon zest"),
        qtyUSMetric({ us: [1, "tsp"], metric: [5, "g"] }, "Kosher salt"),
      ],
      steps: [
        "Heat oil in a large pot over medium-high. Add 3 kernels and cover. When they pop, add the rest of the kernels, shake, and cover again.",
        "Cook, shaking occasionally, until popping slows to 1 to 2 seconds between pops. Remove from heat.",
        "Toss with melted butter, truffle oil, Parmesan, rosemary, lemon zest, and salt until glossy and evenly coated.",
      ],
      tips: [
        "Go light on truffle oil. It should whisper, not shout.",
        "If using bagged popcorn, warm it in a low oven before dressing so it absorbs the butter nicely.",
      ],
    },
    {
      id: "cerulean-runway-spritz",
      title: "Cerulean Runway Spritz",
      kicker: "Color-shift moment. Butterfly pea tea ice meets lemon for that signature hue.",
      isCocktail: true,
      time: "5 min + ice time",
      difficulty: "Easy",
      tags: ["spritz", "make-ahead-ice"],
      baseServings: 1,
      servingLabel: "drink",
      stepSize: 1,
      image: "/images/spritz.jpg",
      ingredients: [
        qtyUSMetric(
          { us: [2, "oz"], metric: [60, "mL"] },
          "Strong butterfly pea flower tea, frozen as ice cubes"
        ),
        qtyUSMetric({ us: [1.5, "oz"], metric: [45, "mL"] }, "Gin"),
        qtyUSMetric({ us: [1, "oz"], metric: [30, "mL"] }, "Fresh lemon juice"),
        qtyUSMetric({ us: [0.5, "oz"], metric: [15, "mL"] }, "Simple syrup"),
        qtyUSMetric(
          { us: [2, "oz"], metric: [60, "mL"] },
          "Club soda or prosecco, to top"
        ),
        noteOnly("Lemon twist, to garnish"),
      ],
      steps: [
        "Brew a deep-blue butterfly pea tea, cool, and freeze in an ice tray. The cubes are your color agent.",
        "In a stemmed glass with the pea-tea ice, add gin, lemon juice, and simple syrup. Top with club soda or prosecco.",
        "Give a single gentle stir. As the ice melts, the drink shifts from blue to violet. Express a lemon twist over the top and drop it in.",
      ],
      ingredientsNA: [
        qtyUSMetric(
          { us: [2, "oz"], metric: [60, "mL"] },
          "Strong butterfly pea flower tea, frozen as ice cubes"
        ),
        qtyUSMetric(
          { us: [1.5, "oz"], metric: [45, "mL"] },
          "Zero-proof gin or additional soda"
        ),
        qtyUSMetric({ us: [1, "oz"], metric: [30, "mL"] }, "Fresh lemon juice"),
        qtyUSMetric({ us: [0.5, "oz"], metric: [15, "mL"] }, "Simple syrup"),
        qtyUSMetric({ us: [2.5, "oz"], metric: [75, "mL"] }, "Club soda, to top"),
        noteOnly("Lemon twist, to garnish"),
      ],
      stepsNA: [
        "Brew a deep-blue butterfly pea tea, cool, and freeze in an ice tray.",
        "In a stemmed glass with the pea-tea ice, add zero-proof gin or a splash more soda, plus lemon juice and simple syrup.",
        "Top with club soda, stir once, finish with a lemon twist.",
      ],
      tips: [
        "No pea flowers on hand - sub 1/2 oz blue curaçao for color, then reduce syrup to taste.",
        "For a make-ahead pitcher, multiply everything but the soda, keep chilled, and add soda just before pouring.",
      ],
    },
  ];
}

/* --------------------------- Rendering helpers -------------------------- */

function renderIngredient(ing, scale, unitSystem) {
  if (ing.kind === "note") return ing.label;

  const sys = unitSystem === "US" ? ing.us : ing.metric;

  if (!sys || sys.amount == null) {
    // count or non-scalable
    if (ing.countUnit) {
      const amount = Math.round((ing.count ?? 0) * scale);
      return `${amount} ${pluralize(ing.countUnit, amount)} ${ing.label}`;
    }
    return ing.label;
  }

  const amount = sys.amount * scale;
  const unit = sys.unit;
  return `${formatAmount(amount)} ${pluralize(unit, amount)} ${ing.label}`;
}

function formatIngredientLine(ing, scale, unitSystem) {
  if (ing.kind === "note") return ing.label;
  const sys = unitSystem === "US" ? ing.us : ing.metric;
  if (!sys || sys.amount == null) {
    if (ing.countUnit) {
      const amount = Math.round((ing.count ?? 0) * scale);
      return `${amount} ${pluralize(ing.countUnit, amount)} ${ing.label}`;
    }
    return ing.label;
  }
  const amount = sys.amount * scale;
  return `${formatAmount(amount)} ${pluralize(sys.unit, amount)} ${ing.label}`;
}

function qtyUSMetric(usMetric, label) {
  // usMetric: { us: [amount, unit], metric: [amount, unit] }
  const [usAmount, usUnit] = usMetric.us || [];
  const [mAmount, mUnit] = usMetric.metric || [];
  return {
    kind: "qty",
    label,
    us: usAmount != null ? { amount: usAmount, unit: usUnit } : null,
    metric: mAmount != null ? { amount: mAmount, unit: mUnit } : null,
  };
}

function noteOnly(label) {
  return { kind: "note", label };
}

/* ----------------------------- UI primitives ---------------------------- */

function Badge({ children, subtle }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        subtle
          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          : "bg-sky-600 text-white dark:bg-sky-500"
      )}
    >
      {children}
    </span>
  );
}

function Meta({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-4 w-4 opacity-70">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------- Icons ---------------------------------- */

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-full w-full"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ChefHatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-full w-full"
    >
      <path d="M7 22h10M6 18h12l-1-6h-10l-1 6ZM12 4a4 4 0 0 0-4 4 4 4 0 0 0-2 7h12a4 4 0 0 0-2-7 4 4 0 0 0-4-4Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-full w-full"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function GlassIcon({ className = "" }) {
  return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={cx("h-full w-full", className)}
      >
        <path d="M5 3h14l-2 7a7 7 0 0 1-6 5.5V21" />
        <path d="M12 15.5A7 7 0 0 1 6 10L5 3" />
      </svg>
  );
}

function PlateIcon({ className = "" }) {
  return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={cx("h-full w-full", className)}
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
      </svg>
  );
}

/* ------------------------------- Utils ---------------------------------- */

function pluralize(unit, amount) {
  const n = Number(amount);
  if (isNaN(n)) return unit;
  const abs = Math.abs(n);
  // crude pluralization, good enough for units used here
  if (abs === 1) return unit;
  if (unit === "oz") return "oz";
  if (unit === "mL") return "mL";
  if (unit === "tsp") return "tsp";
  if (unit === "tbsp") return "tbsp";
  return unit + "s";
}

function formatAmount(value) {
  const n = Number(value);
  if (!isFinite(n)) return String(value);
  if (n < 1) {
    const frac = toNearestFraction(n, [1 / 8, 1 / 6, 1 / 4, 1 / 3, 1 / 2]);
    return frac;
  }
  const whole = Math.floor(n);
  const remainder = n - whole;
  if (remainder < 1e-6) return String(whole);
  return `${whole} ${toNearestFraction(remainder, [1 / 8, 1 / 6, 1 / 4, 1 / 3, 1 / 2])}`;
}

function toNearestFraction(x, allowed) {
  let best = { diff: Infinity, str: "" };
  for (const f of allowed) {
    const num = Math.round(x / f);
    const val = num * f;
    const diff = Math.abs(x - val);
    if (diff < best.diff) {
      const fracStr = fractionString(num, Math.round(1 / f));
      best = { diff, str: fracStr };
    }
  }
  return best.str || x.toFixed(2);
}

function fractionString(num, den) {
  // reduce fraction
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (n === 0) return "0";
  if (d === 1) return `${n}`;
  return `${n}/${d}`;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
