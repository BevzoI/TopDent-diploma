import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Form, Button, ButtonToolbar, Input, SelectPicker, DatePicker, Message } from "rsuite";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { PageHeader } from "../../components/ui";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { useAuthContext } from "../../context/AuthContext";
import { siteUrls } from '../../utils/siteUrls';

// =========================
// Status options
// =========================
const statusOptions = [
  { label: "Čeká na schválení", value: "new" },
  { label: "Schváleno", value: "approved" },
  { label: "Zamítnuto", value: "rejected" },
];

// =========================
// Validation
// =========================
const schema = yup.object({
  dateFrom: yup.date().required("Vyberte datum"),
  dateTo: yup.date().required("Vyberte datum"),
  reason: yup.string().required("Důvod je povinný"),
  note: yup.string().nullable(),
  status: yup.string().required("Vyberte status"),
});

export default function WeekendForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();
  const { user: currentUser } = useAuthContext();

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
      dateFrom: null,
      dateTo: null,
      reason: "",
      note: "",
      status: "new",
    },
  });

  // =========================
  // Load data for edit
  // =========================
  useEffect(() => {
    if (!isEdit) return;

    const loadItem = async () => {
      const res = await apiRequest(`${apiUrl.weekend}/${id}`, "GET");

      if (res?.status === "success" && res.data) {
        reset({
          dateFrom: res.data.dateFrom ? new Date(res.data.dateFrom) : null,
          dateTo: res.data.dateTo ? new Date(res.data.dateTo) : null,
          reason: res.data.reason || "",
          note: res.data.note || "",
          status: res.data.status || "new",
        });
      } else {
        setApiError("Nepodařilo se načíst záznam.");
      }
    };

    loadItem();
  }, [isEdit, id, reset]);

  // =========================
  // Submit handler
  // =========================
  const onSubmit = async (values) => {
    setApiError("");
    setApiSuccess("");

    const payload = {
      userId: currentUser?.id,   // 👈 Додаємо id користувача
      dateFrom: values.dateFrom,
      dateTo: values.dateTo,
      reason: values.reason.trim(),
      note: values.note?.trim() || "",
      status: values.status,
    };

    let url = apiUrl.weekend;
    let method = "POST";

    if (isEdit) {
      url = `${apiUrl.weekend}/${id}`;
      method = "PATCH";
    }

    const res = await apiRequest(url, method, payload);

    if (!res || res.status !== "success") {
      setApiError(res?.message || "Nepodařilo se uložit.");
      return;
    }

    setApiSuccess("Záznam byl úspěšně uložen.");

    setTimeout(() => navigate(siteUrls.weekend), 700);
  };

  return (
    <Form fluid onSubmit={handleSubmit(onSubmit)}>
      
      <PageHeader
        title={isEdit ? "Upravit omluvenku" : "Nová omluvenka"}
        backTo={siteUrls.weekend}
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

      {/* Datum od */}
      <Form.Group>
        <Form.ControlLabel>Datum od</Form.ControlLabel>
        <Controller
          name="dateFrom"
          control={control}
          render={({ field }) => (
            <DatePicker
              format="dd.MM.yyyy"
              style={{ width: "100%" }}
              value={field.value}
              onChange={field.onChange}
              placeholder="Vyberte datum"
            />
          )}
        />
        {errors.dateFrom && <Message type="error">{errors.dateFrom.message}</Message>}
      </Form.Group>

      {/* Datum do */}
      <Form.Group>
        <Form.ControlLabel>Datum do</Form.ControlLabel>
        <Controller
          name="dateTo"
          control={control}
          render={({ field }) => (
            <DatePicker
              format="dd.MM.yyyy"
              style={{ width: "100%" }}
              value={field.value}
              onChange={field.onChange}
              placeholder="Vyberte datum"
            />
          )}
        />
        {errors.dateTo && <Message type="error">{errors.dateTo.message}</Message>}
      </Form.Group>

      {/* Důvod */}
      <Form.Group>
        <Form.ControlLabel>Důvod</Form.ControlLabel>
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <Input {...field} as="textarea" rows={3} placeholder="Důvod absence..." />
          )}
        />
        {errors.reason && <Message type="error">{errors.reason.message}</Message>}
      </Form.Group>

      {/* Poznámka */}
      <Form.Group>
        <Form.ControlLabel>Poznámka</Form.ControlLabel>
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Input {...field} as="textarea" rows={2} placeholder="Nepovinné..." />
          )}
        />
      </Form.Group>

      {/* Status - тільки для адміна */}
      {currentUser?.role === "admin" && (
        <Form.Group>
          <Form.ControlLabel>Status</Form.ControlLabel>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SelectPicker
                data={statusOptions}
                cleanable={false}
                searchable={false}
                style={{ width: "100%" }}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Form.Group>
      )}

      <ButtonToolbar style={{ marginTop: 12 }}>
        <Button appearance="primary" type="submit" loading={isSubmitting}>
          {isEdit ? "Uložit změny" : "Uložit"}
        </Button>
        <Button appearance="subtle" onClick={() => navigate(siteUrls.weekend)}>
          Zpět
        </Button>
      </ButtonToolbar>
    </Form>
  );
}
