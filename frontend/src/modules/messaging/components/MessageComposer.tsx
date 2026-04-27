import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";

interface Props {
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageComposer: React.FC<Props> = ({
  onSend,
  disabled,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!body.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(body);
      setBody("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [body]);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white border-t flex items-end gap-2"
    >
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t("common:messaging.type_message")}
        disabled={disabled || isSending}
        className="flex-1 max-h-32 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        rows={1}
      />
      <button
        type="submit"
        disabled={!body.trim() || disabled || isSending}
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
      >
        <Send size={20} />
      </button>
    </form>
  );
};
