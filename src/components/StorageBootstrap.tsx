"use client";

import { useEffect } from "react";
import { migrateStorage } from "@/lib/storage";

export function StorageBootstrap() {
  useEffect(() => {
    migrateStorage();
  }, []);

  return null;
}
