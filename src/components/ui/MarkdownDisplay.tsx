
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownDisplayProps {
    content: string;
}

export const MarkdownDisplay = ({ content }: MarkdownDisplayProps) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ node, ...props }) => <h1 className="font-heading font-bold text-2xl text-slate-800 dark:text-white mt-6 mb-3" {...props} />,
                h2: ({ node, ...props }) => <h2 className="font-heading font-bold text-xl text-slate-800 dark:text-white mt-5 mb-2" {...props} />,
                h3: ({ node, ...props }) => <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mt-4 mb-2" {...props} />,
                h4: ({ node, ...props }) => <h4 className="font-heading font-bold text-base text-slate-800 dark:text-white mt-3 mb-1" {...props} />,
                p: ({ node, ...props }) => <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-sm" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-600 dark:text-slate-300 text-sm" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-2 mb-4 text-slate-600 dark:text-slate-300 text-sm" {...props} />,
                li: ({ node, ...props }) => <li className="marker:text-teal-500" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-teal-600 dark:text-teal-400" {...props} />,
                a: ({ node, ...props }) => <a className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline transition-colors" {...props} />,
                code: ({ node, ...props }) => <code className="bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 text-xs font-mono text-indigo-600 dark:text-indigo-300" {...props} />,
                blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-teal-500/50 pl-4 italic my-4 text-slate-500 dark:text-slate-400" {...props} />
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
};
