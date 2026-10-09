import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-10">Loading...</div>}>
            <SearchClient />
        </Suspense>
    );
}