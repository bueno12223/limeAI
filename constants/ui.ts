import { NoteStatus, EntityType } from "@prisma/client";

export const STATUS_COLORS: Record<NoteStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    PROCESSING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    FINAL: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const ENTITY_COLORS: Record<EntityType, string> = {
    MEDICATION: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    DIAGNOSIS: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    SYMPTOM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    TEST: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    PROCEDURE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};
