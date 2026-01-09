import { memo, useMemo } from "react";
import DOMPurify from 'dompurify';

interface PostContentProps {
    content: string;
    onClick: () => void;
}

export const PostContent = memo(({ content, onClick }: PostContentProps) => {
    // Memoize sanitized content to prevent expensive recalculations
    const sanitizedContent = useMemo(
        () => DOMPurify.sanitize(content.replace(/\n/g, '<br />')),
        [content]
    );

    return (
        <div
            className="mb-4 prose dark:prose-invert max-w-none cursor-pointer hover:opacity-90 transition-opacity leading-relaxed"
            onClick={onClick}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    );
});

PostContent.displayName = "PostContent";
