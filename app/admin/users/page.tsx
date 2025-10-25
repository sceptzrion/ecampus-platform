import type { Metadata } from "next";
import UserTable from "@/components/admin/users/user_table";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <>
      <div className="flex h-[75px] justify-between items-center">
        <h1 className="text-xl font-semibold text-[#323a46]">Users</h1>
        <div className="hidden md:flex gap-2.5 text-[14px]">
          <a href="/admin/dashboard" className="text-[#6c757d]">Dashboard</a>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">Users</span>
        </div>
      </div>

      <div className="bg-white rounded-xs px-6 py-5 w-full">
        <UserTable />
      </div>
    </>
  );
}
