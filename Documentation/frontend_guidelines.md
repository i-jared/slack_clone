Below is a proposal for a **Frontend Guidelines** document that is **extremely detailed** and **developer-proof** (i.e., everything is specified so devs “can’t think” incorrectly). This will live in:

```
/Users/reeceharding/Gauntlet/new-slack-clone/slack_clone/Documentation/frontend_guidelines.md
```

It references our existing design schema, style setup, components, and Next.js structure. Adjust as needed to match actual repository specifics.

---

# **Frontend Guidelines**

## **1. Overview & Purpose**

These guidelines document **exact** rules and best practices for all front-end development within the **Talk2D2** codebase. The goal is to **eliminate guesswork** for devs who might “overthink” or diverge from the established approach. By standardizing coding style, component usage, naming, file organization, and theming, we ensure a consistent, professional, and maintainable user interface.

**Key Points**:
- Follow **Next.js** and **React** conventions strictly.
- Use **Tailwind CSS** classes consistently for styling, augmented by our global `.css`/`.scss` imports.
- Use pre-built or shared **components** from `/components/` whenever possible.
- Maintain consistent **naming** and **folder structure** (no ad-hoc rearranging).
- Implement accessibility (focus states, alt text, etc.) as specified.

This document is **non-negotiable**. If it’s not here, ask for approval before inventing new patterns.

---

## **2. File & Folder Structure**

The frontend files are located primarily under:
```
slack_clone/
├── pages/
├── components/
├── styles/
├── lib/
├── ...
```

### 2.1 Pages Folder

- **`pages/`** is for Next.js **page** components that map directly to routes (`/`, `/dms/[id]`, `/channels/[id]`, etc.).
- Each file in `pages/` is a top-level route or dynamic route. **No** complicated nesting beyond what’s needed for the route.

**Rules**:
1. No business logic in `pages/` – keep it minimal. Use hooks/utilities from `lib/` or specialized files.
2. Page-level styling is minimal; rely on shared styles or components.

### 2.2 Components Folder

- **`components/`** contains all **presentational** or **container** components:  
  - Buttons, modals, chat message items, input forms, sidebars, etc.
  - **One component** per file, named after the component (e.g. `MessageInput.js`, `UserProfile.js`).
  - **Use PascalCase** for component filenames and exports (e.g. `MessageInput.js -> export default MessageInput`).

**Rules**:
1. Keep each component **focused**: if you have a large chunk of logic, split into smaller sub-components.
2. Each component **must** handle its own minimal state or use context if it interacts with global data (`UserContext`, etc.).
3. Place reusable components (e.g. `AttachmentPreview`, `FlyingShips`, `LoadingScreen`) in `components/`. If it’s truly shared across multiple pages, definitely in `components/`.
4. **No** direct calls to `supabase.from(‘...’)` or fetching in these component files unless it’s a small local effect. Prefer hooks in `lib/` for data fetching.

### 2.3 Styles Folder

- **`styles/`** contains global CSS/SCSS/Tailwind configurations:
  - `globals.css`: main global styling (includes Tailwind base, typography).
  - `fonts.css`: custom fonts (e.g. Star Wars font, Orbitron).
  - `style.scss`, `style.css`: optional custom styles if not using inline Tailwind classes.

**Rules**:
1. Use **Tailwind classes** for the majority of styles. 
2. Over-ride or add custom CSS only for special cases (e.g. Starfield animations, keyframes).
3. Keep all color references to `theme('colors...')` or valid Tailwind tokens. Do **not** hardcode hex/rgb unless absolutely necessary (and always justify it).
4. If you add new custom animations or keyframes, define them in `globals.css` or a `.scss` partial, then reference via Tailwind (`@apply animate-fade-in` or similar).

### 2.4 Lib Folder

- **`lib/`** typically houses:
  - Hooks (`useDirectMessages.js`, `useChannelMessages.js`)
  - The main Supabase instance (`Store.js`)
  - Utility or constants files (`constants.js`).
- This ensures that business logic and data fetching are separate from UI components.

**Rules**:
1. Do **not** fetch data directly inside page components if possible. Use the relevant hook from `lib/`.
2. Do **not** define large constants or enumerations in page files or component files. Put them in `constants.js`.
3. Keep `Store.js` minimal, focusing on supabase client creation & simple utility functions (like `sendMessage()` or `sendDirectMessage()`).

---

## **3. Styling & Theming**

We rely heavily on **Tailwind CSS** plus some custom SCSS partials for theming:

1. **No** in-line style props (like `style={{...}}`) unless you’re doing dynamic canvas manipulations or absolutely can’t use classes.
2. **Use** the color tokens from `tailwind.config.js` (like `sw-black`, `sw-gray.dark`, `sw-yellow`) – do not create random new color classes.
3. Keep your class order consistent: layout first (flex, grid), then size (w-*, h-*), then margin/padding, then color, etc. Example:

   ```jsx
   <div className="flex items-center space-x-2 p-4 bg-sw-gray.dark text-sw-yellow">
     ...
   </div>
   ```
4. If you need advanced styling, add it in `style.css` or `style.scss`, but always check if Tailwind can do it first.

