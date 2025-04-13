# Project TODOs and Deferred Items

This file tracks features, fixes, and improvements that have been deferred during development.

## Phase 4: UI/UX Enhancement

*   **Theme System (Dark/Light Mode):**
    *   Implement automatic dark/light mode switching based on system preferences.
    *   Address the TypeScript type error (`Property 'fonts' is missing...`) encountered when trying to apply adapted themes in `app/_layout.tsx`.
    *   Investigate potential version conflicts between `react-native-paper` and `@react-navigation/native` or `tsconfig.json` settings.

*   **Custom Theme:**
    *   Define custom color schemes beyond the default MD3 themes.

*   **Animations & Gestures:**
    *   Add subtle animations for transitions or interactions.
    *   Implement gesture support where appropriate (e.g., swiping).

## Phase 3: Data Management & Analytics

*   **Analytics Charts:**
    *   Fix the import issue with `VictoryPie` / `VictoryLabel` from `victory-native` in `app/(tabs)/analytics.tsx`.
    *   Implement other charts (e.g., Spending Over Time line/bar chart).
    *   Display more detailed spending summary statistics.

*   **Expense History Filtering/Search:**
    *   Add date range filters to the Expenses screen.
    *   Add category filters.
    *   Implement search functionality.

*   **Data Structure/Offline Support:**
    *   Implement local caching/storage for expenses and expense cards.
    *   Set up data synchronization logic for offline mode.
    *   Handle data validation more robustly.

## Phase 2: Core Features Development

*   **Expense Cards Drag & Drop:**
    *   Implement drag-and-drop functionality for expense cards on the dashboard for quick logging.
    *   This will likely require a library like `react-native-gesture-handler` and `react-native-reanimated` (which we installed) and potentially a drag-and-drop specific library.

*   **Expense Card Management:**
    *   Create UI for adding, editing, and deleting Expense Cards (e.g., in Settings or a dedicated screen).
    *   Implement corresponding functions in `useExpenseCards` hook (or a new hook) to interact with Supabase (Insert, Update, Delete).

*   **Dashboard Data:**
    *   Fetch and display real data for Monthly/Daily totals in the Overview card.

## Phase 1: Project Setup & Authentication

*   **Forgot Password:**
    *   Implement the `forgot-password.tsx` screen.
    *   Integrate Supabase password recovery functionality.
*   **Social Authentication:**
    *   Add options for social login (e.g., Google, Apple) using Supabase Auth providers.

## Other

*   **Date Picker:** Install `@react-native-community/datetimepicker` and uncomment the code in `AddExpenseModal.tsx` to enable the native date picker. 