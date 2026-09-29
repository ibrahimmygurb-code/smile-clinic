"use client";

import EmojiPicker, { Theme } from "emoji-picker-react";
import { resolveServiceIcon, serviceEmojiOptions } from "@/lib/service-icons";

type ServiceIconPickerProps = {
  value: string;
  onChange: (icon: string) => void;
  open: boolean;
  onClose: () => void;
};

function emojiBadgeClass(selected: boolean) {
  return [
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-xl leading-none transition",
    "hover:ring-2 hover:ring-accent/40",
    selected ? "ring-2 ring-accent" : "",
  ].join(" ");
}

export default function ServiceIconPicker({ value, onChange, open, onClose }: ServiceIconPickerProps) {
  if (!open) {
    return null;
  }

  const selectedEmoji = resolveServiceIcon(value);

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-3 py-2">
        <p className="text-xs font-semibold text-muted">اختر أيقونة</p>
        <div className="mt-2 grid grid-cols-6 gap-2 sm:grid-cols-8">
          {serviceEmojiOptions.map((emoji) => {
            const isSelected = emoji === selectedEmoji;
            return (
              <button
                key={emoji}
                type="button"
                title={emoji}
                onClick={() => {
                  onChange(emoji);
                  onClose();
                }}
                className={emojiBadgeClass(isSelected)}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </div>
      <EmojiPicker
        theme={Theme.LIGHT}
        width="100%"
        height={320}
        lazyLoadEmojis
        previewConfig={{ showPreview: false }}
        searchPlaceHolder="بحث في كل الإيموji..."
        onEmojiClick={(emojiData) => {
          onChange(emojiData.emoji);
          onClose();
        }}
      />
    </div>
  );
}
