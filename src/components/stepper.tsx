import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  title: string;
  description: string;
}

export interface StepperProps {
  steps: readonly Step[];
  /** 1-based index of the active step (first step = 1). */
  currentStep: number;
  className?: string;
  'aria-label'?: string;
}

export function Stepper({
  steps,
  currentStep,
  className,
  'aria-label': ariaLabel = 'Progress',
}: StepperProps) {
  return (
    <nav aria-label={ariaLabel} className={cn('w-full', className)}>
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <Fragment key={index}>
              <li
                className="flex shrink-0 flex-col items-center"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="relative flex h-10 w-10 items-center justify-center">
                  {isCurrent && (
                    <span
                      className="bg-primary/20 absolute inset-0 animate-ping rounded-full"
                      style={{ animationDuration: '2s' }}
                    />
                  )}
                  <div
                    className={cn(
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold tabular-nums transition-all duration-500',
                      isCompleted && 'border-primary bg-primary text-primary-foreground shadow-sm',
                      isCurrent &&
                        'border-primary bg-primary text-primary-foreground ring-primary/25 shadow-sm ring-2',
                      isUpcoming && 'border-border bg-background text-muted-foreground',
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4 stroke-[2.5]" aria-hidden />
                    ) : (
                      <span>{stepNumber}</span>
                    )}
                  </div>
                </div>

                <span
                  className={cn(
                    'mt-3 text-center text-sm leading-tight font-medium whitespace-nowrap transition-colors duration-300',
                    (isCompleted || isCurrent) && 'text-foreground',
                    isCurrent && 'font-semibold',
                    isUpcoming && 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </span>
                <span
                  className={cn(
                    'text-muted-foreground mt-1 text-center text-xs leading-snug whitespace-nowrap transition-colors duration-300',
                    isCurrent && 'text-foreground/80',
                  )}
                >
                  {step.description}
                </span>
              </li>

              {index < steps.length - 1 && (
                <li aria-hidden className="flex h-10 flex-1 items-center">
                  <div className="bg-border relative h-0.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: currentStep > index + 1 ? '100%' : '0%',
                      }}
                    />
                  </div>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
