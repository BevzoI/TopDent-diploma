import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ButtonToolbar,
  Button,
  Message,
  Input,
  CheckPicker,
  SelectPicker
} from "rsuite";

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

  const [groups, setGroups] = useState([]);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const editingSelf = isEdit && currentUser?.id === id;

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
    birthDate: yup.date().nullable(),
    groups: yup.array().of(yup.string()),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      phone: "",
      role: "user",
      password: "",
      name: "",
      clinic: "",
      birthDate: null,
      groups: [],
    },
  });

  // ✅ Load groups (ВИПРАВЛЕНО)
  useEffect(() => {
    apiRequest(apiUrl.groups).then((res) => {
      if (res?.status === "success") {
        setGroups(res.data || []);
      }
    });
  }, []);

  // ✅ Load user
  useEffect(() => {
    if (!isEdit) return;

    apiRequest(`${apiUrl.users}/${id}`).then((res) => {
      if (res?.status === "success") {
        reset({
          email: res.user.email || "",
          phone: res.user.phone || "",
          role: res.user.role || "user",
          name: res.user.name || "",
          clinic: res.user.clinic || "",
          birthDate: res.user.birthDate
            ? res.user.birthDate.split("T")[0]
            : null,
          groups: res.user.groups?.map((g) => g._id) || [],
        });
      } else {
        setApiError("Nepodařilo se načíst uživatele.");
      }
    });
  }, [id, isEdit, reset]);

  const onSubmit = async (values) => {
    setApiError("");
    setApiSuccess("");

    const payload = {
      email: values.email.trim(),
      phone: values.phone?.trim() || "",
      name: values.name?.trim() || "",
      clinic: values.clinic?.trim() || "",
      birthDate: values.birthDate || null,
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
        <Controller name="name" control={control} render={({ field }) => <Input {...field} />} />
      </Field>

      <Field label="Telefon">
        <Controller name="phone" control={control} render={({ field }) => <Input {...field} />} />
      </Field>

      <Field label="Klinika">
        <Controller name="clinic" control={control} render={({ field }) => <Input {...field} />} />
      </Field>

      <Field label="Datum narození">
        <Controller
          name="birthDate"
          control={control}
          render={({ field }) => <Input {...field} type="date" />}
        />
      </Field>

      {!editingSelf && (
        <Field label="Role">
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <SelectPicker
                {...field}
                data={[
                  { label: "User", value: "user" },
                  { label: "Admin", value: "admin" },
                ]}
                style={{ width: "100%" }}
              />
            )}
          />
        </Field>
      )}

      <Field label="Skupiny">
        <Controller
          name="groups"
          control={control}
          render={({ field }) => (
            <CheckPicker
              data={groups.map((g) => ({
                label: g.name,
                value: g._id,
              }))}
              value={field.value}
              onChange={field.onChange}
              style={{ width: "100%" }}
              block
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