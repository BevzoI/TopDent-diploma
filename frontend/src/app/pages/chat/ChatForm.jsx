import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Button,
  ButtonToolbar,
  Input,
  SelectPicker,
  Message,
} from "rsuite";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { publishOptions } from "../../data/Options";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { siteUrls } from "../../utils/siteUrls";
import { PageHeader } from "../../components/ui";

// ✔ yup schema
const schema = yup.object({
  title: yup.string().required("Název je povinný"),
  publish: yup.string().oneOf(["show", "hide"]).required(),
  members: yup.array().min(1, "Vyberte alespoň jednoho uživatele"),
});

export default function ChatForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [apiError, setApiError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      publish: "show",
      members: [],
    },
  });

  // 🔵 1. Завантаження користувачів з API
  useEffect(() => {
    const loadUsers = async () => {
      const res = await apiRequest(apiUrl.users, "GET");

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

  // 🔵 2. Завантаження даних при редагуванні
  useEffect(() => {
    if (!isEdit) return;

    const loadChat = async () => {
      const res = await apiRequest(`${apiUrl.chat}/${id}`);

      if (res?.status === "success") {
        let selected = res.data.members || [];
        if (selected.length === 0) selected = ["ALL"];

        reset({
          title: res.data.title,
          publish: res.data.publish,
          members: selected,
        });

      }
    };

    loadChat();
  }, [id, isEdit, reset]);

  // 🔵 3. Submit
  const onSubmit = async (values) => {
    setApiError("");

    let selectedMembers = values.members;
    if (selectedMembers.includes("ALL")) selectedMembers = [];

    const payload = {
      title: values.title.trim(),
      publish: values.publish,
      members: selectedMembers,
    };

    const url = isEdit ? `${apiUrl.chat}/${id}` : apiUrl.chat;
    const method = isEdit ? "PATCH" : "POST";

    const res = await apiRequest(url, method, payload);

    if (res?.status === "success") {
      navigate(siteUrls.chat);
    } else {
      setApiError("Chyba při ukládání dat.");
    }
  };

  return (
    <Form fluid onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title={isEdit ? "Upravit chat" : "Vytvořit nový chat"}
        backTo={siteUrls.chat}
      />

      {apiError && (
        <Message type="error" showIcon style={{ marginBottom: 10 }}>
          {apiError}
        </Message>
      )}

      {/* Název chatu */}
      <Form.Group>
        <Form.ControlLabel>Název chatu</Form.ControlLabel>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Zadejte název..." />
          )}
        />
        {errors.title && (
          <Message type="error" style={{ marginTop: 6 }}>
            {errors.title.message}
          </Message>
        )}
      </Form.Group>

      {/* Zobrazení */}
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
              style={{ width: "100%" }}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Form.Group>

      {/* Výběr uživatelů */}
      <Form.Group>
        <Form.ControlLabel>Uživatelé v chatu</Form.ControlLabel>
        <Controller
          name="members"
          control={control}
          render={({ field }) => (
            <SelectPicker
              data={usersList}
              style={{ width: "100%" }}
              placeholder="Vyberte uživatele"
              onChange={(val) => {
                if (val.includes("ALL")) {
                  field.onChange(["ALL"]);
                } else {
                  field.onChange(val);
                }
              }}              
              value={field.value}
              searchable
              multiple
            />
          )}
        />
        {errors.members && (
          <Message type="error" style={{ marginTop: 6 }}>
            {errors.members.message}
          </Message>
        )}
      </Form.Group>

      <ButtonToolbar>
        <Button appearance="primary" type="submit" loading={isSubmitting}>
          {isEdit ? "Uložit změny" : "Vytvořit chat"}
        </Button>
        <Button appearance="subtle" onClick={() => navigate(siteUrls.chat)}>
          Zpět
        </Button>
      </ButtonToolbar>
    </Form>
  );
}
