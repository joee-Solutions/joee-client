"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function useAdminBasePath() {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const tenant = segments[0] && segments[0] !== "dashboard" ? segments[0] : null;
  return tenant ? `/${tenant}/dashboard/admin` : "/dashboard/admin";
}

export default function AdminDetailPage() {
  const router = useRouter();
  const params = useParams();
  const basePath = useAdminBasePath();
  const id = params?.id as string | undefined;
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_ADMIN(id));
        const data = response?.data ?? response;
        setAdmin(data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message ?? "Failed to load admin", { toastId: "admin-detail-error" });
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await processRequestOfflineAuth("delete", API_ENDPOINTS.DELETE_ADMIN(id));
      toast.success("Admin deleted successfully", { toastId: "admin-delete-success" });
      setDeleteConfirmOpen(false);
      router.push(`${basePath}/list`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to delete admin", { toastId: "admin-delete-error" });
      setDeleting(false);
    }
  };

  const name =
    admin?.name ??
    [admin?.first_name ?? admin?.firstname, admin?.last_name ?? admin?.lastname].filter(Boolean).join(" ") ??
    admin?.email ??
    "—";
  const email = admin?.email ?? "—";
  const role = admin?.role ?? admin?.roles?.[0] ?? "—";
  const phone = admin?.phone_number ?? admin?.phoneNumber ?? admin?.phone ?? "—";
  const address = admin?.address ?? "—";
  const company = admin?.company ?? admin?.organization ?? admin?.domain ?? "—";
  const profilePicture = admin?.profile_picture ?? admin?.profilePicture ?? "/assets/profile.png";

  if (loading) {
    return (
      <div className="px-10 pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="font-bold text-base text-black">Admin Details</h2>
        </div>
        <p className="text-gray-500 py-8">Loading...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="px-10 pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="font-bold text-base text-black">Admin Details</h2>
        </div>
        <p className="text-gray-500 py-8">Admin not found.</p>
      </div>
    );
  }

  return (
    <div className="px-10 pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-[30px]">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="font-bold text-base text-black">Admin Details</h2>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setDeleteConfirmOpen(true)}
          className="border-[#EC0909] text-[#EC0909] hover:bg-[#EC0909] hover:text-white flex items-center gap-2"
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-8">
        <div className="shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#D9D9D9] bg-gray-100">
            <Image
              src={profilePicture}
              alt={name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.src = "/assets/profile.png";
              }}
            />
          </div>
        </div>
        <div className="grid gap-4 flex-1">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <p className="text-base font-medium text-black">{name}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <p className="text-base text-black">{email}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
            <p className="text-base text-black">{role}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
            <p className="text-base text-black">{phone}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
            <p className="text-base text-black">{address}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
            <p className="text-base text-black">{company}</p>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[#EC0909] hover:bg-[#EC0909]/90 text-white"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
