import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import images from "../constant/images.js";
import { useNavigate } from 'react-router-dom';

export const TextParallax = () => {
  return (
    <div className="bg-white">
      <TextParallaxContent
        id="lms-section"
        imgUrl={images.LMS}
        heading="Learning Management System"
        subheading="Built to Teach. Designed to Learn."
      >
        <Connect />
      </TextParallaxContent>
      <TextParallaxContent
        id="discussions-section"
        imgUrl={images.Discussion}
        heading="Discussions"
        subheading="Where Queries Spark Ideas"
      >
        <Quality />
      </TextParallaxContent>
      <TextParallaxContent
        id="blog-section"
        imgUrl={images.blog}
        heading="Blog"
        subheading="Voices That Build Vision"
      >
        <Insight />
      </TextParallaxContent>
    </div>
  );
};

const IMG_PADDING = 12;

const TextParallaxContent = ({ id, imgUrl, heading, subheading, children }) => {
  return (
    <div
      id={id}
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ heading, subheading }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
      <p className="mt-6 text-center text-xl md:mb-4 md:text-3xl">
        {subheading}
      </p>
    </motion.div>
  );
};

const Connect = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
      <div className="col-span-1 md:col-span-4">
        <h2 className="text-6xl font-bold">LMS</h2>
        <div className="mt-8">
          <button
            onClick={() => navigate('/LearningPath')}
            className="w-full rounded bg-neutral-900 px-6 py-3 text-lg text-white transition-colors hover:bg-neutral-700"
          >
            Explore LMS →
          </button>
        </div>
      </div>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-4 text-xl text-neutral-600 md:text-2xl font-mono text-justify">
          LMS offers a dynamic environment to both consume and create knowledge.
          Learners can dive deep into technical foundations with curated lessons and hands-on implementation
          workbooks. Admins and educators can seamlessly upload videos, Jupyter notebooks, PDFs,
          and structured learning modules transforming the DGX Community into a self-sustained learning hub.
        </p>
        <p className="text-xl text-neutral-600 md:text-2xl font-mono text-justify">
          <b>
            Your Complete Hub for Interactive Learning and Implementation!
          </b>
        </p>
      </div>
    </div>
  );
}

const Quality = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
      <div className="col-span-1 md:col-span-4">
        <h2 className="text-6xl font-bold">Discussions</h2>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate('/Discussion')}
            className="w-full rounded bg-neutral-900 px-6 py-3 text-lg text-white transition-colors hover:bg-neutral-700"
          >
            Explore Discussions →
          </button>
        </div>
      </div>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-4 text-xl text-neutral-600 md:text-2xl font-mono text-justify">
          This module is where ideas meet impact. Whether it's solving bugs,
          brainstorming new features, or debating the ethical challenges of AI, this is your space to grow.
          Engage in bold conversations from real-world applications to future disruptions and shape the evolving
          landscape of tech together.
        </p>
      </div>
    </div>
  );
}

const Insight = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
      <div className="col-span-1 md:col-span-4">
        <h2 className="text-6xl font-bold">Blog</h2>
        <div className="mt-8">
          <button
            onClick={() => navigate('/Blog')}
            className="w-full rounded bg-neutral-900 px-6 py-3 text-lg text-white transition-colors hover:bg-neutral-700"
          >
            Explore Blogs →
          </button>
        </div>
      </div>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-4 text-xl text-neutral-600 md:text-2xl font-mono text-justify">
          The Blog page is your gateway to insights from innovators, educators, and peers.
          Whether you're writing your own thoughts or reading updates from community leaders,
          this space keeps you connected to the latest in AI, ML, and beyond. Share perspectives,
          publish breakthroughs, and stay ahead with every post.
        </p>
      </div>
    </div>
  );
}