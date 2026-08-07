'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Heading3, Link2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Açıklama girin...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [isUploading, setIsUploading] = useState(false);

  // Sync value from prop to editor innerHTML (only if it differs to prevent cursor jumping)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html === '<br>' ? '' : html);
    }
  };

  const executeCommand = (command: string, arg: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleLink = () => {
    const url = prompt('Bağlantı URL\'sini girin (örn: https://example.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Upload file to Supabase storage bucket "boat-images" inside listings/rich-text/ folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const path = `listings/rich-text/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('boat-images')
        .upload(path, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('boat-images')
        .getPublicUrl(path);

      // Focus editor and insert the image HTML block at cursor position
      if (editorRef.current) {
        editorRef.current.focus();
      }
      
      const imgHtml = `<img src="${publicUrl}" style="max-width: 100%; max-height: 250px; border-radius: 8px; margin: 8px 0; display: inline-block; object-fit: contain;" alt="İçerik Görseli" />`;
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();

    } catch (err: any) {
      alert(`Görsel yüklenirken hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading same file name again
      e.target.value = '';
    }
  };

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'var(--bg-card)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '220px'
    }}>
      
      {/* TOOLBAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-body)',
        flexWrap: 'wrap'
      }}>
        
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          title="Kalın (B)"
          style={toolbarButtonStyle}
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('italic')}
          title="İtalik (I)"
          style={toolbarButtonStyle}
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('underline')}
          title="Altı Çizili (U)"
          style={toolbarButtonStyle}
        >
          <Underline size={16} />
        </button>

        <span style={dividerStyle} />

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          title="Başlık (H3)"
          style={toolbarButtonStyle}
        >
          <Heading3 size={16} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Madde İşaretli Liste"
          style={toolbarButtonStyle}
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          title="Numaralı Liste"
          style={toolbarButtonStyle}
        >
          <ListOrdered size={16} />
        </button>

        <span style={dividerStyle} />

        <button
          type="button"
          onClick={handleLink}
          title="Bağlantı Ekle"
          style={toolbarButtonStyle}
        >
          <Link2 size={16} />
        </button>

        {/* IMAGE UPLOAD BUTTON */}
        <label
          title="Görsel Ekle (Logo vb.)"
          style={{
            ...toolbarButtonStyle,
            cursor: isUploading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ImageIcon size={16} />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </label>
        
      </div>

      {/* EDITABLE CONTENT AREA */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: '12px 16px',
          outline: 'none',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          overflowY: 'auto',
          minHeight: '160px',
          maxHeight: '400px',
          background: 'transparent'
        }}
        className="rich-text-editor-content"
      />

      <style jsx global>{`
        .rich-text-editor-content:empty::before {
          content: attr(placeholder);
          color: var(--text-muted);
          opacity: 0.65;
          pointer-events: none;
        }
        .rich-text-editor-content h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 10px 0 6px 0;
          color: var(--text-primary);
        }
        .rich-text-editor-content ul {
          list-style-type: disc;
          padding-left: 20px;
          margin: 8px 0;
        }
        .rich-text-editor-content ol {
          list-style-type: decimal;
          padding-left: 20px;
          margin: 8px 0;
        }
        .rich-text-editor-content a {
          color: var(--color-primary);
          text-decoration: underline;
          font-weight: 600;
        }
      `}</style>

    </div>
  );
}

const toolbarButtonStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--text-secondary)',
  padding: '6px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
  outline: 'none',
  width: '30px',
  height: '30px'
};

const dividerStyle: React.CSSProperties = {
  width: '1px',
  height: '18px',
  background: 'var(--border)',
  margin: '0 4px'
};
