import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react";

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "What went well? What could you improve? How did you feel?",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0f141f]">
      <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-[#1a1f2e]">
        {[
          { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
          { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
          { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
          { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
          { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
        ].map((item, i) => (
          <React.Fragment key={i}>
            <button
              type="button"
              onClick={item.action}
              className={`p-2 rounded transition-colors ${
                item.active ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon className="h-4 w-4" />
            </button>
          </React.Fragment>
        ))}
      </div>
      <EditorContent 
        editor={editor} 
        className="prose prose-invert max-w-none p-4 min-h-[150px] focus:outline-none text-gray-300" 
      />
    </div>
  );
}
