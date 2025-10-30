export function linkify(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
        if (part.match(urlRegex)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-blue hover:underline break-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
}
