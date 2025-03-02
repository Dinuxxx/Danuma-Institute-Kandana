import React from 'react'

const AboutUs = () => {
  return (
    <div className='flex flex-col'>
      <div>
        <h1 className='text-4xl font-bold text-customOrange'>About Us</h1>
      </div>
      <div className='flex w-2/3 p-10 m-10 gap-12 border-2 rounded-3xl shadow-lg justify-center align-center'>
        <div className='w-1/2 flex flex-col gap-10'>
            <p>
                Danuma Institute in Kadana provides a high-tech learning environment for first-time higher education students. 
                Featuring air-conditioned auditoriums, advanced widescreen displays, and superior audio systems, it ensures a top-tier learning experience. The institute also offers comfortable seating and a serene cafeteria, creating an ideal atmosphere for academic success and student relaxation.
            </p>
            <button className="bg-blue-500 rounded-3xl hover:bg-blue-600 text-white py-2 px-4">
                Read More
            </button>
        </div>
        <div className='w-1/2'>
            <img src='https://dgmg81phhvh63.cloudfront.net/content/user-photos/Events/Institute-OER/7-Hero-4K.png' alt='img-aboutus'/>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
