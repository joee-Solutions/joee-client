import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-12 pb-20 flex flex-col gap-[30px] w-full ">
      {/* <header>
        <h3
          className="font-semibold text-2xl text-black gap-1 p-0 flex items-center"
        >
         Admin Settings
        </h3>
      </header> */}
      {children}
      </div>
  )
}

export default layout