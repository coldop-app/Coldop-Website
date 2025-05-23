import Footer from "@/components/common/Footer/Footer";
import { footerData } from "../homeScreenData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft,  HelpCircle } from "lucide-react";
import { motion } from "motion/react";
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <motion.div
        className="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
        </div>

        <div className="relative container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Animated 404 with floating effect */}
            <div className="relative mb-8">
              <motion.h1
                className="text-8xl md:text-9xl font-bold text-primary/20 select-none"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.3,
                  type: "spring",
                  stiffness: 100
                }}
              >
                404
              </motion.h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-2xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    y: [0, -10, 0]
                  }}
                  transition={{
                    scale: { duration: 0.8, delay: 0.5, type: "spring" },
                    rotate: { duration: 0.8, delay: 0.5 },
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5
                    }
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 10,
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <HelpCircle className="w-16 h-16 md:w-20 md:h-20 text-white" />
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Main content */}
            <motion.div
              className="space-y-6 mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                Oops! Page Not Found
              </motion.h2>
              <motion.p
                className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                The page you're looking for seems to have wandered off into the digital void.
                Don't worry, it happens to the best of us!
              </motion.p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => navigate("/")}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.6 }}
                  >
                    <Home className="w-5 h-5 mr-2" />
                  </motion.div>
                  Return Home
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </motion.div>
                  Go Back
                </Button>
              </motion.div>
            </motion.div>

            {/* Additional help section */}
            <motion.div
              className="mt-12 p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2 }}
              whileHover={{
                y: -5,
                transition: { duration: 0.3 }
              }}
            >
              <motion.h3
                className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
              >
                Need help finding what you're looking for?
              </motion.h3>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm text-slate-600 dark:text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4 }}
              >
                <motion.button
                  onClick={() => navigate("/search")}
                  className="flex items-center hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >

                </motion.button>
                <motion.button
                  onClick={() => navigate("/contact")}
                  className="flex items-center hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Contact support
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <Footer {...footerData} />
    </>
  );
};

export default NotFound;