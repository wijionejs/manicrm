# Pricing Architecture: Per-Employee Rates + Booking Price

## Context

Prices vary by employee seniority, and the admin may apply discounts or surcharges at booking time. Future workspace statistics (revenue by employee, by service, by period) require a reliable financial record on each booking. A base price on the `service` table was ruled out as it "represents nothing and will almost always be edited."

---

## Recommended Architecture

### Two-layer model

| Layer         | Table                   | Purpose                                                             |
| ------------- | ----------------------- | ------------------------------------------------------------------- |
| Default rate  | `service_employee_rate` | The "rack rate" for a given employee × service pair                 |
| Actual charge | `booking.price`         | What was actually charged — **sole source of truth for statistics** |

These two layers are independent. The rate pre-fills the booking form but never constrains it.

---

## Data Model

### `service_employee_rate`

```
service_employee_rate
  id                    uuid PK
  workspace_id          uuid FK → workspace (cascade)
  service_id            uuid FK → service (cascade)
  workspace_member_id   uuid FK → workspace_member (cascade)
  price                 numeric(10,2) NOT NULL
  UNIQUE (service_id, workspace_member_id)
```

- References `workspace_member.id` (not `user.id`) because rates are workspace-scoped — a user could be an employee in two workspaces at different rates.
- `workspace_id` is denormalised for simpler workspace-scoped queries and guard filtering.
- Cascade deletes: removing a service or member cleans up their rates automatically.

### `booking` (when implemented)

```
booking
  id                    uuid PK
  workspace_id          uuid FK → workspace (cascade)
  service_id            uuid FK → service
  workspace_member_id   uuid FK → workspace_member   ← the performing employee
  client_id             uuid FK → client
  start_time            timestamp NOT NULL
  end_time              timestamp NOT NULL            ← derived from baseDurationMinutes at creation, editable
  price                 numeric(10,2) NOT NULL        ← actual charged amount
  notes                 text                          ← optional: "birthday discount", "extra nail art"
  status                enum ('scheduled','completed','cancelled','no_show')
  created_at / updated_at
```

`booking.price` is required and explicit — never computed from anywhere else. All revenue statistics run against this column.

---

## Backend

1. **New module `service-employee-rates/`** — CRUD scoped to `/workspaces/:workspaceId/service-employee-rates`, `owner|admin` guard on writes, all members on reads.
2. **Key endpoint**: `GET .../service-employee-rates?serviceId=X&workspaceMemberId=Y` — used by the booking form to fetch the pre-fill price when employee + service are selected.
3. Booking module owns `booking.price` independently — no coupling to the rate table at the API level; the rate is only fetched client-side to pre-populate the form field.

---

## UI/UX

### Rate management — Pricing settings page (`/w/:slug/settings/pricing`)

A matrix table: rows = employees, columns = services. Each cell shows the rate or "—" if unset. Click a cell to open an inline edit or small popover. This gives an at-a-glance overview and lets the admin fill gaps quickly.

### Booking form price flow

1. Select service
2. Select employee → frontend fetches rate via the query endpoint above
3. Price field pre-populates from rate (blank if no rate exists)
4. Admin edits freely — discount, surcharge for add-ons, etc.
5. A small hint label shows the default rate when the admin has changed the value: _"Ставка: 450 ₴"_
6. Optional `notes` field for the reason (useful for statistics drill-down later)

---

## Statistics Readiness

All financial queries run on `booking.price`:

| Metric              | Query pattern                                          |
| ------------------- | ------------------------------------------------------ |
| Revenue by period   | `SUM(price) WHERE start_time BETWEEN x AND y`          |
| Revenue by employee | `SUM(price) GROUP BY workspace_member_id`              |
| Revenue by service  | `SUM(price) GROUP BY service_id`                       |
| Booking count       | `COUNT(*) GROUP BY workspace_member_id`                |
| Avg discount given  | `AVG(rate.price - booking.price)` JOIN with rate table |

The rate table enables "expected vs actual" variance analysis — which employees or services attract the most discounts — for free once both tables exist. No schema changes needed when stats are built later.

---

## What is NOT needed

- A price on the `service` table.
- Automatic price recalculation when a rate changes — `booking.price` is locked at creation time.
