import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      nav: {
        howItWorks: "How it works",
        testimonials: "Testimonials",
        pricing: "Pricing",
        about: "About",
        signIn: "Sign in",
        selectLanguage: "Language"
      },
      hero: {
        heading: "The Complete Cold Storage Management Platform.",
        description: "Mobile app, web dashboard, WhatsApp updates, and instant receipt printing — all in one system. Stay connected and in control. Anytime, anywhere.",
        startManaging: "Start Managing",
        howItWorks: "How It Works ↓",
        customerStats: {
          count: "300+ farmers",
          text: "using Coldop to manage their harvests."
        }
      },
      howItWorks: {
        title: "How it works",
        subtitle: "Your daily dose of 3 simple steps",
        steps: [
          {
            heading: "Create Farmer Accounts",
            description: "Add farmers quickly with just a name and mobile number. Each farmer gets a digital ledger, no more handwritten records."
          },
          {
            heading: "Make Incoming and Outgoing Orders",
            description: "Record incoming stock and outgoing stock/dispatch outgoing stock in seconds through mobile or web. Coldop automatically updates farmer balances and lot numbers."
          },
          {
            heading: "Receive confirmation on WhatsApp",
            description: "Upon successful storage of your crops, you and your client instantly receives a confirmation on WhatsApp. Full Transparency"
          }
        ]
      },
      testimonials: {
        title: "Testimonials",
        heading: "Once you try it, you won't go back to the old ways.",
        testimonials: [
          {
            quote: "Affordable, nutritious, and deliciously preserved crops, without the need for manual handling! It's like experiencing a frosty enchantment for your harvest.",
            name: "Dave Bryson"
          },
          {
            quote: "The cold storage app is remarkably efficient, selecting the optimal crops every time. It's incredible to be free from concerns about crop preservation!",
            name: "Ben Hadley"
          },
          {
            quote: "ChillHarbor, the cold storage app, is a game-changer! It streamlines my crop storage, making it effortless and ensuring my produce stays fresh. Truly a lifesaver!",
            name: "Steve Miller"
          },
          {
            quote: "ChillHarbor is a crop storage gem! Stress-free and efficient, it's the perfect companion for modern farmers, allowing focus on other farm aspects.",
            name: "Hannah Smith"
          }
        ]
      },
      pricing: {
        title: "Pricing",
        heading: "Smart pricing for complete control.",
        plans: [
          {
            name: "Starter",
            period: "per month.",
            features: [
              "1 crop per day",
              "Order from 11am to 9pm",
              "Recovery is free",
              ""
            ],
            cta: "Start storing"
          },
          {
            name: "Complete",
            period: "per month.",
            features: [
              "<strong>2 crops</strong> per day",
              "Order <strong>24/7</strong>",
              "Recovery is free",
              "Get access to all storages"
            ],
            cta: "Start storing"
          }
        ],
        disclaimer: "Prices include all applicable taxes. You can cancel at any time. Both plans include the following:",
        features: [
          {
            title: "Purity Pact",
            description: "The crop cold-storage app, a steadfast commitment to crop freshness, minimizing waste, and ensuring unparalleled quality."
          },
          {
            title: "Extended Shelf Life",
            description: "Optimal temperature control in the app helps extend the shelf life of stored crops, reducing economic losses to farmers."
          },
          {
            title: "Loss Prevention:",
            description: "By maintaining ideal storage conditions, the app prevents deterioration, contributing to reduced economic loss for farmers."
          },
          {
            title: "Efficient Inventory",
            description: "The app facilitates smart inventory management, aiding farmers in tracking, planning, and optimizing supply chain logistics."
          }
        ]
      },
      footer: {
        companyName: "Coldstorage",
        address: "623 Harrison St., 2nd Floor, San Francisco, CA 94107",
        phone: "415-201-6370",
        email: "hello@omnifood.com",
        navColumns: [
          {
            title: "Account",
            links: [
              { text: "Create account" },
              { text: "Sign In" },
              { text: "iOS app" },
              { text: "Android app" }
            ]
          },
          {
            title: "Company",
            links: [
              { text: "About Cold Storage" },
              { text: "For Business" },
              { text: "Our partners" },
              { text: "Careers" }
            ]
          },
          {
            title: "Resources",
            links: [
              { text: "Recipe directory" },
              { text: "Help center" },
              { text: "Privacy & terms" }
            ]
          }
        ]
      },
      signInModal: {
        title: "Sign in as",
        description: "Choose your account type to sign in",
        farmer: "Farmer",
        storeAdmin: "Store Admin",
        continue: "Continue",
        noAccount: "Don't have an account?",
        signUp: "Sign up"
      },
      storeAdminLogin: {
        title: "Store Admin Login",
        mobileNumber: "Mobile Number",
        mobileNumberPlaceholder: "Enter your mobile number",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        signingIn: "Signing in...",
        signIn: "Sign in",
        noAccount: "Don't have an account?",
        signUp: "Sign up"
      },
      erpFooter: {
        daybook: "Daybook",
        people: "People",
        analytics: "Analytics",
        settings: "Settings"
      },
      daybook: {
        title: "Daybook",
        errorLoading: "Error loading daybook data",
        totalOrders: "Total",
        orders: "orders",
        searchPlaceholder: "Search by receipt number...",
        allOrders: "All Orders",
        incoming: "Incoming",
        outgoing: "Outgoing",
        latestFirst: "Latest First",
        oldestFirst: "Oldest First",
        addIncoming: "Add Incoming",
        addOutgoing: "Add Outgoing",
        searchError: "Error searching for receipt. Please try again.",
        searching: "Searching...",
        noReceiptFound: "No receipt found with this number.",
        noOrdersFound: "No orders found for the selected filters.",
        currentStock: "Current Stock",
        location: "Location",
        remarks: "Remarks",
        showing: "Showing",
        to: "to",
        of: "of",
        entries: "entries",
        perPage: "per page",
        firstPage: "First page",
        previousPage: "Previous page",
        nextPage: "Next page",
        lastPage: "Last page",
        incomingOrder: {
          title: "Create Incoming Order",
          steps: {
            quantities: "Quantities",
            details: "Details"
          },
          farmer: {
            label: "Enter Account Name (search and select)",
            searchPlaceholder: "Search or Create Farmer",
            new: "New Farmer",
            preSelected: "Creating order for pre-selected farmer"
          },
          variety: {
            title: "Select Variety",
            description: "Choose the potato variety for this order",
            loading: "Loading varieties...",
            selectPlaceholder: "Select a variety"
          },
          quantities: {
            title: "Enter Quantities",
            description: "Set the quantities for each size",
            selectVarietyFirst: "Please select a variety first to enter quantities",
            total: "Total / Lot No."
          },
          location: {
            title: "Enter Address (CH R FL)",
            description: "This will be used as a reference in outgoing.",
            mainLabel: "Main Location",
            placeholder: "C3 5 22"
          },
          remarks: {
            label: "Remarks",
            placeholder: "Describe any sort of exception to be handelled in the order , eg : handed over to shamu; payment pending.\nPickup done, pending, scheduled."
          },
          buttons: {
            continue: "Continue",
            back: "Back",
            creating: "Creating Order...",
            create: "Create Order"
          }
        }
      },
      incomingOrder: {
        title: "Create Incoming Order",
        steps: {
          quantities: "Quantities",
          details: "Details"
        },
        farmer: {
          label: "Enter Account Name (search and select)",
          searchPlaceholder: "Search or Create Farmer",
          new: "New Farmer",
          preSelected: "Creating order for pre-selected farmer"
        },
        variety: {
          title: "Select Variety",
          description: "Choose the potato variety for this order",
          loading: "Loading varieties...",
          selectPlaceholder: "Select a variety"
        },
        quantities: {
          title: "Enter Quantities",
          description: "Set the quantities for each size",
          selectVarietyFirst: "Please select a variety first to enter quantities",
          total: "Total / Lot No."
        },
        location: {
          title: "Enter Address (CH R FL)",
          description: "This will be used as a reference in outgoing.",
          mainLabel: "Main Location",
          placeholder: "C3 5 22"
        },
        remarks: {
          label: "Remarks",
          placeholder: "Describe any sort of exception to be handelled in the order , eg : handed over to shamu; payment pending.\nPickup done, pending, scheduled."
        },
        buttons: {
          continue: "Continue",
          back: "Back",
          creating: "Creating Order...",
          create: "Create Order"
        }
      }
    }
  },
  hi: {
    translation: {
      nav: {
        howItWorks: "यह कैसे काम करता है",
        testimonials: "प्रशंसापत्र",
        pricing: "मूल्य निर्धारण",
        about: "हमारे बारे में",
        signIn: "साइन इन करें",
        selectLanguage: "भाषा"
      },
      hero: {
        heading: "संपूर्ण कोल्ड स्टोरेज प्रबंधन प्लेटफॉर्म।",
        description: "मोबाइल ऐप, वेब डैशबोर्ड, व्हाट्सऐप अपडेट्स, और तत्काल रसीद प्रिंटिंग — सब कुछ एक ही सिस्टम में। जुड़े रहें और नियंत्रण में रहें। कभी भी, कहीं भी।",
        startManaging: "प्रबंधन शुरू करें",
        howItWorks: "यह कैसे काम करता है ↓",
        customerStats: {
          count: "300+ किसान",
          text: "अपनी फसल का प्रबंधन करने के लिए Coldop का उपयोग कर रहे हैं।"
        }
      },
      howItWorks: {
        title: "यह कैसे काम करता है",
        subtitle: "3 सरल चरणों की आपकी दैनिक खुराक",
        steps: [
          {
            heading: "किसान खाते बनाएं",
            description: "केवल नाम और मोबाइल नंबर के साथ तुरंत किसान जोड़ें। हर किसान को एक डिजिटल खाता बही मिलता है, अब हस्तलिखित रिकॉर्ड की आवश्यकता नहीं।"
          },
          {
            heading: "आने वाले और बाहर जाने वाले ऑर्डर बनाएं",
            description: "मोबाइल या वेब के माध्यम से सेकंडों में आने वाला स्टॉक और बाहर जाने वाला स्टॉक/डिस्पैच रिकॉर्ड करें। Coldop स्वचालित रूप से किसान बैलेंस और लॉट नंबर अपडेट करता है।"
          },
          {
            heading: "व्हाट्सऐप पर पुष्टि प्राप्त करें",
            description: "आपकी फसलों के सफल भंडारण पर, आपको और आपके ग्राहक को व्हाट्सऐप पर तुरंत पुष्टि मिलती है। पूर्ण पारदर्शिता"
          }
        ]
      },
      testimonials: {
        title: "प्रशंसापत्र",
        heading: "एक बार कोशिश करने के बाद, आप पुराने तरीकों पर वापस नहीं जाएंगे।",
        testimonials: [
          {
            quote: "किफायती, पोषक तत्वों से भरपूर, और स्वादिष्ट रूप से संरक्षित फसलें, मैन्युअल हैंडलिंग की आवश्यकता के बिना! यह आपकी फसल के लिए एक ठंडक भरे जादू का अनुभव करने जैसा है।",
            name: "डेव ब्रायसन"
          },
          {
            quote: "कोल्ड स्टोरेज ऐप उल्लेखनीय रूप से कुशल है, हर बार इष्टतम फसल का चयन करता है। फसल संरक्षण की चिंताओं से मुक्त होना अविश्वसनीय है!",
            name: "बेन हैडली"
          },
          {
            quote: "चिलहार्बर, कोल्ड स्टोरेज ऐप, एक गेम-चेंजर है! यह मेरे फसल भंडारण को सुव्यवस्थित करता है, इसे आसान बनाता है और यह सुनिश्चित करता है कि मेरा उत्पाद ताजा रहे। वास्तव में एक जीवनरक्षक!",
            name: "स्टीव मिलर"
          },
          {
            quote: "चिलहार्बर एक फसल भंडारण रत्न है! तनाव-मुक्त और कुशल, इह आधुनिक किसानों के लिए एकदम सही साथी है, जो खेत के अन्य पहलुओं पर ध्यान केंद्रित करने की अनुमति देता है।",
            name: "हन्ना स्मिथ"
          }
        ]
      },
      pricing: {
        title: "मूल्य निर्धारण",
        heading: "पूर्ण नियंत्रण के लिए स्मार्ट मूल्य निर्धारण।",
        plans: [
          {
            name: "स्टार्टर",
            period: "प्रति माह।",
            features: [
              "प्रति दिन 1 फसल",
              "सुबह 11 से रात 9 बजे तक ऑर्डर",
              "रिकवरी मुफ्त है",
              ""
            ],
            cta: "भंडारण शुरू करें"
          },
          {
            name: "कंप्लीट",
            period: "प्रति माह।",
            features: [
              "<strong>प्रति दिन 2 फसलें</strong>",
              "<strong>24/7</strong> ऑर्डर",
              "रिकवरी मुफ्त है",
              "सभी भंडारण तक पहुंच प्राप्त करें"
            ],
            cta: "भंडारण शुरू करें"
          }
        ],
        disclaimer: "कीमतों में सभी लागू कर शामिल हैं। आप कभी भी रद्द कर सकते हैं। दोनों योजनाओं में निम्नलिखित शामिल है:",
        features: [
          {
            title: "शुद्धता पैक्ट",
            description: "फसल कोल्ड-स्टोरेज ऐप, फसल की ताजगी के लिए एक दृढ़ प्रतिबद्धता, बर्बादी को कम करना, अथवा बेमिसाल गुणवत्ता यकीन बनाना।"
          },
          {
            title: "विस्तारित शेल्फ लाइफ",
            description: "ऐप में इष्टतम तापमान नियंत्रण संग्रहीत फसलों के शेल्फ जीवन को बढ़ाने में मदद करता है, किसानों के आर्थिक नुकसान को कम करता है।"
          },
          {
            title: "नुकसान की रोकथाम:",
            description: "आदर्श भंडारण स्थितियों को बनाए रखकर, ऐप गिरावट को रोकता है, किसानों के लिए आर्थिक नुकसान को कम करने में योगदान देता है।"
          },
          {
            title: "कुशल इन्वेंट्री",
            description: "ऐप स्मार्ट इन्वेंट्री प्रबंधन की सुविधा प्रदान करता है, किसानों को ट्रैकिंग, योजना बनाने और आपूर्ति श्रृंखला लॉजिस्टिक्स को अनुकूलित करने में सहायता करता है।"
          }
        ]
      },
      footer: {
        companyName: "कोल्डस्टोरेज",
        address: "623 हैरिसन सेंट., 2वीं मंजिल, सैन फ्रांसिस्को, सीए 94107",
        phone: "415-201-6370",
        email: "hello@omnifood.com",
        navColumns: [
          {
            title: "खाता",
            links: [
              { text: "खाता बनाएं" },
              { text: "साइन इन करें" },
              { text: "iOS ऐप" },
              { text: "एंड्रॉइड ऐप" }
            ]
          },
          {
            title: "कंपनी",
            links: [
              { text: "कोल्ड स्टोरेज के बारे में" },
              { text: "व्यापार के लिए" },
              { text: "हमारे पार्टनर" },
              { text: "करियर" }
            ]
          },
          {
            title: "संसाधन",
            links: [
              { text: "रेसिपी डायरेक्टरी" },
              { text: "हेल्प सेंटर" },
              { text: "गोपनीयता और नियम" }
            ]
          }
        ]
      },
      signInModal: {
        title: "साइन इन करें",
        description: "साइन इन करने के लिए अपना खाता प्रकार चुनें",
        farmer: "किसान",
        storeAdmin: "स्टोर एडमिन",
        continue: "जारी रखें",
        noAccount: "कोई खाता नहीं है?",
        signUp: "साइन अप करें"
      },
      storeAdminLogin: {
        title: "स्टोर एडमिन लॉगिन",
        mobileNumber: "मोबाइल नंबर",
        mobileNumberPlaceholder: "अपना मोबाइल नंबर दर्ज करें",
        password: "पासवर्ड",
        passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
        rememberMe: "मुझे याद रखें",
        forgotPassword: "पासवर्ड भूल गए?",
        signingIn: "साइन इन हो रहा है...",
        signIn: "साइन इन करें",
        noAccount: "कोई खाता नहीं है?",
        signUp: "साइन अप करें"
      },
      erpFooter: {
        daybook: "दैनिक बही",
        people: "लोग",
        analytics: "विश्लेषण",
        settings: "सेटिंग्स"
      },
      daybook: {
        title: "दैनिक बही",
        errorLoading: "डेटा लोड करने में त्रुटि",
        totalOrders: "कुल",
        orders: "ऑर्डर",
        searchPlaceholder: "रसीद नंबर से खोजें...",
        allOrders: "सभी ऑर्डर",
        incoming: "आने वाला",
        outgoing: "बाहर जाने वाला",
        latestFirst: "नवीनतम पहले",
        oldestFirst: "पुराने पहले",
        addIncoming: "आने वाला जोड़ें",
        addOutgoing: "बाहर जाने वाला जोड़ें",
        searchError: "रसीद खोजने में त्रुटि। कृपया पुनः प्रयास करें।",
        searching: "खोजा जा रहा है...",
        noReceiptFound: "इस नंबर की कोई रसीद नहीं मिली।",
        noOrdersFound: "चयनित फिल्टर के लिए कोई ऑर्डर नहीं मिला।",
        currentStock: "वर्तमान स्टॉक",
        location: "स्थान",
        remarks: "टिप्पणी",
        showing: "दिखाया जा रहा",
        to: "से",
        of: "का",
        entries: "प्रविष्टियाँ",
        perPage: "प्रति पृष्ठ",
        firstPage: "पहला पृष्ठ",
        previousPage: "पिछला पृष्ठ",
        nextPage: "अगला पृष्ठ",
        lastPage: "अंतिम पृष्ठ"
      },
      incomingOrder: {
        title: "Create Incoming Order",
        steps: {
          quantities: "Quantities",
          details: "Details"
        },
        farmer: {
          label: "Enter Account Name (search and select)",
          searchPlaceholder: "Search or Create Farmer",
          new: "New Farmer",
          preSelected: "Creating order for pre-selected farmer"
        },
        variety: {
          title: "Select Variety",
          description: "Choose the potato variety for this order",
          loading: "Loading varieties...",
          selectPlaceholder: "Select a variety"
        },
        quantities: {
          title: "Enter Quantities",
          description: "Set the quantities for each size",
          selectVarietyFirst: "Please select a variety first to enter quantities",
          total: "Total / Lot No."
        },
        location: {
          title: "Enter Address (CH R FL)",
          description: "This will be used as a reference in outgoing.",
          mainLabel: "Main Location",
          placeholder: "C3 5 22"
        },
        remarks: {
          label: "Remarks",
          placeholder: "Describe any sort of exception to be handelled in the order , eg : handed over to shamu; payment pending.\nPickup done, pending, scheduled."
        },
        buttons: {
          continue: "Continue",
          back: "Back",
          creating: "Creating Order...",
          create: "Create Order"
        }
      }
    }
  },
  pa: {
    translation: {
      nav: {
        howItWorks: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
        testimonials: "ਸਿਫਾਰਿਸ਼ਾਂ",
        pricing: "ਕੀਮਤ",
        about: "ਸਾਡੇ ਬਾਰੇ",
        signIn: "ਸਾਇਨ ਇਨ ਕਰੋ",
        selectLanguage: "ਭਾਸ਼ਾ"
      },
      hero: {
        heading: "ਸੰਪੂਰਨ ਕੋਲਡ ਸਟੋਰੇਜ ਪ੍ਰਬੰਧਨ ਪਲੇਟਫਾਰਮ।",
        description: "ਮੋਬਾਈਲ ਐਪ, ਵੈੱਬ ਡੈਸ਼ਬੋਰਡ, WhatsApp ਅਪਡੇਟਸ, ਅਤੇ ਤੁਰੰਤ ਰਸੀਦ ਪ੍ਰਿੰਟਿੰਗ — ਸਭ ਕੁਝ ਇੱਕ ਸਿਸਟਮ ਵਿੱਚ। ਜੁੜੇ ਰਹੋ ਅਤੇ ਕਾਬੂ ਵਿੱਚ ਰਹੋ। ਕਦੇ ਵੀ, ਕਿਤੇ ਵੀ।",
        startManaging: "ਪ੍ਰਬੰਧਨ ਸ਼ੁਰੂ ਕਰੋ",
        howItWorks: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ ↓",
        customerStats: {
          count: "300+ ਕਿਸਾਨ",
          text: "ਆਪਣੀ ਫਸਲ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰਨ ਲਈ Coldop ਦੀ ਵਰਤੋਂ ਕਰ ਰਹੇ ਹਨ।"
        }
      },
      howItWorks: {
        title: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
        subtitle: "3 ਸਧਾਰਨ ਕਦਮਾਂ ਦੀ ਤੁਹਾਡੀ ਰੋਜ਼ਾਨਾ ਖੁਰਾਕ",
        steps: [
          {
            heading: "ਕਿਸਾਨ ਖਾਤੇ ਬਣਾਓ",
            description: "ਸਿਰਫ਼ ਨਾਮ ਅਤੇ ਮੋਬਾਈਲ ਨੰਬਰ ਨਾਲ ਕਿਸਾਨਾਂ ਨੂੰ ਤੁਰੰਤ ਜੋੜੋ। ਹਰ ਕਿਸਾਨ ਨੂੰ ਇੱਕ ਡਿਜੀਟਲ ਲੇਜ਼ਰ ਮਿਲਦਾ ਹੈ, ਹੁਣ ਹੱਥ ਨਾਲ ਲਿਖੇ ਰਿਕਾਰਡ ਦੀ ਲੋੜ ਨਹੀਂ।"
          },
          {
            heading: "ਆਉਣ ਵਾਲੇ ਅਤੇ ਜਾਣ ਵਾਲੇ ਆਰਡਰ ਬਣਾਓ",
            description: "ਮੋਬਾਈਲ ਜਾਂ ਵੈੱਬ ਰਾਹੀਂ सਕਿੰਟਾਂ ਵਿੱਚ ਆਉਣ ਵਾਲਾ ਸਟਾਕ ਅਤੇ ਜਾਣ ਵਾਲਾ ਸਟਾਕ/ਡਿਸਪੈਚ ਰਿਕਾਰਡ ਕਰੋ। Coldop ਆਪਣੇ ਆਪ ਕਿਸਾਨ ਬੈਲੇਂਸ ਅਤੇ ਲਾਟ ਨੰਬਰ ਅਪਡੇਟ ਕਰਦਾ ਹੈ।"
          },
          {
            heading: "WhatsApp ਤੇ ਪੁਸ਼ਟੀ ਪ੍ਰਾਪਤ ਕਰੋ",
            description: "ਤੁਹਾਡੀ ਫਸਲ ਦੇ ਸਫਲ ਭੰਡਾਰਨ ਤੇ, ਤੁਸੀਂ ਅਤੇ ਤੁਹਾਡੇ ਗਾਹਕ ਨੂੰ WhatsApp ਤੇ ਤੁਰੰਤ ਪੁਸ਼ਟੀ ਮਿਲਦੀ ਹੈ। ਪੂਰੀ ਪਾਰਦਰਸ਼ਤਾ"
          }
        ]
      },
      testimonials: {
        title: "ਸਿਫਾਰਿਸ਼ਾਂ",
        heading: "ਇੱਕ ਵਾਰ ਕੋਸ਼ਿਸ਼ ਕਰਨ ਤੋਂ ਬਾਅਦ, ਤੁਸੀਂ ਪੁਰਾਣੇ ਤਰੀਕਿਆਂ ਤੇ ਵਾਪਸ ਨਹੀਂ ਜਾਓਗੇ।",
        testimonials: [
          {
            quote: "ਕਿਫਾਇਤੀ, ਪੌਸ਼ਟਿਕ, ਅਤੇ ਸੁਆਦੀ ਸੰਭਾਲੀਆਂ ਫਸਲਾਂ, ਹੱਥੀਂ ਹੈਂਡਲਿੰਗ ਦੀ ਲੋੜ ਤੋਂ ਬਿਨਾਂ! ਇਹ ਤੁਹਾਡੀ ਫਸਲ ਲਈ ਠੰਡਕ ਭਰੇ ਜਾਦੂ ਦਾ ਅਨੁਭਵ ਕਰਨ ਵਰਗਾ ਹੈ।",
            name: "ਡੇਵ ਬ੍ਰਾਇਸਨ"
          },
          {
            quote: "ਕੋਲਡ ਸਟੋਰੇਜ ਐਪ ਸ਼ਲਾਘਾਯੋਗ ਤੌਰ 'ਤੇ ਕੁਸ਼ਲ ਹੈ, ਹਰ ਵਾਰ ਸਰਵੋਤਮ ਫਸਲਾਂ ਦੀ ਚੋਣ ਕਰਦੀ ਹੈ। ਫਸਲ ਸੰਭਾਲ ਦੀਆਂ ਚਿੰਤਾਵਾਂ ਤੋਂ ਮੁਕਤ ਹੋਣਾ ਅਵਿਸ਼ਵਾਸਯੋਗ ਹੈ!",
            name: "ਬੈਨ ਹੈਡਲੀ"
          },
          {
            quote: "ਚਿਲਹਾਰਬਰ, ਕੋਲਡ ਸਟੋਰੇਜ ਐਪ, ਇੱਕ ਗੇਮ-ਚੇਂਜਰ ਹੈ! ਇਹ ਮੇਰੇ ਫਸਲ ਭੰਡਾਰਨ ਨੂੰ ਸੁਚਾਰੂ ਬਣਾਉਂਦੀ ਹੈ, ਇਸਨੂੰ ਆਸਾਨ ਬਣਾਉਂਦੀ ਹੈ ਅਤੇ ਯਕੀਨੀ ਬਣਾਉਂਦੀ ਹੈ ਕਿ ਮੇਰਾ ਉਤਪਾਦ ਤਾਜ਼ਾ ਰਹੇ। ਸੱਚਮੁੱਚ ਜੀਵਨ ਰੱਖਿਅਕ!",
            name: "ਸਟੀਵ ਮਿਲਰ"
          },
          {
            quote: "ਚਿਲਹਾਰਬਰ ਇੱਕ ਫਸਲ ਭੰਡਾਰਨ ਰਤਨ ਹੈ! ਤਣਾਅ-ਮੁਕਤ ਅਤੇ ਕੁਸ਼ਲ, ਇਹ ਆਧੁਨਿਕ ਕਿਸਾਨਾਂ ਲਈ ਸੰਪੂਰਨ ਸਾਥੀ ਹੈ, ਜੋ ਖੇਤ ਦੇ ਹੋਰ ਪਹਿਲੂਆਂ 'ਤੇ ਧਿਆਨ ਦੇਣ ਦੀ ਇਜਾਜ਼ਤ ਦਿੰਦਾ ਹੈ।",
            name: "ਹੈਨਾ ਸਮਿਥ"
          }
        ]
      },
      pricing: {
        title: "ਕੀਮਤ",
        heading: "ਪੂਰਨ ਨਿਯੰਤਰਣ ਲਈ ਸਮਾਰਟ ਕੀਮਤ।",
        plans: [
          {
            name: "ਸਟਾਰਟਰ",
            period: "ਪ੍ਰਤੀ ਮਹੀਨਾ।",
            features: [
              "ਪ੍ਰਤੀ ਦਿਨ 1 ਫਸਲ",
              "ਸਵੇਰੇ 11 ਤੋਂ ਰਾਤ 9 ਬजੇ ਤੱਕ ਆਰਡਰ",
              "ਰਿਕਵਰੀ ਮੁਫਤ ਹै",
              ""
            ],
            cta: "ਭੰਡਾਰਨ ਸ਼ੁਰੂ ਕਰੋ"
          },
          {
            name: "ਕੰਪਲੀਟ",
            period: "ਪ੍ਰਤੀ ਮਹੀਨਾ।",
            features: [
              "<strong>ਪ੍ਰਤੀ ਦਿਨ 2 ਫਸਲਾਂ</strong>",
              "<strong>24/7</strong> ਆਰਡਰ",
              "ਰਿਕਵਰੀ ਮੁਫਤ ਹै",
              "ਸਾਰੇ ਭੰਡਾਰਨ ਤੱਕ ਪਹੁੰਚ ਪ੍ਰਾਪਤ ਕਰੋ"
            ],
            cta: "ਭੰਡਾਰਨ ਸ਼ੁਰੂ ਕਰੋ"
          }
        ],
        disclaimer: "ਕੀਮਤਾਂ ਵਿੱਚ ਸਾਰੇ ਲਾਗੂ ਟੈਕਸ ਸ਼ਾਮਲ ਹਨ। ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਰੱਦ ਕਰ ਸਕਦੇ ਹੋ। ਦੋਵੇਂ ਯੋਜਨਾਵਾਂ ਵਿੱਚ ਹੇਠ ਲਿਖਿਆਂ ਸ਼ਾਮਲ ਹਨ:",
        features: [
          {
            title: "ਸ਼ੁੱਧਤਾ ਪੈਕਟ",
            description: "ਫਸਲ ਕੋਲਡ-ਸਟੋਰੇਜ ਐਪ, ਫਸਲ ਦੀ ਤਾਜ਼ਗੀ ਲਈ ਇੱਕ ਦ੍ਰਿੜ੍ਹ ਵਚਨਬੱਧਤਾ, ਬਰਬਾਦੀ ਨੂੰ ਘੱਟ ਕਰਨਾ, ਅਤੇ ਬੇਮਿਸਾਲ ਗੁਣਵੱਤਾ ਯਕੀਨੀ ਬਣਾਉਣਾ।"
          },
          {
            title: "ਵਿਸਤ੍ਰਿਤ ਸ਼ੈਲਫ ਲਾਈਫ",
            description: "ਐਪ ਵਿੱਚ ਸਰਵੋਤਮ ਤਾਪਮਾਨ ਨਿਯੰਤਰਣ ਸਟੋਰ ਕੀਤੀਆਂ ਫਸਲਾਂ ਦੀ ਸ਼ੈਲਫ ਲਾਈਫ ਵਧਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ, ਕਿਸਾਨਾਂ ਦੇ ਆਰਥਿਕ ਨੁਕਸਾਨ ਨੂੰ ਘਟਾਉਂਦਾ ਹੈ।"
          },
          {
            title: "ਨੁਕਸਾਨ ਦੀ ਰੋਕਥਾਮ:",
            description: "ਆਦਰਸ਼ ਭੰਡਾਰਨ ਸਥਿਤੀਆਂ ਬਣਾਈ ਰੱਖ ਕੇ, ਐਪ ਵਿਗਾੜ ਨੂੰ ਰੋਕਦੀ ਹੈ, ਕਿਸਾਨਾਂ ਲਈ ਆਰਥਿਕ ਨੁਕਸਾਨ ਘਟਾਉਣ ਵਿੱਚ ਯੋਗਦਾਨ ਪਾਉਂਦੀ ਹੈ।"
          },
          {
            title: "ਕੁਸ਼ਲ ਇਨਵੈਂਟਰੀ",
            description: "ਐਪ ਸਮਾਰਟ ਇਨਵੈਂਟਰੀ ਪ੍ਰਬੰਧਨ ਦੀ ਸਹੂਲਤ ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ, ਕਿਸਾਨਾਂ ਨੂੰ ਟਰੈਕਿੰਗ, ਯੋਜਨਾ ਬਣਾਉਣ ਅਤੇ ਸਪਲਾਈ ਚੇਨ ਲਾਜਿਸਟਿਕਸ ਨੂੰ ਅਨੁਕੂਲ ਬਣਾਉਣ ਵਿੱਚ ਸਹਾਇਤਾ ਕਰਦੀ ਹੈ।"
          }
        ]
      },
      footer: {
        companyName: "ਕੋਲਡਸਟੋਰੇਜ",
        address: "623 ਹੈਰਿਸਨ ਸਟ., 2ਵੀਂ ਮੰਜ਼ਿਲ, ਸੈਨ ਫ੍ਰਾਂਸਿਸੋ, CA 94107",
        phone: "415-201-6370",
        email: "hello@omnifood.com",
        navColumns: [
          {
            title: "ਖਾਤਾ",
            links: [
              { text: "ਖਾਤਾ ਬਣਾਓ" },
              { text: "ਸਾਇਨ ਇਨ ਕਰੋ" },
              { text: "iOS ਐਪ" },
              { text: "ਐਂਡਰਾਇਡ ਐਪ" }
            ]
          },
          {
            title: "ਕੰਪਨੀ",
            links: [
              { text: "ਕੋਲਡ ਸਟੋਰੇਜ ਬਾਰੇ" },
              { text: "ਕਾਰੋਬਾਰ ਲਈ" },
              { text: "ਸਾਡੇ ਪਾਰਟਨਰ" },
              { text: "ਕਰੀਅਰ" }
            ]
          },
          {
            title: "ਸਰੋਤ",
            links: [
              { text: "ਰੈਸਿਪੀ ਡਾਇਰੈਕਟਰੀ" },
              { text: "ਹੈਲਪ ਸੈਂਟਰ" },
              { text: "ਪਰਾਈਵੇਸੀ ਅਤੇ ਨਿਯਮ" }
            ]
          }
        ]
      },
      signInModal: {
        title: "ਸਾਇਨ ਇਨ ਕਰੋ",
        description: "ਸਾਇਨ ਇਨ ਕਰਨ ਲਈ ਆਪਣਾ ਖਾਤਾ ਕਿਸਮ ਚੁਣੋ",
        farmer: "ਕਿਸਾਨ",
        storeAdmin: "ਸਟੋਰ ਐਡਮਿਨ",
        continue: "ਜਾਰੀ ਰੱਖੋ",
        noAccount: "ਕੋਈ ਖਾਤਾ ਨਹੀਂ ਹੈ?",
        signUp: "ਸਾਇਨ ਅੱਪ ਕਰੋ"
      },
      storeAdminLogin: {
        title: "ਸਟੋਰ ਐਡਮਿਨ ਲਾਗਇਨ",
        mobileNumber: "ਮੋਬਾਈਲ ਨੰਬਰ",
        mobileNumberPlaceholder: "ਆਪਣਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਾਖਲ ਕਰੋ",
        password: "ਪਾਸਵਰਡ",
        passwordPlaceholder: "ਆਪਣਾ ਪਾਸਵਰਡ ਦਾਖਲ ਕਰੋ",
        rememberMe: "ਮੈਨੂੰ ਯਾਦ ਰੱਖੋ",
        forgotPassword: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?",
        signingIn: "ਸਾਇਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ...",
        signIn: "ਸਾਇਨ ਇਨ ਕਰੋ",
        noAccount: "ਕੋਈ ਖਾਤਾ ਨਹੀਂ ਹै?",
        signUp: "ਸਾਇਨ ਅੱਪ ਕਰੋ"
      },
      erpFooter: {
        daybook: "ਰੋਜ਼ਨਾਮਚਾ",
        people: "ਲੋਕ",
        analytics: "ਵਿਸ਼ਲੇਸ਼ਣ",
        settings: "ਸੈਟਿੰਗਜ਼"
      },
      daybook: {
        title: "ਰੋਜ਼ਨਾਮਚਾ",
        errorLoading: "ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ",
        totalOrders: "ਕੁੱਲ",
        orders: "ਆਰਡਰ",
        searchPlaceholder: "ਰਸੀਦ ਨੰਬਰ ਨਾਲ ਖੋਜੋ...",
        allOrders: "ਸਾਰੇ ਆਰਡਰ",
        incoming: "ਆਉਣ ਵਾਲਾ",
        outgoing: "ਜਾਣ ਵਾਲਾ",
        latestFirst: "ਨਵੇਂ ਪਹਿਲਾਂ",
        oldestFirst: "ਪੁਰਾਣੇ ਪਹਿਲਾਂ",
        addIncoming: "ਆਉਣ ਵਾਲਾ ਜੋੜੋ",
        addOutgoing: "ਜਾਣ ਵਾਲਾ ਜੋੜੋ",
        searchError: "ਰਸੀਦ ਖੋਜਣ ਵਿੱਚ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
        searching: "ਖੋਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
        noReceiptFound: "ਇਸ ਨੰਬਰ ਦੀ ਕੋਈ ਰਸੀਦ ਨਹੀਂ ਮਿਲੀ।",
        noOrdersFound: "ਚੁਣੇ ਗਏ ਫਿਲਟਰ ਲਈ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਮਿਲਿਆ।",
        currentStock: "ਮੌਜੂਦਾ ਸਟਾਕ",
        location: "ਸਥਾਨ",
        remarks: "ਟਿੱਪਣੀ",
        showing: "ਦਿਖਾਇਆ ਜਾ ਰਿਹਾ",
        to: "ਤੋਂ",
        of: "ਦਾ",
        entries: "ਐਂਟਰੀਆਂ",
        perPage: "ਪ੍ਰਤੀ ਪੰਨਾ",
        firstPage: "ਪਹਿਲਾ ਪੰਨਾ",
        previousPage: "ਪਿਛਲਾ ਪੰਨਾ",
        nextPage: "ਅਗਲਾ ਪੰਨਾ",
        lastPage: "ਆਖਰੀ ਪੰਨਾ"
      },
      incomingOrder: {
        title: "ਆਵਕ ਆਰਡਰ ਬਣਾਓ",
        steps: {
          quantities: "ਮਾਤਰਾ",
          details: "ਵੇਰਵੇ"
        },
        farmer: {
          label: "ਖਾਤਾ ਨਾਮ ਦਰਜ ਕਰੋ (ਖੋਜੋ ਅਤੇ ਚੁਣੋ)",
          searchPlaceholder: "ਕਿਸਾਨ ਖੋਜੋ ਜਾਂ ਬਣਾਓ",
          new: "ਨਵਾਂ ਕਿਸਾਨ",
          preSelected: "ਪਹਿਲਾਂ-ਚੁਣੇ ਕਿਸਾਨ ਲਈ ਆਰਡਰ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ"
        },
        variety: {
          title: "ਕਿਸਮ ਚੁਣੋ",
          description: "ਇਸ ਆਰਡਰ ਲਈ ਆਲੂ ਦੀ ਕਿਸਮ ਚੁਣੋ",
          loading: "ਕਿਸਮਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...",
          selectPlaceholder: "ਇੱਕ ਕਿਸਮ ਚੁਣੋ"
        },
        quantities: {
          title: "ਮਾਤਰਾ ਦਰਜ ਕਰੋ",
          description: "ਹਰ ਆਕਾਰ ਲਈ ਮਾਤਰਾ ਨਿਰਧਾਰਤ ਕਰੋ",
          selectVarietyFirst: "ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਕਿਸਮ ਚੁਣੋ",
          total: "ਕੁੱਲ / ਲਾਟ ਨੰਬਰ"
        },
        location: {
          title: "ਪਤਾ ਦਰਜ ਕਰੋ (CH R FL)",
          description: "ਇਸ ਦੀ ਵਰਤੋਂ ਜਾਵਕ ਵਿੱਚ ਹਵਾਲੇ ਵਜੋਂ ਕੀਤੀ ਜਾਵੇਗੀ।",
          mainLabel: "ਮੁੱਖ ਸਥਾਨ",
          placeholder: "C3 5 22"
        },
        remarks: {
          label: "ਟਿੱਪਣੀਆਂ",
          placeholder: "ਆਰਡਰ ਵਿੱਚ ਕਿਸੇ ਵੀ ਤਰ੍ਹਾਂ ਦੇ ਅਪਵਾਦ ਦਾ ਵਰਣਨ ਕਰੋ, ਜਿਵੇਂ: ਸ਼ਾਮੂ ਨੂੰ ਸੌਂਪ ਦਿੱਤਾ; ਭੁਗਤਾਨ ਬਕਾਇਆ ਹੈ।\nਪਿਕਅੱਪ ਹੋ ਗਿਆ, ਬਕਾਇਆ, ਨਿਰਧਾਰਤ।"
        },
        buttons: {
          continue: "ਜਾਰੀ ਰੱਖੋ",
          back: "ਵਾਪਸ",
          creating: "ਆਰਡਰ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
          create: "ਆਰਡਰ ਬਣਾਓ"
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;