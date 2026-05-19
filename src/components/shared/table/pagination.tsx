"use client";

import ReactPaginate from "react-paginate";

interface PaginationProps {
  dataLength: number;
  pageSize: number;
  numOfPages: number;
  currentPage?: number;
  handlePageClick: (event: { selected: number }) => void;
}

export default function Pagination({
  dataLength,
  pageSize,
  numOfPages,
  currentPage = 0,
  handlePageClick,
}: PaginationProps) {
  const start = dataLength === 0 ? 0 : currentPage * pageSize + 1;
  const end = dataLength === 0 ? 0 : Math.min(dataLength, (currentPage + 1) * pageSize);

  return (
    <div className="pt-4 border-[#D8E7F2] border-t">
      <div className="flex items-center justify-between h-[62px] gap-5 flex-wrap py-3 px-4">
        <p className="font-medium text-sm text-[#737373]">
          Showing {start} to {end} of {dataLength} entries
        </p>
        <ReactPaginate
          breakLabel="..."
          forcePage={currentPage}
          onPageChange={handlePageClick}
          nextLabel="Next"
          previousLabel="Previous"
          pageRangeDisplayed={3}
          pageCount={numOfPages}
          marginPagesDisplayed={2}
          renderOnZeroPageCount={null}
          containerClassName="flex justify-center gap-1"
          pageClassName="flex items-center justify-center w-[30px] h-[30px] rounded-[8px] overflow-hidden bg-white border border-[#BFBFBF] text-[#595959] text-xs cursor-pointer [&_>a]:w-full [&_>a]:h-full [&_>a]:flex [&_>a]:items-center [&_>a]:justify-center [&_>a]:rounded-[2px] [&_>a]:px-[10px]"
          activeClassName="[&_>a]:bg-[#003465] [&_>a]:text-white border border-[#003465]"
          activeLinkClassName=""
          breakClassName="px-3 py-1"
          previousClassName="h-[30px] flex items-center justify-center p-[10px] border border-[#BFBFBF] rounded-[2px] text-xs font-normal text-[#595959]"
          nextClassName="h-[30px] flex items-center justify-center p-[10px] border border-[#BFBFBF] rounded-[2px] text-xs font-normal text-[#595959]"
        />
      </div>
    </div>
  );
}
