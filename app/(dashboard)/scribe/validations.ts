import * as Yup from "yup";

export interface ScribeFormValues {
    patientId: string;
    type: "TEXT" | "AUDIO";
    content?: string;
    audioFile?: File | null;
}

export const initialValues: ScribeFormValues = {
    patientId: "",
    type: "TEXT",
    content: "",
    audioFile: null,
};

export const scribeValidationSchema = Yup.object().shape({
    patientId: Yup.string().required("Please select a patient"),
    type: Yup.string().oneOf(["TEXT", "AUDIO"]).required(),
    content: Yup.string().when("type", {
        is: "TEXT",
        then: (schema) => schema.required("Please enter text content"),
        otherwise: (schema) => schema.optional(),
    }),
    audioFile: Yup.mixed().nullable().when(["type", "content"], {
        is: (type: string, content: string) => type === "AUDIO" && !content,
        then: (schema) => schema.required("Audio file or recording is required"),
        otherwise: (schema) => schema.optional(),
    }),
}) as Yup.Schema<ScribeFormValues>;
