import SettingsOverview from './components/settings-overview';

const SettingsPage = () => {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <section>
        <SettingsOverview />
      </section>
    </div>
  );
};

export default SettingsPage;
