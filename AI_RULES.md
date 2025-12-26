# AI Studio Application Rules

This document outlines the technical stack and guidelines for developing and modifying the iManager Argentina application.

## Tech Stack Overview

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Build Tool**: Vite
*   **Routing**: React Router (to be implemented for navigation)
*   **UI Components**: shadcn/ui (pre-installed and preferred for new components)
*   **Icons**: lucide-react (pre-installed and preferred for new icons)
*   **Data Storage**: Local Storage (for client-side persistence)

## Library Usage Rules

1.  **React**: Use React for all UI development.
2.  **TypeScript**: All new and modified code must be written in TypeScript for type safety and better maintainability.
3.  **Tailwind CSS**: All styling should be implemented using Tailwind CSS utility classes. Avoid inline styles or separate CSS files unless absolutely necessary for complex, custom animations or third-party integrations.
4.  **React Router**: For navigation between different views/pages, use React Router. All routes should be defined and managed within `src/App.tsx`.
5.  **shadcn/ui**: Leverage `shadcn/ui` components for common UI elements (buttons, forms, tables, etc.). Do not modify the source files of `shadcn/ui` components directly; if customization is needed, create a new component that wraps or extends the `shadcn/ui` component.
6.  **lucide-react**: Use icons from the `lucide-react` library for all graphical symbols in the UI.
7.  **Local Storage**: The application currently uses local storage for data persistence. Continue to use `services/db.ts` for interacting with local storage.
8.  **Component Structure**:
    *   New components should be created in `src/components/`.
    *   New pages (top-level views) should be created in `src/pages/`.
    *   Each component or page should reside in its own dedicated file.
    *   Aim for small, focused components (ideally under 100 lines of code).
9.  **Utility Functions**: Place general utility functions (e.g., formatting, data manipulation, CSV export) in `src/utils.ts`.
10. **Error Handling**: Do not implement `try/catch` blocks for error handling unless specifically requested. Allow errors to bubble up for easier debugging and resolution.
11. **Supabase/Auth/Database**: If features requiring authentication, a database, or server-side functions are requested, the user must first add Supabase integration.