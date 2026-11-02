import type { AlertButton } from 'react-native';

/**
 * React Native Web neturi Alert įgyvendinimo (iškvietimas nieko nedaro),
 * todėl naršyklėje naudojame window.alert / window.confirm.
 */
export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    const text = [title, message].filter(Boolean).join('\n\n');
    const actions = (buttons ?? []).filter((b) => b.style !== 'cancel');
    if (actions.length === 0) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    // Keli veiksmai (pvz. Apple / Google Maps) – naršyklėje imamas pirmasis.
    if (window.confirm(text)) actions[0].onPress?.();
    else buttons?.find((b) => b.style === 'cancel')?.onPress?.();
  },
};
