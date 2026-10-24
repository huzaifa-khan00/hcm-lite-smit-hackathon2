import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField, {
  inputClass,
  buttonClass,
} from "../../components/FormField.jsx";
import { getSetupStatus, runSetup } from "../../api/auth.js";
import { errorMessage } from "../../api/client.js";

export default function Setup() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    getSetupStatus()
      .then((s) => {
        if (s.setupComplete) navigate("/login", { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await runSetup(values);
      navigate("/login", { replace: true });
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Set up HCM Lite"
      subtitle="Create your company and the Admin account."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Company name" error={errors.companyName?.message}>
          <input
            className={inputClass}
            {...register("companyName", {
              required: "Company name is required",
            })}
          />
        </FormField>
        <FormField label="Admin name" error={errors.name?.message}>
          <input
            className={inputClass}
            {...register("name", { required: "Admin name is required" })}
          />
        </FormField>
        <FormField label="Admin email" error={errors.email?.message}>
          <input
            type="email"
            className={inputClass}
            {...register("email", { required: "Email is required" })}
          />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <input
            type="password"
            className={inputClass}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
          />
        </FormField>
        {serverError && (
          <p className="mb-4 text-sm text-red-600">{serverError}</p>
        )}
        <button className={buttonClass} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create company"}
        </button>
      </form>
    </AuthLayout>
  );
}
