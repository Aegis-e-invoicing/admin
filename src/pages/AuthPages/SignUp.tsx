import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | Aegis EInvoicing Portal"
        description="Register your business on the Aegis NRS e-invoicing portal"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
