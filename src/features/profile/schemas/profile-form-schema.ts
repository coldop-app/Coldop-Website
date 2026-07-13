import * as z from 'zod';
import type { ProfileData } from '../types';
import type { UpdateProfilePayload } from '../types';

const mobileNumberSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

const storageFloorFormSchema = z.object({
  name: z.string().trim().min(1, 'Floor name is required'),
  capacity: z
    .number({ message: 'Floor capacity is required' })
    .positive('Floor capacity must be greater than zero'),
});

const storageLayoutChamberFormSchema = z.object({
  name: z.string().trim().min(1, 'Chamber name is required'),
  floors: z.array(storageFloorFormSchema).min(1, 'Each chamber must have at least one floor'),
});

const coldStorageFormSchema = z.object({
  name: z.string().trim().min(1, 'Cold storage name is required'),
  address: z.string().trim().min(1, 'Address is required'),
  mobileNumber: mobileNumberSchema,
  capacity: z
    .number({ message: 'Capacity is required' })
    .positive('Capacity must be greater than 0'),
  storageLayout: z.array(storageLayoutChamberFormSchema),
});

export type StorageFloorFormValues = z.infer<typeof storageFloorFormSchema>;
export type StorageLayoutChamberFormValues = z.infer<typeof storageLayoutChamberFormSchema>;

export function emptyStorageFloor(): StorageFloorFormValues {
  return { name: '', capacity: 0 };
}

export function emptyStorageLayoutChamber(): StorageLayoutChamberFormValues {
  return {
    name: '',
    floors: [emptyStorageFloor()],
  };
}

export const profileFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    mobileNumber: mobileNumberSchema,
    password: z.string(),
    confirmPassword: z.string(),
    coldStorage: coldStorageFormSchema,
  })
  .superRefine((values, ctx) => {
    const password = values.password.trim();

    if (password.length === 0) {
      return;
    }

    if (password.length < 6) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must be at least 6 characters',
        path: ['password'],
      });
    }

    if (values.confirmPassword !== values.password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function profileToFormValues(profile: ProfileData): ProfileFormValues {
  const { coldStorage } = profile;

  return {
    name: profile.storeAdmin.name,
    mobileNumber: profile.storeAdmin.mobileNumber,
    password: '',
    confirmPassword: '',
    coldStorage: {
      name: coldStorage.name,
      address: coldStorage.address,
      mobileNumber: coldStorage.mobileNumber,
      capacity: coldStorage.capacity,
      storageLayout: (coldStorage.storageLayout ?? []).map((chamber) => ({
        name: chamber.name,
        floors: chamber.floors.map((floor) => ({
          name: floor.name,
          capacity: floor.capacity,
        })),
      })),
    },
  };
}

function storageLayoutEqual(
  left: ProfileFormValues['coldStorage']['storageLayout'],
  right: ProfileFormValues['coldStorage']['storageLayout'],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every(
    (chamber, index) =>
      chamber.name === right[index]?.name &&
      chamber.floors.length === right[index]?.floors.length &&
      chamber.floors.every(
        (floor, floorIndex) =>
          floor.name === right[index]?.floors[floorIndex]?.name &&
          floor.capacity === right[index]?.floors[floorIndex]?.capacity,
      ),
  );
}

function hasColdStorageChanges(
  values: ProfileFormValues['coldStorage'],
  original: ProfileData['coldStorage'],
): UpdateProfilePayload['coldStorage'] | undefined {
  const changes: UpdateProfilePayload['coldStorage'] = {};

  if (values.name !== original.name) {
    changes.name = values.name;
  }
  if (values.address !== original.address) {
    changes.address = values.address;
  }
  if (values.mobileNumber !== original.mobileNumber) {
    changes.mobileNumber = values.mobileNumber;
  }
  if (values.capacity !== original.capacity) {
    changes.capacity = values.capacity;
  }

  const originalStorageLayout = (original.storageLayout ?? []).map((chamber) => ({
    name: chamber.name,
    floors: chamber.floors.map((floor) => ({
      name: floor.name,
      capacity: floor.capacity,
    })),
  }));

  if (!storageLayoutEqual(values.storageLayout, originalStorageLayout)) {
    changes.storageLayout = values.storageLayout.map((chamber) => ({
      name: chamber.name,
      floors: chamber.floors.map((floor) => ({
        name: floor.name,
        capacity: floor.capacity,
      })),
    }));
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
}

export function formValuesToUpdatePayload(
  values: ProfileFormValues,
  originalProfile: ProfileData,
): UpdateProfilePayload {
  const payload: UpdateProfilePayload = {};
  const { storeAdmin, coldStorage } = originalProfile;

  if (values.name !== storeAdmin.name) {
    payload.name = values.name;
  }
  if (values.mobileNumber !== storeAdmin.mobileNumber) {
    payload.mobileNumber = values.mobileNumber;
  }

  const password = values.password.trim();
  if (password.length >= 6) {
    payload.password = password;
  }

  const coldStorageChanges = hasColdStorageChanges(values.coldStorage, coldStorage);
  if (coldStorageChanges) {
    payload.coldStorage = coldStorageChanges;
  }

  return payload;
}

export function hasUpdatePayloadChanges(payload: UpdateProfilePayload): boolean {
  return (
    payload.name !== undefined ||
    payload.mobileNumber !== undefined ||
    payload.password !== undefined ||
    (payload.coldStorage !== undefined && Object.keys(payload.coldStorage).length > 0)
  );
}
