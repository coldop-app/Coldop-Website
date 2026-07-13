const INSTAGRAM_REEL_EMBED_URL = 'https://www.instagram.com/reel/DRrlfr1CfB5/embed';

export function InstagramReel() {
  return (
    <iframe
      src={INSTAGRAM_REEL_EMBED_URL}
      title="Coldop Instagram Reel — Real-time WhatsApp Alert"
      className="h-full w-full border-0"
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}
