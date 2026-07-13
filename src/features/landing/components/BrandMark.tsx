export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/icon-192x192.webp"
        alt="Coldop logo"
        width={40}
        height={40}
        className="size-10 rounded-full border bg-white object-contain p-0.5"
        decoding="async"
      />
      <div className="flex flex-col">
        <span className="font-heading text-lg leading-none font-bold tracking-tight">Coldop</span>
        <span className="text-primary mt-0.5 text-[9px] font-semibold tracking-widest uppercase">
          Estd. 2023
        </span>
      </div>
    </div>
  );
}
