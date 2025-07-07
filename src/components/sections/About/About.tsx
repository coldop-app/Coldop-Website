import { motion } from "motion/react";

const About = () => {
  const founders = [
    {
      name: "Dhairya Sehgal",
      role: "Backend & Web Developer",
      description: "Led the development of the web platform and backend infrastructure, ensuring robust and scalable solutions for cold storage management."
    },
    {
      name: "Anurag Anand",
      role: "Mobile App Developer",
      description: "Spearheaded the development of iOS and Android applications, creating seamless mobile experiences for farmers and storage managers."
    },
    {
      name: "Gourish Narang",
      role: "UI/UX & Product Manager",
      description: "Crafted the user experience and product strategy, ensuring intuitive design and valuable features for all stakeholders."
    }
  ];

  return (
    <section className="py-16 sm:py-24 w-full bg-secondary" id="about">
      <div className="container mx-auto max-w-[75rem] px-4 sm:px-8">
        <div className="text-center mb-16">
          <span className="mb-4 block text-base font-medium uppercase tracking-[0.075rem] text-foreground">
            Meet Our Team
          </span>
          <h2 className="mb-6 text-4xl font-bold tracking-tighter text-[#333] md:text-5xl">
            The Minds Behind Coldop
          </h2>
          <p className="mx-auto max-w-[50rem] text-lg text-[#6f6f6f] leading-[1.8]">
            We're a passionate team of developers and designers who came together to revolutionize cold storage management in India. Our diverse expertise spans web, mobile, and user experience design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {founders.map((founder, index) => (
            <motion.div
              key={founder.name}
              className="flex flex-col items-center text-center p-6 sm:p-8 rounded-[11px] bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            >
              <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl text-primary font-bold">
                  {founder.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-[#333]">
                {founder.name}
              </h3>
              <p className="text-primary font-medium mb-4">
                {founder.role}
              </p>
              <p className="text-[#6f6f6f] leading-relaxed">
                {founder.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
