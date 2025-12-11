import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Panel,
  ButtonToolbar,
  Button,
  Message,
  Input,
  SelectPicker,
  Textarea,
} from "rsuite";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Field from "../../components/ui/Field";
import { publishOptions } from "../../data/Options";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { PageHeader } from '../../components/ui';
import { siteUrls } from '../../utils/siteUrls';

// схема валідації
const schema = yup.object({
  title: yup
    .string()
    .required("Název je povinný")
    .min(3, "Název musí mít alespoň 3 znaky"),
  text: yup
    .string()
    .required("Text je povinný")
    .min(10, "Text musí mít alespoň 10 znaků"),
  publish: yup
    .string()
    .oneOf(["show", "hide"], "Neplatná hodnota")
    .required("Zobrazení je povinné"),
});

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      text: "",
      publish: "hide",
    },
  });

  useEffect(() => {
    if (!isEdit) return;

    const loadNews = async () => {
      const res = await apiRequest(`${apiUrl.news}/${id}`);

      if (res?.status === "success" && res.data) {
        reset({
          title: res.data.title || "",
          text: res.data.text || "",
          publish: res.data.publish || "hide",
        });
      } else {
        setApiError(res?.message);
      }
    };

    loadNews();
  }, [id, isEdit, reset]);

  const onSubmit = async (values) => {
    setApiError("");

    const payload = {
      title: values.title.trim(),
      text: values.text.trim(),
      publish: values.publish,
    };

    const url = isEdit ? `${apiUrl.news}/${id}` : apiUrl.news;
    const method = isEdit ? "PATCH" : "POST";

    const res = await apiRequest(url, method, payload);

    if (!res || res.status !== "success") {
      setApiError(res?.message);
      return;
    }

    // успіх → повертаємось до списку новин
    navigate("/news");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
          title={isEdit ? "Upravit zprávu" : "Přidat novou zprávu"}
          backTo={siteUrls.news}
          className='mb-20'
      />
        
        <div>
          {/* Název */}
          <Field label="Název">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <>
                  <Input {...field} placeholder="Zadejte název..." />
                  {errors.title && (
                    <Message type="error" size="xs" style={{ marginTop: 8 }}>
                      {errors.title.message}
                    </Message>
                  )}
                </>
              )}
            />
          </Field>

          {/* Text */}
          <Field label="Text">
            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <>
                  <Textarea
                    {...field}
                    rows={5}
                    placeholder="Zadejte text zprávy..."
                  />
                  {errors.text && (
                    <Message type="error" size="xs" style={{ marginTop: 8 }}>
                      {errors.text.message}
                    </Message>
                  )}
                </>
              )}
            />
          </Field>

          {/* Zobrazení */}
          <Field label="Zobrazení">
            <Controller
              name="publish"
              control={control}
              render={({ field }) => (
                <>
                  <SelectPicker
                    data={publishOptions}
                    searchable={false}
                    style={{ width: '100%' }}
                    cleanable={false}
                    placeholder="Vyberte stav"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                  {errors.publish && (
                    <Message type="error" size="xs" style={{ marginTop: 8 }}>
                      {errors.publish.message}
                    </Message>
                  )}
                </>
              )}
            />
          </Field>

          <ButtonToolbar style={{ marginTop: 24 }}>
            <Button appearance="primary" loading={isSubmitting} type="submit">
              {isEdit ? "Uložit změny" : "Přidat zprávu"}
            </Button>
            <Button appearance="subtle" onClick={() => navigate("/news")}>
              Zpět
            </Button>
          </ButtonToolbar>
        </div>
    </form>
  );
}
