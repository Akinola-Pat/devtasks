import { useState, useMemo } from "react";
import { Tag, Copy, Check, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";

export default function SemverCalculator() {
  const [currentVersion, setCurrentVersion] = useState("1.4.2");
  const [preReleaseTag, setPreReleaseTag] = useState("beta.1");
  const [rangeInput, setRangeInput] = useState("^1.2.0");
  const [targetVersionTest, setTargetVersionTest] = useState("1.4.2");
  const [copiedKey, setCopiedKey] = useState(null);

  //this is for parsing the versions safely 
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

  //this section is for having bump calculations
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

  //this is for range calculating purpose
  const rangeMatchResult = useMemo(() => {
    const range = rangeInput.trim();
    const target = targetVersionTest.trim().replace(/^v/i, "");

    const targetParts = target.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!targetParts) return { valid: false, message: "Invalid target version format (use X.Y.Z)" };

    const tMaj = parseInt(targetParts[1], 10);
    const tMin = parseInt(targetParts[2], 10);
    const tPatch = parseInt(targetParts[3], 10);
    if (/^\d+\.\d+\.\d+$/.test(range)) {
      const match = range === target;
      return { valid: true, matches: match, desc: `Requires exact match ${range}` };
    }

    // Caret ^ (allows changes that do not modify the left-most non-zero digit)
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

    // Tilde ~ (allows patch-level changes if minor is specified)
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
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Tag className="w-6 h-6" /> SemVer Calculator & Range Tester
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Calculate version bumps, inspect Semantic Version components, and test dependency ranges completely offline.
        </p>
      </div>
      <div className="p-5 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <label className="text-xs uppercase font-mono tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              Current Version
            </label>
            <input
              type="text"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full px-3 py-2 text-base font-mono font-bold bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="text-xs uppercase font-mono tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              Pre-release Label
            </label>
            <input
              type="text"
              value={preReleaseTag}
              onChange={(e) => setPreReleaseTag(e.target.value)}
              placeholder="beta.1"
              className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
        </div>

        {/*semantic anatomy*/}
        {parsed ? (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">MAJOR (Breaking)</span>
              <span className="text-lg font-mono font-bold text-neutral-900 dark:text-white">{parsed.major}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">MINOR (Feature)</span>
              <span className="text-lg font-mono font-bold text-neutral-900 dark:text-white">{parsed.minor}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">PATCH (Bugfix)</span>
              <span className="text-lg font-mono font-bold text-neutral-900 dark:text-white">{parsed.patch}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
            Please enter a valid version format like <code>1.0.0</code>
          </div>
        )}
      </div>

      {/*bump calculation cards*/}
      {bumps && (
        <div className="space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-neutral-500 dark:text-neutral-400 block">
            Next Version Calculators
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: "Patch", desc: "Backwards-compatible bug fix", val: bumps.patch },
              { type: "Minor", desc: "Backwards-compatible feature", val: bumps.minor },
              { type: "Major", desc: "Breaking API change", val: bumps.major },
              { type: "Pre-release", desc: "Alpha/Beta/RC release", val: bumps.preRelease },
            ].map(({ type, desc, val }) => (
              <div
                key={type}
                className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900 dark:text-white">{type}</span>
                    <button
                      onClick={() => copyToClipboard(val, type)}
                      className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                      title="Copy version"
                    >
                      {copiedKey === type ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">{desc}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-base font-mono font-bold text-neutral-900 dark:text-white">{val}</span>
                  <button
                    onClick={() => setCurrentVersion(val)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
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

      {/*dependency range testing*/}
      <div className="p-5 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            Range Constraint Tester (^ and ~)
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Test whether a package.json range constraint accepts a given version.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
              Range Rule (e.g. ^1.2.0, ~1.2.0)
            </label>
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
              Version to Evaluate
            </label>
            <input
              type="text"
              value={targetVersionTest}
              onChange={(e) => setTargetVersionTest(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
        </div>

        {/*result box*/}
        <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {rangeMatchResult.valid ? (
              rangeMatchResult.matches ? (
                <CheckCircle2 className="w-5 h-5 text-neutral-900 dark:text-white" />
              ) : (
                <XCircle className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              )
            ) : (
              <span className="w-2 h-2 rounded-full bg-neutral-400" />
            )}
            <div>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white block">
                {rangeMatchResult.valid
                  ? rangeMatchResult.matches
                    ? `SATISFIES: ${targetVersionTest} is accepted by ${rangeInput}`
                    : `REJECTED: ${targetVersionTest} does NOT satisfy ${rangeInput}`
                  : rangeMatchResult.message}
              </span>
              {rangeMatchResult.desc && (
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                  {rangeMatchResult.desc}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}