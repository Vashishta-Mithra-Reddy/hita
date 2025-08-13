"use client";
import React, { useState } from 'react';
import { ArrowRight, X, Apple, Package, Citrus, Heart, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import ReactDOM from 'react-dom';

const Modal = ({ triggerText = "Explore Hita" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const wellnessPaths = [
    {
      title: "Products",
      description: "Discover healthy products",
      icon: Package,
      href: "/products",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      title: "Foods", 
      description: "Explore nutritious foods",
      icon: Apple,
      href: "/foods",
      gradient: "from-green-500 to-emerald-400"
    },
    {
      title: "Remedies",
      description: "Find natural remedies",
      icon: Citrus,
      href: "/remedies", 
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Wellness Tips",
      description: "Get life-changing tips",
      icon: Heart,
      href: "/wellness-tips",
      gradient: "from-amber-500 to-orange-400"
    }
  ];

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div>
      <Button size="lg" onClick={openModal} className='rounded-xl py-6 px-8 group transition-all duration-500'>

        {triggerText} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all duration-300" />
      </Button>
      {isOpen && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />
          {/* Modal Content */}
          <div className="relative bg-background rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 px-2 py-2">
            {/* Header */}
            <div className="flex items-center justify-between p-6 ">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground text-start">Choose Your Wellness Path</h2>
                <p className="hidden md:flex text-foreground/50 mt-1">Discover healthy living options</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-foreground/10 rounded-xl border-2 border-dashed border-foreground/15 items-start justify-start hover:border-transparent transition-colors duration-300"

              >
                <X className="h-5 w-5 text-gray-500 animate-pulse" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Wellness Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {wellnessPaths.map((path) => {
                  const Icon = path.icon;
                  return (
                    <div
                      key={path.title}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br hover:bg-foreground/10 p-4 md:p-6 cursor-pointer transform transition-all duration-300 hover:shadow-xl border-2 border-foreground/15 border-dashed hover:border-transparent"
                      onClick={() => {
                        router.push(path.href);
                        closeModal();
                      }}
                    >
                      <div className="flex items-center justify-center mb-2 mt-2 md:mt-0">
                        <div className="p-2 dark:bg-foreground/20 bg-foreground/5 backdrop-blur-sm rounded-lg">
                          <Icon className="h-6 w-6 text-foreground" />
                        </div>
                      </div>
                      <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 mt-4 text-center">{path.title}</h3>
                      <p className="text-foreground/80 text-sm text-center hidden md:flex">{path.description}</p>
                      
                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  );
                })}
              </div>

              {/* All Sections Option */}
              <div className="pt-4">
                <div
                  className="group flex items-center justify-between p-4 bg-background/50 hover:bg-foreground/10 rounded-xl cursor-pointer transition-all duration-200 px-6 border-2 border-dashed hover:border-transparent"
                  onClick={() => {
                    router.push('/agent');
                    closeModal();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 dark:bg-foreground/20 bg-foreground/5 group-hover:bg-foreground/20 rounded-lg transition-colors duration-200">
                      <Sun className="h-5 w-5 text-foreground animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-start font-semibold text-foreground">Hita's Agent</h3>
                      <p className="hidden md:flex text-sm text-foreground/50">Under construction, but you can check it out!</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Modal;