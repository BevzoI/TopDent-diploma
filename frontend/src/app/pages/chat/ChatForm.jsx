import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ButtonToolbar,
  Button,
  Input,
  SelectPicker,
  CheckPicker,
} from "rsuite";
import { useForm, Controller } from "react-hook-form";

import Field from "../../components/ui/Field";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { PageHeader } from "../../components/ui";
import { siteUrls } from "../../utils/siteUrls";

const visibilityOptions = [
  { label: "Pro všechny", value: "all" },
  { label: "Konkrétní uživatelé", value: "users" },
  { label: "Konkrétní skupiny", value: "groups" },
];

export default function ChatForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [usersOptions, setUsersOptions] = useState([]);
  const [groupsOptions, setGroupsOptions] = useState([]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      publish: "show",
      visibility: "all",
      specificUsers: [],
      specificGroups: [],
    },
  });

  const visibility = watch("visibility");

  /* ========================================
     LOAD USERS + GROUPS
  ======================================== */

  useEffect(() => {
    const loadData = async () => {
      const usersRes = await apiRequest(apiUrl.users);
      const groupsRes = await apiRequest(apiUrl.groups);

      if (usersRes?.status === "success") {
        setUsersOptions(
          usersRes.users.map((u) => ({
            label: u.name || u.email,
            value: u._id,
          }))
        );
      }

      if (groupsRes?.status === "success") {
        setGroupsOptions(
          groupsRes.data.map((g) => ({
            label: g.name,
            value: g._id,
          }))
        );
      }
    };

    loadData();
  }, []);

  /* ========================================
     LOAD EDIT DATA
  ======================================== */

  useEffect(() => {
    if (!isEdit) return;

    const loadChat = async () => {
      const res = await apiRequest(`${apiUrl.chat}/${id}`);

      if (res?.status === "success") {
        reset({
          ...res.data,
          specificUsers: res.data.specificUsers || [],
          specificGroups: res.data.specificGroups || [],
        });
      }
    };

    loadChat();
  }, [id, isEdit, reset]);

  /* ========================================
     SUBMIT
  ======================================== */

  const onSubmit = async (values) => {
    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("publish", values.publish);
    formData.append("visibility", values.visibility);
    formData.append(
      "specificUsers",
      JSON.stringify(values.specificUsers)
    );
    formData.append(
      "specificGroups",
      JSON.stringify(values.specificGroups)
    );

    const url = isEdit
      ? `${apiUrl.chat}/${id}`
      : apiUrl.chat;

    const method = isEdit ? "PATCH" : "POST";

    const res = await apiRequest(url, method, formData, true);

    if (res?.status === "success") {
      navigate(siteUrls.chat);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title={isEdit ? "Upravit chat" : "Vytvořit chat"}
        backTo={siteUrls.chat}
        className="mb-20"
      />

      {/* TITLE */}
      <Field label="Název chatu">
        <Controller
          name="title"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Field>

      {/* VISIBILITY */}
      <Field label="Pro koho">
        <Controller
          name="visibility"
          control={control}
          render={({ field }) => (
            <SelectPicker
              data={visibilityOptions}
              value={field.value}
              onChange={field.onChange}
              cleanable={false}
              style={{ width: "100%" }}
            />
          )}
        />
      </Field>

      {visibility === "users" && (
        <Field label="Vyberte uživatele">
          <Controller
            name="specificUsers"
            control={control}
            render={({ field }) => (
              <CheckPicker
                data={usersOptions}
                value={field.value}
                onChange={field.onChange}
                style={{ width: "100%" }}
              />
            )}
          />
        </Field>
      )}

      {visibility === "groups" && (
        <Field label="Vyberte skupiny">
          <Controller
            name="specificGroups"
            control={control}
            render={({ field }) => (
              <CheckPicker
                data={groupsOptions}
                value={field.value}
                onChange={field.onChange}
                style={{ width: "100%" }}
              />
            )}
          />
        </Field>
      )}

      <ButtonToolbar style={{ marginTop: 24 }}>
        <Button appearance="primary" type="submit">
          {isEdit ? "Uložit změny" : "Vytvořit chat"}
        </Button>
        <Button appearance="subtle" onClick={() => navigate(siteUrls.chat)}>
          Zpět
        </Button>
      </ButtonToolbar>
    </form>
  );
}