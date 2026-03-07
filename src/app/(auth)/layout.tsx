import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex w-screen h-screen">
            {children}
            <div
                className="basis-1/2 lg:block hidden h-full bg-linear-to-r from-[oklch(0.55_0.19_20)] via-[oklch(0.52_0.19_27)] to-[oklch(0.48_0.18_35)]"
            />
        </div>
    );
};

export default layout;
