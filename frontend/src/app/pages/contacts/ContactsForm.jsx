import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    DatePicker,
    ButtonToolbar,
    Button,
    Message,
    Input,
    SelectPicker,
    Uploader,
    Loader,
    Box,
} from "rsuite";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { apiRequest, apiUrl } from "../../utils/apiData";
import { useAuthContext } from "../../context/AuthContext";
import { Field, Img, PageHeader } from "../../components/ui";
import { siteUrls } from "../../utils/siteUrls";
import { getUserAvatar } from "../../utils/utils";

// ==============================
// Avatar preview helper
// ==============================
function previewFile(file, callback) {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
}

export default function ContactsForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { user: currentUser } = useAuthContext();

    const [apiError, setApiError] = useState("");
    const [apiSuccess, setApiSuccess] = useState("");
    const [uploading, setUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState("");

    // Validation schema
    const schema = yup.object({
        email: yup.string().email("Neplatný email").required("Email je povinný"),
        phone: yup.string().max(30, "Telefon je příliš dlouhý"),
        role: yup.string().oneOf(["admin", "user"]),
        avatar: yup.string().nullable(),
        password: yup
            .string()
            .transform((value) => (value === "" ? undefined : value))
            .min(3, "Heslo musí mít alespoň 3 znaky")
            .notRequired(),
        name: yup.string().max(120).nullable(),
        clinic: yup.string().max(120).nullable(),
        birthDate: yup.date().nullable(),
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            email: "",
            phone: "",
            role: "user",
            avatar: "",
            password: "",
            name: "",
            clinic: "",
            birthDate: null,
        },
    });

    // ===== Admin cannot edit his own role =====
    const editingSelf = isEdit && currentUser?.id === id;

    // ==============================
    // Load existing user for edit
    // ==============================
    useEffect(() => {
        if (!isEdit) return;

        const loadUser = async () => {
            const res = await apiRequest(`${apiUrl.users}/${id}`, "GET");

            if (res?.status === "success" && res.user) {
                reset({
                    email: res.user.email || "",
                    phone: res.user.phone || "",
                    role: res.user.role || "user",
                    avatar: res.user.avatar || "",
                    name: res.user.name || "",
                    clinic: res.user.clinic || "",
                    birthDate: res.user.birthDate
                        ? new Date(res.user.birthDate)
                        : null,
                });

                setAvatarPreview(res.user.avatar || "");
            } else {
                setApiError(res?.message || "Nepodařilo se načíst uživatele.");
            }
        };

        loadUser();
    }, [id, isEdit, reset]);

    // ==============================
    // Submit handler
    // ==============================
    const onSubmit = async (values) => {
        setApiError("");
        setApiSuccess("");

        const payload = {
            email: values.email.trim(),
            phone: values.phone.trim(),
            avatar: values.avatar || "",
            name: values.name?.trim() || "",
            clinic: values.clinic?.trim() || "",
            birthDate: values.birthDate || null,
        };

        if (!editingSelf) {
            payload.role = values.role;
        }

        if (values.password && values.password.trim().length > 0) {
            payload.password = values.password.trim();
        }

        let url = apiUrl.users;
        let method = "POST";

        if (isEdit) {
            url = `${apiUrl.users}/${id}`;
            method = "PATCH";
        }

        const res = await apiRequest(url, method, payload);

        if (!res || res.status !== "success") {
            setApiError(res?.message || "Nepodařilo se uložit.");
            return;
        }

        setApiSuccess("Uživatel byl úspěšně uložen.");

        setTimeout(() => navigate("/contacts"), 800);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <PageHeader
                title={isEdit ? "Upravit uživatele" : "Přidat nového uživatele"}
                backTo={siteUrls.contacts}
                className="mb-20"
            />

            {apiError && (
                <Message type="error" showIcon style={{ marginBottom: 15 }}>
                    {apiError}
                </Message>
            )}
            {apiSuccess && (
                <Message type="success" showIcon style={{ marginBottom: 15 }}>
                    {apiSuccess}
                </Message>
            )}

            {/* Email */}
            <Field label="Email">
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <>
                            <Input {...field} placeholder="Zadejte email..." />
                            {errors.email && (
                                <Message type="error" size="xs" style={{ marginTop: 8 }}>
                                    {errors.email.message}
                                </Message>
                            )}
                        </>
                    )}
                />
            </Field>

            {/* Password */}
            <Field label="Heslo">
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <>
                            <Input
                                {...field}
                                type="password"
                                placeholder={
                                    isEdit
                                        ? "Nové heslo (ponechte prázdné pokud nechcete změnit)"
                                        : "Zadejte heslo..."
                                }
                            />
                            {errors.password && (
                                <Message type="error" size="xs" style={{ marginTop: 8 }}>
                                    {errors.password.message}
                                </Message>
                            )}
                        </>
                    )}
                />
            </Field>

            {/* решта JSX — без змін */}
            {/* … файл далі ідентичний твоєму … */}

            <ButtonToolbar style={{ marginTop: 24 }}>
                <Button appearance="primary" loading={isSubmitting} type="submit">
                    {isEdit ? "Uložit změny" : "Přidat uživatele"}
                </Button>
                <Button appearance="subtle" onClick={() => navigate("/contacts")}>
                    Zpět
                </Button>
            </ButtonToolbar>
        </form>
    );
}
