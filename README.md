# GrandStay | Hotel Management Dashboard
> **Namla Tech Frontend Interview Task Solution**  
> Built with **React 18**, **Vite**, **Redux Toolkit**, **React-Redux**, **React Helmet Async**, and **Plain CSS**.

---

## 📋 Table of Contents
1. [Overview & Features](#-overview--features)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Data Flow](#-architecture--data-flow)
4. [Project Structure](#-project-structure)
5. [Quick Setup & Terminal Commands](#-quick-setup--terminal-commands)
6. [Interactive Feature Walkthrough](#-interactive-feature-walkthrough)
7. [Testing & Verification](#-testing--verification)
8. [Senior Frontend Mentor Guide (Beginner Explanations)](#-senior-frontend-mentor-guide)

---

## 🌟 Overview & Features

GrandStay is a responsive, administrative single-page dashboard designed for hotel portfolio management. It features full CRUD operations, multi-parameter search, dynamic filtering, multi-criteria sorting, configurable pagination, image upload with live client previews, interactive OpenStreetMap visualization, and toast notifications.

### Key Capabilities
- **Full CRUD Support**:
  - **Create**: Add new properties with validation (name, location, price, rating, coordinates, image, description).
  - **Read**: Dual view layouts (**Grid Cards View** & **Administrative Data Table View**).
  - **Update**: Edit existing properties with pre-filled inputs and cancellation support.
  - **Delete**: Confirmation dialog preventing accidental deletion, with instant Redux state updates.
- **Search & Filtering**:
  - Live, case-insensitive search matching against both property name and location.
  - Location dropdown automatically populated with cities currently in inventory.
  - Combined filter pipeline where search and dropdown work in unison.
- **Sorting**:
  - Price: Low to High ($ &rarr; $$$)
  - Price: High to Low ($$$ &rarr; $)
  - Property Name: A &rarr; Z and Z &rarr; A
  - Default order
- **Configurable Pagination**:
  - Select items per page (4, 6, 8, 12).
  - Previous / Next controls with boundary disabling and direct page buttons.
  - Automatic page clamping when filtering or deleting reduces the total page count.
- **Image Upload & Fallback**:
  - Upload custom images via device file picker (validated for format and size &le; 3MB) converted into instant Base64 preview URLs via `FileReader`.
  - Paste external image URLs or pick from instant curated presets.
  - Graceful SVG fallback when an image URL fails to load or is not provided.
- **Geographic Coordinates & Interactive Map**:
  - Strict coordinate validation (-90&deg; to 90&deg; latitude, -180&deg; to 180&deg; longitude).
  - Interactive OpenStreetMap modal with pin marker and direct OpenStreetMap links.
- **Analytics KPI Cards**:
  - Live calculation of Total Properties, Average Nightly Rate, Unique Destinations, and Price Range.

---

## 🛠 Technology Stack

| Technology | Purpose | Rationale |
| :--- | :--- | :--- |
| **React 18** | UI Library | Component-based view layer with fast reconciler and hooks. |
| **Vite** | Build Tool & Dev Server | Sub-second Hot Module Replacement (HMR) and optimized Rollup production builds. |
| **Redux Toolkit (RTK)** | State Management | Standardized Redux store setup with `createSlice`, eliminating legacy boilerplate and preventing accidental state mutations via Immer. |
| **React-Redux** | React Bindings | Provides `useSelector` and `useDispatch` hooks for connecting React components to the centralized store. |
| **React Helmet Async** | Page Metadata / SEO | Thread-safe document `<head>` management for client-rendered page titles and OpenGraph tags. |
| **Lucide React** | Icons | Crisp, accessible SVG icons. |
| **Plain CSS** | Styling | Modern CSS custom properties (variables), Flexbox, CSS Grid, and responsive media queries without heavy third-party framework overhead. |
| **Vitest & RTL** | Testing | Fast unit and integration tests with Jest DOM matchers. |

---

## 🏗 Architecture & Data Flow

```
+-------------------------------------------------------------------------+
|                               Redux Store                               |
|                     (src/features/hotels/hotelsSlice.js)                |
|                                                                         |
|  State: { items: [Hotel, Hotel, ...] }                                  |
|  Actions: addHotel, updateHotel, deleteHotel, resetToInitialHotels      |
+-------------------------------------------------------------------------+
                                    ▲  │
            dispatch(action)        │  │  useSelector(selectAllHotels)
                                    │  ▼
+-------------------------------------------------------------------------+
|                                 App.jsx                                 |
|                                                                         |
|  Local UI State:                                                        |
|  • searchQuery, selectedLocation, sortBy, currentPage, itemsPerPage    |
|  • viewMode ('grid' | 'table')                                          |
|  • Modal state: isFormOpen, editingHotel, deletingHotel, mapViewingHotel |
|                                                                         |
|  Data Pipeline (useMemo):                                               |
|  Hotels State ──► Search Filter ──► Location Filter ──► Sort ──► Slice  |
+-------------------------------------------------------------------------+
            │                                             │
            ▼                                             ▼
+-----------------------+                     +-----------------------+
|   HotelForm (Modal)   |                     | HotelList (Grid/Table)|
| Local form input state|                     | Renders active slice  |
| Dispatches on submit  |                     | Triggers edit/delete  |
+-----------------------+                     +-----------------------+
```

---

## 📁 Project Structure

```
zealous-hubble/
├── index.html                           # HTML template with fonts and meta tags
├── package.json                         # Dependencies and scripts
├── vite.config.js                       # Vite configuration with Vitest setup
├── src/
│   ├── app/
│   │   └── store.js                     # Redux store configured via configureStore
│   ├── features/
│   │   └── hotels/
│   │       ├── hotelsSlice.js           # Hotel slice: reducers, actions & selectors
│   │       ├── hotelsSlice.test.js      # Unit tests for Redux slice
│   │       └── initialHotels.js         # Realistic dummy hotels dataset
│   ├── components/
│   │   ├── Navbar.jsx                   # Brand header with Add button & demo reset
│   │   ├── StatsOverview.jsx            # KPI cards (total, avg price, destinations)
│   │   ├── SearchAndFilters.jsx         # Search, location dropdown, sort & view toggle
│   │   ├── SearchAndFilters.test.jsx    # Unit tests for filters & pagination
│   │   ├── HotelList.jsx                # Layout switcher & empty states
│   │   ├── HotelItem.jsx                # Individual grid card with media fallback
│   │   ├── HotelTable.jsx               # Tabular administrative data view
│   │   ├── HotelForm.jsx                # Add/Edit modal with client file validation
│   │   ├── HotelForm.test.jsx           # Unit tests for form validation
│   │   ├── DeleteConfirmModal.jsx       # Accessible delete confirmation dialog
│   │   ├── HotelMapModal.jsx            # Interactive OpenStreetMap modal
│   │   ├── Pagination.jsx               # Page navigation with previous/next & numbers
│   │   └── Toast.jsx                    # Accessible floating notification feedback
│   ├── test/
│   │   └── setup.js                     # Vitest test setup with @testing-library/jest-dom
│   ├── App.jsx                          # Main container & data processing pipeline
│   ├── App.test.jsx                     # Full dashboard integration tests
│   ├── App.css                          # Layout, components & responsive styling
│   ├── index.css                        # Design tokens, CSS resets & typography
│   └── main.jsx                         # React entrypoint wiring Redux & Helmet
└── README.md                            # Comprehensive documentation
```

---

## 🚀 Quick Setup & Terminal Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Automated Tests
```bash
npm test
```
Runs 23 automated tests covering Redux slice logic, component validation, filters, and end-to-end user workflows.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized production bundle inside the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🧪 Testing & Verification Checklist

| # | Feature / Test Case | How to Verify | Expected Outcome |
| :--- | :--- | :--- | :--- |
| 1 | **Initial Sample Data** | Load the page. | 10 sample hotels appear across destinations (Paris, Tokyo, New York, etc.). |
| 2 | **Add Hotel** | Click **"Add Hotel"**, enter valid inputs, and submit. | Modal closes, hotel appears first in the list, KPI stats update, success toast fires. |
| 3 | **Input Validation** | Open Add Hotel, click submit with empty fields. | Inline red error messages appear below Name, Location, and Price. Form does not submit. |
| 4 | **Coordinate Validation** | In Add Hotel, enter latitude `120` or longitude `-250`. | Validation error prevents submission ("Latitude must be between -90 and 90"). |
| 5 | **Image Upload Preview** | Select a local PNG/JPG file in Add Hotel. | Live preview thumbnail appears immediately with option to remove or replace. |
| 6 | **Edit Hotel** | Click **"Edit"** on any hotel card or table row. | Form opens with pre-populated data. Changing fields and saving updates the record. |
| 7 | **Delete with Confirmation** | Click **"Delete"** on any hotel. | Confirmation dialog asks for confirmation. Confirming removes hotel from Redux state. |
| 8 | **Search by Name & City** | Type `"Tokyo"` or `"grand"` into the search box. | Real-time case-insensitive filtering shows matching properties. |
| 9 | **Location Filter** | Select `"Paris, France"` from the location dropdown. | List updates immediately to show only properties in Paris. |
| 10 | **Sort by Price** | Select `"Price: Low to High"`. | Properties reorder with lowest prices displayed first. |
| 11 | **View Mode Toggle** | Click the table icon next to the search input. | Layout transforms into an administrative data table. |
| 12 | **Pagination** | Change items per page to `4`. Navigate using Next/Prev. | Pages advance smoothly; page indicators reflect current window. |
| 13 | **Interactive Map** | Click the coordinates badge or **"Map"** button. | OpenStreetMap modal opens centered at the hotel's exact latitude and longitude. |
| 14 | **Empty States** | Search for a non-existent hotel like `"xyz123"`. | Clean empty state appears with a **"Reset All Filters"** button. |

---

## 🎓 Senior Frontend Mentor Guide

### 1. React Local State vs. Redux Global State
- **When to use React Local State (`useState`)**:
  - Keep state local when only a single component cares about it.
  - *Example*: Form inputs inside `HotelForm.jsx` (such as `formData.name` and validation errors) only matter while the user is actively typing. Storing every keystroke in Redux creates unnecessary global store dispatches and clutters the Redux action log.
- **When to use Redux Global State (`useSelector` / `useDispatch`)**:
  - Use Redux for application-wide domain data needed by multiple unrelated components.
  - *Example*: The hotel records list is needed by `StatsOverview` (to calculate average price), `HotelList` (to display cards), and `SearchAndFilters` (to populate unique locations in the dropdown). Redux provides a single source of truth.

### 2. How Redux Actions & Reducers Work (Redux Toolkit)
- **Action**: A plain JavaScript object describing an event (e.g., `{ type: 'hotels/addHotel', payload: { ... } }`).
- **Reducer**: A pure function that calculates the next state given the current state and an action: `(state, action) => nextState`.
- **Why Redux Toolkit (RTK)?**:
  - In legacy Redux, developers had to manually write action types, action creators, and use nested object spreading (`{ ...state, items: [...state.items, action.payload] }`).
  - RTK's `createSlice` bundles actions and reducers together and uses **Immer** under the hood. Immer allows writing intuitive mutative code like `state.items.unshift(action.payload)` while safely producing an immutable update behind the scenes.

### 3. How the Search, Filter, Sort, and Pagination Pipeline Works
To prevent state synchronization bugs, raw hotel records are kept intact in the Redux store while filtering, sorting, and pagination are performed in `App.jsx` using React's `useMemo` hook:
1. **Search**: Filters `hotels` by matching query against lowercase `name` or `location`.
2. **Location Filter**: Filters further by the chosen city dropdown value.
3. **Sort**: Sorts the filtered array by price or alphabetical order.
4. **Pagination**: Computes total pages and extracts the current page slice using `.slice(startIndex, endIndex)`.
5. **Page Clamping**: If a search filter reduces the total count from 10 to 2 items while the user was on page 2, an effect automatically clamps `currentPage` back to 1 to avoid rendering an empty view.

### 4. SEO & Page Metadata in Client-Rendered Apps (CSR vs SSR)
- In this client-rendered application (SPA), `react-helmet-async` dynamically mutates `document.title` and `<meta>` tags in the browser DOM.
- **Interview Discussion Point**:
  - While modern search engine crawlers (such as Googlebot) execute JavaScript, client-rendered metadata is not immediately present in the initial raw HTML payload received by crawlers or social media link unfurlers (Twitter cards, Slack previews).
  - For true, production-grade SEO where initial HTML must contain pre-rendered meta tags, a Server-Side Rendering (SSR) framework like **Next.js** or **Remix**, or a static pre-rendering build step, is required.
