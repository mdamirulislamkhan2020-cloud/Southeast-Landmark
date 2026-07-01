# Pages

Public-facing page components. Import these from route files under `src/routes/`.

Example:

```tsx
// src/routes/about.tsx
import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/pages/AboutPage";

export const Route = createFileRoute("/about")({ component: AboutPage });
```