import { useForm } from '@tanstack/react-form';
import { EyeIcon, EyeOffIcon, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { env } from '@/lib/env';
import { useLogin } from '../api/use-login';

const formSchema = z.object({
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password must be at most 100 characters'),
});

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: login, isPending } = useLogin();

  const form = useForm({
    defaultValues: {
      mobileNumber: '',
      password: '',
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { message } = await login(value);
        toast.success(message, { position: 'bottom-right' });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Login failed', {
          position: 'bottom-right',
        });
      }
    },
  });

  return (
    <div className="bg-background flex min-h-screen w-full items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Account Access</CardTitle>
          <CardDescription>
            Sign in to {env.appName} with your mobile number and password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="mobileNumber">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Mobile Number</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="9876543210"
                      type="tel"
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <a
                        href="/forgot-password"
                        className="text-primary text-sm font-medium hover:underline"
                        tabIndex={-1}
                      >
                        Forgot?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
                    )}
                  </Field>
                )}
              </form.Field>
            </FieldGroup>

            <div className="pt-2">
              <form.Subscribe selector={(state) => state.canSubmit}>
                {(canSubmit) => (
                  <Button type="submit" disabled={!canSubmit || isPending} className="w-full">
                    {isPending ? (
                      'Authenticating…'
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-muted-foreground text-sm">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
