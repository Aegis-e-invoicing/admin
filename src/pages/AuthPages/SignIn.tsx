import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Aegis EInvoicing Portal"
        description="Sign in to the Aegis NRS e-invoicing portal"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
