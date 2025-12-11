import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Form,
  Button,
  ButtonToolbar,
  Input,
  SelectPicker,
  DatePicker,
  Message,
} from "rsuite";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { PageHeader } from "../../components/ui";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { siteUrls } from "../../utils/siteUrls";

// Publish options
const publishOptions = [
  { label: "Zobrazit", value: "show" },
  { label: "Skrýt", value: "hide" },
];

// Validation schema
const schema = yup.object({
  title: yup.string().required("Název je povinný"),
  description: yup.string().nullable(),
  address: yup.string().nullable(),
  dateTime: yup.date().required("Datum a čas jsou povinné"),
  publish: yup.string().oneOf(["show", "hide"]).required(),
  users: yup.array().of(yup.string()).min(1, "Vyberte alespoň jednoho uživatele"),
});

export default function EventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      dateTime: null,
      publish: "hide",
      users: [],
    },
  });

  // Load users for SelectPicker
  useEffect(() => {
    const loadUsers = async () => {
      const res = await apiRequest(apiUrl.users);

      if (res?.users) {
        const formatted = res.users.map((u) => ({
          label: u.name || u.email,
          value: u._id,
        }));

        setUsersList([
          { label: "Všichni uživatelé", value: "ALL" },
          ...formatted,
        ]);
      }
    };

    loadUsers();
  }, []);

  // Load event for edit
  useEffect(() => {
    if (!isEdit) return;

    const loadEvent = async () => {
      const res = await apiRequest(`${apiUrl.events}/${id}`, "GET");

      if (res?.status === "success") {
        const ev = res.data;

        let selectedUsers = ev.users || [];
        if (selectedUsers.length === 0) selectedUsers = ["ALL"];

        reset({
          title: ev.title,
          description: ev.description || "",
          address: ev.address || "",
          dateTime: ev.dateTime ? new Date(ev.dateTime) : null,
          publish: ev.publish,
          users: selectedUsers,
        });
      }
    };

    loadEvent();
  }, [isEdit, id, reset]);

  // Submit handler
  const onSubmit = async (values) => {
    setApiError("");
    setApiSuccess("");

    let selectedUsers = values.users;
    if (selectedUsers.includes("ALL")) selectedUsers = [];

    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || "",
      address: values.address?.trim() || "",
      dateTime: values.dateTime,
      publish: values.publish,
      users: selectedUsers,
    };

    let url = apiUrl.events;
    let method = "POST";

    if (isEdit) {
      url = `${apiUrl.events}/${id}`;
      method = "PATCH";
    }

    const res = await apiRequest(url, method, payload);

    if (res?.status === "success") {
      setApiSuccess("Uloženo.");
      setTimeout(() => navigate(siteUrls.events), 600);
    } else {
      setApiError(res?.message || "Chyba při ukládání.");
    }
  };

  return (
    <Form fluid onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title={isEdit ? "Upravit událost" : "Nová událost"}
        backTo={siteUrls.events}
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

      {/* TITLE */}
      <Form.Group>
        <Form.ControlLabel>Název</Form.ControlLabel>
        <Controller
          name="title"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Název události" />}
        />
        {errors.title && <Message type="error">{errors.title.message}</Message>}
      </Form.Group>

      {/* DESCRIPTION */}
      <Form.Group>
        <Form.ControlLabel>Popis</Form.ControlLabel>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input {...field} as="textarea" rows={3} placeholder="Krátký popis" />
          )}
        />
      </Form.Group>

      {/* ADDRESS */}
      <Form.Group>
        <Form.ControlLabel>Adresa</Form.ControlLabel>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Adresa konání události" />
          )}
        />
      </Form.Group>

      {/* DATE & TIME */}
      <Form.Group>
        <Form.ControlLabel>Datum a čas</Form.ControlLabel>
        <Controller
          name="dateTime"
          control={control}
          render={({ field }) => (
            <DatePicker
              format="dd.MM.yyyy HH:mm"
              ranges={[]}
              style={{ width: "100%" }}
              value={field.value}
              onChange={field.onChange}
              placeholder="Vyberte datum a čas"
              oneTap
            />
          )}
        />
        {errors.dateTime && (
          <Message type="error">{errors.dateTime.message}</Message>
        )}
      </Form.Group>

      {/* PUBLISH */}
      <Form.Group>
        <Form.ControlLabel>Zobrazení</Form.ControlLabel>
        <Controller
          name="publish"
          control={control}
          render={({ field }) => (
            <SelectPicker
              data={publishOptions}
              value={field.value}
              onChange={field.onChange}
              searchable={false}
              cleanable={false}
              style={{ width: "100%" }}
            />
          )}
        />
      </Form.Group>

      {/* USERS */}
      <Form.Group>
        <Form.ControlLabel>Kdo uvidí událost?</Form.ControlLabel>
        <Controller
          name="users"
          control={control}
          render={({ field }) => (
            <SelectPicker
              data={usersList}
              style={{ width: "100%" }}
              placeholder="Vyberte uživatele"
              value={field.value}
              searchable
              multiple
              onChange={(val) => {
                if (val.includes("ALL")) {
                  field.onChange(["ALL"]);
                } else {
                  field.onChange(val);
                }
              }}
            />
          )}
        />
      </Form.Group>

      <ButtonToolbar>
        <Button appearance="primary" loading={isSubmitting} type="submit">
          {isEdit ? "Uložit změny" : "Vytvořit"}
        </Button>
        <Button appearance="subtle" onClick={() => navigate(siteUrls.events)}>
          Zpět
        </Button>
      </ButtonToolbar>
    </Form>
  );
}
