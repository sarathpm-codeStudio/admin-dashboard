import { useState } from 'react'

// A lightweight, dependency-free emoji picker: category tabs over a scrollable
// grid. Rendered as a popover by the caller (position it relatively). Selecting
// an emoji calls onSelect; the caller decides whether to keep the picker open.
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Smileys',
    emojis: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥳 🤩 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😴 🤤 😪 🥱 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕'.split(' '),
  },
  {
    label: 'Gestures',
    emojis: '👍 👎 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤝 🙏 ✍️ 💪 🦾 👏 🙌 👐 🤲'.split(' '),
  },
  {
    label: 'Hearts',
    emojis: '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝'.split(' '),
  },
  {
    label: 'Animals',
    emojis: '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🐤 🦄 🐝 🦋 🐢 🐙 🦖'.split(' '),
  },
  {
    label: 'Food',
    emojis: '🍎 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🥑 🌽 🥕 🍔 🍟 🍕 🌭 🍿 🧁 🍰 🎂 🍩 🍪 ☕ 🍵 🍺 🍻 🥂 🍷'.split(' '),
  },
  {
    label: 'Activities',
    emojis: '⚽ 🏀 🏈 ⚾ 🎾 🏐 🎱 🏓 🏸 🥅 🎯 🎮 🎲 🎸 🎹 🎺 🎻 🥁 🎨 🏆 🥇 🎉 🎊 🎈'.split(' '),
  },
  {
    label: 'Travel',
    emojis: '🚗 🚕 🚙 🚌 🏎️ 🚓 🚑 🚒 ✈️ 🚀 🛸 🚁 ⛵ 🚤 🏝️ 🗺️ 🧭 🏔️ 🌋 🗽 🎡 🎢'.split(' '),
  },
  {
    label: 'Objects',
    emojis: '💡 🔦 📱 💻 ⌨️ 🖥️ 🖨️ 📷 📸 🎥 📺 ⏰ ⏳ 💰 💎 🔑 🔒 🔓 🔔 📌 📍 📎 ✂️ 📝 📚'.split(' '),
  },
  {
    label: 'Symbols',
    emojis: '✅ ❌ ⭐ 🌟 ✨ ⚡ 🔥 💥 💫 🎵 🎶 💯 ✔️ ❓ ❗ 💤 🚀 🌈 ☀️ 🌙'.split(' '),
  },
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [active, setActive] = useState(0)
  const group = EMOJI_GROUPS[active] ?? EMOJI_GROUPS[0]!

  return (
    <div className="absolute bottom-full left-0 z-50 mb-2 w-[320px] rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-2 py-2 scrollbar-hide">
        {EMOJI_GROUPS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            onClick={() => setActive(i)}
            title={g.label}
            className={`shrink-0 rounded-lg px-2 py-1 text-lg transition-colors ${active === i ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            {g.emojis[0]}
          </button>
        ))}
      </div>
      <div className="h-[220px] overflow-y-auto p-2 scrollbar-hide">
        <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {group.label}
        </p>
        <div className="grid grid-cols-8 gap-0.5">
          {group.emojis.map((e, idx) => (
            <button
              key={`${e}-${idx}`}
              type="button"
              onClick={() => onSelect(e)}
              className="rounded-lg p-1 text-xl transition-colors hover:bg-gray-100"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmojiPicker
