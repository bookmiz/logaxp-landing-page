"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FreeMode, Navigation } from "swiper/modules";
import { useRef, useState } from "react";

export default function Blog() {
  const prevButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const [_, setSwiperInit] = useState(false);
  return (
    <section id="blog" className="py-4 md:py-8 px-4 md:px-24 min-h-screen">
      <div className="flex gap-6 md:flex-row flex-col pb-16 md:items-center md:justify-between">
        <h2 className="mango align-baseline tracking-wide font-bold text-6xl">
          Blog
        </h2>
        <div className="flex gap-4 items-center">
          <button
            ref={prevButtonRef}
            className="p-4 rounded-full bg-black dark:bg-neutral-900"
          >
            <ChevronLeft color="#89E101" />
          </button>
          <button
            ref={nextButtonRef}
            className="p-4 rounded-full bg-black dark:bg-neutral-900"
          >
            <ChevronRight color="#89E101" />
          </button>
        </div>
      </div>
      <Swiper
        allowSlideNext
        allowSlidePrev
        modules={[FreeMode, Navigation]}
        freeMode
        loop={true}
        autoplay={{
          pauseOnMouseEnter: true,
          delay: 0, // Set delay to 0 for continuous movement
          disableOnInteraction: false, // Allow interaction without stopping autoplay
        }}
        speed={400}
        onInit={() => setSwiperInit(true)}
        navigation={{
          prevEl: prevButtonRef?.current,
          nextEl: nextButtonRef?.current,
        }}
        breakpoints={{
          768: {
            slidesPerView: 2,
          },
        }}
        className="pt-16 w-full"
        slidesPerView={1}
        spaceBetween={48}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <SwiperSlide
            className="select-none shrink-0 cursor-pointer"
            key={index}
          >
            <Image
              src={`/images/${index + 4}.png`}
              alt="test"
              className="w-full"
              width={100}
              height={100}
            />
            <p className="mango text-4xl mt-8 mb-2 font-black  truncate">
              Behind the Scenes: How We Judge DEV Challenge Submissions
            </p>
            <p className="opacity-70">
              One of the questions we hear most from our community is: &quot;How
              exactly do you decide who wins these challenges?&quot;
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
