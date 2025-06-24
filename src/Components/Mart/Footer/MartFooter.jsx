import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-20 mb-10">
          {/* Left Section */}
          <div className="md:w-2/5 lg:w-2/5">
            <Link
              to="/admin-login"
              className="mb-4 flex flex-col items-center space-y-1 select-none cursor-pointer"
            >
              {/* Title */}
              <h1 className="flex items-center space-x-2">
                {/* EZZO in white */}
                <span className="text-5xl sm:text-6xl font-extrabold text-white drop-shadow-lg">
                  EZZO
                </span>

                {/* Mart smaller and bottom-aligned */}
                <span className="text-sm sm:text-base font-semibold text-white self-end relative group">
                  Mart
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 
          bg-gradient-to-r from-amber-400 to-orange-500 
          transition-all duration-500 group-hover:w-full"
                  ></span>
                </span>
              </h1>

              {/* Tagline */}
              <span className="text-[13px] sm:text-[13px] text-amber-100 italic tracking-wide m-0 p-0">
                into sustainability
              </span>
            </Link>

            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              Your trusted partner for construction tools and equipment since
              2010.
            </p>

            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/ezzo-manufacturer-pvt-ltd/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Right Section */}
          <div className="md:w-3/5 lg:w-3/5 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Products", href: "/products" },
                  { name: "Testimonials", href: "/testimonials" },
                  { name: "Careers", href: "/careers" },
                  { name: "Contact", href: "/contact" },
                ].map(({ name, href }) => (
                  <li key={name}>
                    <a
                      href={href}
                      className="text-gray-400 hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-3">
                {[
                  { name: "Power Tools", href: "/categories/power-tools" },
                  { name: "Hand Tools", href: "/categories/hand-tools" },
                  { name: "Safety Gear", href: "/categories/safety-gear" },
                  { name: "Materials", href: "/categories/materials" },
                  { name: "Equipment", href: "/categories/equipment" },
                ].map(({ name, href }) => (
                  <li key={name}>
                    <a
                      href={href}
                      className="text-gray-400 hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-span-2 sm:col-auto">
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <address className="not-italic text-gray-400 space-y-3">
                <div className="flex items-start">
                  <MapPin
                    className="mt-0.5 mr-3 text-orange-500 flex-shrink-0"
                    size={18}
                  />
                  <span className="text-sm sm:text-base">
                    1/7-B Thaticherla, Ananthapuram, AP, India, 515731
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 text-orange-500" size={18} />
                  <a
                    href="tel:+916302174395"
                    className="hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base"
                  >
                    +91 63021 74395
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 text-orange-500" size={18} />
                  <a
                    href="tel:+919347172800"
                    className="hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base"
                  >
                    +91 93471 72800
                  </a>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-3 text-orange-500" size={18} />
                  <a
                    href="mailto:ezzo.build@gmail.com?subject=Inquiry&body=Hello EZZO Mart,"
                    className="hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base"
                  >
                    ezzo.build@gmail.com
                  </a>
                </div>
              </address>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-800 my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs sm:text-sm order-2 sm:order-1">
            © {new Date().getFullYear()} EZZO MANUFACTURER PVT.LTD. All rights
            reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 order-1 sm:order-2">
            {[
              { name: "Privacy", href: "/privacy" },
              { name: "Terms", href: "/terms" },
              { name: "Shipping", href: "/shipping" },
              { name: "Returns", href: "/returns" },
            ].map(({ name, href }) => (
              <a
                key={name}
                href={href}
                className="text-gray-500 hover:text-orange-500 text-xs sm:text-sm transition-colors duration-200"
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
