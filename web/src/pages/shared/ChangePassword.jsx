import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField, {
  inputClass,
  buttonClass,
} from "../../components/FormField.jsx";
import { useAuth } from "../../auth/useAuth.js";
import { changePassword } from "../../api/auth.js";
import { errorMessage } from "../../api/client.js";

export default function ChangePassword() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setServerError("");
    try {
      await changePassword({ currentPassword, newPassword });
      await refresh();
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Change password"
      subtitle={
        user?.mustChangePassword
          ? "You must set a new password before continuing."
          : "Choose a new password."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Current password"
          error={errors.currentPassword?.message}
        >
          <input
            type="password"
            className={inputClass}
            {...register("currentPassword", { required: "Required" })}
          />
        </FormField>
        <FormField label="New password" error={errors.newPassword?.message}>
          <input
            type="password"
            className={inputClass}
            {...register("newPassword", {
              required: "Required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
          />
        </FormField>
        <FormField label="Confirm new password" error={errors.confirm?.message}>
          <input
            type="password"
            className={inputClass}
            {...register("confirm", {
              required: "Required",
              validate: (v) =>
                v === watch("newPassword") || "Passwords do not match",
            })}
          />
        </FormField>
        {serverError && (
          <p className="mb-4 text-sm text-red-600">{serverError}</p>
        )}
        <button className={buttonClass} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Change password"}
        </button>
      </form>
    </AuthLayout>
  );
}
