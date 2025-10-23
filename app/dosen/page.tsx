import { redirect } from "next/navigation";
  
export default function Home() {
  redirect("/dosen/dashboard");
  return (
    <div>
      <p></p>
    </div>
  );
}
