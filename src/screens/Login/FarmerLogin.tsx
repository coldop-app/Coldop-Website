import Navbar from "@/components/common/Navbar/Navbar";
import Footer from "@/components/common/Footer/Footer";
import FarmerLoginForm from "@/components/auth/FarmerLoginForm";
import { useTranslation } from 'react-i18next';
import { footerData } from "../homeScreenData";
import SEO from "@/components/common/SEO/SEO";
import { SEO_PAGES, getPageUrl } from "@/utils/seo";

const FarmerLogin = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={SEO_PAGES.FARMER_LOGIN.title}
        description={SEO_PAGES.FARMER_LOGIN.description}
        keywords={SEO_PAGES.FARMER_LOGIN.keywords}
        url={getPageUrl('/login/farmer')}
        noindex={SEO_PAGES.FARMER_LOGIN.noindex}
        nofollow={SEO_PAGES.FARMER_LOGIN.nofollow}
      />
      <Navbar />
      <div className="py-16 px-4 bg-secondary min-h-screen">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-3">{t('farmerLogin.title')}</h1>
            <p className="text-muted-foreground">
              {t('farmerLogin.description')}
            </p>
          </div>

          <FarmerLoginForm />
        </div>
      </div>
      <Footer {...footerData} />
    </>
  );
};

export default FarmerLogin;