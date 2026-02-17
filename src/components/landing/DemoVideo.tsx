import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

interface DemoVideoProps {
  eyebrow: string;
  title: string;
  description: string;
  videoId: string;
  videoTitle: string;
  detailsTitle: string;
  detailsDescription: string;
  ctaText: string;
  ctaHref: string;
}

const DemoVideo = ({
  eyebrow,
  title,
  description,
  videoId,
  videoTitle,
  detailsTitle,
  detailsDescription,
  ctaText,
  ctaHref,
}: DemoVideoProps) => {
  return (
    <section
      id="demo"
      className="from-background via-secondary/30 to-background relative w-full overflow-hidden bg-gradient-to-b py-20 sm:py-32"
    >
      {/* Background decoration */}
      <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-r via-transparent opacity-50" />

      <div className="relative mx-auto max-w-[75rem] px-8 sm:px-16 lg:px-24">
        {/* Header */}
        <div className="mb-16 text-center sm:mb-20">
          <span className="font-custom text-foreground mb-6 block text-base font-medium tracking-[0.075rem] uppercase">
            {eyebrow}
          </span>
          <h2 className="font-custom text-foreground mb-8 text-4xl font-bold tracking-tighter md:text-5xl">
            {title}
          </h2>
          <p className="font-custom text-muted-foreground mx-auto max-w-[50rem] text-lg leading-[1.8]">
            {description}
          </p>
        </div>

        {/* Video */}
        <div className="mx-auto max-w-4xl">
          <div className="bg-card overflow-hidden rounded-[11px] shadow-2xl">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={videoTitle}
                className="h-full w-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* Video details */}
          <div className="mt-12 text-center">
            <h3 className="font-custom text-foreground mb-4 text-2xl font-semibold">
              {detailsTitle}
            </h3>
            <p className="font-custom text-muted-foreground mx-auto max-w-2xl leading-relaxed">
              {detailsDescription}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center sm:mt-20">
          <Button
            variant="default"
            size="lg"
            asChild
            className="font-custom px-8 py-4 text-xl shadow-lg"
          >
            <Link to={ctaHref as '/'}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default memo(DemoVideo);
