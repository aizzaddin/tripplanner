# Trip Planner App — Requirements

## Background
Based on analysis of `Base_Template.xlsx` (8-sheet Google Spreadsheet template by @liburanbali).
Goal: Build a SaaS web app that digitizes this spreadsheet into a proper multi-user trip planning tool.

---

## Tech Stack
- **Framework**: Next.js (App Router) — fullstack, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **ORM**: Prisma
- **DB**: PostgreSQL
- **Auth**: NextAuth.js (credentials provider, session via httpOnly cookie)

### Auth Flow (NextAuth.js)
```
POST /api/auth/register  → { name, email, password } → 201
POST /api/auth/[...nextauth]  → credentials sign-in / sign-out / session

// Session stored as httpOnly cookie (JWT strategy)
// Access token: 15 min expiry
// Refresh token: 7 days expiry
// Middleware protects all /app/(protected) routes
```

---

## Data Model

### Trip
```
Trip {
  id, name, currency,
  startDate, endDate,
  days (= endDate - startDate + 1),
  nights (= days - 1)
}
```

### Member
```
Member {
  id, tripId,
  name, category (ADULT | CHILD | BABY),
  color (UI only)
}
```

### Expense (Transactions sheet)
```
Expense {
  id, tripId,
  date, category, description,
  qty, unitCost,
  total (= qty != null ? qty * unitCost : unitCost),
  paidBy (memberId),
  paymentMethod (CASH | DEBIT | CREDIT | TRANSFER | QRIS),
  paymentStatus (SPLIT_EQUAL | PERSONAL),
  splitWith [memberId] -- subset of members, default all
}
```

### Budget (Budget Planner sheet)
```
BudgetPlan {
  id, tripId,
  category, plannedCost,
  actualCost (= SUMIF expenses by category -- computed),
  difference (= plannedCost - actualCost -- computed)
}
```

### Itinerary (Itineraries sheet)
```
ItineraryDay {
  id, tripId,
  dayNumber, date (= startDate + dayNumber - 1),
  mainArea, accommodation,
  activities [ { order, name, estimatedTime } ],
  todos [ { order, name, assignedTo (memberId) } ],
  notes [string]
}
```

### TodoItem (To Do List sheet)
```
TodoItem {
  id, tripId,
  isDone (boolean),
  task, assignedTo (memberId),
  priority, dueDate,
  daysLeft (= dueDate - today -- computed),
  urgencyLabel (= computed, see logic below)
}
```

### PackingItem (Packing List sheet)
```
PackingItem {
  id, tripId,
  isDone (boolean),
  item, qty,
  assignedTo (memberId -- optional)
}
```

---

## Business Logic

### 1. Expense Total
```
total = qty != null && qty != 0 ? qty * unitCost : unitCost
```

### 2. Split Equal
```
// Only applies when paymentStatus == SPLIT_EQUAL
sharePerPerson = total / splitWith.length
```

### 3. Dashboard Balance (per member)
```
paidExpenses[member]  = SUM(expense.total WHERE expense.paidBy == member)
totalShare[member]    = SUM(expense.sharePerPerson WHERE member IN expense.splitWith)
balance[member]       = paidExpenses - totalShare

// Interpretation:
// balance > 0 → member overpaid → needs to RECEIVE back
// balance < 0 → member underpaid → needs to REIMBURSE others
// balance == 0 → settled
```

### 4. Settlement (minimize transactions)
```
// Greedy algorithm:
// Sort creditors (balance > 0) desc, debtors (balance < 0) desc
// Match largest debtor to largest creditor iteratively
// Result: minimum number of transfers needed
```

### 5. Budget Actual Cost
```
actualCost[category] = SUM(expense.total WHERE expense.category == category)
difference = plannedCost - actualCost
// positive difference = under budget ✅
// negative difference = over budget ❌
```

### 6. Hotel Nights (Budget Planner detail)
```
nights = checkOutDate - checkInDate
totalHotelCost = numberOfRooms * pricePerNight * nights
```

### 7. Itinerary Date Auto-increment
```
day[n].date = trip.startDate + (n - 1) days
```

### 8. To-Do Urgency Label
```
daysLeft = dueDate - today
label = daysLeft < 0   ? "Overdue"
      : daysLeft <= 7  ? "This Week"
      : daysLeft <= 30 ? "This Month"
                       : "Next To Do"
```

