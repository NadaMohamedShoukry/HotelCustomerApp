import { auth } from "../_lib/auth";

export default async function page() {
  const session = await auth();
  const firstName = session?.user?.name;
  console.log(session);
  return (
    <h2 className="font-semibold text-2xl text-accent-400 mb-7">
      Welcome , {firstName}
    </h2>
  );
}
