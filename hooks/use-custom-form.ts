import { useFormik, FormikConfig, FormikValues, FormikHelpers } from "formik";
import { Schema } from "yup";

/**
 * Props configuration for the useCustomForm hook.
 * @template T - The shape of the form values.
 */
interface UseCustomFormProps<T extends FormikValues> {
    /** The initial values for the form fields. */
    initialValues: T;
    /** A Yup validation schema to enforce validation rules. */
    validationSchema: Schema<T>;
    /** 
     * Callback function executed upon successful form submission.
     * @param values - The submitted form values.
     * @param helpers - Formik helpers to manage form state (e.g., resetForm).
     */
    onSubmit: (values: T, helpers: FormikHelpers<T>) => Promise<void> | void;
}

/**
 * A generic wrapper hook around Formik to standardize form initialization and validation.
 * 
 * @template T - The type of the form values extending FormikValues.
 * @param {UseCustomFormProps<T>} props - The configuration props including initial values, validation schema, and submit handler.
 * @returns {import("formik").FormikProps<T>} The Formik instance containing form state, handlers, and helpers.
 * 
 * @example
 * const form = useCustomForm({
 *   initialValues: { name: '' },
 *   validationSchema: Yup.object({ name: Yup.string().required() }),
 *   onSubmit: (values) => console.log(values)
 * });
 */
export const useCustomForm = <T extends FormikValues>({
    initialValues,
    validationSchema,
    onSubmit,
}: UseCustomFormProps<T>) => {
    const formik = useFormik<T>({
        initialValues,
        validationSchema,
        onSubmit,
    });

    return formik;
};
