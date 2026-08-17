import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, CheckCircle, FileText, PieChart, Bell, Settings, Briefcase, Key, Lock, ArrowRight, Menu, X, Check, BarChart2,
  Mail, Phone, Send, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

// ----------------------------------------------------
// COMPONENTS
// ----------------------------------------------------

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-sm border-b border-gray-100 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">C</span>
            </div>
            <span className={`font-bold text-xl ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              CoreStack
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</a>
            <a href="#modules" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Modules</a>
            <a href="#security" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Security</a>
            <a href="#workflow" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Workflow</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Login</Link>
            <Button onClick={() => navigate('/register')}>Register</Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[60px] z-40 bg-white border-b border-gray-100 shadow-lg md:hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Features</a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Modules</a>
              <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Security</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Workflow</a>
              <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col gap-2">
                <Button variant="outline" className="w-full justify-center" onClick={() => navigate('/login')}>Login</Button>
                <Button className="w-full justify-center" onClick={() => navigate('/register')}>Register</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl opacity-70 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-medium mb-6 border border-blue-100">
              <CheckCircle size={16} /> Built for modern professional firms
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight mb-8">
              Run Your Firm. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">All in One Core.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              CoreStack brings clients, employees, tasks, documents, billing, reporting, notifications and workflows together in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg" onClick={() => navigate('/register')}>
                Register Now <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg" onClick={() => navigate('/login')}>
                Login to Workspace
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 relative mx-auto max-w-5xl"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl bg-white relative z-10 border border-gray-200">
               <img src="/dashboard_mockup.jpg" alt="Dashboard Mockup" className="w-full h-auto object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TrustSection = () => {
  const capabilities = [
    "Client Management", "Task Management", "Secure Workspaces", "Billing", "Reports", "Audit Trails"
  ];
  
  return (
    <section className="py-12 border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Everything your firm needs to stay organized
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {capabilities.map((cap, i) => (
            <div key={i} className="flex items-center text-gray-600 font-medium">
              <Check className="text-primary mr-2" size={18} />
              {cap}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProblemSolution = () => {
  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your firm shouldn't run on scattered tools.</h2>
          <p className="text-lg text-gray-600">
            WhatsApp conversations everywhere. Spreadsheets for tracking work. Scattered client documents. CoreStack brings everything together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-6">
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                <X size={20} /> The Old Way
              </h3>
              <ul className="space-y-3">
                <li className="flex text-red-700"><span className="mr-2 opacity-50">•</span> Manual task follow-ups</li>
                <li className="flex text-red-700"><span className="mr-2 opacity-50">•</span> Unclear employee workload</li>
                <li className="flex text-red-700"><span className="mr-2 opacity-50">•</span> Disconnected billing information</li>
                <li className="flex text-red-700"><span className="mr-2 opacity-50">•</span> Scattered client documents</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-md transform md:translate-x-8">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} /> The CoreStack Way
              </h3>
              <ul className="space-y-3">
                <li className="flex text-green-700"><span className="mr-2 opacity-50">•</span> Automated task assignments</li>
                <li className="flex text-green-700"><span className="mr-2 opacity-50">•</span> Centralized client portal</li>
                <li className="flex text-green-700"><span className="mr-2 opacity-50">•</span> Integrated billing & invoicing</li>
                <li className="flex text-green-700"><span className="mr-2 opacity-50">•</span> Secure document vault</li>
              </ul>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-full bg-gradient-to-tr from-primary/10 to-blue-400/20 absolute -inset-4 blur-2xl"></div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-8 relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                <Users className="mx-auto text-primary mb-2" size={32} />
                <div className="font-medium text-sm text-gray-900">Clients</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                <Briefcase className="mx-auto text-primary mb-2" size={32} />
                <div className="font-medium text-sm text-gray-900">Employees</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                <FileText className="mx-auto text-primary mb-2" size={32} />
                <div className="font-medium text-sm text-gray-900">Documents</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                <PieChart className="mx-auto text-primary mb-2" size={32} />
                <div className="font-medium text-sm text-gray-900">Billing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesGrid = () => {
  const features = [
    { icon: Users, title: 'Client Management', desc: 'Centralized directory for all client information, documents, and contacts.' },
    { icon: Briefcase, title: 'Employee Workspace', desc: 'Dedicated portals for employees to manage their tasks and workload.' },
    { icon: CheckCircle, title: 'Task Management', desc: 'Track task progress, deadlines, and responsibilities seamlessly.' },
    { icon: FileText, title: 'Document Management', desc: 'Securely store and organize files with version control.' },
    { icon: PieChart, title: 'Billing & Payments', desc: 'Create invoices, track payments, and manage outstanding balances.' },
    { icon: BarChart2, title: 'Reports & MIS', desc: 'Real-time analytics on revenue, performance, and workload.' },
    { icon: Bell, title: 'Notifications', desc: 'Automated alerts for deadlines, task updates, and payments.' },
    { icon: Shield, title: 'Activity & Audit Logs', desc: 'Comprehensive tracking of every action for compliance.' },
  ];

  return (
    <section className="py-24 bg-slate-50" id="modules">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Complete firm management</h2>
          <p className="text-lg text-gray-600">Everything you need to run your operations smoothly, all in one place.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-lg flex items-center justify-center mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureHighlights = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        
        {/* Section 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Give every team member a clear workspace.</h2>
            <p className="text-lg text-gray-600 mb-8">
              Employees get their own dedicated portal focused exactly on what they need to do. No clutter, no distraction.
            </p>
            <ul className="space-y-4 mb-8">
              {['My Tasks', 'My Clients', 'My Documents', 'Notifications'].map((item, i) => (
                <li key={i} className="flex items-center text-gray-700 font-medium">
                  <CheckCircle className="text-primary mr-3" size={20} /> {item}
                </li>
              ))}
            </ul>
            <Button variant="outline">Explore Employee Workspace</Button>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="bg-slate-100 rounded-2xl p-4 shadow-inner border border-gray-200">
               <img src="/workspace_mockup.jpg" alt="Employee Workspace Mockup" className="w-full h-auto object-cover rounded-xl shadow-md border border-gray-100" />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Know exactly what is happening.</h2>
            <p className="text-lg text-gray-600 mb-8">
              Turn daily operations into clear insights. Track performance, revenue, and outstanding payments in real-time.
            </p>
            <ul className="space-y-4 mb-8">
              {['Revenue & Payments', 'Outstanding Balances', 'Task Performance', 'Employee Workload'].map((item, i) => (
                <li key={i} className="flex items-center text-gray-700 font-medium">
                  <PieChart className="text-primary mr-3" size={20} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 relative">
             <div className="bg-slate-100 rounded-2xl p-4 shadow-inner border border-gray-200">
              <div className="bg-white rounded-xl shadow-md p-6 h-80 border border-gray-100 flex flex-col gap-4">
                <div className="flex gap-2 sm:gap-4">
                  <div className="flex-1 h-20 md:h-24 bg-emerald-50 rounded-lg border border-emerald-100"></div>
                  <div className="flex-1 h-20 md:h-24 bg-amber-50 rounded-lg border border-amber-100"></div>
                  <div className="flex-1 h-20 md:h-24 bg-blue-50 rounded-lg border border-blue-100 hidden sm:block"></div>
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 mt-2 relative overflow-hidden flex items-center justify-center">
                   <img src="/analytics-graph.jpg" alt="Analytics Graph" className="w-full h-full object-cover opacity-90 mix-blend-multiply" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

const WorkflowSection = () => {
  const steps = [
    { title: "Client", icon: Users },
    { title: "Assignment", icon: Briefcase },
    { title: "Task", icon: CheckCircle },
    { title: "Employee", icon: Users },
    { title: "Billing", icon: PieChart }
  ];
  return (
    <section className="py-24 bg-slate-900 text-white" id="workflow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-16">A connected workflow</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 relative z-10">
          {/* We will mock the horizontal line using CSS on desktop */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-slate-700 -z-10 -translate-y-1/2"></div>
          
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center mb-4 z-10 relative text-blue-400">
                <step.icon size={24} />
              </div>
              <span className="font-medium text-slate-300">{step.title}</span>
              {i < steps.length - 1 && (
                <div className="md:hidden h-8 w-0.5 bg-slate-700 my-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SecuritySection = () => {
  return (
    <section className="py-24 bg-white" id="security">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-50 rounded-3xl p-8 md:p-12 lg:p-16 border border-blue-100 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Control access without losing visibility.</h2>
            <p className="text-lg text-gray-600 mb-8">
              Designed with role-based access and audit-ready architecture to ensure your firm's data remains protected and scoped to the right people.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Lock size={18} className="text-primary" /> Protected Routes
              </div>
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Key size={18} className="text-primary" /> Role-based Access
              </div>
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Shield size={18} className="text-primary" /> Audit Logs
              </div>
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Settings size={18} className="text-primary" /> Admin Controls
              </div>
            </div>
          </div>
          <div className="lg:w-5/12 bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2"><Shield size={18}/> Audit History</h4>
            </div>
            <div className="space-y-4">
               {[
                 { action: "Updated Invoice Status", user: "Admin", time: "2 mins ago" },
                 { action: "Assigned Task #402", user: "Manager", time: "1 hr ago" },
                 { action: "Uploaded Document", user: "Employee", time: "3 hrs ago" },
               ].map((log, i) => (
                 <div key={i} className="flex justify-between items-start">
                   <div>
                     <p className="text-sm font-medium text-gray-900">{log.action}</p>
                     <p className="text-xs text-gray-500">{log.user}</p>
                   </div>
                   <span className="text-xs text-gray-400">{log.time}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Bring your entire firm into one workspace.</h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Manage your people, clients, work, documents and finances from one connected platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg" onClick={() => navigate('/register')}>
            Register Now <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const [showContact, setShowContact] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 md:py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 mb-12 justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">C</span>
              </div>
              <span className="font-bold text-xl text-white">
                CoreStack
              </span>
            </div>
            <p className="text-slate-400">
              The centralized platform for professional firms to manage workflow, clients, employees, and billing.
            </p>
          </div>
          
          <div className="flex flex-row gap-8 sm:gap-16 justify-between lg:justify-end flex-1">
            <div>
              <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#modules" className="hover:text-white transition-colors">Modules</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Resources</h4>
              <ul className="space-y-3">
                <li><button onClick={() => setShowContact(true)} className="hover:text-white transition-colors text-left">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 CoreStack. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="mailto:hmcoding.h@gmail.com" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <Mail size={16} />
            </a>
            <a href="tel:+919106147748" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <Phone size={16} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <Globe size={16} />
            </a>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        title="Contact Us"
      >
        <div className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Email Address</p>
                <a href="mailto:hmcoding.h@gmail.com" className="text-gray-900 font-semibold hover:text-primary">hmcoding.h@gmail.com</a>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                <a href="tel:+919106147748" className="text-gray-900 font-semibold hover:text-primary">+91 91061 47748</a>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mt-2">
              <h4 className="font-semibold text-gray-900 mb-4">Send us a query</h4>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                />
                <textarea 
                  placeholder="How can we help?" 
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-900"
                ></textarea>
                <Button className="w-full" onClick={() => setShowContact(false)}>
                  <Send size={16} className="mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </footer>
  );
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <TrustSection />
        <ProblemSolution />
        <FeaturesGrid />
        <FeatureHighlights />
        <WorkflowSection />
        <SecuritySection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
