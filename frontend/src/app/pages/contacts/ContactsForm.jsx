import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonToolbar, Button, Message, Input, CheckPicker } from "rsuite";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { apiRequest, apiUrl } from "../../utils/apiData";
import { Field, PageHeader } from "../../components/ui";
import { siteUrls } from "../../utils/siteUrls";

export default function ContactsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const schema = yup.object({
    email: yup.string().email().required(),
    groups: yup.array().of(yup.string()),
  });

  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      groups: [],
    },
  });

  useEffect(() => {
    apiRequest(apiUrl.groups).then((res) => {
      if (res?.status === "success") {
        setGroups(res.groups);
      }
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    apiRequest(`${apiUrl.users}/${id}`).then((res) => {
      if (res?.status === "success") {
        reset({
          email: res.user.email,
          groups: res.user.groups?.map((g) => g._id) || [],
        });
      }
    });
  }, [id, isEdit, reset]);

  const onSubmit = async (values) => {
    const url = isEdit
      ? `${apiUrl.users}/${id}`
      : apiUrl.users;

    const method = isEdit ? "PATCH" : "POST";

    const res = await apiRequest(url, method, values);

    if (res?.status !== "success") {
      setApiError("Chyba při ukládání.");
      return;
    }

    setApiSuccess("Uloženo.");
    setTimeout(() => navigate(siteUrls.contacts), 800);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
      </Field>

      <Field label="Skupiny">
        <Controller
          name="groups"
          control={control}
          render={({ field }) => (
            <CheckPicker
              {...field}
              data={groups.map((g) => ({
                label: g.name,
                value: g._id,
              }))}
              style={{ width: "100%" }}
              block
            />
          )}
        />
      </Field>

      <ButtonToolbar>
        <Button appearance="primary" type="submit">
          Uložit
        </Button>
      </ButtonToolbar>
    </form>
  );
}