### 3.1 Tailwind Plugins

- We use:
  - `@tailwindcss/forms` for nice form styling
  - `postcss-nesting` for SCSS-like nesting in `.css` files
- Keep the config in `tailwind.config.js`, referencing the `./pages/**/*.{js,ts,jsx,tsx,mdx}`, `./components/**/*.{js,ts,jsx,tsx,mdx}`.

### 3.2 Animations

- We have custom keyframes in `styles/globals.css` (see `@keyframes twinkle`, `@keyframes pulse`, etc.).
- Use them via `animate-*` or `animation-*` classes. Example: `className="animate-spin-slow"`.
- For starfields, flying ships, or big fancy animations, place the logic in specialized components (`FlyingShips.js`, `Starfield.js`) and do **not** inline CSS.

---

## **4. Component Design Rules**

Each React component in `/components/` must follow these guidelines:

1. **Naming**: Use PascalCase. E.g. `MessageReactions`, `BackgroundMusic`.
2. **Export**: Default export the main functional component. E.g. `export default function RandomCharacters() { ... }`
3. **Props**: 
   - Destructure all props at the top: `function MyComponent({ propA, propB })`.
   - Provide sensible defaults if needed (`function MyComponent({ isActive = false }) { ... }`).
   - Document unusual props in a comment above or within a JSDoc block if complicated.
4. **Return**: 
   - The top-level element must have a **className** describing the general layout or usage. 
   - Example: `<div className="flex flex-col p-4 bg-gray-900" ...>`
5. **State**: 
   - If the component has multiple states, keep them minimal and local. 
   - For shared data, use contexts or the `lib/` hooks.
6. **Side Effects**: 
   - If a side effect is needed (e.g. subscription), wrap in a `useEffect`.
   - If you are subscribing to a supabase channel, ensure you unsubscribe on unmount.
7. **Error Handling**: 
   - If an error is possible (like image load error), handle gracefully with fallback states (e.g. “Image not found” or a placeholder).

### 4.1 Type of Components

- **Presentational**: Renders static or semi-dynamic content (e.g. `StarWarsEmoji`, `TrashIcon`). Minimal or no state.
- **Container**: Manages some data fetching or local state (e.g. `ThreadPanel`, `Layout`).
- **Widgets**: Specialized, e.g. `BackgroundMusic`, `FlyingShips`.

### 4.2 Testing

- Each major component **must** have a basic test in `__tests__/`.
- The test ensures it renders properly and handles any critical props or events.  
- Use the naming pattern `<ComponentName>.test.js`.

---

## **5. Next.js Pages**

1. **`pages/_app.js`**:  
   - Wraps everything in providers (`UserContext.Provider`) and global styles.  
   - No heavy logic.  
   - Must handle route changes with events (loading screens, etc.).

2. **`pages/index.js`**:  
   - Typically our landing or login page.  
   - Use minimal logic; if need more, create a separate hook or lib function.

3. **`pages/channels/[id].js`**:  
   - Renders the channel feed (makes use of `useChannelMessages`).
   - Should wrap in `<Layout />` from `components/Layout.js`.
   - All UI for messages is in sub-components (`Message.js`, etc.).

4. **`pages/dms/[id].js`**:  
   - Renders direct messages with that user ID (makes use of `useDirectMessages`).
   - Also uses `<Layout />`.

**Naming**:  
- If you have a new route that is user-specific, put it under `pages/users/[id]`, etc.  
- Avoid random route expansions unless they’re documented.

---

## **6. Common Patterns**

### 6.1 Data Fetching & Real-Time

- For channel messages: `useChannelMessages.js` in `lib/`.
- For direct messages: `useDirectMessages.js` in `lib/`.
- For global user or session data: `UserContext` from `contexts/UserContext.js`.

**We do not** do ad-hoc `supabase.from(...)` calls in the UI. Always use the designated hook or function from `Store.js`.

### 6.2 UI State & Context

- The global user session is stored in `UserContext.js`.
- If you need ephemeral UI state (like “is the thread panel open?”), store it in a parent or local state. Example in `Layout.js` sets `isThreadOpen`.
- Use the event system (like `window.dispatchEvent()`) only when you must coordinate between distant components (e.g. opening the thread panel).

### 6.3 Handling Loading States

- If a page or a large component is fetching data, show a **LoadingScreen** or a minimal spinner. 
- Example:  
  ```jsx
  if (isLoading) {
    return <LoadingScreen message="Loading conversation..." />
  }
  ```

### 6.4 Error Handling

- If an error occurs in data fetching, console.error it, then optionally show a small error UI message. 
- For critical errors, we can show a fallback (`<ErrorBoundary>` in future versions, if we had one).

---

## **7. Accessibility**

1. All images **must** have an `alt` attribute. If purely decorative, alt can be `""`.
2. All interactive elements (`button`, `a`) must have appropriate label or text. 
3. Provide visible focus outlines or states for keyboard navigation.
4. For modals/overlays, trap focus inside (unless it’s a partial overlay). 
5. If you add any new custom interactive components, ensure they are navigable by **Tab** keys.

---

## **8. Naming Conventions**

