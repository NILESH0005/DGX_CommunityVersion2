import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown, Shield, Users, Brain, Zap, Heart, MessageSquare, Flag, Lightbulb, Star, ArrowRight } from 'lucide-react'
import images from "../../public/images.js";
const guidelines = [
  {
    id: 1,
    title: "Respect and Professionalism",
    icon: Heart,
    summary: "Treat all community members with dignity and respect",
    details: [
      "Use inclusive and professional language in all interactions",
      "Respect diverse perspectives and backgrounds",
      "Avoid personal attacks, harassment, or discriminatory behavior",
      "Maintain constructive dialogue even during disagreements"
    ]
  },
  {
    id: 2,
    title: "Knowledge Sharing",
    icon: Brain,
    summary: "Share knowledge openly and help others learn",
    details: [
      "Provide accurate and helpful information",
      "Credit sources and original authors appropriately",
      "Share resources that benefit the community",
      "Mentor newcomers and support their learning journey"
    ]
  },
  {
    id: 3,
    title: "Ethical AI Practices",
    icon: Shield,
    summary: "Promote responsible AI development and deployment",
    details: [
      "Discuss ethical implications of AI technologies",
      "Avoid sharing harmful or biased AI implementations",
      "Promote transparency in AI development",
      "Consider societal impact of AI solutions"
    ]
  },
  {
    id: 4,
    title: "Quality Content",
    icon: Star,
    summary: "Maintain high standards for posts and discussions",
    details: [
      "Share well-researched and valuable content",
      "Use clear titles and descriptions",
      "Avoid spam, self-promotion without value",
      "Fact-check information before sharing"
    ]
  },
  {
    id: 5,
    title: "Collaboration",
    icon: Users,
    summary: "Foster teamwork and community building",
    details: [
      "Participate actively in discussions and projects",
      "Offer help and support to fellow members",
      "Share opportunities and resources",
      "Build meaningful professional relationships"
    ]
  },
  {
    id: 6,
    title: "Innovation Focus",
    icon: Zap,
    summary: "Encourage creative thinking and breakthrough ideas",
    details: [
      "Share innovative approaches and solutions",
      "Experiment with new technologies responsibly",
      "Provide constructive feedback on ideas",
      "Support experimental and research projects"
    ]
  },
  {
    id: 7,
    title: "Constructive Communication",
    icon: MessageSquare,
    summary: "Engage in meaningful and productive conversations",
    details: [
      "Ask thoughtful questions and provide detailed answers",
      "Use appropriate channels for different types of discussions",
      "Stay on topic and avoid derailing conversations",
      "Practice active listening and empathy"
    ]
  },
  {
    id: 8,
    title: "Platform Improvement",
    icon: Lightbulb,
    summary: "Help us build a better community experience",
    details: [
      "Provide feedback on platform features and policies",
      "Report bugs and technical issues promptly",
      "Suggest improvements and new features",
      "Participate in community surveys and discussions"
    ]
  }
]

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-green-400/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  )
}


export default function CommunityGuidelines() {
  const { scrollYProgress } = useScroll()
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <motion.section 
        style={{ y: headerY }}
        className="relative bg-gradient-to-r from-DGXblue to-DGXgreen py-20 px-4 sm:px-6 lg:px-8 text-center text-DGXgreen"

      >
        <ParticleBackground />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              DGX Community
              <span className="block text-green-300">Guidelines</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Our shared principles for a thriving AI community
            </p>
          </motion.div>
        </div>
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 w-full h-full border border-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full border border-white/10 rounded-full"
          />
        </div>
      </motion.section>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img 
                    src="Community.png" 
                    alt="DGX Community collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Building the Future of AI Together
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                The DGX Community brings together AI researchers, engineers, and enthusiasts committed to ethical innovation. Our guidelines ensure a safe, productive environment for advancing AI.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 mt-0.5">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-800">Safety First:</span> We prioritize member well-being and ethical considerations in all discussions.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 mt-0.5">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-800">Collective Growth:</span> We believe knowledge sharing accelerates progress for all members.
                  </p>
                </div>
              </div>
            
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guidelines Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center px-4 py-2 bg-green-100 rounded-full mb-4">
              <span className="text-sm font-medium text-green-700">Community Standards</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Core Guidelines
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Principles that shape our community culture and interactions
            </p>
          </motion.div>
          
       
        </div>
      </section>

      {/* Code of Conduct */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-6">
              DGX Code of Conduct
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              All members are expected to adhere to these standards in all community spaces and events
            </p>
          </motion.div>
          
          <div className="space-y-8">
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Expected Behavior
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2.5 flex-shrink-0" />
                  <span>Participate in an authentic and active way</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2.5 flex-shrink-0" />
                  <span>Exercise consideration and respect in speech and actions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2.5 flex-shrink-0" />
                  <span>Attempt collaboration before conflict</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2.5 flex-shrink-0" />
                  <span>Give and accept constructive feedback gracefully</span>
                </li>
              </ul>
            </div>
            
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-400" />
                Unacceptable Behavior
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2.5 flex-shrink-0" />
                  <span>Violence, threats of violence, or violent language</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2.5 flex-shrink-0" />
                  <span>Sexist, racist, homophobic, transphobic, or otherwise discriminatory language</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2.5 flex-shrink-0" />
                  <span>Posting or displaying sexually explicit or violent material</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2.5 flex-shrink-0" />
                  <span>Personal attacks, insults, or demeaning comments</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2.5 flex-shrink-0" />
                  <span>Unsolicited sexual attention or advances</span>
                </li>
              </ul>
            </div>
            
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Enforcement Responsibilities
              </h3>
              <p className="text-gray-300 mb-4">
                Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior they deem inappropriate.
              </p>
              <p className="text-gray-300">
                Community leaders have the right to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Spotlight
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Community Spotlight
            </h2>
            <p className="text-xl text-gray-600">
              Members who exemplify our community values
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Alex Chen",
                role: "ML Research Lead",
                quote: "Mentoring newcomers has been incredibly rewarding. Seeing fresh perspectives on AI challenges inspires my own work.",
                specialty: "Computer Vision"
              },
              {
                name: "Priya Patel",
                role: "AI Ethics Researcher",
                quote: "Our discussions on responsible AI have led to real policy changes in several organizations.",
                specialty: "AI Ethics"
              },
              {
                name: "Jamal Williams",
                role: "Open Source Contributor",
                quote: "The collaborative projects here have helped me grow faster than I could have imagined.",
                specialty: "NLP"
              }
            ].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`/images/member-${i+1}.jpg`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{member.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{member.role}</p>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mb-4">
                  {member.specialty}
                </div>
                <p className="text-gray-700 text-sm italic">
                  "{member.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Become part of a global network of AI professionals committed to ethical innovation and knowledge sharing.
            </p>
         
          </motion.div>
        </div>
      </section>
     </div>
  )
}