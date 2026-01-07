---
trigger: always_on
---

Avoid using switch statements for logic branching. Instead, use object literals or Maps to handle different cases. This approach is more declarative, easier to extend, and avoids the pitfalls of fall-through logic (e.g., { add: (a, b) => a + b }).