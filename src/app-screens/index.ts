/**
 * Registry of all app screens that get bundled into the APK build.
 *
 * Jab bhi koi naya screen add ho (LoginScreen, ProfileScreen, etc.)
 * usse yahan import karke `appScreens` array me daalo. Studio aur
 * APK builder dono yahi list use karte hain.
 */
import HomeScreen from "./HomeScreen";

export type AppScreen = {
  id: string;
  label: string;
  Component: React.ComponentType;
  isDefault?: boolean;
};

export const appScreens: AppScreen[] = [
  { id: "home", label: "Home", Component: HomeScreen, isDefault: true },
];
