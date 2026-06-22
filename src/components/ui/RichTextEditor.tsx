import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Palette,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

export type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  editorClassName?: string
  'aria-label'?: string
}

const toolbarButtonClass =
  'inline-flex size-8 items-center justify-center rounded-md text-nav transition-colors hover:bg-surface-input hover:text-ink-heading'

const editorSurfaceClass =
  'min-h-[220px] w-full bg-surface-input px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:bg-white focus:ring-2 focus:ring-primary-50'

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your message...',
  className,
  editorClassName,
  'aria-label': ariaLabel = 'Rich text editor',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const isInternalChange = useRef(false)

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || isInternalChange.current) return
    if (editor.innerHTML !== value) {
      editor.innerHTML = value
    }
  }, [value])

  const syncValue = () => {
    const html = editorRef.current?.innerHTML ?? ''
    isInternalChange.current = true
    onChange(html)
    window.requestAnimationFrame(() => {
      isInternalChange.current = false
    })
  }

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    syncValue()
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-[#e2e8f0]/60 bg-white',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#e2e8f0]/60 bg-[#FAFBFC] px-2 py-1.5">
        <button type="button" className={toolbarButtonClass} aria-label="Undo" onClick={() => runCommand('undo')}>
          <Undo2 className="size-4" />
        </button>
        <button type="button" className={toolbarButtonClass} aria-label="Redo" onClick={() => runCommand('redo')}>
          <Redo2 className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-[#e2e8f0]" aria-hidden />
        <button type="button" className={toolbarButtonClass} aria-label="Bold" onClick={() => runCommand('bold')}>
          <Bold className="size-4" />
        </button>
        <button type="button" className={toolbarButtonClass} aria-label="Italic" onClick={() => runCommand('italic')}>
          <Italic className="size-4" />
        </button>
        <button type="button" className={toolbarButtonClass} aria-label="Underline" onClick={() => runCommand('underline')}>
          <Underline className="size-4" />
        </button>
        <button type="button" className={toolbarButtonClass} aria-label="Strikethrough" onClick={() => runCommand('strikeThrough')}>
          <Strikethrough className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-[#e2e8f0]" aria-hidden />
        <button type="button" className={toolbarButtonClass} aria-label="Bullet list" onClick={() => runCommand('insertUnorderedList')}>
          <List className="size-4" />
        </button>
        <button type="button" className={toolbarButtonClass} aria-label="Numbered list" onClick={() => runCommand('insertOrderedList')}>
          <ListOrdered className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-[#e2e8f0]" aria-hidden />
        <button type="button" className={toolbarButtonClass} aria-label="Align left" onClick={() => runCommand('justifyLeft')}>
          <AlignLeft className="size-4" />
        </button>
        <button type="button" className={toolbarButtonClass} aria-label="Align center" onClick={() => runCommand('justifyCenter')}>
          <AlignCenter className="size-4" />
        </button>
        <button type="button" className={toolbarButtonClass} aria-label="Align right" onClick={() => runCommand('justifyRight')}>
          <AlignRight className="size-4" />
        </button>
        <button type="button" className={toolbarButtonClass} aria-label="Justify" onClick={() => runCommand('justifyFull')}>
          <AlignJustify className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-[#e2e8f0]" aria-hidden />
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label="Insert link"
          onClick={() => {
            const url = window.prompt('Enter URL')
            if (url) runCommand('createLink', url)
          }}
        >
          <Link2 className="size-4" />
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label="Text color"
          onClick={() => colorInputRef.current?.click()}
        >
          <Palette className="size-4" />
        </button>
        <input
          ref={colorInputRef}
          type="color"
          className="sr-only"
          aria-hidden
          onChange={(event) => runCommand('foreColor', event.target.value)}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-label={ariaLabel}
        data-placeholder={placeholder}
        className={cn(
          editorSurfaceClass,
          'empty:before:pointer-events-none empty:before:text-[#6b7280] empty:before:content-[attr(data-placeholder)]',
          editorClassName,
        )}
        onInput={syncValue}
        onBlur={syncValue}
      />
    </div>
  )
}
