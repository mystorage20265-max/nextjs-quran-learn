// Utility function to parse and render translation text with footnotes
export function parseTranslationWithFootnotes(text: string): React.ReactNode {
    if (!text) return text;

    // Regular expression to match <sup foot_note=NUMBER>CONTENT</sup>
    const footnoteRegex = /<sup\s+foot_note=(\d+)>([^<]+)<\/sup>/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = footnoteRegex.exec(text)) !== null) {
        // Add text before the footnote
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        // Add the footnote as a proper superscript
        const footnoteId = match[1];
        const footnoteText = match[2];

        parts.push(
            <sup
                key={`footnote-${footnoteId}-${match.index}`}
                className="translation-footnote"
                title={`Footnote ${footnoteId}`}
                style={{
                    fontSize: '0.7em',
                    verticalAlign: 'super',
                    cursor: 'help',
                    color: 'var(--rq-primary, #047857)',
                    fontWeight: '600',
                    marginLeft: '2px'
                }}
            >
                {footnoteText}
            </sup>
        );

        lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last footnote
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
}