### 9. Dashboard Task Stats
```
overdue     = COUNT(todos WHERE dueDate < today AND isDone == false AND task != null)
onProgress  = COUNT(todos WHERE task != null AND isDone == false)
done        = COUNT(todos WHERE task != null AND isDone == true)
total       = onProgress + done
completion  = done / total  // percentage
```

---

## Master Data (from Settings sheet)

### Budget Categories (customizable)
Default: Flights, Hotels, Transportation, Food & Drinks, Snacks, Shopping, Souvenirs, Attraction Tickets, Documentation

### Payment Methods
Default: Cash, Debit Card, Credit Card, Transfer, QRIS

### To-Do Statuses
Done, Pending, Planned, Progress, Stuck

### Member Categories
Adult, Child, Baby

---

## Feature Scope

### MVP (Phase 1)
- [x] Trip setup (name, dates, currency, members)
- [x] Expense tracker (add/edit/delete with split equal)
- [x] Dashboard (balance per person, settlement transfers)
- [ ] Budget planner (planned vs actual per category)

### V2 (Phase 2)
- [ ] Itinerary builder (day by day, activities, accommodation)
- [ ] To-do list (with assignee, due date, urgency)
- [ ] Packing checklist (per person)

### V3 / SaaS Features
- [ ] Upgrade auth to Google OAuth (currently JWT)
- [ ] Share trip via link
- [ ] Real-time collaboration
- [ ] Export to PDF / Excel
- [ ] WhatsApp reminder for unsettled debts
- [ ] Multi-currency with exchange rate

---

## Project Structure

```
/app
  /auth
    /login        → Login page
    /register     → Register page
  /(protected)
    /dashboard    → Trip list
    /trips/[id]
      /expenses   → Expense tracker + split
      /budget     → Budget planner
      /itinerary  → Day-by-day
      /todos      → Task list
      /packing    → Packing checklist
  /api
    /auth
      /register   → POST register
      /[...nextauth] → NextAuth handler
    /trips/[id]
      /route.ts         → GET, PUT, DELETE trip
      /expenses/route.ts
      /dashboard/route.ts
      /budget/route.ts
      /itinerary/route.ts
      /todos/route.ts
      /packing/route.ts
    /trips/route.ts     → GET list, POST create
/components
  /ui             → shadcn/ui components
  /trip           → Trip-specific components
/lib
  prisma.ts       → Prisma client singleton
  auth.ts         → NextAuth config + session helpers
/prisma
  schema.prisma   → Data models
  migrations/
```

---

## API Endpoints (Next.js Route Handlers)

```
// Auth
POST   /api/auth/register
POST   /api/auth/[...nextauth]   → sign-in / sign-out / session

// Trip
GET    /api/trips                → list trips for current user
POST   /api/trips
GET    /api/trips/[id]
PUT    /api/trips/[id]
DELETE /api/trips/[id]

// Members
POST   /api/trips/[id]/members
DELETE /api/trips/[id]/members/[memberId]

// Expenses
GET    /api/trips/[id]/expenses
POST   /api/trips/[id]/expenses
PUT    /api/trips/[id]/expenses/[expenseId]
DELETE /api/trips/[id]/expenses/[expenseId]

// Dashboard (computed)
GET    /api/trips/[id]/dashboard
  → { totalExpenses, perPerson, balances[], settlements[] }

// Budget
GET    /api/trips/[id]/budget
POST   /api/trips/[id]/budget
PUT    /api/trips/[id]/budget/[planId]

// Itinerary
GET    /api/trips/[id]/itinerary
PUT    /api/trips/[id]/itinerary/[dayNumber]

// Todos
GET    /api/trips/[id]/todos
POST   /api/trips/[id]/todos
PUT    /api/trips/[id]/todos/[todoId]
DELETE /api/trips/[id]/todos/[todoId]

// Packing
GET    /api/trips/[id]/packing
POST   /api/trips/[id]/packing
PUT    /api/trips/[id]/packing/[itemId]
DELETE /api/trips/[id]/packing/[itemId]
```

---

## Current Progress
- [x] Trip cost splitter UI (React) — basic version built
- [ ] Full app with Budget Planner tab
- [ ] Prisma schema + migrations
- [ ] Next.js API route handlers
- [ ] Auth (NextAuth.js)

## Source
Spreadsheet: `Base_Template.xlsx` by @liburanbali (personal use license)
App logic extracted and reimplemented independently.
