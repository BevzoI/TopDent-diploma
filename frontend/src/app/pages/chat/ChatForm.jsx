import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, ButtonToolbar, Input, SelectPicker, Message } from "rsuite";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { publishOptions } from "../../data/Options";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { siteUrls } from "../../utils/siteUrls";

const users = [
  { label: "Vadim", value: "vadim" },
  { label: "Alona", value: "alona" },
  { label: "Admin", value: "admin" },
];

// ✔ yup схема
const schema = yup.object({
  title: yup.string().required("Název je povinný"),
  publish: yup.string().oneOf(["show", "hide"]).required(),
  members: yup.array().min(1, "Vyberte alespoň jednoho uživatele"),
});

export default function ChatForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setValue,
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

  // Завантаження даних при редагуванні
  useEffect(() => {
    if (!isEdit) return;

    const loadChat = async () => {
      const res = await apiRequest(`${apiUrl.chat}/${id}`);

      if (res?.status === "success") {
        reset({
          title: res.data.title,
          publish: res.data.publish,
          members: res.data.members || [],
        });
      }
    };

    loadChat();
  }, [id, isEdit, reset]);

  const onSubmit = async (values) => {
    const payload = {
      title: values.title.trim(),
      publish: values.publish,
      members: values.members,
    };

    const url = isEdit ? `${apiUrl.chat}/${id}` : apiUrl.chat;
    const method = isEdit ? "PATCH" : "POST";

    const res = await apiRequest(url, method, payload);

    if (res?.status === "success") {
      navigate(siteUrls.chat);
    } else {
      alert("Chyba při ukládání dat.");
    }
  };

  return (
    <Form
      fluid onSubmit={handleSubmit(onSubmit)}>
      
      <h3 style={{ marginBottom: 20 }}>
        {isEdit ? "Upravit chat" : "Vytvořit nový chat"}
      </h3>

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

      {/* Výběr uživatelů */}
      <Form.Group>
        <Form.ControlLabel>Uživatelé v chatu</Form.ControlLabel>

        <Controller
          name="members"
          control={control}
          render={({ field }) => (
            <SelectPicker
              data={users}
              style={{ width: "100%" }}
              placeholder="Vyberte uživatele"
              onChange={field.onChange}
              value={field.value}
              searchable={true}
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
