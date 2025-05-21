import React from 'react';
import { Button } from '../../ui/dailog';


const About = () => {
  return (
    <div className="w-full min-h-screen bg-tealCustom">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] bg-dark overflow-hidden">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="https://availoassist.s3.eu-north-1.amazonaws.com/world-vedio.mp4"
          loop
          muted
          playsInline
          autoPlay
        ></video>

        {/* Gradient Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-amber-50/90 to-amber-100/90"></div> */}

        {/* Content */}
        <div className="relative container mx-auto px-6 py-20">
          <h1 className="text-5xl text-white font-bold mb-6 mt-8 max-w-2xl">
            We're revolutionizing the future of work
          </h1>
          <h4 className='text-gray-300'>
            "We're revolutionizing the way the world works. <br />
            Empowering innovation, one task at a time. <br />
            Building connections that shape a brighter future. <br />
            Transforming possibilities into extraordinary realities."
          </h4>
          <Button className="bg-emerald-700 mt-4 hover:bg-emerald-800 text-white px-8 py-2 rounded">
            See open jobs
          </Button>
        </div>
      </section>



      {/* Mission Section */}
      <section className="py-6 px-6 bg-emerald-800 border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-100">
                Transforming lives one task at a time
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  In 2008, we sparked a movement that would reshape how people work and live.
                  At Taskrabbit, we're not just about tasks; we're about transformation.
                  As a woman-led, remote-first company, we're on a mission to transform lives,
                  one task at a time by connecting millions globally with trusted Taskers every year.
                </p>
                <p>
                  Since joining forces with IKEA in 2017, we have become the go-to platform
                  for all things home-related and continue to reimagine how to improve work
                  for Taskers, home life for clients and professional growth for our growing
                  internal teams.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg">
                {/* World Map Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="https://5.imimg.com/data5/SELLER/Default/2023/5/307511773/BS/DI/ZC/88505518/black-blue-wooden-world-map.jpg"
                    alt="World map showing AvailoAssist global presence"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Remote Work Section */}
      <section className="bg-emerald-900 text-white py-16 border-t">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">
                Remote first and highly connected
              </h2>
              <p className="text-lg">
                At Taskrabbit, we believe in work-life harmony, which is why we've adopted
                a "remote-first" policy that prioritizes flexibility and choice while also
                focusing on meaningful engagement. Starting in September 2025, employees will
                come together twice a week in our dedicated offices, enabling them to foster
                connection, make decisions faster and iterate in real-time.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-emerald-800 rounded-lg p-2 aspect-square">
                  <img
                    src={`https://static.vecteezy.com/system/resources/thumbnails/048/632/363/small/male-doctor-in-gray-suit-and-tie-with-neutral-gray-background-free-photo.jpg`}
                    alt={`Team member ${i + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer with IKEA Logo */}
      <footer className="py-8 ">
        <div className="container mx-auto px-6">
          <img
            src="https://www.cst.gov.sa/ar/services/tech/PublishingImages/Availo.png"
            alt="IKEA logo"
            className="h-30 w-20"
          />
        </div>
      </footer>
    </div>
  );
};

export default About;