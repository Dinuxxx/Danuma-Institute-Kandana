import React from 'react'; 
import ImageCarousel from './ImageCarousel';

const AboutUs = () => {
  const images = [
    'https://via.placeholder.com/800x400/FF5733/FFFFFF?text=Slide+1',
    'https://via.placeholder.com/800x400/33CFFF/FFFFFF?text=Slide+2',
    'https://via.placeholder.com/800x400/FF33A6/FFFFFF?text=Slide+3',
    'https://via.placeholder.com/800x400/FF5733/FFFFFF?text=Slide+4',
    'https://via.placeholder.com/800x400/33CFFF/FFFFFF?text=Slide+5',
    'https://via.placeholder.com/800x400/FF33A6/FFFFFF?text=Slide+6'
  ];

  return (
    <div className="mx-auto my-16 p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 flex flex-col sm:flex-row-reverse w-full max-w-screen-xl items-center justify-between gap-8 shadow-[1px_1px_5px_#3d3d3df7,_1px_1px_5px_#afb0b0f7] rounded-2xl mt-[-40px]">
      <div className="flex-[1] sm:flex-[1_1_43%]">
        <div className="w-full">
          <ImageCarousel images={images} />
        </div>
      </div>
      <div className="flex-[1] sm:flex-[1_1_54%]">
        <p className="text-base sm:text-lg font-semibold">
          Danuma Institute in Kadana provides a high-tech learning environment for first-time higher education students.
        </p>
        <br />
        <p className="text-base sm:text-lg font-semibold">
          Featuring air-conditioned auditoriums, advanced widescreen displays, and superior audio systems, it ensures a
          top-tier learning experience. The institute also offers comfortable seating and a serene cafeteria, creating
          an ideal atmosphere for academic success and student relaxation.
        </p>
        <br />
        
        <button className="mt-6 sm:mt-10 inline-block px-6 sm:px-7 py-3 bg-blue-500 rounded-full text-white font-semibold text-sm sm:text-base tracking-wide shadow-lg hover:shadow-[0_0_10px_#5271FF,0_0_20px_#5271FF] transition duration-300 ease-in-out">
          Read more
        </button>
      </div>
    </div>
  );
}

export default AboutUs;
