import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Sample screenshots for slider
  const screenshots = [
    {
      id: 1,
      title: "Hover Tooltip & Drag & Drop",
      description: "Intuitive node manipulation with real-time tooltips",
      color: "from-[#F05A5B] to-[#BF4E30]",
      imageUrl: "/screenshots/hover-tooltip.png",
    },
    {
      id: 2,
      title: "Color Customization",
      description: "Change colors of nodes and connections with one click",
      color: "from-[#4ECDC4] to-[#2C7873]",
      imageUrl: "/screenshots/editNodeDetails.png",
    },
    {
      id: 3,
      title: "Export & Import",
      description: "Export as PNG or JSON, import existing projects",
      color: "from-[#45B7D1] to-[#96CEB4]",
      imageUrl: "/screenshots/ImportExport.png",
    },
    {
      id: 4,
      title: "Expand & Collapse Nodes",
      description:
        "Focus on specific sections by expanding or collapsing nodes",
      color: "from-[#9D50BB] to-[#6E48AA]",
      imageUrl: "/screenshots/collapseAndExpnad.png",
    },
  ];

  // Features with detailed descriptions
  const features = [
    {
      icon: "🖱️",
      title: "Drag & Drop Interface",
      description: "Effortlessly move nodes around with intuitive drag & drop",
      howItWorks: [
        "Click and hold any node to drag",
        "Drop to reorganize structure",
        "Automatic connection adjustment",
      ],
    },
    {
      icon: "🎨",
      title: "Color Customization",
      description: "Personalize your mind map with custom colors",
      howItWorks: [
        "Click node to select",
        "Choose from palette or custom hex",
        "Apply gradient effects",
      ],
    },
    {
      icon: "📱",
      title: "Expand/Collapse Nodes",
      description: "Focus on specific sections by expanding/collapsing",
      howItWorks: [
        "Click + button to expand",
        "Click - button to collapse",
        "Keyboard shortcuts available",
      ],
    },
    {
      icon: "🔍",
      title: "Pan & Zoom Controls",
      description: "Navigate large mind maps with smooth pan and zoom",
      howItWorks: [
        "Mouse wheel to zoom in/out",
        "Hold right-click to pan",
        "Double-click to reset view",
      ],
    },
    {
      icon: "📤",
      title: "Export Options",
      description: "Export your work in multiple formats",
      howItWorks: [
        "PNG for high-quality images",
        "JSON for backup/import",
        "PDF for documents",
      ],
    },
    {
      icon: "⚡",
      title: "Real-time Editing",
      description: "See changes instantly as you work",
      howItWorks: [
        "Type and see updates live",
        "Multiple undo/redo levels",
        "Auto-save every 30 seconds",
      ],
    },
    {
      icon: "🧠",
      title: "AI-Powered Suggestions",
      description: "Get intelligent ideas to expand your thoughts",
      howItWorks: [
        "Click AI button on any node",
        "Get relevant suggestions",
        "One-click to add to map",
      ],
    },
    {
      icon: "🔄",
      title: "Import JSON Files",
      description: "Continue working on existing projects",
      howItWorks: [
        "Drag & drop JSON files",
        "Upload from computer",
        "Restore previous sessions",
      ],
    },
  ];

  // Advanced features section
  const advancedFeatures = [
    {
      title: "Context Menus",
      description: "Right-click anywhere for advanced options",
      icon: "📋",
      details: [
        "Add child/parent nodes",
        "Change node style",
        "Copy/Paste nodes",
        "Delete with confirmation",
      ],
    },
    {
      title: "Keyboard Shortcuts",
      description: "Work faster with keyboard navigation",
      icon: "⌨️",
      details: [
        "Ctrl+C / Ctrl+V for copy/paste",
        "Delete key to remove nodes",
        "Arrow keys for navigation",
        "Space to center view",
      ],
    },
    {
      title: "Node Operations",
      description: "Complete control over every node",
      icon: "🔘",
      details: [
        "Drag to reposition",
        "Click to edit text",
        "Double-click to expand",
        "Ctrl+click for multiple select",
      ],
    },
    {
      title: "View Controls",
      description: "Customize how you see your mind map",
      icon: "👁️",
      details: [
        "Zoom in/out (Ctrl + Scroll)",
        "Fit to screen (Ctrl+0)",
        "Toggle grid visibility",
        "Switch between light/dark mode",
      ],
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % screenshots.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, screenshots.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + screenshots.length) % screenshots.length
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-[kanit]">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] bg-clip-text text-transparent">
                MindMapX
              </span>
            </div>
            <Button
              onClick={() => navigate("/mindmap")}
              className="bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] text-white hover:shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              Launch Editor
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Content - Modern Design */}
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-[#F05A5B]/10 to-[#BF4E30]/10 dark:from-[#F05A5B]/20 dark:to-[#BF4E30]/20 border border-[#F05A5B]/20">
            <span className="text-sm font-semibold bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] bg-clip-text text-transparent">
              ✨ Next Generation Mind Mapping
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Visualize Ideas
            <span className="block">
              <span className="bg-gradient-to-r from-[#F05A5B] via-[#BF4E30] to-[#FF8E53] bg-clip-text text-transparent animate-gradient">
                Beyond Imagination
              </span>
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create, collaborate, and conquer complexity with the most advanced
            AI-powered mind mapping tool. Everything you need to organize
            thoughts beautifully.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/mindmap")}
              size="lg"
              className="bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] text-white hover:shadow-xl hover:scale-105 transform transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-xl"
            >
              Start Creating Free
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: "50K+", label: "Active Users", icon: "👥" },
              { value: "200K+", label: "Maps Created", icon: "🗺️" },
              { value: "4.9", label: "User Rating", icon: "⭐" },
              { value: "99.9%", label: "Uptime", icon: "⚡" },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Screenshot Slider & Video Section */}
        <div className="mt-20 mb-32">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              See It In{" "}
              <span className="bg-gradient-to-r from-[#4ECDC4] to-[#2C7873] bg-clip-text text-transparent">
                Action
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Interactive demo showcasing powerful features
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Screenshot Slider */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#F05A5B] to-[#4ECDC4] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Browser-like header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    mindmapx.com/editor
                  </div>
                  <div className="w-20"></div>
                </div>

                {/* Slider */}
                <div className="relative h-96">
                  {screenshots.map((screenshot, index) => (
                    <div
                      key={screenshot.id}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {/* Image Container */}
                      <div className="h-64 relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                        {/* Fallback gradient background in case image fails to load */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${screenshot.color} opacity-20`}
                        ></div>

                        {/* Actual Image */}
                        <img
                          src={screenshot.imageUrl}
                          alt={screenshot.title}
                          className="w-full h-full object-contain p-4 relative z-10"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />

                        {/* Image overlay with title */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-20">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {screenshot.title}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {screenshot.description}
                          </p>
                        </div>

                        {/* Fallback content (shown only if image fails to load) */}
                        <div className="absolute inset-0 hidden items-center justify-center flex-col p-8 text-center">
                          <div className="text-6xl mb-4">📊</div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {screenshot.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {screenshot.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Screenshot {index + 1} of {screenshots.length}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              aria-label={
                                isPlaying ? "Pause slideshow" : "Play slideshow"
                              }
                            >
                              {isPlaying ? (
                                <Pause size={20} />
                              ) : (
                                <Play size={20} />
                              )}
                            </button>
                            <button
                              onClick={prevSlide}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              aria-label="Previous screenshot"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={nextSlide}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              aria-label="Next screenshot"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Screenshot Highlights
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Intuitive drag & drop interface",
                      "Customizable node colors",
                      "Expand and collapse sections",
                      "Seamless export options",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-600 dark:text-gray-300"
                      >
                        <span className="mr-3 text-[#4ECDC4]">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Video Section with thumbnail preview */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#4ECDC4] to-[#45B7D1] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                  {/* Video Thumbnail/Preview */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                    <div className="relative">
                      {/* Optional: Add your video thumbnail image */}
                      <img
                        src="/video-thumbnail.jpg"
                        alt="MindMapX Tutorial Thumbnail"
                        className="opacity-50 w-full h-full object-cover"
                      />

                      {/* Play button */}
                      <button
                        className="absolute inset-0 flex items-center justify-center"
                        onClick={() => {
                          const videoContainer =
                            document.getElementById("video-player");
                          const video = document.getElementById(
                            "mindmap-video"
                          ) as HTMLVideoElement;

                          if (videoContainer && video) {
                            // Show video player
                            videoContainer.classList.remove("hidden");
                            video.play();
                          }
                        }}
                        aria-label="Play MindMapX Tutorial"
                      >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] flex items-center justify-center cursor-pointer hover:scale-110 transform transition-transform shadow-2xl">
                          <Play size={32} className="text-white ml-1" />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Video Player (hidden initially) */}
                  <div id="video-player" className="hidden absolute inset-0">
                    <video
                      id="mindmap-video"
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    >
                      <source
                        src="/demoVideo/demoVideoMindMapX.mp4"
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Video info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      MindMapX Tutorial: Getting Started
                    </h3>
                    <p className="text-white/80 text-sm">
                      5-minute guide to mastering all features
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center text-white/70 text-sm">
                        <span className="mr-1">⏱️</span> 2:02
                      </div>
                      <div className="flex items-center text-white/70 text-sm">
                        <span className="mr-1">📺</span> 1080p
                      </div>
                      <div className="flex items-center text-white/70 text-sm">
                        <span className="mr-1">🔊</span> Demo
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    What You'll Learn
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Creating your first mind map",
                      "Using drag & drop effectively",
                      "Customizing colors and styles",
                      "Exporting and sharing",
                      "Using AI suggestions",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-600 dark:text-gray-300"
                      >
                        <span className="mr-3 text-[#4ECDC4]">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful{" "}
              <span className="bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] bg-clip-text text-transparent">
                Features
              </span>{" "}
              Designed for You
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Every feature is built to enhance your creativity and productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {feature.description}
                </p>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    How it works:
                  </h4>
                  <ul className="space-y-1">
                    {feature.howItWorks.map((step, stepIndex) => (
                      <li
                        key={stepIndex}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-center"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4] mr-2"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Features */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Advanced{" "}
              <span className="bg-gradient-to-r from-[#4ECDC4] to-[#2C7873] bg-clip-text text-transparent">
                Controls
              </span>{" "}
              & Interactions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Professional tools for power users
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {advancedFeatures.slice(0, 2).map((feature, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{feature.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.details.map((detail, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {advancedFeatures.slice(2).map((feature, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{feature.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.details.map((detail, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-20">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#F05A5B] via-[#4ECDC4] to-[#45B7D1] rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-12 text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Ideas?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are already visualizing their
                thoughts with MindMapX
              </p>
              <Button
                onClick={() => navigate("/mindmap")}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transform transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                Start Creating for Free
              </Button>
              <p className="text-gray-400 text-sm mt-4">
                No credit card required • Free forever plan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 pt-12 pb-8 border-t border-gray-800 align-center text-center text-gray-400">
        <p>© {new Date().getFullYear()} MindMapX. All rights reserved.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {[
            "Privacy Policy",
            "Terms of Service",
            "Cookie Policy",
            "Contact",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-gray-300 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default HeroSection;
