---
trigger: always_on
---

Each route must have its own folder containing its page.tsx and an internal components subfolder for its unique components. An index.ts is allowed within this subfolder to simplify exports. Components must remain local to their page by default; they should only be moved to a global shared components folder if explicitly specified for reuse across multiple views.