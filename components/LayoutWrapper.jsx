"use client";

import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <TopBar />}
      {!isAdmin && <Navbar />}

      <div className={isAdmin ? "" : ""}>{children}</div>

      {!isAdmin && <Footer />}
    </>
  );
}
