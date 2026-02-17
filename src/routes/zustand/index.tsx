import { createFileRoute } from '@tanstack/react-router';
import { useStore } from '@/stores/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/zustand/')({
  component: RouteComponent,
});

function RouteComponent() {
  const admin = useStore((state) => state.admin);
  const coldStorage = useStore((state) => state.coldStorage);
  const preferences = useStore((state) => state.preferences);
  const token = useStore((state) => state.token);
  const isLoading = useStore((state) => state.isLoading);
  const hasHydrated = useStore((state) => state._hasHydrated);
  const clearAdminData = useStore((state) => state.clearAdminData);

  console.log(preferences);

  return (
    <div className="bg-secondary flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        <h2 className="font-custom text-center text-2xl font-bold tracking-tighter text-[#333]">
          Store state (Zustand)
        </h2>

        {!hasHydrated ? (
          <p className="font-custom text-center text-sm text-gray-600">
            Hydrating store…
          </p>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="font-custom">Meta</CardTitle>
                <CardDescription className="font-custom">
                  isLoading & hydration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <StoreRow label="isLoading" value={String(isLoading)} />
                <StoreRow label="_hasHydrated" value={String(hasHydrated)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-custom">Token</CardTitle>
                <CardDescription className="font-custom">
                  Auth token (masked)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StoreRow
                  label="token"
                  value={token ? `${token.slice(0, 20)}…` : 'null'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-custom">Admin</CardTitle>
                <CardDescription className="font-custom">
                  Logged-in store admin
                </CardDescription>
              </CardHeader>
              <CardContent>
                {admin ? (
                  <ul className="font-custom space-y-2 text-sm">
                    <StoreRow label="_id" value={admin._id} />
                    <StoreRow
                      label="coldStorageId"
                      value={admin.coldStorageId}
                    />
                    <StoreRow label="name" value={admin.name} />
                    <StoreRow label="mobileNumber" value={admin.mobileNumber} />
                    <StoreRow label="role" value={admin.role} />
                    <StoreRow
                      label="isVerified"
                      value={String(admin.isVerified)}
                    />
                    <StoreRow
                      label="failedLoginAttempts"
                      value={String(admin.failedLoginAttempts)}
                    />
                    {admin.lockedUntil && (
                      <StoreRow label="lockedUntil" value={admin.lockedUntil} />
                    )}
                    <StoreRow label="createdAt" value={admin.createdAt} />
                    <StoreRow label="updatedAt" value={admin.updatedAt} />
                  </ul>
                ) : (
                  <p className="font-custom text-sm text-gray-600">null</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-custom">Cold storage</CardTitle>
                <CardDescription className="font-custom">
                  Current cold storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coldStorage ? (
                  <ul className="font-custom space-y-2 text-sm">
                    <StoreRow label="_id" value={coldStorage._id} />
                    <StoreRow label="name" value={coldStorage.name} />
                    <StoreRow label="address" value={coldStorage.address} />
                    <StoreRow
                      label="mobileNumber"
                      value={coldStorage.mobileNumber}
                    />
                    <StoreRow
                      label="capacity"
                      value={String(coldStorage.capacity)}
                    />
                    {coldStorage.imageUrl && (
                      <StoreRow label="imageUrl" value={coldStorage.imageUrl} />
                    )}
                    <StoreRow
                      label="isPaid"
                      value={String(coldStorage.isPaid)}
                    />
                    <StoreRow
                      label="isActive"
                      value={String(coldStorage.isActive)}
                    />
                    <StoreRow label="plan" value={coldStorage.plan} />
                    <StoreRow label="createdAt" value={coldStorage.createdAt} />
                    <StoreRow label="updatedAt" value={coldStorage.updatedAt} />
                    {coldStorage.preferencesId && (
                      <StoreRow
                        label="preferencesId"
                        value={coldStorage.preferencesId}
                      />
                    )}
                  </ul>
                ) : (
                  <p className="font-custom text-sm text-gray-600">null</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-custom">Preferences</CardTitle>
                <CardDescription className="font-custom">
                  Commodity config, report format, showFinances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {preferences ? (
                  <ul className="font-custom space-y-2 text-sm">
                    {preferences._id && (
                      <StoreRow label="_id" value={preferences._id} />
                    )}
                    <StoreRow
                      label="reportFormat"
                      value={preferences.reportFormat}
                    />
                    <StoreRow
                      label="showFinances"
                      value={String(preferences.showFinances)}
                    />
                    <StoreRow
                      label="commodities"
                      value={
                        preferences.commodities?.length
                          ? JSON.stringify(preferences.commodities)
                          : '[]'
                      }
                    />
                    {preferences.customFields &&
                      Object.keys(preferences.customFields).length > 0 && (
                        <StoreRow
                          label="customFields"
                          value={JSON.stringify(preferences.customFields)}
                        />
                      )}
                    <StoreRow label="createdAt" value={preferences.createdAt} />
                    <StoreRow label="updatedAt" value={preferences.updatedAt} />
                  </ul>
                ) : (
                  <p className="font-custom text-sm text-gray-600">null</p>
                )}
              </CardContent>
            </Card>

            {(admin || coldStorage || preferences || token) && (
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={clearAdminData}
                  className="font-custom"
                >
                  Clear store (logout)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StoreRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-wrap gap-x-2 gap-y-1 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="break-all text-gray-600">{value}</span>
    </li>
  );
}