### 8.1 Components

- **`ComponentName.js`**  
- If it’s a small utility file with no default React component, name it like `someUtility.js` or `someHelper.js`.

### 8.2 Variables & Functions

- **CamelCase** for local variables and function names: `fetchData`, `userList`, etc.
- **useSomething** for hooks: `useChannelMessages`.
- **ALL_CAPS** for constants in `constants.js`: `DEFAULT_AVATAR`, `LOADING_MESSAGES`.

### 8.3 Classes & IDs

- We do not rely heavily on custom classes (Tailwind is our friend). If needed, keep them semantic: `.channel-list`, `.message-row`.
- IDs are rarely used. If used, they must be unique (like `id="message-123"` for anchor linking).

---

## **9. Specific UI Guidelines**

### 9.1 Theming & Colors

- **Primary color**: `sw-yellow` (Tailwind token `#FFE81F`).
- **Background**: `sw-black` (`#000000`) or `sw-gray.dark` (`#1A1D24`) for main content.
- **Text**: Usually `text-gray-100` or `text-yellow-400` for highlights.
- **Hover states**: Typically `hover:bg-gray-700` or `hover:text-gray-200`.

### 9.2 Layout

- Use **flex** or **grid** from Tailwind. 
- Standard layout is in `components/Layout.js`:
  - **Sidebar** left, **main content** right. 
  - Possibly an optional **right sidebar** for threads if `isThreadOpen`.

### 9.3 Interactive Elements

- Buttons: 
  - Use `sw-button` or `sw-button-secondary` classes from `globals.css` or define inline in Tailwind. 
  - Provide icons or text. 
  - Disabled states must have `opacity-50 cursor-not-allowed`.
- Inputs: 
  - Use `<input className="sw-input" />` or `<textarea className="sw-input" />`.
  - Always label with `<label>...</label>` if it’s not purely decorative.

### 9.4 Iconography

- Icons are found in `Heroicons` or custom `TrashIcon.js`.
- Do **not** use random external icons without design approval.
- SVG usage: inline React components or references to `public/` if large.

---

## **10. Performance**

- **Lazy load** large components if they’re not always used (like a big chart in a rarely accessed page).
- For infinite lists (messages), we rely on virtualization or smaller fetch chunk if needed. 
- Keep an eye on the console for performance logs if we add them.

---

## **11. Testing & QA**

- Every major UI component in `components/` has a corresponding test in `__tests__/`.
- For pages, basic rendering tests suffice. For complex flows, integrate with Jest + React Testing Library.
- Ensure that there are **no** console warnings in a successful run. A console warning = test fail.

---

## **12. Deployment & Build**

- The Next.js build is handled by `npm run build` and run with `npm run start`.
- If you add new environment variables (like an external API key), put them in `.env.example` (never commit secrets).
- Check that the site functions in dev and production (some differences in Next.js `_app.js` or server environment).

---

## **13. Stylelint / ESlint**

- If a linter or style linter is configured, **no** warnings or errors allowed. 
- That means consistent usage of `semicolon`, `trailingComma`, etc. (in future we can add a `.eslintrc` or `.prettierrc`).

---

## **14. Example Snippets**

### 14.1 Creating a New Page
```jsx
// pages/new-feature.js
import Layout from '~/components/Layout'
import SomeFancyComponent from '~/components/SomeFancyComponent'
import { useUserContext } from '~/contexts/UserContext'

export default function NewFeaturePage() {
  const { user } = useUserContext()

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl text-yellow-400 mb-4">New Feature</h1>
        {user ? (
          <SomeFancyComponent user={user} />
        ) : (
          <p className="text-gray-400">You must be logged in to view this feature.</p>
        )}
      </div>
    </Layout>
  )
}
```

### 14.2 Creating a Reusable Component
```jsx
// components/CustomBanner.js
export default function CustomBanner({ title, subtitle }) {
  return (
    <div className="bg-gray-800 p-4 rounded shadow-lg">
      <h2 className="text-yellow-400 text-lg font-bold">{title}</h2>
      <p className="text-gray-200">{subtitle}</p>
    </div>
  )
}
```

### 14.3 Using Hooks from `lib/Store.js`
```jsx
import { sendMessage } from '~/lib/Store'

export default function SendMessageButton({ channelId }) {
  const handleSend = async () => {
    try {
      await sendMessage("Hello World", channelId)
      // handle success
    } catch (error) {
      // handle error
    }
  }

  return (
    <button 
      onClick={handleSend}
      className="sw-button"
    >
      Send
    </button>
  )
}
```

---

## **15. Conclusion**

By following these **Frontend Guidelines**, we maintain a uniform code base, minimize confusion, and ensure a stable, theme-consistent user interface. Every developer must read and adhere to these rules:

1. **Use** Next.js page structure properly.
2. **Rely** on shared components and hooks for data and UI.
3. **Stick** to Tailwind for styling and theming consistency.
4. **Do** thorough testing and adopt best practices for accessibility.

If any new patterns are required, they **must** be added to this document or explicitly approved to keep the codebase unified.

**That’s it!** If you have a question not answered here, ask the team lead or update the doc once the approach is approved.