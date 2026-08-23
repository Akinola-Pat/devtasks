import { useState, useMemo } from 'react';
import { useTheme } from "../../../context/ThemeContext";

export default function CssCursorPlayground() {
    const { dark } = useTheme();
    const [copied, setCopied] = useState('');

    const theme = useMemo(
        () =>
            dark
                ? {
                    page: "bg-zinc-950 text-zinc-100",
                    panel: "bg-zinc-900/60 border-zinc-800",
                    muted: "text-zinc-400",
                }
                : {
                    page: "bg-[#F8F9FA] text-zinc-900",
                    panel: "bg-white border-zinc-200",
                    muted: "text-zinc-500",
                },
        [dark],
    );

    // List of the most used CSS cursors
    const cursors = [
        'auto', 'default', 'pointer', 'crosshair',
        'move', 'text', 'wait', 'help',
        'not-allowed', 'grab', 'zoom-in', 'zoom-out'
    ];

    const copyToClipboard = (cursor) => {
        const cssCode = `cursor: ${cursor};`;
        navigator.clipboard.writeText(cssCode);
        setCopied(cursor);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">CSS Cursor Playground</h1>
            <p className="mb-8 text-gray-600">
                Hover over the cards to test the effect. Click at the card to copy the CSS style code.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cursors.map((cursor) => (
                    <div
                        key={cursor}
                        onClick={() => copyToClipboard(cursor)}
                        className="flex items-center justify-center h-24 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white text-gray-700"
                        style={{ cursor: cursor }}
                    >
            <span className="font-mono text-sm">
              {copied === cursor ? 'Copied!' : cursor}
            </span>
                    </div>
                ))}
            </div>
        </div>
    );
}