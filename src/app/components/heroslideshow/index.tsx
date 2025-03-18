"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";


interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  { id: 1, image: "/hero1.png", title: "", subtitle: "" },
  { id: 2, image: "/hero2.png", title: "", subtitle: "" },
  { id: 3, image: "/hero3.png", title: "", subtitle: "" },
];

const HeroSlideshow = () => {
  return (
    <section className="relative z-10">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{ delay: 5000 }}
        navigation
        pagination={{ clickable: true }}
        loop={true}
        className="flex w-auto lg:h-[400px] z-0 "
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            <Image
              src={slide.image}
              alt={slide.title}
              layout="fill"
              objectFit="cover"
              className="brightness-100"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6">
              <h2 className="text-3xl font-bold">{slide.title}</h2>
              <p className="text-lg mt-2">{slide.subtitle}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSlideshow;
