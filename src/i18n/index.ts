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
      people: {
        title: "People",
        errorLoading: "Error loading people data",
        total: "Total",
        people: "people",
        searchPlaceholder: "Search by name, mobile or address...",
        sortBy: "Sort By",
        name: "Name",
        recentlyAdded: "Recently Added",
        addFarmer: "Add Farmer",
        addNewPerson: "Add new person",
        noPeopleFound: "No people found for the selected filters.",
        mobile: "Mobile",
        address: "Address"
      },
      farmerProfile: {
        title: "Farmer Profile",
        notFound: "Farmer information not found",
        phoneNumber: "Phone Number",
        address: "Address",
        memberSince: "Member Since",
        totalBags: "Total Bags",
        incomingOrder: "Incoming Order",
        outgoingOrder: "Outgoing Order",
        viewReport: "View Report",
        report: "Report",
        loading: "Loading...",
        fallbackDownload: "Fallback Download",
        generating: "Generating...",
        gen: "Gen...",
        download: "Download",
        hideOrdersHistory: "Hide Orders History",
        showOrdersHistory: "Show Orders History",
        ordersHistory: "Orders History",
        noOrdersFound: "No orders found for this farmer",
        stockSummary: "Stock Summary",
        totalVarieties: "Total Varieties",
        totalBagsLabel: "Total Bags",
        currentStock: "Current Stock",
        initialStock: "Initial Stock"
      },
      notFound: {
        title: "Oops! Page Not Found",
        description: "The page you're looking for seems to have wandered off into the digital void. Don't worry, it happens to the best of us!",
        returnHome: "Return Home",
        goBack: "Go Back",
        needHelp: "Need Help?",
        helpDescription: "If you're lost, our support team is here to help you find your way.",
        contactSupport: "Contact Support",
        searchTip: "Try using the search feature or check the URL for any typos."
      },
      error: {
        title: "Something Went Wrong",
        description: "We apologize for the inconvenience. Please try again later or contact support if the problem persists.",
        returnHome: "Return Home",
        goBack: "Go Back",
        needHelp: "Need Help?",
        helpDescription: "If this error continues to occur, please don't hesitate to reach out to our support team.",
        contactSupport: "Contact Support",
        tryAgain: "Try Again"
      },
      coldStorageSummary: {
        title: "Cold Storage Summary",
        overview: "Cold Storage Overview",
        totalVarieties: "Total Varieties",
        totalBags: "Total Bags",
        stockSummary: "Stock Summary",
        currentStock: "Current Stock",
        initialStock: "Initial Stock",
        total: "Total",
        bags: "bags"
      },
      farmerLogin: {
        title: "Farmer Login",
        description: "Sign in to track your stored crops and inventory"
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
          },
          errors: {
            enterFarmerName: "Please enter farmer name",
            selectVariety: "Please select a variety",
            enterQuantity: "Please enter at least one quantity",
            enterLocation: "Please enter main location",
            failedToCreate: "Failed to create order",
            failedToCreateFarmer: "Failed to create farmer"
          },
          success: {
            orderCreated: "Incoming order created successfully!",
            farmerCreated: "Farmer created successfully!"
          }
        }
      },
      outgoingOrder: {
        title: "Create Outgoing Order",
        steps: {
          farmerVariety: "Farmer & Variety",
          quantities: "Quantities"
        },
        farmer: {
          label: "Enter Account Name (search and select)",
          searchPlaceholder: "Search Farmer",
          preSelected: "Pre-selected farmer"
        },
        variety: {
          title: "Select Variety",
          description: "Choose from varieties in farmer's incoming orders",
          noVarieties: "No varieties found in farmer's incoming orders",
          loading: "Loading varieties...",
          selectPlaceholder: "Select a variety"
        },
        orders: {
          loading: "Loading incoming orders...",
          receiptVoucher: "R. Voucher",
          location: "Location",
          noOrders: "No orders found for variety",
          selectVariety: "Please select a variety to view orders",
          scrollHint: "Swipe horizontally to see more sizes"
        },
        selectedQuantities: {
          title: "Selected Quantities:",
          receipt: "Receipt",
          bags: "bags"
        },
        review: {
          title: "Review Order Details",
          orderRemarks: "Order Remarks",
          remarksPlaceholder: "Enter any remarks for this order"
        },
        quantityModal: {
          title: "Quantity to be removed",
          currentAvailable: "Current Available Quantity",
          enterQty: "Enter Qty",
          placeholder: "Enter quantity",
          save: "Save"
        },
        buttons: {
          continue: "Continue",
          back: "Back",
          creating: "Creating...",
          create: "Create Order"
        },
        errors: {
          enterFarmerName: "Please enter farmer name",
          selectVariety: "Please select a variety",
          failedToCreate: "Failed to create outgoing order"
        },
        success: {
          orderCreated: "Outgoing order created successfully"
        }
      },
      editIncomingOrder: {
        title: "Edit Incoming Order",
        farmerDetails: "Farmer Details",
        continue: "Continue",
        back: "Back",
        updating: "Updating",
        update: "Update"
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
        },
        errors: {
          selectVariety: "Please select a variety",
          enterQuantity: "Please enter at least one quantity",
          enterLocation: "Please enter main location",
          failedToCreate: "Failed to create order",
          failedToCreateFarmer: "Failed to create farmer"
        },
        success: {
          orderCreated: "Incoming order created successfully!",
          farmerCreated: "Farmer created successfully!"
        }
      },
      settings: {
        title: "Settings",
        subtitle: "Manage your cold storage facility settings",
        saving: "Saving...",
        saveChanges: "Save Changes",
        saveSuccess: "Settings saved successfully",
        saveError: "Failed to save settings",
        tabs: {
          general: "General",
          notifications: "Notifications",
          billing: "Billing & Payments",
          storage: "Storage Configuration"
        },
        general: {
          title: "General Settings",
          description: "Configure your basic cold storage facility information",
          companyName: "Company Name",
          email: "Email",
          phone: "Phone",
          address: "Address",
          temperatureUnit: "Temperature Unit",
          selectTemperatureUnit: "Select temperature unit",
          celsius: "Celsius (°C)",
          fahrenheit: "Fahrenheit (°F)"
        },
        notifications: {
          title: "Notification Preferences",
          description: "Configure alerts and notification settings",
          temperatureAlerts: "Temperature Alerts",
          temperatureAlertsDesc: "Receive alerts when temperature exceeds set thresholds",
          capacityAlerts: "Capacity Alerts",
          capacityAlertsDesc: "Get notified when storage capacity reaches certain levels",
          maintenanceReminders: "Maintenance Reminders",
          maintenanceRemindersDesc: "Receive maintenance schedule notifications",
          paymentReminders: "Payment Reminders",
          paymentRemindersDesc: "Get notified about upcoming and overdue payments"
        },
        billing: {
          title: "Billing Settings",
          description: "Configure your billing and payment preferences",
          currency: "Currency",
          selectCurrency: "Select currency",
          taxRate: "Tax Rate (%)",
          paymentTerms: "Payment Terms (days)"
        },
        storage: {
          title: "Storage Configuration",
          description: "Configure your cold storage units and zones",
          adminApprovalRequired: "Storage configuration changes require admin approval. Please contact support for modifications.",
          requestChanges: "Request Storage Configuration Changes"
        },
        farmerProfile: {
          title: "Farmer Profile",
          notFound: "Farmer information not found",
          phoneNumber: "Phone Number",
          address: "Address",
          memberSince: "Member Since",
          totalBags: "Total Bags",
          incomingOrder: "Incoming Order",
          outgoingOrder: "Outgoing Order",
          viewReport: "View Report",
          report: "Report",
          loading: "Loading...",
          fallbackDownload: "Fallback Download",
          generating: "Generating...",
          gen: "Gen...",
          download: "Download",
          hideOrdersHistory: "Hide Orders History",
          showOrdersHistory: "Show Orders History",
          ordersHistory: "Orders History",
          noOrdersFound: "No orders found for this farmer",
          stockSummary: "Stock Summary",
          totalVarieties: "Total Varieties",
          totalBagsLabel: "Total Bags",
          currentStock: "Current Stock",
          initialStock: "Initial Stock"
        },
        people: {
          title: "People",
          errorLoading: "Error loading people data",
          total: "Total",
          people: "people",
          searchPlaceholder: "Search by name, mobile or address...",
          sortBy: "Sort By",
          name: "Name",
          recentlyAdded: "Recently Added",
          addFarmer: "Add Farmer",
          addNewPerson: "Add new person",
          noPeopleFound: "No people found for the selected filters.",
          mobile: "Mobile",
          address: "Address"
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
            heading: "WhatsApp पर पुष्टि प्राप्त करें",
            description: "आपकी फसलों के सफल भंडारण पर, आपको और आपके ग्राहक को WhatsApp पर तुरंत पुष्टि मिलती है। पूर्ण पारदर्शिता"
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
            quote: "चिलहार्बर, कोल्ड स्टोरेज ऐप, इक गेम-चेंजर है! यह मेरे फसल भंडारण को सुव्यवस्थित करता है, इसे आसान बनाता है और यह सुनिश्चित करता है कि मेरा उत्पाद ताजा रहे। वास्तव में एक जीवनरक्षक!",
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
            description: "फसल कोल्ड-स्टोरेज ऐप, फसल की ताजगी ਲਈ ਇੱਕ ਦ੍ਰਿੜ੍ਹ ਵਚਨਬੱਧਤਾ, ਬਰਬਾਦੀ ਨੂੰ ਘੱਟ ਕਰਨਾ, ਅਤੇ ਬੇਮਿਸਾਲ ਗੁਣਵੱਤਾ ਯਕੀਨੀ ਬਣਾਉਣਾ।"
          },
          {
            title: "ਵਿਸਤ੍ਰਿਤ ਸ਼ੈਲਫ ਲਾਈਫ",
            description: "ऐप ਵਿੱਚ ਸਰਵੋਤਮ ਤਾਪਮਾਨ ਨਿਯੰਤਰਣ ਸਟੋਰ ਕੀਤੀਆਂ ਫਸਲਾਂ ਦੀ ਸ਼ੈਲਫ ਲਾਈਫ ਵਧਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ, ਕਿਸਾਨਾਂ ਦੇ ਆਰਥਿਕ ਨੁਕਸਾਨ ਨੂੰ ਘਟਾਉਂਦਾ ਹੈ।"
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
        companyName: "कोल्डस्टोरेज",
        address: "623 हैरिसन सेंट., 2ਵੀਂ मंजिल, सैन फ्रांसिस्को, CA 94107",
        phone: "415-201-6370",
        email: "hello@omnifood.com",
        navColumns: [
          {
            title: "ਖਾਤਾ",
            links: [
              { text: "ਖਾਤਾ ਬਣਾਓ" },
              { text: "ਸਾਇਨ ਇਨ ਕਰੋ" },
              { text: "iOS ਐਪ" },
              { text: "ਏਂਡਰਾਇਡ ਐਪ" }
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
      people: {
        title: "ਲੋਕ",
        errorLoading: "ਲੋਕਾਂ ਦਾ ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ",
        total: "ਕੁੱਲ",
        people: "ਲੋਕ",
        searchPlaceholder: "ਨਾਮ, ਮੋਬਾਈਲ ਜਾਂ ਪਤੇ ਨਾਲ ਖੋਜੋ...",
        sortBy: "ਇਸ ਅਨੁਸਾਰ ਕ੍ਰਮਬੱਧ ਕਰੋ",
        name: "ਨਾਮ",
        recentlyAdded: "ਹਾਲ ਹੀ ਵਿੱਚ ਜੋੜੇ ਗਏ",
        addFarmer: "ਕਿਸਾਨ ਜੋੜੋ",
        addNewPerson: "ਨਵਾਂ ਵਿਅਕਤੀ ਜੋੜੋ",
        noPeopleFound: "ਚੁਣੇ ਗਏ ਫਿਲਟਰ ਲਈ ਕੋਈ ਲੋਕ ਨਹੀਂ ਮਿਲੇ।",
        mobile: "ਮੋਬਾਈਲ",
        address: "ਪਤਾ"
      },
      farmerProfile: {
        title: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ",
        notFound: "ਕਿਸਾਨ ਦੀ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ",
        phoneNumber: "ਫੋਨ ਨੰਬਰ",
        address: "ਪਤਾ",
        memberSince: "ਮੈਂਬਰ ਬਣੇ",
        totalBags: "ਕੁੱਲ ਬੈਗ",
        incomingOrder: "ਆਉਣ ਵਾਲਾ ਆਰਡਰ",
        outgoingOrder: "ਜਾਣ ਵਾਲਾ ਆਰਡਰ",
        viewReport: "ਰਿਪੋਰਟ ਦੇਖੋ",
        report: "ਰਿਪੋਰਟ",
        loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
        fallbackDownload: "ਫਾਲਬੈਕ ਡਾਉਨਲੋਡ",
        generating: "ਜੇਨਰੇਟ ਹੋ ਰਿਹਾ ਹੈ...",
        gen: "ਜੇਨ...",
        download: "ਡਾਉਨਲੋਡ",
        hideOrdersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ ਛੁਪਾਓ",
        showOrdersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ ਦਿਖਾਓ",
        ordersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ",
        noOrdersFound: "ਇਸ ਕਿਸਾਨ ਲਈ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਮਿਲਿਆ",
        stockSummary: "ਸਟਾਕ ਸਾਰਾਂਸ਼",
        totalVarieties: "ਕੁੱਲ ਕਿਸਮਾਂ",
        totalBagsLabel: "ਕੁੱਲ ਬੈਗ",
        currentStock: "ਮੌਜੂਦਾ ਸਟਾਕ",
        initialStock: "ਸ਼ੁਰੂਆਤੀ ਸਟਾਕ"
      },
      notFound: {
        title: "ਓਹ! ਪੰਨਾ ਨਹੀਂ ਮਿਲਿਆ",
        description: "ਜੋ ਪੰਨਾ ਤੁਸੀਂ ਖੋਜ ਰਹੇ ਹੋ ਉਹ ਡਿਜੀਟਲ ਸਪੇਸ ਵਿੱਚ ਕਿਤੇ ਖੋ ਗਿਆ ਲਗਦਾ ਹੈ। ਚਿੰਤਾ ਨਾ ਕਰੋ, ਇਹ ਸਾਡੇ ਸਭ ਨਾਲ ਹੁੰਦਾ ਹੈ!",
        returnHome: "ਘਰ ਵਾਪਸ ਜਾਓ",
        goBack: "ਵਾਪਸ ਜਾਓ",
        needHelp: "ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
        helpDescription: "ਜੇ ਤੁਸੀਂ ਖੋ ਗਏ ਹੋ, ਤਾਂ ਸਾਡੀ ਸਪੋਰਟ ਟੀਮ ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਇੱਥੇ ਹੈ।",
        contactSupport: "ਸਪੋਰਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
        searchTip: "ਖੋਜ ਸੁਵਿਧਾ ਦੀ ਵਰਤੋਂ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ URL ਵਿੱਚ ਕੋਈ ਟਾਈਪੋ ਦੀ ਜਾਂਚ ਕਰੋ।"
      },
      error: {
        title: "ਕੁਝ ਗਲਤ ਹੋਇਆ",
        description: "ਅਸੁਵਿਧਾ ਲਈ ਅਸੀਂ ਮਾਫੀ ਚਾਹੁੰਦੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਜੇ ਸਮੱਸਿਆ ਬਣੀ ਰਹਿੰਦੀ ਹੈ ਤਾਂ ਸਪੋਰਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
        returnHome: "ਘਰ ਵਾਪਸ ਜਾਓ",
        goBack: "ਵਾਪਸ ਜਾਓ",
        needHelp: "ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
        helpDescription: "ਜੇ ਇਹ ਗਲਤੀ ਲਗਾਤਾਰ ਆਉਂਦੀ ਰਹਿੰਦੀ ਹੈ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੀ ਸਪੋਰਟ ਟੀਮ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਵਿੱਚ ਸੰਕੋਚ ਨਾ ਕਰੋ।",
        contactSupport: "ਸਪੋਰਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
        tryAgain: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ"
      },
      coldStorageSummary: {
        title: "ਕੋਲਡ ਸਟੋਰੇਜ ਸਾਰਾਂਸ਼",
        overview: "ਕੋਲਡ ਸਟੋਰੇਜ ਸਮੀਖਿਆ",
        totalVarieties: "ਕੁੱਲ ਕਿਸਮਾਂ",
        totalBags: "ਕੁੱਲ ਬੈਗ",
        stockSummary: "ਸਟਾਕ ਸਾਰਾਂਸ਼",
        currentStock: "ਮੌਜੂਦਾ ਸਟਾਕ",
        initialStock: "ਸ਼ੁਰੂਆਤੀ ਸਟਾਕ",
        total: "ਕੁੱਲ",
        bags: "ਬੈਗ"
      },
      farmerLogin: {
        title: "ਕਿਸਾਨ ਲਾਗਇਨ",
        description: "ਆਪਣੀ ਸਟੋਰ ਕੀਤੀ ਫਸਲਾਂ ਅਤੇ ਇਨਵੈਂਟਰੀ ਨੂੰ ਟਰੈਕ ਕਰਨ ਲਈ ਸਾਇਨ ਇਨ ਕਰੋ"
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
      outgoingOrder: {
        title: "ਆਉਟਗੋਇੰਗ ਆਰਡਰ ਬਣਾਓ",
        steps: {
          farmerVariety: "ਕਿਸਾਨ ਅਤੇ ਕਿਸਮ",
          quantities: "ਮਾਤਰਾ"
        },
        farmer: {
          label: "ਖਾਤਾ ਨਾਮ ਦਰਜ ਕਰੋ (ਖੋਜੋ ਅਤੇ ਚੁਣੋ)",
          searchPlaceholder: "ਕਿਸਾਨ ਖੋਜੋ",
          preSelected: "ਪਹਿਲਾਂ-ਚੁਣਿਆ ਕਿਸਾਨ"
        },
        variety: {
          title: "ਕਿਸਮ ਚੁਣੋ",
          description: "ਕਿਸਾਨ ਦੇ ਆਉਣ ਵਾਲੇ ਆਰਡਰ ਵਿੱਚੋਂ ਕਿਸਮ ਚੁਣੋ",
          noVarieties: "ਕਿਸਾਨ ਦੇ ਆਉਣ ਵਾਲੇ ਆਰਡਰ ਵਿੱਚ ਕੋਈ ਕਿਸਮ ਨਹੀਂ ਮਿਲੀ",
          loading: "ਕਿਸਮਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...",
          selectPlaceholder: "ਇੱਕ ਕਿਸਮ ਚੁਣੋ"
        },
        orders: {
          loading: "ਆਉਣ ਵਾਲੇ ਆਰਡਰ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...",
          receiptVoucher: "ਆਰ. ਵਾਉਚਰ",
          location: "ਸਥਾਨ",
          noOrders: "ਕਿਸਮ ਲਈ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਮਿਲਿਆ",
          selectVariety: "ਆਰਡਰ ਦੇਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਕਿਸਮ ਚੁਣੋ",
          scrollHint: "ਹੋਰ ਸਾਈਜ਼ ਦੇਖਣ ਲਈ ਖਿਤਿਜੀ ਰੂਪ ਵਿੱਚ ਸਵਾਈਪ ਕਰੋ"
        },
        selectedQuantities: {
          title: "ਚੁਣੀ ਮਾਤਰਾ:",
          receipt: "ਰਸੀਦ",
          bags: "ਬੈਗ"
        },
        review: {
          title: "ਆਰਡਰ ਵੇਰਵਿਆਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ",
          orderRemarks: "ਆਰਡਰ ਟਿੱਪਣੀਆਂ",
          remarksPlaceholder: "ਇਸ ਆਰਡਰ ਲਈ ਕੋਈ ਟਿੱਪਣੀ ਦਰਜ ਕਰੋ"
        },
        quantityModal: {
          title: "ਹਟਾਈ ਜਾਣ ਵਾਲੀ ਮਾਤਰਾ",
          currentAvailable: "ਮੌਜੂਦਾ ਉਪਲਬਧ ਮਾਤਰਾ",
          enterQty: "ਮਾਤਰਾ ਦਰਜ ਕਰੋ",
          placeholder: "ਮਾਤਰਾ ਦਰਜ ਕਰੋ",
          save: "ਸੇਵ ਕਰੋ"
        },
        buttons: {
          continue: "ਜਾਰੀ ਰੱਖੋ",
          back: "ਵਾਪਸ",
          creating: "ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
          create: "ਆਰਡਰ ਬਣਾਓ"
        },
        errors: {
          enterFarmerName: "ਕਿਰਪਾ ਕਰਕੇ ਕਿਸਾਨ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ",
          selectVariety: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਕਿਸਮ ਚੁਣੋ",
          failedToCreate: "ਆਉਟਗੋਇੰਗ ਆਰਡਰ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ"
        },
        success: {
          orderCreated: "ਆਉਟਗੋਇੰਗ ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਇਆ ਗਿਆ"
        }
      },
      editIncomingOrder: {
        title: "ਇਨਕਮਿੰਗ ਆਰਡਰ ਸੰਪਾਦਿਤ ਕਰੋ",
        farmerDetails: "ਕਿਸਾਨ ਵੇਰਵੇ",
        continue: "ਜਾਰੀ ਰੱਖੋ",
        back: "ਵਾਪਸ",
        updating: "ਅਪਡੇਟ ਹੋ ਰਿਹਾ ਹੈ",
        update: "ਅਪਡੇਟ ਕਰੋ",
        errors: {
          selectVariety: "Please select a variety",
          enterQuantity: "Please enter at least one quantity",
          enterLocation: "Please enter main location",
          failedToUpdate: "Failed to update order"
        },
        success: {
          orderUpdated: "Order updated successfully!"
        }
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
        },
        errors: {
          enterFarmerName: "ਕਿਰਪਾ ਕਰਕੇ ਕਿਸਾਨ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ",
          selectVariety: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਕਿਸਮ ਚੁਣੋ",
          failedToCreate: "ਆਰਡਰ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ",
          failedToCreateFarmer: "ਕਿਸਾਨ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ"
        },
        success: {
          orderCreated: "ਇਨਕਮਿੰਗ ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਇਆ ਗਿਆ!",
          farmerCreated: "ਕਿਸਾਨ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਇਆ ਗਿਆ!"
        }
      },
      settings: {
        title: "Settings",
        subtitle: "Manage your cold storage facility settings",
        saving: "Saving...",
        saveChanges: "Save Changes",
        saveSuccess: "Settings saved successfully",
        saveError: "Failed to save settings",
        tabs: {
          general: "General",
          notifications: "Notifications",
          billing: "Billing & Payments",
          storage: "Storage Configuration"
        },
        general: {
          title: "General Settings",
          description: "Configure your basic cold storage facility information",
          companyName: "Company Name",
          email: "Email",
          phone: "Phone",
          address: "Address",
          temperatureUnit: "Temperature Unit",
          selectTemperatureUnit: "Select temperature unit",
          celsius: "Celsius (°C)",
          fahrenheit: "Fahrenheit (°F)"
        },
        notifications: {
          title: "Notification Preferences",
          description: "Configure alerts and notification settings",
          temperatureAlerts: "Temperature Alerts",
          temperatureAlertsDesc: "Receive alerts when temperature exceeds set thresholds",
          capacityAlerts: "Capacity Alerts",
          capacityAlertsDesc: "Get notified when storage capacity reaches certain levels",
          maintenanceReminders: "Maintenance Reminders",
          maintenanceRemindersDesc: "Receive maintenance schedule notifications",
          paymentReminders: "Payment Reminders",
          paymentRemindersDesc: "Get notified about upcoming and overdue payments"
        },
        billing: {
          title: "Billing Settings",
          description: "Configure your billing and payment preferences",
          currency: "Currency",
          selectCurrency: "Select currency",
          taxRate: "Tax Rate (%)",
          paymentTerms: "Payment Terms (days)"
        },
        storage: {
          title: "Storage Configuration",
          description: "Configure your cold storage units and zones",
          adminApprovalRequired: "Storage configuration changes require admin approval. Please contact support for modifications.",
          requestChanges: "Request Storage Configuration Changes"
        },
        farmerProfile: {
          title: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ",
          notFound: "ਕਿਸਾਨ ਦੀ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ",
          phoneNumber: "ਫੋਨ ਨੰਬਰ",
          address: "ਪਤਾ",
          memberSince: "ਮੈਂਬਰ ਬਣੇ",
          totalBags: "ਕੁੱਲ ਬੈਗ",
          incomingOrder: "ਆਉਣ ਵਾਲਾ ਆਰਡਰ",
          outgoingOrder: "ਜਾਣ ਵਾਲਾ ਆਰਡਰ",
          viewReport: "ਰਿਪੋਰਟ ਦੇਖੋ",
          report: "ਰਿਪੋਰਟ",
          loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
          fallbackDownload: "ਫਾਲਬੈਕ ਡਾਉਨਲੋਡ",
          generating: "ਜੇਨਰੇਟ ਹੋ ਰਿਹਾ ਹੈ...",
          gen: "ਜੇਨ...",
          download: "ਡਾਉਨਲੋਡ",
          hideOrdersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ ਛੁਪਾਓ",
          showOrdersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ ਦਿਖਾਓ",
          ordersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ",
          noOrdersFound: "ਇਸ ਕਿਸਾਨ ਲਈ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਮਿਲਿਆ",
          stockSummary: "ਸਟਾਕ ਸਾਰਾਂਸ਼",
          totalVarieties: "ਕੁੱਲ ਕਿਸਮਾਂ",
          totalBagsLabel: "ਕੁੱਲ ਬੈਗ",
          currentStock: "ਮੌਜੂਦਾ ਸਟਾਕ",
          initialStock: "ਸ਼ੁਰੂਆਤੀ ਸਟਾਕ"
        },
        people: {
          title: "ਲੋਕ",
          errorLoading: "ਲੋਕਾਂ ਦਾ ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ",
          total: "ਕੁੱਲ",
          people: "ਲੋਕ",
          searchPlaceholder: "ਨਾਮ, ਮੋਬਾਈਲ ਜਾਂ ਪਤੇ ਨਾਲ ਖੋਜੋ...",
          sortBy: "ਇਸ ਅਨੁਸਾਰ ਕ੍ਰਮਬੱਧ ਕਰੋ",
          name: "ਨਾਮ",
          recentlyAdded: "ਹਾਲ ਹੀ ਵਿੱਚ ਜੋੜੇ ਗਏ",
          addFarmer: "ਕਿਸਾਨ ਜੋੜੋ",
          addNewPerson: "ਨਵਾਂ ਵਿਅਕਤੀ ਜੋੜੋ",
          noPeopleFound: "ਚੁਣੇ ਗਏ ਫਿਲਟਰ ਲਈ ਕੋਈ ਲੋਕ ਨਹੀਂ ਮਿਲੇ।",
          mobile: "ਮੋਬਾਈਲ",
          address: "ਪਤਾ"
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
            description: "ਸਿਰਫ਼ ਨਾਮ ਅਤੇ ਮੋਬਾਈਲ ਨੰਬਰ ਨਾਲ ਕिਸਾਨਾਂ ਨੂੰ ਤੁਰੰਤ ਜੋੜੋ। ਹਰ ਕਿਸਾਨ ਨੂੰ ਇੱਕ ਡਿਜੀਟਲ ਲੇਜ਼ਰ ਮਿਲਦਾ ਹੈ, ਹੁਣ ਹੱਥ ਨਾਲ ਲਿਖੇ ਰਿਕਾਰਡ ਦੀ ਲੋੜ ਨਹੀਂ।"
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
            cta: "ਭੰਡਾਰਣ ਸ਼ੁਰੂ ਕਰੋ"
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
            cta: "ਭੰਡਾਰਣ ਸ਼ੁਰੂ ਕਰੋ"
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
      people: {
        title: "ਲੋਕ",
        errorLoading: "ਲੋਕਾਂ ਦਾ ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ",
        total: "ਕੁੱਲ",
        people: "ਲੋਕ",
        searchPlaceholder: "ਨਾਮ, ਮੋਬਾਈਲ ਜਾਂ ਪਤੇ ਨਾਲ ਖੋਜੋ...",
        sortBy: "ਇਸ ਅਨੁਸਾਰ ਕ੍ਰਮਬੱਧ ਕਰੋ",
        name: "ਨਾਮ",
        recentlyAdded: "ਹਾਲ ਹੀ ਵਿੱਚ ਜੋੜੇ ਗਏ",
        addFarmer: "ਕਿਸਾਨ ਜੋੜੋ",
        addNewPerson: "ਨਵਾਂ ਵਿਅਕਤੀ ਜੋੜੋ",
        noPeopleFound: "ਚੁਣੇ ਗਏ ਫਿਲਟਰ ਲਈ ਕੋਈ ਲੋਕ ਨਹੀਂ ਮਿਲੇ।",
        mobile: "ਮੋਬਾਈਲ",
        address: "ਪਤਾ"
      },
      farmerProfile: {
        title: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ",
        notFound: "ਕਿਸਾਨ ਦੀ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ",
        phoneNumber: "ਫੋਨ ਨੰਬਰ",
        address: "ਪਤਾ",
        memberSince: "ਮੈਂਬਰ ਬਣੇ",
        totalBags: "ਕੁੱਲ ਬੈਗ",
        incomingOrder: "ਆਉਣ ਵਾਲਾ ਆਰਡਰ",
        outgoingOrder: "ਜਾਣ ਵਾਲਾ ਆਰਡਰ",
        viewReport: "ਰਿਪੋਰਟ ਦੇਖੋ",
        report: "ਰਿਪੋਰਟ",
        loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
        fallbackDownload: "ਫਾਲਬੈਕ ਡਾਉਨਲੋਡ",
        generating: "ਜੇਨਰੇਟ ਹੋ ਰਿਹਾ ਹੈ...",
        gen: "ਜੇਨ...",
        download: "ਡਾਉਨਲੋਡ",
        hideOrdersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ ਛੁਪਾਓ",
        showOrdersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ ਦਿਖਾਓ",
        ordersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ",
        noOrdersFound: "ਇਸ ਕਿਸਾਨ ਲਈ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਮਿਲਿਆ",
        stockSummary: "ਸਟਾਕ ਸਾਰਾਂਸ਼",
        totalVarieties: "ਕੁੱਲ ਕਿਸਮਾਂ",
        totalBagsLabel: "ਕੁੱਲ ਬੈਗ",
        currentStock: "ਮੌਜੂਦਾ ਸਟਾਕ",
        initialStock: "ਸ਼ੁਰੂਆਤੀ ਸਟਾਕ"
      },
      notFound: {
        title: "ਓਹ! ਪੰਨਾ ਨਹੀਂ ਮਿਲਿਆ",
        description: "ਜੋ ਪੰਨਾ ਤੁਸੀਂ ਖੋਜ ਰਹੇ ਹੋ ਉਹ ਡਿਜੀਟਲ ਸਪੇਸ ਵਿੱਚ ਕਿਤੇ ਖੋ ਗਿਆ ਲਗਦਾ ਹੈ। ਚਿੰਤਾ ਨਾ ਕਰੋ, ਇਹ ਸਾਡੇ ਸਭ ਨਾਲ ਹੁੰਦਾ ਹੈ!",
        returnHome: "ਘਰ ਵਾਪਸ ਜਾਓ",
        goBack: "ਵਾਪਸ ਜਾਓ",
        needHelp: "ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
        helpDescription: "ਜੇ ਤੁਸੀਂ ਖੋ ਗਏ ਹੋ, ਤਾਂ ਸਾਡੀ ਸਪੋਰਟ ਟੀਮ ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਇੱਥੇ ਹੈ।",
        contactSupport: "ਸਪੋਰਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
        searchTip: "ਖੋਜ ਸੁਵਿਧਾ ਦੀ ਵਰਤੋਂ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ URL ਵਿੱਚ ਕੋਈ ਟਾਈਪੋ ਦੀ ਜਾਂਚ ਕਰੋ।"
      },
      error: {
        title: "ਕੁਝ ਗਲਤ ਹੋਇਆ",
        description: "ਅਸੁਵਿਧਾ ਲਈ ਅਸੀਂ ਮਾਫੀ ਚਾਹੁੰਦੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਜੇ ਸਮੱਸਿਆ ਬਣੀ ਰਹਿੰਦੀ ਹੈ ਤਾਂ ਸਪੋਰਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
        returnHome: "ਘਰ ਵਾਪਸ ਜਾਓ",
        goBack: "ਵਾਪਸ ਜਾਓ",
        needHelp: "ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
        helpDescription: "ਜੇ ਇਹ ਗਲਤੀ ਲਗਾਤਾਰ ਆਉਂਦੀ ਰਹਿੰਦੀ ਹੈ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੀ ਸਪੋਰਟ ਟੀਮ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਵਿੱਚ ਸੰਕੋਚ ਨਾ ਕਰੋ।",
        contactSupport: "ਸਪੋਰਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
        tryAgain: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ"
      },
      coldStorageSummary: {
        title: "ਕੋਲਡ ਸਟੋਰੇਜ ਸਾਰਾਂਸ਼",
        overview: "ਕੋਲਡ ਸਟੋਰੇਜ ਸਮੀਖਿਆ",
        totalVarieties: "ਕੁੱਲ ਕਿਸਮਾਂ",
        totalBags: "ਕੁੱਲ ਬੈਗ",
        stockSummary: "ਸਟਾਕ ਸਾਰਾਂਸ਼",
        currentStock: "ਮੌਜੂਦਾ ਸਟਾਕ",
        initialStock: "ਸ਼ੁਰੂਆਤੀ ਸਟਾਕ",
        total: "ਕੁੱਲ",
        bags: "ਬੈਗ"
      },
      farmerLogin: {
        title: "ਕਿਸਾਨ ਲਾਗਇਨ",
        description: "ਆਪਣੀ ਸਟੋਰ ਕੀਤੀ ਫਸਲਾਂ ਅਤੇ ਇਨਵੈਂਟਰੀ ਨੂੰ ਟਰੈਕ ਕਰਨ ਲਈ ਸਾਇਨ ਇਨ ਕਰੋ"
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
      outgoingOrder: {
        title: "ਆਉਟਗੋਇੰਗ ਆਰਡਰ ਬਣਾਓ",
        steps: {
          farmerVariety: "ਕਿਸਾਨ ਅਤੇ ਕਿਸਮ",
          quantities: "ਮਾਤਰਾ"
        },
        farmer: {
          label: "ਖਾਤਾ ਨਾਮ ਦਰਜ ਕਰੋ (ਖੋਜੋ ਅਤੇ ਚੁਣੋ)",
          searchPlaceholder: "ਕਿਸਾਨ ਖੋਜੋ",
          preSelected: "ਪਹਿਲਾਂ-ਚੁਣਿਆ ਕਿਸਾਨ"
        },
        variety: {
          title: "ਕਿਸਮ ਚੁਣੋ",
          description: "ਕਿਸਾਨ ਦੇ ਆਉਣ ਵਾਲੇ ਆਰਡਰ ਵਿੱਚੋਂ ਕਿਸਮ ਚੁਣੋ",
          noVarieties: "ਕਿਸਾਨ ਦੇ ਆਉਣ ਵਾਲੇ ਆਰਡਰ ਵਿੱਚ ਕੋਈ ਕਿਸਮ ਨਹੀਂ ਮਿਲੀ",
          loading: "ਕਿਸਮਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...",
          selectPlaceholder: "ਇੱਕ ਕਿਸਮ ਚੁਣੋ"
        },
        orders: {
          loading: "ਆਉਣ ਵਾਲੇ ਆਰਡਰ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...",
          receiptVoucher: "ਆਰ. ਵਾਉਚਰ",
          location: "ਸਥਾਨ",
          noOrders: "ਕਿਸਮ ਲਈ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਮਿਲਿਆ",
          selectVariety: "ਆਰਡਰ ਦੇਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਕਿਸਮ ਚੁਣੋ",
          scrollHint: "ਹੋਰ ਸਾਈਜ਼ ਦੇਖਣ ਲਈ ਖਿਤਿਜੀ ਰੂਪ ਵਿੱਚ ਸਵਾਈਪ ਕਰੋ"
        },
        selectedQuantities: {
          title: "ਚੁਣੀ ਮਾਤਰਾ:",
          receipt: "ਰਸੀਦ",
          bags: "ਬੈਗ"
        },
        review: {
          title: "ਆਰਡਰ ਵੇਰਵਿਆਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ",
          orderRemarks: "ਆਰਡਰ ਟਿੱਪਣੀਆਂ",
          remarksPlaceholder: "ਇਸ ਆਰਡਰ ਲਈ ਕੋਈ ਟਿੱਪਣੀ ਦਰਜ ਕਰੋ"
        },
        quantityModal: {
          title: "ਹਟਾਈ ਜਾਣ ਵਾਲੀ ਮਾਤਰਾ",
          currentAvailable: "ਮੌਜੂਦਾ ਉਪਲਬਧ ਮਾਤਰਾ",
          enterQty: "ਮਾਤਰਾ ਦਰਜ ਕਰੋ",
          placeholder: "ਮਾਤਰਾ ਦਰਜ ਕਰੋ",
          save: "ਸੇਵ ਕਰੋ"
        },
        buttons: {
          continue: "ਜਾਰੀ ਰੱਖੋ",
          back: "ਵਾਪਸ",
          creating: "ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
          create: "ਆਰਡਰ ਬਣਾਓ"
        },
        errors: {
          enterFarmerName: "ਕਿਰਪਾ ਕਰਕੇ ਕਿਸਾਨ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ",
          selectVariety: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਕਿਸਮ ਚੁਣੋ",
          failedToCreate: "ਆਉਟਗੋਇੰਗ ਆਰਡਰ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ"
        },
        success: {
          orderCreated: "ਆਉਟਗੋਇੰਗ ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਇਆ ਗਿਆ"
        }
      },
      editIncomingOrder: {
        title: "ਇਨਕਮਿੰਗ ਆਰਡਰ ਸੰਪਾਦਿਤ ਕਰੋ",
        farmerDetails: "ਕਿਸਾਨ ਵੇਰਵੇ",
        continue: "ਜਾਰੀ ਰੱਖੋ",
        back: "ਵਾਪਸ",
        updating: "ਅਪਡੇਟ ਹੋ ਰਿਹਾ ਹੈ",
        update: "ਅਪਡੇਟ ਕਰੋ",
        errors: {
          selectVariety: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਕਿਸਮ ਚੁਣੋ",
          enterQuantity: "ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ ਘੱਟ ਇੱਕ ਮਾਤਰਾ ਦਰਜ ਕਰੋ",
          enterLocation: "ਕਿਰਪਾ ਕਰਕੇ ਮੁੱਖ ਸਥਾਨ ਦਰਜ ਕਰੋ",
          failedToUpdate: "਑ਰਡਰ ਅਪਡੇਟ ਕਰਨ ਵਿੱਚ ਅਸਫਲ"
        },
        success: {
          orderUpdated: "਑ਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਅਪਡੇਟ ਕੀਤਾ ਗਿਆ!"
        }
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
        },
        errors: {
          enterFarmerName: "ਕਿਰਪਾ ਕਰਕੇ ਕਿਸਾਨ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ",
          selectVariety: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਕਿਸਮ ਚੁਣੋ",
          failedToCreate: "ਆਰਡਰ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ",
          failedToCreateFarmer: "ਕਿਸਾਨ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ"
        },
        success: {
          orderCreated: "ਇਨਕਮਿੰਗ ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਇਆ ਗਿਆ!",
          farmerCreated: "ਕਿਸਾਨ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਇਆ ਗਿਆ!"
        }
      },
      settings: {
        title: "Settings",
        subtitle: "Manage your cold storage facility settings",
        saving: "Saving...",
        saveChanges: "Save Changes",
        saveSuccess: "Settings saved successfully",
        saveError: "Failed to save settings",
        tabs: {
          general: "General",
          notifications: "Notifications",
          billing: "Billing & Payments",
          storage: "Storage Configuration"
        },
        general: {
          title: "General Settings",
          description: "Configure your basic cold storage facility information",
          companyName: "Company Name",
          email: "Email",
          phone: "Phone",
          address: "Address",
          temperatureUnit: "Temperature Unit",
          selectTemperatureUnit: "Select temperature unit",
          celsius: "Celsius (°C)",
          fahrenheit: "Fahrenheit (°F)"
        },
        notifications: {
          title: "Notification Preferences",
          description: "Configure alerts and notification settings",
          temperatureAlerts: "Temperature Alerts",
          temperatureAlertsDesc: "Receive alerts when temperature exceeds set thresholds",
          capacityAlerts: "Capacity Alerts",
          capacityAlertsDesc: "Get notified when storage capacity reaches certain levels",
          maintenanceReminders: "Maintenance Reminders",
          maintenanceRemindersDesc: "Receive maintenance schedule notifications",
          paymentReminders: "Payment Reminders",
          paymentRemindersDesc: "Get notified about upcoming and overdue payments"
        },
        billing: {
          title: "Billing Settings",
          description: "Configure your billing and payment preferences",
          currency: "Currency",
          selectCurrency: "Select currency",
          taxRate: "Tax Rate (%)",
          paymentTerms: "Payment Terms (days)"
        },
        storage: {
          title: "Storage Configuration",
          description: "Configure your cold storage units and zones",
          adminApprovalRequired: "Storage configuration changes require admin approval. Please contact support for modifications.",
          requestChanges: "Request Storage Configuration Changes"
        },
        farmerProfile: {
          title: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ",
          notFound: "ਕਿਸਾਨ ਦੀ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ",
          phoneNumber: "ਫੋਨ ਨੰਬਰ",
          address: "ਪਤਾ",
          memberSince: "ਮੈਂਬਰ ਬਣੇ",
          totalBags: "ਕੁੱਲ ਬੈਗ",
          incomingOrder: "ਆਉਣ ਵਾਲਾ ਆਰਡਰ",
          outgoingOrder: "ਜਾਣ ਵਾਲਾ ਆਰਡਰ",
          viewReport: "ਰਿਪੋਰਟ ਦੇਖੋ",
          report: "ਰਿਪੋਰਟ",
          loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
          fallbackDownload: "ਫਾਲਬੈਕ ਡਾਉਨਲੋਡ",
          generating: "ਜੇਨਰੇਟ ਹੋ ਰਿਹਾ ਹੈ...",
          gen: "ਜੇਨ...",
          download: "ਡਾਉਨਲੋਡ",
          hideOrdersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ ਛੁਪਾਓ",
          showOrdersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ ਦਿਖਾਓ",
          ordersHistory: "ਆਰਡਰ ਇਤਿਹਾਸ",
          noOrdersFound: "ਇਸ ਕਿਸਾਨ ਲਈ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਮਿਲਿਆ",
          stockSummary: "ਸਟਾਕ ਸਾਰਾਂਸ਼",
          totalVarieties: "ਕੁੱਲ ਕਿਸਮਾਂ",
          totalBagsLabel: "ਕੁੱਲ ਬੈਗ",
          currentStock: "ਮੌਜੂਦਾ ਸਟਾਕ",
          initialStock: "ਸ਼ੁਰੂਆਤੀ ਸਟਾਕ"
        },
        people: {
          title: "ਲੋਕ",
          errorLoading: "ਲੋਕਾਂ ਦਾ ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ",
          total: "ਕੁੱਲ",
          people: "ਲੋਕ",
          searchPlaceholder: "ਨਾਮ, ਮੋਬਾਈਲ ਜਾਂ ਪਤੇ ਨਾਲ ਖੋਜੋ...",
          sortBy: "ਇਸ ਅਨੁਸਾਰ ਕ੍ਰਮਬੱਧ ਕਰੋ",
          name: "ਨਾਮ",
          recentlyAdded: "ਹਾਲ ਹੀ ਵਿੱਚ ਜੋੜੇ ਗਏ",
          addFarmer: "ਕਿਸਾਨ ਜੋੜੋ",
          addNewPerson: "ਨਵਾਂ ਵਿਅਕਤੀ ਜੋੜੋ",
          noPeopleFound: "ਚੁਣੇ ਗਏ ਫਿਲਟਰ ਲਈ ਕੋਈ ਲੋਕ ਨਹੀਂ ਮਿਲੇ।",
          mobile: "ਮੋਬਾਈਲ",
          address: "ਪਤਾ"
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