import { MoreOverview } from './components/more-overview';

const MorePage = () => {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <section>
        <MoreOverview />
      </section>
    </div>
  );
};

export default MorePage;
