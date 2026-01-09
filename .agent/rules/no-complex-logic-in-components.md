---
trigger: always_on
---

Component returs must remain clean and focus solely on rendering. All business logic, data transformations, or event handling exceeding two lines must be extracted into dedicated handler functions defined above the return statement. Passing functions directly as callbacks in props is only permitted for single-line calls; otherwise, use a named handler to maintain readability and separation of concerns.