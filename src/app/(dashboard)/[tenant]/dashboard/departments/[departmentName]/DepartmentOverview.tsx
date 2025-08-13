import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export default function DepartmentOverview() {


  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-black">Department Overview</h2>
      
      {/* Short Description Section */}
      <div className="bg-[#E8F4FD] p-6 rounded-lg">
        <h3 className="text-sm font-medium text-[#666666] mb-3">Short Description</h3>
        <p className="text-sm text-[#333333] leading-relaxed">
          Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. Faucibus 
          volutpat quis cras aliquam a sed. Mattis porttitor risus elementum feugiat 
          mauris. Nec tortor quisque turpis blandit mauris at tellus.
        </p>
      </div>

      {/* Department Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#E8F4FD] p-4 rounded-lg">
          <h4 className="text-sm font-medium text-[#666666] mb-2">Depart name</h4>
          <p className="text-base font-medium text-[#333333]">Opthamology</p>
        </div>
        
        <div className="bg-[#E8F4FD] p-4 rounded-lg">
          <h4 className="text-sm font-medium text-[#666666] mb-2">Date Created</h4>
          <p className="text-base font-medium text-[#333333]">17-04-1984</p>
        </div>
        
        <div className="bg-[#E8F4FD] p-4 rounded-lg">
          <h4 className="text-sm font-medium text-[#666666] mb-2">Number of Employees</h4>
          <p className="text-base font-medium text-[#333333]">24</p>
        </div>
        
        <div className="bg-[#E8F4FD] p-4 rounded-lg">
          <h4 className="text-sm font-medium text-[#666666] mb-2">Status</h4>
          <p className="text-base font-medium text-[#333333]">Active</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button className="bg-[#003465] hover:bg-[#002147] text-white font-medium py-3 px-8 rounded-lg flex items-center gap-2 flex-1">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
        
        <Button 
          variant="outline" 
          className="border-2 border-red-500 text-red-500 hover:bg-red-50 font-medium py-3 px-8 rounded-lg flex items-center gap-2 flex-1"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}