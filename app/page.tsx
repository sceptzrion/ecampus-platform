import { redirect } from "next/navigation";
  
export default function Home() {
  redirect("/dashboard/dashboard-akademik");
  return (
    <div>
      <p></p>
    </div>
  );
}
