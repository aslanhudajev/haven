import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { usePeriodStore, ensureActivePeriodForDashboard } from '@entities/period';
import { addPurchase, uploadReceipt, usePurchaseStore } from '@entities/purchase';
import { runSerialized } from '@shared/lib/async';
import { getErrorMessage } from '@shared/lib/errors';
import { toCents } from '@shared/lib/format';
import { Colors, Spacing } from '@shared/lib/theme';
import { Button, Input } from '@shared/ui';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import { useAuth } from '@app/providers/AuthProvider';

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Enter a valid amount'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddPurchaseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { family } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const storePeriod = usePeriodStore((s) => s.activePeriod);
  const setActivePeriod = usePeriodStore((s) => s.setActivePeriod);
  const addPurchaseToStore = usePurchaseStore((s) => s.addPurchase);

  const [loading, setLoading] = useState(false);
  const [periodLoading, setPeriodLoading] = useState(!storePeriod);
  const [activePeriod, setLocalPeriod] = useState(storePeriod);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  useEffect(() => {
    if (activePeriod || !family) return;

    let cancelled = false;
    (async () => {
      try {
        const period = await runSerialized(`dashboard-period:${family.id}`, () =>
          ensureActivePeriodForDashboard({
            familyId: family.id,
            cadence: family.period_cadence,
            anchorDay: family.period_anchor_day,
          }),
        );
        if (!cancelled && period) {
          setLocalPeriod(period);
          setActivePeriod(period);
        }
      } catch (err) {
        console.warn('Failed to load period:', err);
      } finally {
        if (!cancelled) setPeriodLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [family, activePeriod]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', description: '' },
  });

  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera access is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const onSubmit = async ({ amount, description }: FormData) => {
    if (!user || !family || !activePeriod) return;
    setLoading(true);

    try {
      let receipt_url: string | undefined;
      if (receiptUri) {
        receipt_url = await uploadReceipt(family.id, user.id, receiptUri);
      }

      const purchase = await addPurchase({
        family_id: family.id,
        period_id: activePeriod.id,
        user_id: user.id,
        amount_cents: toCents(parseFloat(amount)),
        description: description || undefined,
        receipt_url,
      });

      addPurchaseToStore(purchase);
      router.back();
    } catch (err: unknown) {
      Alert.alert('Error', getErrorMessage(err, 'Could not add purchase'));
    } finally {
      setLoading(false);
    }
  };

  if (!family || periodLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!activePeriod) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          Could not load the current period. Pull to refresh on the dashboard and try again.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={`Amount (${family.currency})`}
              placeholder="0"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.amount?.message}
              keyboardType="decimal-pad"
              autoFocus
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Description (optional)"
              placeholder="What was this for?"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              style={{ height: 80, textAlignVertical: 'top', paddingTop: 14 }}
            />
          )}
        />

        <View style={styles.receiptSection}>
          <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>Receipt</Text>
          <View style={styles.receiptButtons}>
            <Pressable
              style={[styles.receiptBtn, { backgroundColor: theme.backgroundElement }]}
              onPress={takePhoto}
            >
              <Text style={[styles.receiptBtnText, { color: theme.text }]}>📷 Camera</Text>
            </Pressable>
            <Pressable
              style={[styles.receiptBtn, { backgroundColor: theme.backgroundElement }]}
              onPress={pickReceipt}
            >
              <Text style={[styles.receiptBtnText, { color: theme.text }]}>🖼️ Gallery</Text>
            </Pressable>
          </View>
          {receiptUri && <Image source={{ uri: receiptUri }} style={styles.receiptPreview} />}
        </View>

        <View style={styles.actions}>
          <Button title="Add Purchase" onPress={handleSubmit(onSubmit)} loading={loading} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  empty: { fontSize: 17, textAlign: 'center', marginTop: 64, paddingHorizontal: 32 },
  receiptSection: { marginBottom: 16 },
  receiptLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  receiptButtons: { flexDirection: 'row', gap: 12 },
  receiptBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptBtnText: { fontSize: 15, fontWeight: '500' },
  receiptPreview: { width: '100%', height: 200, borderRadius: 12, marginTop: 12 },
  actions: { marginTop: 'auto' },
});
