export const API_ROUTES = {
    PATIENTS: "/api/patients",
    PATIENTS_COUNT: "/api/patients/count",
    SEED_PATIENTS: "/api/admin/seed/patients",
    NOTES: "/api/notes",
    NOTE_BY_ID: (id: string) => `/api/notes/${id}`,
    WEBHOOK_TRANSCRIPTION: "/api/webhooks/transcription",
    STATS: "/api/stats",
};

export const PAGE_ROUTES = {
    NOTES: "/notes",
    NOTE_DETAIL: (id: string) => `/notes/${id}`,
};
