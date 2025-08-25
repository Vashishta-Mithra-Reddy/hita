"use client";
import React, { useState } from "react";
import { ArrowRight, X, Apple, Package, Citrus, Heart, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ triggerText = "Explore Hita" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const wellnessPaths = [
    {
      title: "Products",
      description: "Discover healthy products",
      icon: Package,
      href: "/products",
    },
    {
      title: "Foods",
      description: "Explore nutritious foods",
      icon: Apple,
      href: "/foods",
    },
    {
      title: "Remedies",
      description: "Find natural remedies",
      icon: Citrus,
      href: "/remedies",
    },
    {
      title: "Wellness Tips",
      description: "Get life-changing tips",
      icon: Heart,
      href: "/wellness-tips",
    },
  ];

  return (
    <div>
      {/* Button */}
      <motion.div layoutId="modal-container">
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="rounded-xl py-6 px-8 group transition-all duration-500"
        >
          {triggerText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all duration-300" />
        </Button>
      </motion.div>

      {/* AnimatePresence for modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Morphing container */}
            <motion.div
              layoutId="modal-container"
              className="relative bg-background rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground text-start">
                    Choose Your Wellness Path
                  </h2>
                  <p className="hidden md:flex text-foreground/50 mt-1">
                    Discover healthy living options
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-foreground/10 rounded-xl border-2 border-dashed border-foreground/15 hover:border-transparent transition-colors duration-300"
                >
                  <X className="h-5 w-5 text-gray-500 animate-pulse" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {wellnessPaths.map((path) => {
                    const Icon = path.icon;
                    return (
                      <div
                        key={path.title}
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br p-4 md:p-6 cursor-pointer transform transition-all duration-300 hover:shadow-xl border-2 border-foreground/15 border-dashed hover:border-transparent"
                        onClick={() => {
                          router.push(path.href);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-center mb-2 mt-2 md:mt-0">
                          <div className="p-2 dark:bg-foreground/20 bg-foreground/5 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 backdrop-blur-sm rounded-lg transition-all duration-500">
                            <Icon className="h-6 w-6 text-foreground group-hover:text-blue-500" />
                          </div>
                        </div>
                        <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 mt-4 text-center">
                          {path.title}
                        </h3>
                        <p className="text-foreground/80 text-sm text-center hidden md:flex">
                          {path.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Agent Option */}
                <div
                  className="group flex items-center justify-between p-4 bg-background/50 rounded-xl cursor-pointer transition-all duration-200 px-6 hover:ring-4 hover:ring-offset-2 ring-offset-background hover:ring-blue-500/20 hover:focus:ring-blue-400/20 focus:border-blue-500/70 hover:shadow-blue-500/20 border-2 border-foreground/5 hover:border-blue-500/70"
                  onClick={() => {
                    router.push("/agent");
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 dark:bg-foreground/20 bg-foreground/5 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 rounded-lg transition-colors duration-500">
                      <Sun className="h-5 w-5 text-foreground ease-out group-hover:animate-fifth group-hover:text-blue-500 transition-all duration-100" />
                    </div>
                    <div>
                      <h3 className="text-start font-semibold text-foreground">
                        Hita&apos;s Agent
                      </h3>
                      <p className="hidden md:flex text-sm text-foreground/50">
                        Under construction, but you can check it out!
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-foreground/50 group-hover:text-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Modal;
