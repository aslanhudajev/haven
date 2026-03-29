import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import {
  deletePurchase,
  getPurchaseById,
  removeReceiptFromStorage,
  updatePurchase,
  uploadReceipt,
  usePurchaseStore,
  useReceiptSignedUrl,
  type Purchase,
} from '@entities/purchase';
import { formatMoney, toCents, fromCents } from '@shared/lib/format';
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

export default function PurchaseEditScreen() {
  const params = useLocalSearchParams<{ purchaseId: string | string[] }>();
  const purchaseId = Array.isArray(params.purchaseId) ? params.purchaseId[0] : params.purchaseId;
  const router = useRouter();
  const { user } = useAuth();
  const { family } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const updatePurchaseInList = usePurchaseStore((s) => s.updatePurchaseInList);
  const removePurchase = usePurchaseStore((s) => s.removePurchase);

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [receiptRemoved, setReceiptRemoved] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);

  const currency = family?.currency ?? 'SEK';

  const load = useCallback(async () => {
    if (!purchaseId) return;
    setLoading(true);
    try {
      const p = await getPurchaseById(purchaseId);
      setPurchase(p);
    } catch (e) {
      console.warn('Purchase load error:', e);
      setPurchase(null);
    } finally {
      setLoading(false);
    }
  }, [purchaseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', description: '' },
  });

  useEffect(() => {
    if (!purchase) return;
    reset({
      amount: String(fromCents(purchase.amount_cents)),
      description: purchase.description ?? '',
    });
    setReceiptUri(null);
    setReceiptRemoved(false);
  }, [purchase, reset]);

  const isOwn = !!purchase && !!user && purchase.user_id === user.id;
  const remoteReceiptSource =
    purchase && isOwn && !receiptUri && !receiptRemoved ? purchase.receipt_url : null;
  const signedReceiptUrl = useReceiptSignedUrl(remoteReceiptSource);
  const ownerReceiptDisplayUri = receiptUri ?? signedReceiptUrl;

  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
      setReceiptRemoved(false);
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
      setReceiptRemoved(false);
    }
  };

  const onSubmit = async ({ amount, description }: FormData) => {
    if (!purchase || !user || !family || !isOwn) return;
    setSaving(true);
    try {
      let receipt_url: string | null | undefined = purchase.receipt_url;
      if (receiptRemoved && purchase.receipt_url) {
        await removeReceiptFromStorage(purchase.receipt_url);
        receipt_url = null;
      }
      if (receiptUri) {
        receipt_url = await uploadReceipt(family.id, user.id, receiptUri);
        if (purchase.receipt_url && purchase.receipt_url !== receipt_url) {
          await removeReceiptFromStorage(purchase.receipt_url);
        }
      }

      const updated = await updatePurchase(purchase.id, {
        amount_cents: toCents(parseFloat(amount)),
        description: description || null,
        receipt_url: receipt_url ?? null,
      });

      const merged: Purchase = {
        ...updated,
        profile: purchase.profile,
      };
      updatePurchaseInList(merged);
      router.back();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update purchase';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!purchase || !isOwn) return;
    Alert.alert('Delete purchase?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePurchase(purchase.id);
            removePurchase(purchase.id);
            router.back();
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Could not delete';
            Alert.alert('Error', msg);
          }
        },
      },
    ]);
  };

  if (loading || !purchaseId) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!purchase) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background, paddingHorizontal: 32 }]}>
        <Text style={[styles.muted, { color: theme.textSecondary }]}>
          This purchase could not be loaded.
        </Text>
        <Button title="Go back" onPress={() => router.back()} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!isOwn) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: 24,
          paddingTop: 16,
        }}
      >
        <Text style={[styles.readOnlyLabel, { color: theme.textSecondary }]}>Amount</Text>
        <Text style={[styles.readOnlyValue, { color: theme.text }]}>
          {formatMoney(purchase.amount_cents, currency)}
        </Text>
        {purchase.description ? (
          <>
            <Text style={[styles.readOnlyLabel, { color: theme.textSecondary, marginTop: 16 }]}>
              Description
            </Text>
            <Text style={[styles.readOnlyValue, { color: theme.text }]}>
              {purchase.description}
            </Text>
          </>
        ) : null}
        {purchase.receipt_url ? (
          <Text style={[styles.hint, { color: theme.textSecondary, marginTop: 24 }]}>
            A receipt is attached. Only the person who added this purchase can view it.
          </Text>
        ) : null}
        <Text style={[styles.hint, { color: theme.textSecondary, marginTop: 16 }]}>
          Only the person who added this purchase can edit or delete it.
        </Text>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: 24,
          paddingTop: 16,
        }}
      >
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={`Amount (${currency})`}
              placeholder="0"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.amount?.message}
              keyboardType="decimal-pad"
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
              <Text style={[styles.receiptBtnText, { color: theme.text }]}>Camera</Text>
            </Pressable>
            <Pressable
              style={[styles.receiptBtn, { backgroundColor: theme.backgroundElement }]}
              onPress={pickReceipt}
            >
              <Text style={[styles.receiptBtnText, { color: theme.text }]}>Gallery</Text>
            </Pressable>
          </View>
          {ownerReceiptDisplayUri && !receiptRemoved ? (
            <Pressable onPress={() => setReceiptModalVisible(true)}>
              <Image source={{ uri: ownerReceiptDisplayUri }} style={styles.receiptPreview} />
            </Pressable>
          ) : null}
          {(purchase.receipt_url || receiptUri) && !receiptRemoved ? (
            <Pressable
              onPress={() => {
                setReceiptRemoved(true);
                setReceiptUri(null);
              }}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: '#FF3B30', fontSize: 15 }}>Remove receipt</Text>
            </Pressable>
          ) : null}
          {purchase.receipt_url && !receiptUri && !receiptRemoved && !signedReceiptUrl ? (
            <Text style={[styles.hint, { color: theme.textSecondary, marginTop: 8 }]}>
              Could not load receipt preview. Pull to refresh and try again.
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Button title="Save changes" onPress={handleSubmit(onSubmit)} loading={saving} />
          <View style={{ height: 12 }} />
          <Button title="Delete purchase" onPress={onDelete} variant="destructive" />
        </View>
      </ScrollView>

      <Modal visible={receiptModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setReceiptModalVisible(false)}>
          {ownerReceiptDisplayUri ? (
            <Image
              source={{ uri: ownerReceiptDisplayUri }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { fontSize: 17, textAlign: 'center' },
  readOnlyLabel: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginBottom: 6 },
  readOnlyValue: { fontSize: 20, fontWeight: '600' },
  hint: { fontSize: 15, lineHeight: 22 },
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
  actions: { marginTop: 8 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: { width: '100%', height: '80%' },
});
