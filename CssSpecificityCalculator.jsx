import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";


export default function CssSpecificityCalculator() {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-200/85 shadow-sm",
      cardSoft: "bg-zinc-50 border-zinc-200/85",
      border: "border-zinc-200",
      textMuted: "text-zinc-500",
      input:
        "bg-white border-zinc-250 text-zinc-900 placeholder-zinc-400 focus:border-black",
      button: "bg-black text-white hover:bg-zinc-800",
      pill: "bg-zinc-50 border-zinc-200/85",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/40 border-zinc-800/85 backdrop-blur-md shadow-lg",
      cardSoft: "bg-zinc-950/50 border-zinc-800/80",
      border: "border-zinc-850",
      textMuted: "text-zinc-500",
      input:
        "bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-white",
      button: "bg-white text-black hover:bg-zinc-200",
      pill: "bg-zinc-950/50 border-zinc-800/80",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const [selector, setSelector] = useState("");
  const [specificity, setSpecificity] = useState(null);
  const [error, setError] = useState("");

  // Computes [ids, classesLikeCount, elementLikeCount] for a selector fragment.
  // Handles :not()/:is()/:has() by scoring their argument instead of flatly
  // adding 1 for the pseudo-class AND separately counting what's inside it
  // (per the CSS spec, :where() contributes nothing and :not()/:is()/:has()
  // take on the specificity of their most specific argument).
  const score = (fragment) => {
    let rest = fragment;
    let ids = 0;
    let classesLike = 0;
    let elementsLike = 0;

    // Attribute selectors count as classes; strip so their contents can't
    // later be mistaken for a bare element name.
    classesLike += (rest.match(/\[[^\]]*\]/g) || []).length;
    rest = rest.replace(/\[[^\]]*\]/g, " ");

    // Functional pseudo-classes: :name(arg)
    rest = rest.replace(/:([a-zA-Z-]+)\(([^()]*)\)/g, (_, name, arg) => {
      const lower = name.toLowerCase();
      if (lower === "where") {
        // :where() always contributes zero, argument included.
        return " ";
      }
      if (["not", "is", "has"].includes(lower)) {
        const [i, c, e] = score(arg.split(",")[0]);
        ids += i;
        classesLike += c;
        elementsLike += e;
        return " ";
      }
      // e.g. :nth-child(2n+1) — the pseudo-class itself counts as one
      // class-like selector, its argument is not a selector to score.
      classesLike += 1;
      return " ";
    });

    // Pseudo-elements: ::name
    elementsLike += (rest.match(/::[a-zA-Z-]+/g) || []).length;
    rest = rest.replace(/::[a-zA-Z-]+/g, " ");

    // Remaining simple pseudo-classes: :name (no parens left)
    classesLike += (rest.match(/:(?!:)[a-zA-Z-]+/g) || []).length;
    rest = rest.replace(/:(?!:)[a-zA-Z-]+/g, " ");

    ids += (rest.match(/#[a-zA-Z0-9_-]+/g) || []).length;
    rest = rest.replace(/#[a-zA-Z0-9_-]+/g, " ");

    classesLike += (rest.match(/\.[a-zA-Z0-9_-]+/g) || []).length;
    rest = rest.replace(/\.[a-zA-Z0-9_-]+/g, " ");

    elementsLike += (
      rest.match(/(^|[\s>+~])([a-zA-Z][a-zA-Z0-9_-]*|\*)/g) || []
    ).filter((m) => m.trim() !== "*").length;

    return [ids, classesLike, elementsLike];
  };

  const calculateSpecificity = () => {
    const trimmed = selector.trim();

    if (!trimmed) {
      setSpecificity(null);
      setError("Enter a selector first.");
      return;
    }

    setError("");

    const [ids, classesLike, elementsLike] = score(trimmed);

    setSpecificity({
      ids,
      classesLike,
      elementsLike,
      value: [ids, classesLike, elementsLike],
    });
  };

  const rows = specificity
    ? [
        { label: "IDs", value: specificity.ids },
        {
          label: "Classes, attrs, pseudo-classes",
          value: specificity.classesLike,
        },
        {
          label: "Elements, pseudo-elements",
          value: specificity.elementsLike,
        },
      ]
    : [];

  return (
    <div className={`min-h-full ${t.wrapper}`}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            CSS Specificity Calculator
          </h1>
          <p className={`text-sm mt-1 ${t.textMuted}`}>
            Paste a CSS selector to break down its specificity score.
          </p>
        </div>

        <div className={`p-4 sm:p-5 border rounded-3xl flex flex-col gap-3 ${t.card}`}>
          <textarea
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder="e.g. #header .nav li.active"
            rows={2}
            className={`w-full rounded-xl border px-3 py-2 text-sm font-mono outline-none transition-colors ${t.input}`}
          />

          <div className="flex items-center gap-3">
            <button
              onClick={calculateSpecificity}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${t.button}`}
            >
              Calculate Specificity
            </button>
            {error && (
              <span className="text-xs font-bold text-red-500">{error}</span>
            )}
          </div>
        </div>

        {specificity && (
          <div className={`mt-4 p-4 sm:p-5 border rounded-3xl ${t.card}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${t.pill}`}>
              ({specificity.value.join(", ")})
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {rows.map((row) => (
                <div key={row.label} className={`p-3 border rounded-xl ${t.cardSoft}`}>
                  <div className={`text-[10px] font-black uppercase tracking-wider ${t.textMuted}`}>
                    {row.label}
                  </div>
                  <div className="text-lg font-black tabular-nums mt-0.5">
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}