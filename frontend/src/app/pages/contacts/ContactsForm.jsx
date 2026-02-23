import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonToolbar, Button, Message, Input, SelectPicker } from "rsuite";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { apiRequest, apiUrl } from "../../utils/apiData";
import { useAuthContext } from "../../context/AuthContext";
import { Field, PageHeader } from "../../components/ui";
import { siteUrls } from "../../utils/siteUrls";

export default function ContactsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user: currentUser } = useAuthContext();

  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [groups, setGroups] = useState([]);

  const schema = yup.object({
    email: yup.string().email("Neplatný email").required("Email je povinný"),
    phone: yup.string().max(30),
    role: yup.string().oneOf(["admin", "user"]),
    password: yup
      .string()
      .transform((v) => (v === "" ? undefined : v))
      .min(3)
      .notRequired(),
    name: yup.string().max(120).nullable(),
    clinic: yup.string().max(120).nullable(),
    groups: yup.array().of(yup.string()).nullable(),
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
      password: "",
      name: "",
      clinic: "",
      groups: [],
    },
  });

  const editingSelf = isEdit && currentUser?.id === id;

  // 🔥 Load groups
  useEffect(() => {
    const loadGroups = async () => {
      const res = await apiRequest(apiUrl.groups);
      if (res?.status === "success") {
        setGroups(res.groups);
      }
    };
    loadGroups();
  }, []);

  // 🔥 Load user for edit
  useEffect(() => {
    if (!isEdit) return;

    const loadUser = async () => {
      const res = await apiRequest(`${apiUrl.users}/${id}`, "GET");

      if (res?.status === "success" && res.user) {
        reset({
          email: res.user.email || "",
          phone: res.user.phone || "",
          role: res.user.role || "user",
          name: res.user.name || "",
          clinic: res.user.clinic || "",
          groups: res.user.groups?.map((g) => g._id) || [],
        });
      } else {
        setApiError("Nepodařilo se načíst uživatele.");
      }
    };

    loadUser();
  }, [id, isEdit, reset]);

  const onSubmit = async (values) => {
    setApiError("");
    setApiSuccess("");

    const payload = {
      email: values.email.trim(),
      phone: values.phone.trim(),
      name: values.name?.trim() || "",
      clinic: values.clinic?.trim() || "",
      groups: values.groups || [],
    };

    if (!editingSelf) payload.role = values.role;
    if (values.password) payload.password = values.password.trim();

    const url = isEdit ? `${apiUrl.users}/${id}` : apiUrl.users;
    const method = isEdit ? "PATCH" : "POST";

    const res = await apiRequest(url, method, payload);

    if (res?.status !== "success") {
      setApiError("Nepodařilo se uložit.");
      return;
    }

    setApiSuccess("Uživatel byl uložen.");
    setTimeout(() => navigate(siteUrls.contacts), 800);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title={isEdit ? "Upravit uživatele" : "Přidat uživatele"}
        backTo={siteUrls.contacts}
      />

      {apiError && <Message type="error">{apiError}</Message>}
      {apiSuccess && <Message type="success">{apiSuccess}</Message>}

      <Field label="Email">
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        {errors.email && <Message type="error">{errors.email.message}</Message>}
      </Field>

      <Field label="Heslo">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input {...field} type="password" placeholder="Nové heslo" />
          )}
        />
      </Field>

      <Field label="Jméno">
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Field>

      <Field label="Klinika">
        <Controller
          name="clinic"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Field>

      {/* 🔥 GROUPS SELECT */}
      <Field label="Skupiny">
        <Controller
          name="groups"
          control={control}
          render={({ field }) => (
            <SelectPicker
              {...field}
              data={groups.map((g) => ({
                label: g.name,
                value: g._id,
              }))}
              style={{ width: "100%" }}
              placeholder="Vyberte skupiny"
              multiple
              searchable
              cleanable
            />
          )}
        />
      </Field>

      <ButtonToolbar>
        <Button appearance="primary" loading={isSubmitting} type="submit">
          Uložit
        </Button>
        <Button appearance="subtle" onClick={() => navigate(siteUrls.contacts)}>
          Zpět
        </Button>
      </ButtonToolbar>
    </form>
  );
}