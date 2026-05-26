import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import Purchases, {
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { syncPremiumStatus } from '@/lib/revenueCat';

export const ENTITLEMENT_ID = 'Olfaire Pro';

interface UseRevenueCat {
  offering: PurchasesOffering | null;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export function useRevenueCat(): UseRevenueCat {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    Purchases.getOfferings()
      .then((offerings) => setOffering(offerings.current))
      .catch((err) => console.warn('getOfferings failed:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    setIsPurchasing(true);
    try {
      await Purchases.purchasePackage(pkg);
      await syncPremiumStatus();
      return true;
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert('Purchase failed', err.message ?? 'Something went wrong. Please try again.');
      }
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    setIsRestoring(true);
    try {
      await Purchases.restorePurchases();
      await syncPremiumStatus();
      Alert.alert('Purchases restored', 'Your Olfaire Pro access has been restored.');
      return true;
    } catch (err: any) {
      Alert.alert('Nothing to restore', err.message ?? 'No previous purchases found.');
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  return { offering, isLoading, isPurchasing, isRestoring, purchase, restore };
}
