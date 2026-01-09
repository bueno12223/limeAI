import { UserCircle } from "lucide-react";

export const Header = () => {
    return (
        <div className="flex items-center p-4 border-b h-full w-full bg-white dark:bg-slate-950">
            <div className="flex w-full justify-end">
                <div className="flex items-center gap-x-2 cursor-pointer hover:bg-slate-100 p-2 rounded-full transition dark:hover:bg-slate-800">
                    <UserCircle className="h-8 w-8 text-slate-600 dark:text-slate-300" />
                </div>
            </div>
        </div>
    );
};
