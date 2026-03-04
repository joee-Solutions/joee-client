import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import BackupTable from "./BackupTable";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
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

const tableColumnNames = [
  "Date",
  "File name",
  "Backup Completion Time",
  "File size",
  "Status",
  "Actions",
];

function formatDate(val: string | undefined): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return String(val);
  }
}

/** Format bytes to KB, MB, GB */
function formatFileSize(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num) || num < 0) return "—";
  if (num === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let u = 0;
  let n = num;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u += 1;
  }
  return `${n.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}

interface RecentBackupProps {
  showRestoreOnly?: boolean;
}

export default function RecentBackup({ showRestoreOnly = false }: RecentBackupProps) {
  const [tableRows, setTableRows] = useState<Record<string, string | number>[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null);

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_BACKUPS);
      const raw = Array.isArray(response?.data)
        ? response.data
        : Array.isArray((response as any)?.data?.data)
          ? (response as any).data.data
          : Array.isArray(response)
            ? response
            : [];
      const rows = raw.map((b: any, index: number) => ({
        id: b.id ?? b.backupId,
        date: formatDate(b.date ?? b.createdAt ?? b.created_at),
        fileName: `Backup ${index + 1}`,
        backupTime: formatDate(b.completedAt ?? b.completed_at ?? b.date ?? b.createdAt),
        fileSize: formatFileSize(b.fileSize ?? b.size ?? b.file_size),
        status: b.status ?? "Successful",
      }));
      setTableRows(rows);
    } catch (e: any) {
      toast.error((e?.response?.data?.message as string) ?? "Failed to load backups", { toastId: "backup-load" });
      setTableRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      await processRequestOfflineAuth("post", API_ENDPOINTS.CREATE_BACKUP);
      toast.success("Backup created successfully", { toastId: "backup-create" });
      await fetchBackups();
    } catch (e: any) {
      toast.error((e?.response?.data?.message as string) ?? "Failed to create backup", { toastId: "backup-create-error" });
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (backupId: string | number) => {
    try {
      await processRequestOfflineAuth("post", API_ENDPOINTS.RESTORE_BACKUP(backupId));
      toast.success("Backup restored successfully", { toastId: "backup-restore" });
      await fetchBackups();
    } catch (e: any) {
      toast.error((e?.response?.data?.message as string) ?? "Failed to restore", { toastId: "backup-restore-error" });
    }
  };

  const handleDelete = async (backupId: string | number) => {
    try {
      await processRequestOfflineAuth("delete", API_ENDPOINTS.DELETE_BACKUP(backupId));
      toast.success("Backup deleted successfully", { toastId: "backup-delete" });
      setPendingDeleteId(null);
      await fetchBackups();
    } catch (e: any) {
      toast.error((e?.response?.data?.message as string) ?? "Failed to delete backup", { toastId: "backup-delete-error" });
      setPendingDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between my-7">
        <h2 className="font-bold text-base text-black">Recent Backup</h2>
        {!showRestoreOnly && (
          <Button
            type="button"
            onClick={handleCreateBackup}
            disabled={creating}
            className="h-[50px] bg-[#003465] text-white font-medium text-base rounded-[8px] px-6 hover:bg-[#003465]/90"
          >
            {creating ? "Creating…" : "Backup"}
          </Button>
        )}
      </div>

      <div>
        <BackupTable
          tableTitle="Backups"
          tableColumnNames={tableColumnNames}
          tableRows={tableRows}
          loading={loading}
          onRestore={handleRestore}
          onDelete={(id) => setPendingDeleteId(id)}
        />
      </div>

      <AlertDialog open={pendingDeleteId != null} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the backup from the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDeleteId != null && handleDelete(pendingDeleteId)}
              className="bg-[#EC0909] hover:bg-[#EC0909]/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
