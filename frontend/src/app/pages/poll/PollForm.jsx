import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Form, Button, ButtonToolbar, Input, SelectPicker, Message } from "rsuite";
import { useForm, Controller } from "react-hook-form";
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

// Validation
const schema = yup.object({
  title: yup.string().required("Text otázky je povinný"),
  description: yup.string().nullable(),
  publish: yup.string().oneOf(["show", "hide"]).required(),
  users: yup
    .array()
    .of(yup.string().required())
    .min(1, "Vyberte alespoň jednoho uživatele"),
});

export default function PollForm() {
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
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      publish: "hide",
      users: [],
    },
  });

  // Load all users for selector
  useEffect(() => {
    const loadUsers = async () => {
      const res = await apiRequest(apiUrl.users); // GET /users

      if (res?.users) {
        const formatted = res.users.map((u) => ({
          label: u.email || u.id,
          value: u._id,
        }));

        const fullList = [
          { label: "Všichni uživatelé", value: "ALL" },
          ...formatted,
        ];

        setUsersList(fullList);
      }
    };

    loadUsers();
  }, []);

  // Load poll for edit
  useEffect(() => {
    if (!isEdit) return;

    const loadPoll = async () => {
      const res = await apiRequest(`${apiUrl.poll}/${id}`, "GET");

      if (res?.status === "success") {
        let selectedUsers = res.data.users || [];

        // Pokud users = [] → ALL
        if (selectedUsers.length === 0) {
          selectedUsers = ["ALL"];
        }

        reset({
          title: res.data.title,
          description: res.data.description || "",
          publish: res.data.publish,
          users: selectedUsers,
        });        
      } else {
        setApiError("Nepodařilo se načíst data.");
      }
    };

    loadPoll();
  }, [id, isEdit, reset]);

  // Submit
  const onSubmit = async (values) => {
    setApiError("");
    setApiSuccess("");

    let selectedUsers = values.users;

    // Pokud obsažen ALL → všichni uživatelé → users = []
    if (selectedUsers.includes("ALL")) {
      selectedUsers = [];
    }

    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || "",
      publish: values.publish,
      users: selectedUsers,
    };    

    let url = apiUrl.poll;
    let method = "POST";

    if (isEdit) {
      url = `${apiUrl.poll}/${id}`;
      method = "PATCH";
    }

    const res = await apiRequest(url, method, payload);

    if (!res || res.status !== "success") {
      setApiError(res?.message || "Nepodařilo se uložit.");
      return;
    }

    setApiSuccess("Úspěšně uloženo.");
    setTimeout(() => navigate(siteUrls.poll), 700);
  };

  return (
    <Form fluid onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title={isEdit ? "Upravit otázku" : "Vytvořit novou otázku"}
        backTo={siteUrls.poll}
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

      {/* Title */}
      <Form.Group>
        <Form.ControlLabel>Text otázky</Form.ControlLabel>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Zadejte otázku..." />
          )}
        />
        {errors.title && (
          <Message type="error" style={{ marginTop: 6 }}>
            {errors.title.message}
          </Message>
        )}
      </Form.Group>

      {/* Description */}
      <Form.Group>
        <Form.ControlLabel>Popis otázky (nepovinné)</Form.ControlLabel>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              as="textarea"
              rows={3}
              placeholder="Krátký popis nebo doplňující informace…"
            />
          )}
        />
        {errors.description && (
          <Message type="error" style={{ marginTop: 6 }}>
            {errors.description.message}
          </Message>
        )}
      </Form.Group>


      {/* Publish */}
      <Form.Group>
        <Form.ControlLabel>Zobrazení</Form.ControlLabel>
        <Controller
          name="publish"
          control={control}
          render={({ field }) => (
            <SelectPicker
              data={publishOptions}
              cleanable={false}
              searchable={false}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.publish && (
          <Message type="error" style={{ marginTop: 6 }}>
            {errors.publish.message}
          </Message>
        )}
      </Form.Group>

      {/* Users */}
      <Form.Group>
        <Form.ControlLabel>Kdo uvidí otázku?</Form.ControlLabel>
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
                // Pokud ALL → pak jen ALL
                if (val.includes("ALL")) {
                  field.onChange(["ALL"]);
                } else {
                  field.onChange(val);
                }
              }}
            />
          )}
        />
        {errors.users && (
          <Message type="error" style={{ marginTop: 6 }}>
            {errors.users.message}
          </Message>
        )}
      </Form.Group>

      <ButtonToolbar style={{ marginTop: 12 }}>
        <Button appearance="primary" loading={isSubmitting} type="submit">
          {isEdit ? "Uložit změny" : "Vytvořit"}
        </Button>
        <Button appearance="subtle" onClick={() => navigate(siteUrls.poll)}>
          Zpět
        </Button>
      </ButtonToolbar>
    </Form>
  );
}
