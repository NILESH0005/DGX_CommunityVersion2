import { FaFacebookF, FaLinkedinIn, FaInstagram, FaYoutube, FaGlobe } from 'react-icons/fa';
import images from '../../public/images';

const Footer = () => {
  return (
    <footer className="bg-DGXblue dark:bg-gray-900">
      <div className="container px-6 py-8 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <a href="/">
              <img className="w-auto h-7" src={images.gilogowhite} alt="GiVenture Logo" />
            </a>
            <div className="hidden md:block border-l border-gray-400 opacity-60 h-18 mx-4"></div>

            <div className="flex space-x-6">
              {[
                {
                  icon: <FaFacebookF className="w-5 h-5" />,
                  label: "Facebook",
                  url: "https://www.facebook.com/GlobalInfoventures/",
                },
                {
                  icon: <FaLinkedinIn className="w-5 h-5" />,
                  label: "LinkedIn",
                  url: "https://in.linkedin.com/company/global-infoways",
                },
                {
                  icon: <FaInstagram className="w-5 h-5" />,
                  label: "Instagram",
                  url: "https://www.instagram.com/global_infoventures/",
                },
                {
                  icon: <FaYoutube className="w-5 h-5" />,
                  label: "YouTube",
                  url: "https://www.youtube.com/channel/UCMaOjTQeyBNt0wKycTVcrjg/",
                },
                {
                  icon: <FaGlobe className="w-5 h-5" />,
                  label: "Website",
                  url: "https://www.giindia.com/",
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right section - Copyright */}
          <div className="mt-4 md:mt-0 text-white text-sm tracking-wider">
            <span>© Copyright All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;