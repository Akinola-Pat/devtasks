import { useState } from 'react';
import { useTheme } from "../../../context/ThemeContext";
import {Link} from "react-router-dom";

export default function CssCursorPlayground() {
    const { dark } = useTheme();
    const [copied, setCopied] = useState('');

    const theme = {
        light: {
            wrapper: "bg-[#F8F9FA] text-zinc-900",
            card: "bg-white border-zinc-200/85 hover:border-zinc-400 hover:shadow-md hover:-translate-y-1",
            muted: "text-zinc-500",
        },
        dark: {
            wrapper: "bg-[#090A0F] text-zinc-100",
            card: "bg-zinc-900/50 border-zinc-800/85 hover:border-zinc-600 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1",
            muted: "text-zinc-400",
        },
    };

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
        <div className={`min-h-screen ${theme.page} transition-colors duration-300`}>
            <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link
                        to="/devutilities"
                        className={`mb-4 inline-flex text-sm ${theme.muted} hover:underline`}
                    >
                        ← Back to Dev Utilities
                    </Link>

                    <h1 className="text-3xl font-bold tracking-tight">
                        CSS Cursor Playground
                    </h1>

                    <p className={`mt-2 max-w-3xl ${theme.muted}`}>
                        Hover over the cards to test the effect. Click at the card to copy the CSS style code.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {cursors.map((cursor) => (
                        <div
                            key={cursor}
                            onClick={() => copyToClipboard(cursor)}
                            className={`flex items-center justify-center h-28 rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 ${theme.panel} ${theme.cardHover}`}
                            style={{ cursor: cursor }}
                        >
                            <span
                                className={`font-mono text-sm font-semibold transition-colors duration-200 ${
                                    copied === cursor
                                        ? 'text-green-500 dark:text-green-400'
                                        : ''
                                }`}
                            >
                                {copied === cursor ? 'Copied!' : cursor}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}