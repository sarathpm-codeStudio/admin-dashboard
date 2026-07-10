# Platform Settings

Admin UI for managing platform-wide defaults stored in the Supabase
`platform_settings` table.

Everything is **managed from the dashboard** — admins create groups and settings
with the **"Add setting"** button, edit values inline, and delete settings. No
code changes are required for day-to-day management.

## Table schema

| Column | Purpose |
|--------|---------|
| `key` | Unique identifier read by the apps (e.g. `welcome_bonus_coin`). |
| `value` | The stored value (text). |
| `label` | Human name shown in the UI (e.g. "Welcome bonus"). |
| `group_name` | Which **tab** the setting appears under. |
| `unit` | Optional suffix shown on the input (e.g. `coins`, `%`, `₹`). |
| `description` | Optional helper text under the label. |
| `sort_order` | Controls field + tab ordering (lower = earlier). |

The DB is the single source of truth: a setting shows up when its row exists and
disappears when the row is deleted.

---

## Managing settings from the UI

Open **Platform settings** in the dashboard.

- **Add a setting to an existing group** — click **Add setting**, pick the group
  from the dropdown, fill in Key / Label / Value (and optionally Unit,
  Description), then **Create**.
- **Create a new group (new tab)** — click **Add setting**, choose
  **"+ Create new group…"**, type the new group name, fill in the rest. A new tab
  appears automatically.
- **Change a value** — open a tab, click **Edit**, change values, **Save**.
- **Delete a setting** — in **Edit** mode, click **Remove** on the field and
  confirm.

That's the whole workflow. No deployment needed.

---

## How it renders

```
platform_settings table (DB)                     UI
──────────────────────────────                   ──────────────────────────────
key, value, label, group_name, unit ─ listSettings() ─▶  Tabs = one per group_name
                                                          [ Coin economy ] [ Streak rewards ]
                                                          [ Courses ] [ Commission ]
                                                          Each tab lists its group's settings
```

1. `listSettings()` returns every row with its display metadata, ordered by
   `sort_order`.
2. Rows are bucketed by `group_name`; each group becomes a **tab**.
3. The **Commission** tab is special — it also renders the per-faculty commission
   table.
4. If a row is missing `label`/`group_name` (e.g. inserted by hand), the code
   registry `PLATFORM_SETTING_META` fills the gap; anything still unmapped falls
   back to a humanized label under an **"Other settings"** tab. Nothing is hidden.

---

## Key files

| File | Responsibility |
|------|----------------|
| [`api/platformSettings/platformSettings.api.ts`](../../api/platformSettings/platformSettings.api.ts) | Data access — `listSettings` / `createSetting` / `updateSetting` / `deleteSetting`, plus the `PLATFORM_SETTING_META` fallback registry. |
| [`components/groupConfig.ts`](./components/groupConfig.ts) | Per-group tab **icon + description** (`GROUP_UI`). Unmapped groups get a default icon. |
| [`PlatformSettingsView.tsx`](./PlatformSettingsView.tsx) | Builds tabs from the data, hosts the **Add setting** button + modal. |
| [`components/AddSettingModal.tsx`](./components/AddSettingModal.tsx) | Form to create a setting in an existing or brand-new group. |
| [`components/SettingsGroupPanel.tsx`](./components/SettingsGroupPanel.tsx) | Generic editable panel for a group (edit values, remove settings). |
| [`components/CommissionSettingsSection.tsx`](./components/CommissionSettingsSection.tsx) | Special panel for the `Commission` tab (default rate + faculties table). |
| [`components/SettingsPrimitives.tsx`](./components/SettingsPrimitives.tsx) | Shared UI: panel header, field, group grid, footer. |

---

## Optional: give a new group a custom icon

New groups created from the UI use a default icon. To give a group a branded
icon + tab description, add an entry to `GROUP_UI` in
[`groupConfig.ts`](./components/groupConfig.ts):

```ts
import { Bell } from 'lucide-react'

export const GROUP_UI = {
  // ...existing
  Notifications: { icon: Bell, description: 'Reminder and notification defaults.' },
}
```

This is purely cosmetic — the group and its settings work without it.

---

## Notes

- **Values are strings** in the DB. Numeric settings are validated as
  non-negative when edited; `unit` only affects the input UI.
- **Keys** must be lowercase letters, numbers and underscores
  (e.g. `welcome_bonus_coin`) and are validated on create.
- **Deleting** `default_commission_percent` removes the Commission tab and its
  faculties table. Keep that row unless you intend to remove the feature.
- Apps read settings by `key`, so renaming a key means updating the consuming
  code too — prefer adding a new key over renaming.
