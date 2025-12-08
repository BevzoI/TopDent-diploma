import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Panel,
  ButtonToolbar,
  Button,
  Message,
  Input,
  Uploader,
  Loader,
  Box,
  useToaster
} from "rsuite";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { apiRequest, apiUrl } from "../utils/apiData";
import { useAuthContext } from "../context/AuthContext";
import { Field, Img } from "../components/ui";
import { filePath } from "../utils/siteUrls";
import { getUserAvatar } from "../utils/utils";

function previewFile(file, callback) {
  const reader = new FileReader();
  reader.onloadend = () => {
    callback(reader.result);
  };
  reader.readAsDataURL(file);
}

// ✅ схема валідації профілу
const schema = yup.object({
  email: yup
    .string()
    .email("Neplatný email")
    .required("Email je povinný"),
  phone: yup
    .string()
    .max(30, "Telefon je příliš dlouhý"),
  // avatar тут можемо не обмежувати по довжині, бо base64 довгий
  avatar: yup.string().nullable().notRequired(),
});

const PROFILE_URL = `${apiUrl.users}/profile`;

export default function UserEdit() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthContext();
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const toaster = useToaster();
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      phone: "",
      avatar: "",
    },
  });

  // ✅ підтягуємо дані поточного користувача в форму
  useEffect(() => {
    if (!user) return;

    reset({
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
    });

    setAvatarPreview(user.avatar || "");
  }, [user, reset]);

  const onSubmit = async (values) => {
    setApiError("");
    setApiSuccess("");

    const payload = {
        id: user.id,
        email: values.email.trim(),
        phone: values.phone.trim(),
        avatar: values.avatar || "", // може бути шлях або base64
    };

    const res = await apiRequest(PROFILE_URL, "PATCH", payload);

    if (!res || res.status !== "success" || !res.user) {
      setApiError(res?.message || "Nepodařilo se uložit profil.");
      return;
    }

    const updatedUser = {
      id: res.user.id,
      email: res.user.email,
      role: res.user.role,
      phone: res.user.phone,
      avatar: res.user.avatar,
    };

    setUser(updatedUser);

    const token = btoa(JSON.stringify(updatedUser));
    localStorage.setItem("token", token);

    setApiSuccess("Profil byl úspěšně uložen.");
  };

  if (!user) {
    return (
      <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
        <Message type="error" showIcon>
          Uživatel není načten.
        </Message>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}
    >
      <Panel bordered shaded>
        <h3 style={{ marginBottom: 20 }}>Upravit profil</h3>

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

        {/* Email */}
        <Field label="Email">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <>
                <Input {...field} placeholder="Zadejte email..." />
                {errors.email && (
                  <Message type="error" size="xs" style={{ marginTop: 8 }}>
                    {errors.email.message}
                  </Message>
                )}
              </>
            )}
          />
        </Field>

        {/* Telefon */}
        <Field label="Telefon">
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <>
                <Input {...field} placeholder="Zadejte telefon..." />
                {errors.phone && (
                  <Message type="error" size="xs" style={{ marginTop: 8 }}>
                    {errors.phone.message}
                  </Message>
                )}
              </>
            )}
          />
        </Field>

        {/* Avatar */}
        <Field label="Avatar">
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => (
              <>
                <Uploader
                  fileListVisible={false}
                  listType="picture"
                  action=""          // нічого не вантажимо на сервер
                  autoUpload={false} // все робимо локально
                  onChange={(fileList) => {
                    const file = fileList?.[0];
                    if (!file) return;

                    setUploading(true);
                    previewFile(file.blobFile, (value) => {
                      setAvatarPreview(value);
                      field.onChange(value); // записуємо в react-hook-form
                      setUploading(false);
                      toaster.push(
                        <Message type="success">Avatar byl načten</Message>
                      );
                    });
                  }}
                >
                  <Box
                    as="button"
                    type="button"
                    w={150}
                    h={150}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f9f9f9",
                      cursor: "pointer",
                    }}
                  >
                    {uploading && <Loader backdrop center />}
                    {avatarPreview ? (
                      <img
                        src={getUserAvatar({ avatar: avatarPreview })}
                        width="100%"
                        height="100%"
                        alt="Avatar preview"
                      />
                    ) : (
                      <Img
                        src={getUserAvatar(user)}
                        alt="Avatar"
                      />
                    )}
                  </Box>
                </Uploader>

                {errors.avatar && (
                  <Message type="error" size="xs" style={{ marginTop: 8 }}>
                    {errors.avatar.message}
                  </Message>
                )}
              </>
            )}
          />
        </Field>

        <ButtonToolbar style={{ marginTop: 24 }}>
          <Button appearance="primary" loading={isSubmitting} type="submit">
            Uložit profil
          </Button>
          <Button appearance="subtle" onClick={() => navigate(-1)}>
            Zpět
          </Button>
        </ButtonToolbar>
      </Panel>
    </form>
  );
}
