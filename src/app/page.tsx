import { auth } from "@/auth";
import LandingUI from "@/components/landing-ui";

export default async function LandingPage() {
  const session = await auth();
  return <LandingUI user={session?.user} />;
}