import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        faq: "FAQ",
        caseStudies: "Case Studies",
        support: "Support",
        signIn: "Sign in",
        selectLanguage: "Language"
      },
      hero: {
        heading: "The Complete Cold Storage Management Platform.",
        description: "Mobile app, web dashboard, WhatsApp updates, and instant receipt printing — all in one system. Stay connected and in control. Anytime, anywhere.",
        getStarted: "Get Started",
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
            period: "per annum",
            features: [
              "Incoming & Outgoing Order Management",
              "Store Analysis & Details",
              "Detailed Stock Summary",
              "PDF Reports Generation",
              "WhatsApp Text Notifications"
            ],
            cta: "Start storing"
          },
          {
            name: "Complete",
            period: "per annum",
            features: [
              "All Starter Features",
              "Printing Facilities",
              "Payment System Management",
              "Rent Calculation System",
              "Employee Salary Management"
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
        title: "Cold Storage Analytics",
        overview: "Cold Storage Overview",
        totalVarieties: "Total Varieties",
        totalBags: "Total Bags",
        stockSummary: "Stock Summary",
        currentStock: "Current Stock",
        initialStock: "Initial Stock",
        total: "Total",
        bags: "bags",
        totalInventory: "Total Inventory",
        totalBagsStored: "Total bags stored",
        topVariety: "Top Variety",
        bagsStored: "bags stored",
        ofTotalInventory: "of total inventory",
        secondVariety: "Second Variety",
        ofAllVarieties: "of all varieties",
        topFarmer: "Top Farmer",
        specializesIn: "Specializes in",
        capacityUtilization: "Capacity Utilization",
        availableSpace: "Available Space",
        currentlyStored: "Currently Stored",
        totalCapacity: "Total Capacity",
        others: "Others",
        varietyDistribution: "Variety Distribution",
        percentageBreakdown: "Percentage breakdown by potato variety",
        quantity: "Quantity",
        varietyInsights: "Variety Distribution & Insights",
        distributionInsights: "Distribution Insights",
        mostStoredVariety: "is the most stored variety at",
        ofAllInventory: "of all inventory",
        topVarietiesAccount: "Top 2 varieties account for",
        ofInventory: "of inventory",
        varietiesGroupedAs: "varieties grouped as",
        accountFor: "account for",
        stockTrendAnalysis: "Stock Trend Analysis",
        monthlyStockLevels: "Monthly stock levels over the past 12 months",
        totalStock: "Total Stock",
        month: "Month",
        peakStock: "Peak Stock",
        topFarmers: "Top Farmers",
        highestStorageInventory: "Farmers with the highest storage inventory",
        topFarmerInsights: "Top Farmer Insights",
        topContributor: "Top Contributor",
        comparison: "Comparison",
        storesMoreThan: "Stores",
        moreThanSecond: "more than second-ranked farmer",
        storageShare: "Storage Share"
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
        options: {
          profile: {
            title: "Profile Settings",
            description: "Manage your personal and cold storage information"
          },
          billing: {
            title: "Billing Settings",
            description: "View and manage your billing information and subscriptions"
          },
          support: {
            title: "Contact Support",
            description: "Get help from our support team"
          }
        },
        language: "Language",
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
        home: "Home",
        faq: "FAQ",
        caseStudies: "Case Studies",
        support: "Support",
        signIn: "Sign in",
        selectLanguage: "Language"
      },
      hero: {
        heading: "संपूर्ण कोल्ड स्टोरेज प्रबंधन प्लेटफॉर्म।",
        description: "मोबाइल ऐप, वेब डैशबोर्ड, व्हाट्सऐप अपडेट्स, और तत्काल रसीद प्रिंटिंग — सब कुछ एक ही सिस्टम में। जुड़े रहें और नियंत्रण में रहें। कभी भी, कहीं भी।",
        getStarted: "प्रबंधन शुरू करें",
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
              "इनकमिंग और आउटगोइंग ऑर्डर प्रबंधन",
              "स्टोर विश्लेषण और विवरण",
              "विस्तृत स्टॉक सारांश",
              "पीडीएफ रिपोर्ट जनरेशन",
              "व्हाट्सएप टेक्स्ट नोटिफिकेशन"
            ],
            cta: "भंडारण शुरू करें"
          },
          {
            name: "कंप्लीट",
            period: "प्रति माह।",
            features: [
              "सभी स्टार्टर सुविधाएं",
              "प्रिंटिंग सुविधाएं",
              "भुगतान प्रणाली प्रबंधन",
              "किराया गणना प्रणाली",
              "कर्मचारी वेतन प्रबंधन"
            ],
            cta: "भंडारण शुरू करें"
          }
        ],
        disclaimer: "कीमतों में सभी लागू कर शामिल हैं। आप कभी भी रद्द कर सकते हैं। दोनों योजनाओं में निम्नलिखित शामिल है:",
        features: [
          {
            title: "शुद्धता पैक्ट",
            description: "फसल कोल्ड-स्टोरेज ऐप, फसल की ताजगी के लिए एक दृढ़ प्रतिबद्धता, बर्बादी को कम करना, और बेमिसाल गुणवत्ता सुनिश्चित करना।"
          },
          {
            title: "विस्तृत शेल्फ लाइफ",
            description: "ऐप में सर्वोत्तम तापमान नियंत्रण स्टोर की गई फसलों की शेल्फ लाइफ बढ़ाने में मदद करता है, किसानों के आर्थिक नुकसान को कम करता है।"
          },
          {
            title: "नुकसान की रोकथाम",
            description: "आदर्श भंडारण स्थितियां बनाए रखकर, ऐप खराब होने से रोकती है, किसानों के लिए आर्थिक नुकसान कम करने में योगदान देती है।"
          },
          {
            title: "कुशल इन्वेंटरी",
            description: "ऐप स्मार्ट इन्वेंटरी प्रबंधन की सुविधा प्रदान करती है, किसानों को ट्रैकिंग, योजना बनाने और सप्लाई चेन लॉजिस्टिक्स को अनुकूल बनाने में सहायता करती है।"
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
              { text: "व्यवसाय के लिए" },
              { text: "हमारे साझेदार" },
              { text: "करियर" }
            ]
          },
          {
            title: "संसाधन",
            links: [
              { text: "रेसिपी डायरेक्टरी" },
              { text: "हेल्प सेंटर" },
              { text: "प्राइवेसी और नियम" }
            ]
          }
        ]
      },
      people: {
        title: "लोग",
        errorLoading: "लोगों का डेटा लोड करने में त्रुटि",
        total: "कुल",
        people: "लोग",
        searchPlaceholder: "नाम, मोबाइल या पते से खोजें...",
        sortBy: "इस अनुसार क्रमबद्ध करें",
        name: "नाम",
        recentlyAdded: "हाल ही में जोड़े गए",
        addFarmer: "किसान जोड़ें",
        addNewPerson: "नया व्यक्ति जोड़ें",
        noPeopleFound: "चयनित फिल्टर के लिए कोई लोग नहीं मिले।",
        mobile: "मोबाइल",
        address: "पता"
      },
      farmerProfile: {
        title: "किसान प्रोफाइल",
        notFound: "किसान की जानकारी नहीं मिली",
        phoneNumber: "फोन नंबर",
        address: "पता",
        memberSince: "सदस्य बने",
        totalBags: "कुल बैग",
        incomingOrder: "आने वाला ऑर्डर",
        outgoingOrder: "जाने वाला ऑर्डर",
        viewReport: "रिपोर्ट देखें",
        report: "रिपोर्ट",
        loading: "लोड हो रहा है...",
        fallbackDownload: "फॉलबैक डाउनलोड",
        generating: "जनरेट हो रहा है...",
        gen: "जन...",
        download: "डाउनलोड",
        hideOrdersHistory: "ऑर्डर इतिहास छुपाएं",
        showOrdersHistory: "ऑर्डर इतिहास दिखाएं",
        ordersHistory: "ऑर्डर इतिहास",
        noOrdersFound: "इस किसान के लिए कोई ऑर्डर नहीं मिला",
        stockSummary: "स्टॉक सारांश",
        totalVarieties: "कुल किस्में",
        totalBagsLabel: "कुल बैग",
        currentStock: "वर्तमान स्टॉक",
        initialStock: "प्रारंभिक स्टॉक"
      },
      notFound: {
        title: "ओह! पेज नहीं मिला",
        description: "जो पेज आप खोज रहे हैं वह डिजिटल स्पेस में कहीं खो गया लगता है। चिंता न करें, यह हम सभी के साथ होता है!",
        returnHome: "घर वापस जाएं",
        goBack: "वापस जाएं",
        needHelp: "मदद चाहिए?",
        helpDescription: "यदि आप खो गए हैं, तो हमारी सपोर्ट टीम आपकी मदद के लिए यहां है।",
        contactSupport: "सपोर्ट से संपर्क करें",
        searchTip: "खोज सुविधा का उपयोग करने की कोशिश करें या URL में कोई टाइपो की जांच करें।"
      },
      error: {
        title: "कुछ गलत हुआ",
        description: "असुविधा के लिए हम क्षमा चाहते हैं। कृपया बाद में दोबारा कोशिश करें या यदि समस्या बनी रहती है तो सपोर्ट से संपर्क करें।",
        returnHome: "घर वापस जाएं",
        goBack: "वापस जाएं",
        needHelp: "मदद चाहिए?",
        helpDescription: "यदि यह त्रुटि लगातार आती रहती है, तो कृपया हमारी सपोर्ट टीम से संपर्क करने में संकोच न करें।",
        contactSupport: "सपोर्ट से संपर्क करें",
        tryAgain: "दोबारा कोशिश करें"
      },
      coldStorageSummary: {
        title: "कोल्ड स्टोरेज विश्लेषण",
        overview: "कोल्ड स्टोरेज समीक्षा",
        totalVarieties: "कुल किस्में",
        totalBags: "कुल बैग",
        stockSummary: "स्टॉक सारांश",
        currentStock: "वर्तमान स्टॉक",
        initialStock: "प्रारंभिक स्टॉक",
        total: "कुल",
        bags: "बैग",
        totalInventory: "कुल इन्वेंटरी",
        totalBagsStored: "कुल संग्रहीत बैग",
        topVariety: "शीर्ष किस्म",
        bagsStored: "बैग संग्रहीत",
        ofTotalInventory: "कुल इन्वेंटरी का",
        secondVariety: "दूसरी किस्म",
        ofAllVarieties: "सभी किस्मों का",
        topFarmer: "शीर्ष किसान",
        specializesIn: "में विशेषज्ञता",
        capacityUtilization: "क्षमता उपयोग",
        availableSpace: "उपलब्ध स्थान",
        currentlyStored: "वर्तमान में संग्रहीत",
        totalCapacity: "कुल क्षमता",
        others: "अन्य",
        varietyDistribution: "किस्म वितरण",
        percentageBreakdown: "आलू की किस्म के आधार पर प्रतिशत विवरण",
        quantity: "मात्रा",
        varietyInsights: "किस्म वितरण और अंतर्दृष्टि",
        distributionInsights: "वितरण अंतर्दृष्टि",
        mostStoredVariety: "सबसे अधिक संग्रहीत किस्म है",
        ofAllInventory: "सभी इन्वेंटरी का",
        topVarietiesAccount: "शीर्ष 2 किस्में शामिल हैं",
        ofInventory: "इन्वेंटरी का",
        varietiesGroupedAs: "किस्में समूहीकृत हैं",
        accountFor: "शामिल हैं",
        stockTrendAnalysis: "स्टॉक ट्रेंड विश्लेषण",
        monthlyStockLevels: "पिछले 12 महीनों में मासिक स्टॉक स्तर",
        totalStock: "कुल स्टॉक",
        month: "महीना",
        peakStock: "शिखर स्टॉक",
        topFarmers: "शीर्ष किसान",
        highestStorageInventory: "सबसे अधिक भंडारण इन्वेंटरी वाले किसान",
        topFarmerInsights: "शीर्ष किसान अंतर्दृष्टि",
        topContributor: "शीर्ष योगदानकर्ता",
        comparison: "तुलना",
        storesMoreThan: "स्टोर करता है",
        moreThanSecond: "दूसरे रैंक वाले किसान से अधिक",
        storageShare: "भंडारण हिस्सा"
      },
      farmerLogin: {
        title: "किसान लॉगिन",
        description: "अपनी स्टोर की गई फसलों और इन्वेंटरी को ट्रैक करने के लिए साइन इन करें"
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
        daybook: "डेबुक",
        people: "लोग",
        analytics: "विश्लेषण",
        settings: "सेटिंग्स"
      },
      daybook: {
        title: "डेबुक",
        errorLoading: "डेटा लोड करने में त्रुटि",
        totalOrders: "कुल",
        orders: "ऑर्डर",
        searchPlaceholder: "रसीद नंबर से खोजें...",
        allOrders: "सभी ऑर्डर",
        incoming: "आने वाला",
        outgoing: "जाने वाला",
        latestFirst: "नए पहले",
        oldestFirst: "पुराने पहले",
        addIncoming: "आने वाला जोड़ें",
        addOutgoing: "जाने वाला जोड़ें",
        searchError: "रसीद खोजने में त्रुटि। कृपया दोबारा कोशिश करें।",
        searching: "खोजा जा रहा है...",
        noReceiptFound: "इस नंबर की कोई रसीद नहीं मिली।",
        noOrdersFound: "चयनित फिल्टर के लिए कोई ऑर्डर नहीं मिला।",
        currentStock: "वर्तमान स्टॉक",
        location: "स्थान",
        remarks: "टिप्पणी",
        showing: "दिखाया जा रहा",
        to: "से",
        of: "का",
        entries: "एंट्री",
        perPage: "प्रति पेज",
        firstPage: "पहला पेज",
        previousPage: "पिछला पेज",
        nextPage: "अगला पेज",
        lastPage: "आखिरी पेज"
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
        title: "सेटिंग्स",
        subtitle: "अपनी कोल्ड स्टोरेज सुविधा सेटिंग्स का प्रबंधन करें",
        saving: "सेव कर रहे हैं...",
        saveChanges: "बदलाव सेव करें",
        saveSuccess: "सेटिंग्स सफलतापूर्वक सेव की गईं",
        saveError: "सेटिंग्स सेव करने में विफल",
        options: {
          profile: {
            title: "प्रोफाइल सेटिंग्स",
            description: "अपनी व्यक्तिगत और कोल्ड स्टोरेज जानकारी का प्रबंधन करें"
          },
          billing: {
            title: "बिलिंग सेटिंग्स",
            description: "अपनी बिलिंग जानकारी और सब्सक्रिप्शन देखें और प्रबंधित करें"
          },
          support: {
            title: "संपर्क सहायता",
            description: "हमारी सहायता टीम से सहायता प्राप्त करें"
          }
        },
        language: "भाषा",
        tabs: {
          general: "सामान्य",
          notifications: "सूचनाएं",
          billing: "बिलिंग और भुगतान",
          storage: "स्टोरेज कॉन्फ़िगरेशन"
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
  pa: {
    translation: {
      nav: {
        home: "Home",
        faq: "FAQ",
        caseStudies: "Case Studies",
        support: "Support",
        signIn: "Sign in",
        selectLanguage: "Language"
      },
      hero: {
        heading: "ਸੰਪੂਰਨ ਕੋਲਡ ਸਟੋਰੇਜ ਪ੍ਰਬੰਧਨ ਪਲੇਟਫਾਰਮ।",
        description: "ਮੋਬਾਈਲ ਐਪ, ਵੈੱਬ ਡੈਸ਼ਬੋਰਡ, WhatsApp ਅਪਡੇਟਸ, ਅਤੇ ਤੁਰੰਤ ਰਸੀਦ ਪ੍ਰਿੰਟਿੰਗ — ਸਭ ਕੁਝ ਇੱਕ ਸਿਸਟਮ ਵਿੱਚ। ਜੁੜੇ ਰਹੋ ਅਤੇ ਕਾਬੂ ਵਿੱਚ ਰਹੋ। ਕਦੇ ਵੀ, ਕਿਤੇ ਵੀ।",
        getStarted: "ਪ੍ਰਬੰਧਨ ਸ਼ੁਰੂ ਕਰੋ",
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
              "ਇਨਕਮਿੰਗ ਅਤੇ ਆਊਟਗੋਇੰਗ ਆਰਡਰ ਪ੍ਰਬੰਧਨ",
              "ਸਟੋਰ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਵੇਰਵੇ",
              "ਵਿਸਤ੍ਰਿਤ ਸਟਾਕ ਸੰਖੇਪ",
              "ਪੀਡੀਐਫ ਰਿਪੋਰਟ ਜਨਰੇਸ਼ਨ",
              "ਵ੍ਹਟਸਐਪ ਟੈਕਸਟ ਨੋਟੀਫਿਕੇਸ਼ਨ"
            ],
            cta: "ਭੰਡਾਰਣ ਸ਼ੁਰੂ ਕਰੋ"
          },
          {
            name: "ਕੰਪਲੀਟ",
            period: "ਪ੍ਰਤੀ ਮਹੀਨਾ।",
            features: [
              "ਸਾਰੀਆਂ ਸਟਾਰਟਰ ਸੁਵਿਧਾਵਾਂ",
              "ਪ੍ਰਿੰਟਿੰਗ ਸੁਵਿਧਾਵਾਂ",
              "ਭੁਗਤਾਨ ਪ੍ਰਣਾਲੀ ਪ੍ਰਬੰਧਨ",
              "ਕਿਰਾਇਆ ਗਣਨਾ ਪ੍ਰਣਾਲੀ",
              "ਕਰਮਚਾਰੀ ਤਨਖਾਹ ਪ੍ਰਬੰਧਨ"
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
            description: "ਐਪ ਵਿੱਚ ਸਰਵੋਤਮ ਤਾਪਮਾਨ ਨਿਯੰਤਰਣ स्टोर की गई फसलों की शेल्फ लाइफ बढ़ाने में मदद करता है, किसानों के आर्थिक नुकसान को कम करता है।"
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
        description: "ਜੋ ਪੰਨਾ ਤੁਸੀਂ ਖੋਜ ਰਹੇ ਹੋ ਉਹ ਡਿਜੀਟਲ ਸਪੇਸ ਵਿੱਚ ਕ࿤ੇ ਖੋ ਗਿਆ ਲਗਦਾ ਹੈ। ਚਿੰਤਾ ਨਾ ਕਰੋ, ਇਹ ਸਾਡੇ ਸਭ ਨਾਲ ਹੁੰਦਾ ਹੈ!",
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
        title: "ਕੋਲਡ ਸਟੋਰੇਜ ਵਿਸ਼ਲੇਸ਼ਣ",
        overview: "ਕੋਲਡ ਸਟੋਰੇਜ ਸਮੀਖਿਆ",
        totalVarieties: "ਕੁੱਲ ਕਿਸਮਾਂ",
        totalBags: "ਕੁੱਲ ਬੈਗ",
        stockSummary: "ਸਟਾਕ ਸਾਰਾਂਸ਼",
        currentStock: "ਮੌਜੂਦਾ ਸਟਾਕ",
        initialStock: "ਸ਼ੁਰੂਆਤੀ ਸਟਾਕ",
        total: "ਕੁੱਲ",
        bags: "ਬੈਗ",
        totalInventory: "ਕੁੱਲ ਇਨਵੈਂਟਰੀ",
        totalBagsStored: "ਕੁੱਲ ਸਟੋਰ ਕੀਤੇ ਬੈਗ",
        topVariety: "ਚੋਟੀ ਦੀ ਕਿਸਮ",
        bagsStored: "ਬੈਗ ਸਟੋਰ ਕੀਤੇ",
        ofTotalInventory: "ਕੁੱਲ ਇਨਵੈਂਟਰੀ ਦਾ",
        secondVariety: "ਦੂਜੀ ਕਿਸਮ",
        ofAllVarieties: "ਸਾਰੀਆਂ ਕਿਸਮਾਂ ਦਾ",
        topFarmer: "ਚੋਟੀ ਦਾ ਕਿਸਾਨ",
        specializesIn: "ਵਿੱਚ ਮਾਹਰ",
        capacityUtilization: "ਸਮਰੱਥਾ ਵਰਤੋਂ",
        availableSpace: "ਉਪਲਬਧ ਜਗ੍ਹਾ",
        currentlyStored: "ਵਰਤਮਾਨ ਵਿੱਚ ਸਟੋਰ ਕੀਤਾ",
        totalCapacity: "ਕੁੱਲ ਸਮਰੱਥਾ",
        others: "ਹੋਰ",
        varietyDistribution: "ਕਿਸਮ ਵੰਡ",
        percentageBreakdown: "ਆਲੂ ਦੀ ਕਿਸਮ ਦੇ ਅਧਾਰ 'ਤੇ ਪ੍ਰਤੀਸ਼ਤ ਵਿਸਤਾਰ",
        quantity: "ਮਾਤਰਾ",
        varietyInsights: "ਕਿਸਮ ਵੰਡ ਅਤੇ ਸਮਝ",
        distributionInsights: "ਵੰਡ ਸਮਝ",
        mostStoredVariety: "ਸਭ ਤੋਂ ਜ਼ਿਆਦਾ ਸਟੋਰ ਕੀਤੀ ਕਿਸਮ ਹੈ",
        ofAllInventory: "ਸਾਰੀ ਇਨਵੈਂਟਰੀ ਦਾ",
        topVarietiesAccount: "ਚੋਟੀ ਦੀਆਂ 2 ਕਿਸਮਾਂ ਸ਼ਾਮਲ ਹਨ",
        ofInventory: "ਇਨਵੈਂਟਰੀ ਦਾ",
        varietiesGroupedAs: "ਕਿਸਮਾਂ ਸਮੂਹਿਕ ਹਨ",
        accountFor: "ਸ਼ਾਮਲ ਹਨ",
        stockTrendAnalysis: "ਸਟਾਕ ਟ੍ਰੈਂਡ ਵਿਸ਼ਲੇਸ਼ਣ",
        monthlyStockLevels: "ਪਿਛਲੇ 12 ਮਹੀਨਿਆਂ ਵਿੱਚ ਮਹੀਨਾਵਾਰ ਸਟਾਕ ਪੱਧਰ",
        totalStock: "ਕੁੱਲ ਸਟਾਕ",
        month: "ਮਹੀਨਾ",
        peakStock: "ਸਿਖਰ ਸਟਾਕ",
        topFarmers: "ਚੋਟੀ ਦੇ ਕਿਸਾਨ",
        highestStorageInventory: "ਸਭ ਤੋਂ ਜ਼ਿਆਦਾ ਸਟੋਰੇਜ ਇਨਵੈਂਟਰੀ ਵਾਲੇ ਕਿਸਾਨ",
        topFarmerInsights: "ਚੋਟੀ ਦੇ ਕਿਸਾਨ ਸਮਝ",
        topContributor: "ਚੋਟੀ ਦਾ ਯੋਗਦਾਨੀ",
        comparison: "ਤੁਲਨਾ",
        storesMoreThan: "ਸਟੋਰ ਕਰਦਾ ਹੈ",
        moreThanSecond: "ਦੂਜੇ ਰੈਂਕ ਵਾਲੇ ਕਿਸਾਨ ਤੋਂ ਜ਼ਿਆਦਾ",
        storageShare: "ਸਟੋਰੇਜ ਹਿੱਸਾ"
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
        noAccount: "ਕੋਈ ਖਾਤਾ ਨਹੀਂ है?",
        signUp: "ਸਾਇਨ ਅੱਪ ਕਰੋ"
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
        daybook: "डेबुक",
        people: "लोग",
        analytics: "विश्लेषण",
        settings: "सेटिंग्स"
      },
      daybook: {
        title: "डेबुक",
        errorLoading: "डेटा लोड करने में त्रुटि",
        totalOrders: "कुल",
        orders: "ऑर्डर",
        searchPlaceholder: "रसीद नंबर से खोजें...",
        allOrders: "सभी ऑर्डर",
        incoming: "आने वाला",
        outgoing: "जाने वाला",
        latestFirst: "नए पहले",
        oldestFirst: "पुराने पहले",
        addIncoming: "आने वाला जोड़ें",
        addOutgoing: "जाने वाला जोड़ें",
        searchError: "रसीद खोजने में त्रुटि। कृपया दोबारा कोशिश करें।",
        searching: "खोजा जा रहा है...",
        noReceiptFound: "इस नंबर की कोई रसीद नहीं मिली।",
        noOrdersFound: "चयनित फिल्टर के लिए कोई ऑर्डर नहीं मिला।",
        currentStock: "वर्तमान स्टॉक",
        location: "स्थान",
        remarks: "टिप्पणी",
        showing: "दिखाया जा रहा",
        to: "से",
        of: "का",
        entries: "एंट्री",
        perPage: "प्रति पेज",
        firstPage: "पहला पेज",
        previousPage: "पिछला पेज",
        nextPage: "अगला पेज",
        lastPage: "आखिरी पेज"
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
          enterFarmerName: "कृपया किसान का नाम दर्ज करें",
          selectVariety: "कृपया एक किस्म चुनें",
          failedToCreate: "आउटगोइंग ऑर्डर बनाने में असफल"
        },
        success: {
          orderCreated: "आउटगोइंग ऑर्डर सफलतापूर्वक बनाया गया"
        }
      },
      editIncomingOrder: {
        title: "इनकमिंग ऑर्डर संपादित करें",
        farmerDetails: "किसान विवरण",
        continue: "जारी रखें",
        back: "वापस",
        updating: "अपडेट हो रहा है",
        update: "अपडेट करें",
        errors: {
          selectVariety: "कृपया एक किस्म चुनें",
          enterQuantity: "कृपया कम से कम एक मात्रा दर्ज करें",
          enterLocation: "कृपया मुख्य स्थान दर्ज करें",
          failedToUpdate: "ऑर्डर अपडेट करने में असफल"
        },
        success: {
          orderUpdated: "ऑर्डर सफलतापूर्वक अपडेट किया गया!"
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
        title: "ਸੈਟਿੰਗਾਂ",
        subtitle: "ਆਪਣੀ ਕੋਲਡ ਸਟੋਰੇਜ ਸੁਵਿਧਾ ਸੈਟਿੰਗਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ",
        saving: "ਸੇਵ ਕਰ ਰਹੇ ਹਾਂ...",
        saveChanges: "ਤਬਦੀਲੀਆਂ ਸੇਵ ਕਰੋ",
        saveSuccess: "ਸੈਟਿੰਗਾਂ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋ ਗਈਆਂ",
        saveError: "ਸੈਟਿੰਗਾਂ ਸੇਵ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
        options: {
          profile: {
            title: "ਪ੍ਰੋਫਾਈਲ ਸੈਟਿੰਗਾਂ",
            description: "ਆਪਣੀ ਨਿੱਜੀ ਅਤੇ ਕੋਲਡ ਸਟੋਰੇਜ ਜਾਣਕਾਰੀ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ"
          },
          billing: {
            title: "ਬਿਲਿੰਗ ਸੈਟਿੰਗਾਂ",
            description: "ਆਪਣੀ ਬਿਲਿੰਗ ਜਾਣਕਾਰੀ ਅਤੇ ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਦੇਖੋ ਅਤੇ ਪ੍ਰਬੰਧਨ ਕਰੋ"
          },
          support: {
            title: "ਸਹਾਇਤਾ ਸੰਪਰਕ",
            description: "ਸਾਡੀ ਸਹਾਇਤਾ ਟੀਮ ਤੋਂ ਮਦਦ ਪ੍ਰਾਪਤ ਕਰੋ"
          }
        },
        language: "ਭਾਸ਼ਾ",
        tabs: {
          general: "ਆਮ",
          notifications: "ਸੂਚਨਾਵਾਂ",
          billing: "ਬਿਲਿੰਗ ਅਤੇ ਭੁਗਤਾਨ",
          storage: "ਸਟੋਰੇਜ ਕੰਪਿਊਟੇਸ਼ਨ"
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
          noOrdersFound: "ਇਸ ਕਿਸਾਨ ਲਈ ਕੋਈ ਆਰਡਰ नहीं मिला।",
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
          noPeopleFound: "ਚੁਣੇ ਗਏ ਫਿਲਟਰ ਲਈ ਕੋਈ ਲੋਕ नहीं मिले।",
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