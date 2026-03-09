import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ButtonToolbar,
  Button,
  Message,
  Input,
  SelectPicker,
  Textarea,
  CheckPicker,
  Uploader,
} from "rsuite";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Field from "../../components/ui/Field";
import { publishOptions } from "../../data/Options";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { PageHeader } from "../../components/ui";
import { siteUrls } from "../../utils/siteUrls";

const visibilityOptions = [
  { label: "Pro všechny", value: "all" },
  { label: "Konkrétní uživatelé", value: "users" },
  { label: "Konkrétní skupiny", value: "groups" },
];

const schema = yup.object({
  title: yup.string().required("Název je povinný").min(3),
  text: yup.string().required("Text je povinný").min(10),
  publish: yup.string().required(),
  visibility: yup.string().required(),
});

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [usersOptions, setUsersOptions] = useState([]);
  const [groupsOptions, setGroupsOptions] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      text: "",
      publish: "hide",
      visibility: "all",
      specificUsers: [],
      specificGroups: [],
    },
  });

  const visibility = watch("visibility");

  /* =========================================
     Load users + groups
  ========================================= */

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

  /* =========================================
     Load edit data
  ========================================= */

  useEffect(() => {
    if (!isEdit) return;

    const loadNews = async () => {
      const res = await apiRequest(`${apiUrl.news}/${id}`);

      if (res?.status === "success") {
        reset({
          title: res.data.title || "",
          text: res.data.text || "",
          publish: res.data.publish || "hide",
          visibility: res.data.visibility || "all",
          specificUsers: res.data.specificUsers || [],
          specificGroups: res.data.specificGroups || [],
        });

        setAttachments([]);
      }
    };

    loadNews();
  }, [id, isEdit, reset]);

  /* =========================================
     SUBMIT (FormData pro upload)
  ========================================= */

  const onSubmit = async (values) => {
    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("text", values.text);
    formData.append("publish", values.publish);
    formData.append("visibility", values.visibility);

    formData.append(
      "specificUsers",
      JSON.stringify(values.specificUsers || [])
    );

    formData.append(
      "specificGroups",
      JSON.stringify(values.specificGroups || [])
    );

    attachments.forEach((file) => {
      if (file.blobFile) {
        formData.append("files", file.blobFile);
      }
    });

    const url = isEdit
      ? `${apiUrl.news}/${id}`
      : apiUrl.news;

    const method = isEdit ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.status === "success") {
      navigate(siteUrls.news);
    } else {
      alert(data.message || "Chyba při ukládání");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title={isEdit ? "Upravit zprávu" : "Přidat novou zprávu"}
        backTo={siteUrls.news}
        className="mb-20"
      />

      {/* Title */}
      <Field label="Název">
        <Controller
          name="title"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        {errors.title && <Message type="error">{errors.title.message}</Message>}
      </Field>

      {/* Text */}
      <Field label="Text">
        <Controller
          name="text"
          control={control}
          render={({ field }) => <Textarea {...field} rows={5} />}
        />
        {errors.text && <Message type="error">{errors.text.message}</Message>}
      </Field>

      {/* Publish */}
      <Field label="Zobrazení">
        <Controller
          name="publish"
          control={control}
          render={({ field }) => (
            <SelectPicker
              data={publishOptions}
              value={field.value}
              onChange={field.onChange}
              cleanable={false}
              style={{ width: "100%" }}
            />
          )}
        />
      </Field>

      {/* Visibility */}
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

      {/* Users */}
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

      {/* Groups */}
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

      {/* Attachments */}
      <Field label="Přílohy">
        <Uploader
          multiple
          autoUpload={false}
          onChange={(files) => setAttachments(files)}
        />
      </Field>

      <ButtonToolbar style={{ marginTop: 24 }}>
        <Button appearance="primary" loading={isSubmitting} type="submit">
          {isEdit ? "Uložit změny" : "Přidat zprávu"}
        </Button>
        <Button appearance="subtle" onClick={() => navigate(siteUrls.news)}>
          Zpět
        </Button>
      </ButtonToolbar>
    </form>
  );
}