import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Button,
  ButtonToolbar,
  Input,
  SelectPicker,
  CheckPicker,
  Message,
} from "rsuite";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { publishOptions } from "../../data/Options";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { siteUrls } from "../../utils/siteUrls";
import { PageHeader } from "../../components/ui";

// ✅ SCHEMA
const schema = yup.object({
  title: yup.string().required("Název je povinný"),
  publish: yup.string().oneOf(["show", "hide"]).required(),
  groups: yup.array().of(yup.string()),
});

export default function ChatForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [groupsList, setGroupsList] = useState([]);
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
      groups: [],
    },
  });

  // 🔥 LOAD GROUPS
  useEffect(() => {
    const loadGroups = async () => {
      const res = await apiRequest(apiUrl.groups);

      if (res?.status === "success") {
        setGroupsList(res.data || []);
      }
    };

    loadGroups();
  }, []);

  // 🔥 LOAD CHAT FOR EDIT
  useEffect(() => {
    if (!isEdit) return;

    const loadChat = async () => {
      const res = await apiRequest(`${apiUrl.chat}/${id}`);

      if (res?.status === "success") {
        reset({
          title: res.data.title,
          publish: res.data.publish,
          groups: res.data.groups?.map((g) => g._id) || [],
        });
      }
    };

    loadChat();
  }, [id, isEdit, reset]);

  // 🔥 SUBMIT
  const onSubmit = async (values) => {
    setApiError("");

    const payload = {
      title: values.title.trim(),
      publish: values.publish,
      groups: values.groups || [],
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

      {/* TITLE */}
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
          <Message type="error">{errors.title.message}</Message>
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
              cleanable={false}
              searchable={false}
              style={{ width: "100%" }}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Form.Group>

      {/* GROUPS */}
      <Form.Group>
        <Form.ControlLabel>Skupiny</Form.ControlLabel>
        <Controller
          name="groups"
          control={control}
          render={({ field }) => (
            <CheckPicker
              data={groupsList.map((g) => ({
                label: g.name,
                value: g._id,
              }))}
              value={field.value}
              onChange={field.onChange}
              style={{ width: "100%" }}
              placeholder="Vyberte skupiny"
              block
            />
          )}
        />
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