import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField, {
  inputClass,
  buttonClass,
} from "../../components/FormField.jsx";
import { useAuth } from "../../auth/useAuth.js";
import { getSetupStatus } from "../../api/auth.js";
import { errorMessage } from "../../api/client.js";

export default function Login() {
  const { user, loading, login } = useAuth();
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
        if (!s.setupComplete) navigate("/setup", { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  if (!loading && user) return <Navigate to="/" replace />;

  const onSubmit = async ({ email, password }) => {
    setServerError("");
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to HCM Lite.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" error={errors.email?.message}>
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
            {...register("password", { required: "Password is required" })}
          />
        </FormField>
        {serverError && (
          <p className="mb-4 text-sm text-red-600">{serverError}</p>
        )}
        <button className={buttonClass} disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
