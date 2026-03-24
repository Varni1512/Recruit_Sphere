"use client"

import dynamic from 'next/dynamic'
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Dynamically import the markdown previewer safely for Next.js SSR
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false })

export default function MarkdownViewer({ source }: { source: string }) {
    return (
        <div data-color-mode="light" className="w-full">
            <MarkdownPreview 
                source={source} 
                style={{ backgroundColor: 'transparent', color: 'inherit', fontFamily: 'inherit' }} 
            />
        </div>
    )
}
