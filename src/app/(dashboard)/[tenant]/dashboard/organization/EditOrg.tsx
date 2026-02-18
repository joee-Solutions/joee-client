import FieldBox from "@/components/shared/form/FieldBox";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FormComposer from "@/components/shared/form/FormComposer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CircleArrowLeft, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";

const EditOrganizationSchema = z.object({
  organizationName: z.string().min(1, "This field is required"),
  address: z.string().min(1, "This field is required"),
  status: z.string().min(1, "This field is required"),
  organizationPhoneNumber: z.string().min(1, "This field is required"),
  organizationEmail: z
    .string()
    .email("Invalid email address")
    .min(1, "This field is required"),

  adminName: z.string().min(1, "This field is required"),
  adminPhoneNumber: z.string().min(1, "This field is required"),
  adminEmail: z
    .string()
    .email("Invalid email address")
    .min(1, "This field is required"),
});

type EditOrganizationSchemaType = z.infer<typeof EditOrganizationSchema>;

const orgStatus = ["Active", "Inactive"];

export default function EditOrg() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const form = useForm<EditOrganizationSchemaType>({
    resolver: zodResolver(EditOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      organizationName: "",
      address: "",
      adminEmail: "",
      adminName: "",
      adminPhoneNumber: "",
      organizationEmail: "",
      organizationPhoneNumber: "",
      status: "",
    },
  });

  // Load organization profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const response = await processRequestAuth("get", API_ENDPOINTS.GET_PROFILE);
        
        // Extract data from response (handle different response structures)
        const profileData = response?.data || response;
        
        if (profileData) {
          // Map API response to form fields
          form.reset({
            organizationName: profileData.organization_name || profileData.organizationName || profileData.name || profileData.company || "",
            address: profileData.address || "",
            adminEmail: profileData.admin_email || profileData.adminEmail || profileData.email || "",
            adminName: profileData.admin_name || profileData.adminName || `${profileData.first_name || profileData.firstName || ""} ${profileData.last_name || profileData.lastName || ""}`.trim() || "",
            adminPhoneNumber: profileData.admin_phone || profileData.adminPhoneNumber || profileData.phone || profileData.phone_number || "",
            organizationEmail: profileData.organization_email || profileData.organizationEmail || profileData.email || "",
            organizationPhoneNumber: profileData.organization_phone || profileData.organizationPhoneNumber || profileData.phone || profileData.phone_number || "",
            status: profileData.status || (profileData.is_active ? "Active" : "Inactive") || "Active",
          });
        }
      } catch (error: any) {
        console.error("Failed to load organization profile:", error);
        if (error?.response?.status === 403) {
          toast.error("Access denied. Please check your permissions.", {
            toastId: "org-profile-403-error",
          });
        } else if (error?.response?.status === 401) {
          toast.error("Authentication failed. Please log in again.", {
            toastId: "org-profile-401-error",
          });
        } else {
          toast.error("Failed to load organization profile", {
            toastId: "org-profile-load-error",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [form]);

  const onSubmit = async (payload: EditOrganizationSchemaType) => {
    try {
      setIsSubmitting(true);
      
      // Map form data to API format
      const updateData = {
        organization_name: payload.organizationName,
        address: payload.address,
        admin_email: payload.adminEmail,
        admin_name: payload.adminName,
        admin_phone: payload.adminPhoneNumber,
        organization_email: payload.organizationEmail,
        organization_phone: payload.organizationPhoneNumber,
        status: payload.status?.toLowerCase() || "active",
        is_active: payload.status === "Active",
      };

      const response = await processRequestAuth("patch", API_ENDPOINTS.UPDATE_PROFILE, updateData);

      if (response?.data || response) {
        setShowSuccessDialog(true);
        toast.success("Organization profile updated successfully", {
          toastId: "org-profile-update-success",
        });
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Failed to update organization profile:", error);
      if (error?.response?.status === 403) {
        toast.error("Access denied. You don't have permission to update the organization profile.", {
          toastId: "org-profile-update-403-error",
        });
      } else if (error?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          toastId: "org-profile-update-401-error",
        });
      } else if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid organization data";
        toast.error(errorMessage, {
          toastId: "org-profile-update-400-error",
        });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to update organization profile";
        toast.error(errorMessage, {
          toastId: "org-profile-update-error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-500">Loading organization profile...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        Organization Profile
      </h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="organizationName"
            control={form.control}
            labelText="Organization name"
            type="text"
            placeholder="Enter here"
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="address"
            control={form.control}
            labelText="Address"
            type="text"
            placeholder="Enter here"
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="adminName"
            control={form.control}
            labelText="Admin/Contact Person name"
            placeholder="Enter here"
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="organizationPhoneNumber"
            control={form.control}
            labelText="Organization Phone number"
            placeholder="Enter here"
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="adminPhoneNumber"
            control={form.control}
            labelText="Admin Phone number"
            placeholder="Enter here"
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="organizationEmail"
            control={form.control}
            labelText="Organization Email"
            placeholder="Enter here"
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="adminEmail"
            control={form.control}
            labelText="Admin Email"
            placeholder="Enter here"
          />

          <FieldSelect
            bgSelectClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="status"
            control={form.control}
            options={orgStatus}
            labelText="Status"
            placeholder="Select"
          />

          <div className="flex items-center gap-7">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"} <Edit size={20} />
                </Button>

            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
              <AlertDialogContent className="bg-white flex flex-col items-center text-center">
                <AlertDialogHeader className="flex flex-col items-center">
                  <CheckCircle2 className="size-[100px] fill-[#3FA907] text-white" />
                  <AlertDialogTitle className="font-medium text-[#3FA907] text-4xl">
                    Success
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-normal text-base text-[#737373]">
                    You have successfully saved changes
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction 
                    onClick={() => setShowSuccessDialog(false)}
                    className="h-[60px] w-[291px] bg-[#3FA907] text-white font-medium text-base"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="button"
              variant="outline"
              className="h-[60px] border border-[#EC0909] text-base font-normal text-[#D40808] rounded w-full"
            >
              Delete <Trash2 size={24} />
            </Button>
          </div>
        </div>
      </FormComposer>
    </>
  );
}
