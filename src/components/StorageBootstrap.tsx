"use client";

import { useEffect } from "react";
import { migrateStorage } from "@/lib/storage";

export function StorageBootstrap() {
  useEffect(() => {
    try {
      migrateStorage();
    } catch (error) {
      console.warn("Storage migration skipped:", error);
    }
  }, []);

  return null;
}
