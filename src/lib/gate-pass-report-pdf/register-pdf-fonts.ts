import { Font } from '@react-pdf/renderer';

let fontsRegistered = false;

export function registerGatePassReportPdfFonts() {
  if (fontsRegistered) return;

  Font.register({
    family: 'Inter',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
        fontWeight: 400,
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf',
        fontWeight: 700,
      },
    ],
  });

  Font.register({
    family: 'Outfit',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyC4E.ttf',
        fontWeight: 700,
      },
    ],
  });

  fontsRegistered = true;
}
