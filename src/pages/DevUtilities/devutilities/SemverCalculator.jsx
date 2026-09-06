import { useState, useMemo } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Link } from "react-router-dom";
import { Copy, Check, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";

export default function SemverCalculator() {
  const { dark } = useTheme();

  const [currentVersion, setCurrentVersion] = useState("1.4.2");
  const [preReleaseTag, setPreReleaseTag] = useState("beta.1");
  const [rangeInput, setRangeInput] = useState("^1.2.0");
  const [targetVersionTest, setTargetVersionTest] = useState("1.4.2");
  const [copiedKey, setCopiedKey] = useState(null);

  // Parse Version safely
  const parsed = useMemo(() => {
    const clean = currentVersion.trim().replace(/^v/i, "");
    const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
    if (!match) return null;
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      pre: match[4] || "",
    };
  }, [currentVersion]);

  // Bump calculations
  const bumps = useMemo(() => {
    if (!parsed) return null;
    const { major, minor, patch } = parsed;
    return {
      patch: `${major}.${minor}.${patch + 1}`,
      minor: `${major}.${minor + 1}.0`,
      major: `${major + 1}.0.0`,
      preRelease: `${major}.${minor}.${patch + 1}-${preReleaseTag.trim() || "rc.1"}`,
    };
  }, [parsed, preReleaseTag]);

  // SemVer range evaluator
  const rangeMatchResult = useMemo(() => {
    const range = rangeInput.trim();
    const target = targetVersionTest.trim().replace(/^v/i, "");

    const targetParts = target.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!targetParts) return { valid: false, message: "Invalid target version format (use X.Y.Z)" };

    const tMaj = parseInt(targetParts[1], 10);
    const tMin = parseInt(targetParts[2], 10);
    const tPatch = parseInt(targetParts[3], 10);

    // Exact match
    if (/^\d+\.\d+\.\d+$/.test(range)) {
      const match = range === target;
      return { valid: true, matches: match, desc: `Requires exact match ${range}` };
    }

    // Caret ^
    if (range.startsWith("^")) {
      const rParts = range.slice(1).match(/^(\d+)\.(\d+)\.(\d+)$/);
      if (!rParts) return { valid: false, message: "Invalid range syntax" };
      const rMaj = parseInt(rParts[1], 10);
      const rMin = parseInt(rParts[2], 10);
      const rPatch = parseInt(rParts[3], 10);

      const matches =
        tMaj === rMaj &&
        (tMin > rMin || (tMin === rMin && tPatch >= rPatch));

      return {
        valid: true,
        matches,
        desc: `Allows >= ${rParts[0]} and < ${rMaj + 1}.0.0 (compatible updates)`,
      };
    }

    // Tilde ~
    if (range.startsWith("~")) {
      const rParts = range.slice(1).match(/^(\d+)\.(\d+)\.(\d+)$/);
      if (!rParts) return { valid: false, message: "Invalid range syntax" };
      const rMaj = parseInt(rParts[1], 10);
      const rMin = parseInt(rParts[2], 10);
      const rPatch = parseInt(rParts[3], 10);

      const matches =
        tMaj === rMaj &&
        tMin === rMin &&
        tPatch >= rPatch;

      return {
        valid: true,
        matches,
        desc: `Allows >= ${rParts[0]} and < ${rMaj}.${rMin + 1}.0 (patch fixes only)`,
      };
    }

    return { valid: false, message: "Use caret (^) or tilde (~) notation like ^1.2.0 or ~1.2.0" };
  }, [rangeInput, targetVersionTest]);

  const copyToClipboard = (val, key) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 relative flex items-center justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      {/* Background blurs */}
      <div
        className={`absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 ${
          dark ? "bg-zinc-800" : "bg-neutral-300"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 ${
          dark ? "bg-zinc-900" : "bg-neutral-200"
        }`}
      />

      {/* Main Card Container */}
      <div
        className={`relative z-10 w-full max-w-7xl rounded-[32px] border shadow-xl overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        {/* Header section */}
        <div className="px-6 sm:px-8 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/devutilities"
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
                dark
                  ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                  : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300"
              }`}
              title="Back to Workspace"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1
                className={`text-2xl font-black uppercase tracking-tight ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                SEMVER CALCULATOR & RANGE TESTER
              </h1>
              <p
                className={`text-xs sm:text-sm mt-0.5 ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                Calculate version bumps and test package range constraints completely offline.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Version Inputs & Anatomy */}
          <div
            className={`p-6 rounded-2xl border space-y-5 ${
              dark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest block mb-2 ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Current Version
                </label>
                <input
                  type="text"
                  value={currentVersion}
                  onChange={(e) => setCurrentVersion(e.target.value)}
                  placeholder="1.0.0"
                  className={`w-full px-4 py-3 rounded-xl border text-base font-mono font-bold outline-none transition-all ${
                    dark
                      ? "bg-zinc-900 border-zinc-700 text-white focus:border-white"
                      : "bg-white border-neutral-300 text-black focus:border-black"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`text-xs font-black uppercase tracking-widest block mb-2 ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Pre-release Label
                </label>
                <input
                  type="text"
                  value={preReleaseTag}
                  onChange={(e) => setPreReleaseTag(e.target.value)}
                  placeholder="beta.1"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all ${
                    dark
                      ? "bg-zinc-900 border-zinc-700 text-white focus:border-white"
                      : "bg-white border-neutral-300 text-black focus:border-black"
                  }`}
                />
              </div>
            </div>

            {/* Semantic Breakdown */}
            {parsed && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div
                  className={`p-3 rounded-xl border text-center ${
                    dark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-neutral-200"
                  }`}
                >
                  <span className={`text-[11px] font-black uppercase tracking-wider block ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
                    MAJOR (Breaking)
                  </span>
                  <span className={`text-xl font-mono font-black mt-0.5 block ${dark ? "text-white" : "text-black"}`}>
                    {parsed.major}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl border text-center ${
                    dark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-neutral-200"
                  }`}
                >
                  <span className={`text-[11px] font-black uppercase tracking-wider block ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
                    MINOR (Feature)
                  </span>
                  <span className={`text-xl font-mono font-black mt-0.5 block ${dark ? "text-white" : "text-black"}`}>
                    {parsed.minor}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl border text-center ${
                    dark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-neutral-200"
                  }`}
                >
                  <span className={`text-[11px] font-black uppercase tracking-wider block ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
                    PATCH (Bugfix)
                  </span>
                  <span className={`text-xl font-mono font-black mt-0.5 block ${dark ? "text-white" : "text-black"}`}>
                    {parsed.patch}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Next Version Calculators */}
          {bumps && (
            <div className="space-y-3">
              <label
                className={`text-xs font-black uppercase tracking-widest block ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                Next Version Calculators
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: "Patch", desc: "Backwards-compatible bug fix", val: bumps.patch },
                  { type: "Minor", desc: "Backwards-compatible feature", val: bumps.minor },
                  { type: "Major", desc: "Breaking API change", val: bumps.major },
                  { type: "Pre-release", desc: "Alpha/Beta/RC release", val: bumps.preRelease },
                ].map(({ type, desc, val }) => (
                  <div
                    key={type}
                    className={`p-4 rounded-2xl border flex flex-col justify-between ${
                      dark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black uppercase tracking-wider ${dark ? "text-white" : "text-black"}`}>
                          {type}
                        </span>
                        <button
                          onClick={() => copyToClipboard(val, type)}
                          className={`p-1 rounded-lg transition ${
                            dark ? "text-zinc-400 hover:text-white" : "text-neutral-500 hover:text-black"
                          }`}
                          title="Copy version"
                        >
                          {copiedKey === type ? (
                            <Check className={`w-3.5 h-3.5 ${dark ? "text-white" : "text-black"}`} />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className={`text-[11px] mt-1 leading-snug ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
                        {desc}
                      </p>
                    </div>

                    <div
                      className={`mt-4 flex items-center justify-between pt-3 border-t ${
                        dark ? "border-zinc-800" : "border-neutral-200"
                      }`}
                    >
                      <span className={`text-base font-mono font-black ${dark ? "text-white" : "text-black"}`}>
                        {val}
                      </span>
                      <button
                        onClick={() => setCurrentVersion(val)}
                        className={`p-1 rounded-lg transition ${
                          dark ? "text-zinc-400 hover:text-white" : "text-neutral-500 hover:text-black"
                        }`}
                        title="Promote to current version"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Range Constraint Tester */}
          <div
            className={`p-6 rounded-2xl border space-y-4 ${
              dark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div>
              <h2 className={`text-sm font-black uppercase tracking-wide ${dark ? "text-white" : "text-black"}`}>
                Range Constraint Tester (^ and ~)
              </h2>
              <p className={`text-xs mt-0.5 ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
                Test whether a package.json range constraint accepts a given version.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`text-xs font-black uppercase tracking-widest block mb-2 ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Range Rule (e.g., ^1.2.0, ~1.2.0)
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all ${
                    dark
                      ? "bg-zinc-900 border-zinc-700 text-white focus:border-white"
                      : "bg-white border-neutral-300 text-black focus:border-black"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`text-xs font-black uppercase tracking-widest block mb-2 ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Version to Evaluate
                </label>
                <input
                  type="text"
                  value={targetVersionTest}
                  onChange={(e) => setTargetVersionTest(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all ${
                    dark
                      ? "bg-zinc-900 border-zinc-700 text-white focus:border-white"
                      : "bg-white border-neutral-300 text-black focus:border-black"
                  }`}
                />
              </div>
            </div>

            {/* Range Result Box */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {rangeMatchResult.valid ? (
                  rangeMatchResult.matches ? (
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${dark ? "text-white" : "text-black"}`} />
                  ) : (
                    <XCircle className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  )
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                )}
                <div>
                  <span className={`text-xs font-mono font-bold block ${dark ? "text-white" : "text-black"}`}>
                    {rangeMatchResult.valid
                      ? rangeMatchResult.matches
                        ? `SATISFIES: ${targetVersionTest} is accepted by ${rangeInput}`
                        : `REJECTED: ${targetVersionTest} does NOT satisfy ${rangeInput}`
                      : rangeMatchResult.message}
                  </span>
                  {rangeMatchResult.desc && (
                    <span className={`text-[11px] block mt-0.5 ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
                      {rangeMatchResult.desc}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}