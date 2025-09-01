import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface PlatformSettings {
  platform_name: string;
  theme_color: string;
  logo_url: string | null;
  favicon_url: string | null;
}

interface PlatformContextType {
  settings: PlatformSettings | null;
  refreshSettings: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType>({
  settings: null,
  refreshSettings: async () => {
    // Default empty async function
  },
});

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const refreshSettings = async () => {
    try {
      const { data } = await supabase
        .from("platform_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (data) {
        applyThemeSettings(data);
        setSettings(data);
      }
    } catch (error) {
      console.error("Error refreshing platform settings:", error);
    }
  };

  const applyThemeSettings = (settings: PlatformSettings) => {
    document.documentElement.style.setProperty(
      "--primary-color",
      settings.theme_color
    );
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = settings.favicon_url || "/default-favicon.ico";
    }
    document.title = settings.platform_name;
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <PlatformContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </PlatformContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePlatform = () => useContext(PlatformContext);
